// redux/actions/wikipediaAction.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";
import { cacheManager } from "../../utils/cacheUtils";

// Wikimedia user-agent policy: https://meta.wikimedia.org/wiki/User-Agent_policy
// NOTE: On iOS you can't override "User-Agent", but "Api-User-Agent" works.
// Keep both for Android/Web; one will get through.
const WIKI_HEADERS: HeadersInit = {
  Accept: "application/json",
  "User-Agent": "MuseeApp/1.0 (support@musee.app)",
  "Api-User-Agent": "MuseeApp/1.0 (support@musee.app)",
};

const clampRadius = (r: number) => Math.max(1, Math.min(10000, Math.floor(r || 1000)));

export const getWikipediaMuseums = createAsyncThunk<
  any,
  { lat: number; lng: number; radius: number; useCache?: boolean }
>(
  "wikipedia/museums",
  async ({ lat, lng, radius, useCache = true }, { rejectWithValue }) => {
    const clamped = clampRadius(radius);
    const cacheKey = cacheManager.generateCoordinateKey(lat, lng, clamped, "wikipedia_museums");

    try {
      // 1) Cache first
      if (useCache) {
        const cached = await cacheManager.get(cacheKey);
        if (cached) return cached;
      }

      // 2) Geosearch
      const geoUrl =
        `https://en.wikipedia.org/w/api.php` +
        `?action=query&list=geosearch` +
        `&gsradius=${clamped}` +
        `&gscoord=${lat}|${lng}` +
        `&gslimit=50&format=json&origin=*`;

      const geoResp = await fetch(geoUrl, { headers: WIKI_HEADERS });
      if (!geoResp.ok) {
        const body = await geoResp.text().catch(() => "");
        throw new Error(`Wikipedia geosearch ${geoResp.status}: ${body}`);
      }
      const geoJson = await geoResp.json();
      const geosearch = geoJson?.query?.geosearch ?? [];
      if (!Array.isArray(geosearch) || geosearch.length === 0) {
        await cacheManager.set(cacheKey, []);
        return [];
      }

      // 3) Cultural filter
      const cultural = geosearch.filter((item: any) => {
        const title = String(item?.title || "").toLowerCase();
        return (
          title.includes("museum") ||
          title.includes("gallery") ||
          title.includes("art") ||
          title.includes("monument") ||
          title.includes("historic")
        );
      });
      if (cultural.length === 0) {
        await cacheManager.set(cacheKey, []);
        return [];
      }

      // 4) Batch details look-up
      const pageIds = cultural.map((x: any) => x.pageid).filter(Boolean);
      const detailsUrl =
        `https://en.wikipedia.org/w/api.php` +
        `?action=query&prop=extracts|pageimages|info` +
        `&pageids=${encodeURIComponent(pageIds.join("|"))}` +
        `&exintro=true&explaintext=true&pithumbsize=400&inprop=url` +
        `&format=json&origin=*`;

      const detailsResp = await fetch(detailsUrl, { headers: WIKI_HEADERS });
      if (!detailsResp.ok) {
        const body = await detailsResp.text().catch(() => "");
        throw new Error(`Wikipedia details ${detailsResp.status}: ${body}`);
      }
      const detailsJson = await detailsResp.json();
      const pages = detailsJson?.query?.pages || {};

      // 5) Normalize
      const results = cultural.map((site: any) => {
        const page = pages[site.pageid] || {};
        return {
          id: site.pageid,
          name: site.title,
          latitude: site.lat,
          longitude: site.lon ?? site.lng,
          distance: site.dist,
          description: page.extract || "No description available",
          image: page.thumbnail?.source ?? null,
          wikipediaUrl: page.fullurl || `https://en.wikipedia.org/?curid=${site.pageid}`,
          source: "wikipedia",
          categories: ["museum"], // helps your filters
        };
      });

      await cacheManager.set(cacheKey, results);
      return results;
    } catch (err: any) {
      // Fallback to cache if present
      if (useCache) {
        const fallback = await cacheManager.get(cacheKey);
        if (fallback) return fallback;
      }

      const message =
        String(err?.message || "").includes("403")
          ? "Wikipedia blocked the request (403). Use a descriptive Api-User-Agent and avoid many parallel requests."
          : "Failed to fetch Wikipedia data";

      console.error("Wikipedia API error:", err);
      Toast.show({ type: "error", text1: message });
      return rejectWithValue(message);
    }
  }
);
