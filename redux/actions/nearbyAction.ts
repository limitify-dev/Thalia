// src/redux/actions/nearbyAction.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";
import { cacheManager } from "../../utils/cacheUtils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export interface Site {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
  description?: string; // HTML string for Wikipedia extracts
  address?: string;
  categories?: string[];
  type?: string;
  image?: string | null;
  source?: string;
  rating?: number;
  openingHours?: { day: string; opening: string; closing: string }[];
  isFeatured?: boolean;
  reviewStats?: { averageRating: number; totalReviews: number };
  wikiPage?: string;
}

/* ------------------------------------------------------------------ */
/* Utilities                                                          */
/* ------------------------------------------------------------------ */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance;
}

function getSiteType(instanceLabel: string): string {
  const label = instanceLabel?.toLowerCase() || "";
  if (label.includes("museum")) return "museum";
  if (label.includes("gallery")) return "gallery";
  if (label.includes("monument")) return "monument";
  if (label.includes("historic")) return "historic_site";
  if (label.includes("church") || label.includes("cathedral"))
    return "religious_site";
  if (label.includes("park")) return "park";
  if (label.includes("building")) return "building";
  if (label.includes("archaeological")) return "archaeological_site";
  if (label.includes("palace")) return "palace";
  if (label.includes("castle")) return "castle";
  if (label.includes("temple")) return "temple";
  if (label.includes("memorial")) return "memorial";
  if (label.includes("bridge")) return "bridge";
  if (label.includes("tower")) return "tower";
  if (label.includes("library")) return "library";
  if (label.includes("theatre") || label.includes("theater")) return "theater";
  if (label.includes("market")) return "market";
  if (label.includes("square")) return "square";
  if (label.includes("garden")) return "garden";
  return "landmark";
}

const WDQS_ENDPOINT = "https://query.wikidata.org/sparql";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function wikimediaHeaders() {
  const ua = "Thaia/1.0 (contact: support@thaia.example)";
  return {
    Accept: "application/sparql-results+json",
    "User-Agent": ua,
    "Api-User-Agent": ua,
  } as Record<string, string>;
}

/* ------------------------------------------------------------------ */
/* Rate Limiter (to be gentle with WDQS/Wikipedia APIs)               */
/* ------------------------------------------------------------------ */
class RateLimiter {
  private lastRequest: number = 0;
  private minInterval: number;

  constructor(requestsPerMinute: number) {
    this.minInterval = 60000 / requestsPerMinute;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLast = now - this.lastRequest;
    if (timeSinceLast < this.minInterval) {
      await sleep(this.minInterval - timeSinceLast);
    }
    this.lastRequest = Date.now();
  }
}

const apiLimiter = new RateLimiter(60); // Increased to 60 requests/minute (1 per second)

/* ------------------------------------------------------------------ */
/* Resilient SPARQL fetch (timeouts, retries, POST→GET fallback)      */
/* ------------------------------------------------------------------ */
async function fetchSparql(sparql: string) {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000;

  async function tryOnce(method: "POST" | "GET", abortMs = 15000) {
    await apiLimiter.wait();
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), abortMs);

    try {
      if (method === "POST") {
        const body = `query=${encodeURIComponent(sparql)}&format=json`;
        const resp = await fetch(WDQS_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            ...wikimediaHeaders(),
          },
          body,
          signal: controller.signal,
        });
        return resp;
      } else {
        const url = `${WDQS_ENDPOINT}?query=${encodeURIComponent(
          sparql
        )}&format=json`;
        const resp = await fetch(url, {
          method: "GET",
          headers: wikimediaHeaders(),
          signal: controller.signal,
        });
        return resp;
      }
    } finally {
      clearTimeout(t);
    }
  }

  let lastErr: any;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const methods: ("POST" | "GET")[] =
      attempt % 2 === 0 ? ["POST", "GET"] : ["GET", "POST"];

    for (const method of methods) {
      try {
        const resp = await tryOnce(method);
        if (resp.ok) return await resp.json();

        if ([408, 429, 500, 502, 503, 504].includes(resp.status)) {
          lastErr = new Error(`SPARQL ${method} ${resp.status}`);
        } else {
          const text = await resp.text().catch(() => "");
          throw new Error(`SPARQL ${method} ${resp.status} ${text}`);
        }
      } catch (e: any) {
        lastErr = e;
      }
    }

    const jitter = Math.floor(Math.random() * 500);
    await sleep(BASE_DELAY * (1 << attempt) + jitter);
  }
  throw lastErr ?? new Error("SPARQL request failed");
}

/* ------------------------------------------------------------------ */
/* Wikipedia helpers (HTML)                                            */
/* ------------------------------------------------------------------ */
function sanitizeWikipediaHtml(html: string): string {
  if (!html) return "";

  // Remove scripts, styles, comments
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  html = html.replace(/<!--[\s\S]*?-->/g, "");

  // Remove dangerous elements
  html = html.replace(
    /<(iframe|object|embed|form|input|button|textarea|select)[^>]*>[\s\S]*?<\/\1>/gi,
    ""
  );

  // Remove reference links like [1], [2], etc.
  html = html.replace(/\[\d+\]/g, "");

  // Remove edit links
  html = html.replace(/<span class="mw-editsection">[\s\S]*?<\/span>/gi, "");

  // Remove infobox and other complex tables
  html = html.replace(/<table class="infobox[\s\S]*?<\/table>/gi, "");

  // Remove all tables (including maps, data tables, etc.)
  html = html.replace(/<table[^>]*>[\s\S]*?<\/table>/gi, "");

  // Remove map containers and divs
  html = html.replace(
    /<div[^>]*class="[^"]*thumb[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    ""
  );
  html = html.replace(
    /<div[^>]*class="[^"]*mw-kartographer[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    ""
  );
  html = html.replace(
    /<div[^>]*class="[^"]*locmap[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    ""
  );
  html = html.replace(
    /<div[^>]*class="[^"]*maplink[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    ""
  );

  // Remove figures (often contain images/maps)
  html = html.replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "");

  // Remove aside elements (sidebars, infoboxes)
  html = html.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "");

  // Remove all images (optional - remove this line if you want to keep images)
  // html = html.replace(/<img[^>]*>/gi, "");

  // Convert protocol-relative URLs to https
  html = html.replace(/\s(href|src)\s*=\s*"(\/\/[^"]+)"/gi, ' $1="https:$2"');
  html = html.replace(/\s(href|src)\s*=\s*'(\/\/[^']+)'/gi, " $1='https:$2'");

  // Convert relative Wikipedia links to absolute
  html = html.replace(
    /\shref\s*=\s*"\/wiki\/([^"]+)"/gi,
    ' href="https://en.wikipedia.org/wiki/$1"'
  );
  html = html.replace(
    /\shref\s*=\s*'\/wiki\/([^']+)'/gi,
    " href='https://en.wikipedia.org/wiki/$1'"
  );

  // Remove onclick and other event handlers
  html = html.replace(/\son\w+\s*=\s*"[^"]*"/gi, "");
  html = html.replace(/\son\w+\s*=\s*'[^']*'/gi, "");

  // Clean up excessive whitespace
  html = html.replace(/\s+/g, " ");

  // Remove empty paragraphs
  html = html.replace(/<p>\s*<\/p>/gi, "");

  // Remove empty divs
  html = html.replace(/<div[^>]*>\s*<\/div>/gi, "");

  return html.trim();
}

async function batchFetchWikipediaTitles(
  qids: string[],
  language: string = "en"
): Promise<Map<string, string>> {
  const BATCH_SIZE = 50;
  const results = new Map<string, string>();

  for (let i = 0; i < qids.length; i += BATCH_SIZE) {
    const batch = qids.slice(i, i + BATCH_SIZE);
    const wikiSite = `${language}wiki`;
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${batch.join(
      "|"
    )}&props=sitelinks&sitefilter=${wikiSite}&format=json&origin=*`;
    await apiLimiter.wait();
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        for (const qid of batch) {
          const entity = data.entities[qid];
          if (entity?.sitelinks?.[wikiSite]?.title) {
            results.set(qid, entity.sitelinks[wikiSite].title);
          }
        }
      }
    } catch (e) {
      console.warn(`Error fetching Wikipedia titles for batch:`, e);
    }
  }
  return results;
}

async function fetchWikipediaDescription(
  pageTitle: string,
  language: string = "en"
): Promise<string> {
  const url = `https://${language}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
    pageTitle
  )}&prop=text&section=0&format=json&origin=*`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const rawHtml: string | undefined = data?.parse?.text?.["*"];
      if (rawHtml) {
        return sanitizeWikipediaHtml(rawHtml).trim();
      }
    }
  } catch (e) {
    console.warn(`Error fetching Wikipedia description for ${pageTitle}:`, e);
  }
  return `<p>No description available from Wikipedia.</p>`;
}

/* ------------------------------------------------------------------ */
/* Deduplication Helpers                                              */
/* ------------------------------------------------------------------ */
function normalizeName(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickBetter(a: Site, b: Site) {
  const aHasImg = !!a.image;
  const bHasImg = !!b.image;
  if (aHasImg !== bHasImg) return aHasImg ? a : b;

  const aDesc = (a.description ?? "").length;
  const bDesc = (b.description ?? "").length;
  if (aDesc !== bDesc) return aDesc > bDesc ? a : b;

  const aDist = a.distance ?? Number.POSITIVE_INFINITY;
  const bDist = b.distance ?? Number.POSITIVE_INFINITY;
  return aDist <= bDist ? a : b;
}

function dedupeSites(sites: Site[]): Site[] {
  const byId = new Map<string, Site>();
  for (const s of sites) {
    const id = String(s.id);
    if (!byId.has(id)) byId.set(id, s);
    else byId.set(id, pickBetter(byId.get(id)!, s));
  }

  const byName = new Map<string, Site[]>();
  for (const s of byId.values()) {
    const n = normalizeName(s.name);
    if (!n) continue;
    if (!byName.has(n)) byName.set(n, []);
    byName.get(n)!.push(s);
  }

  const bestPerName: Site[] = [];
  for (const [, group] of byName) {
    if (group.length === 1) {
      bestPerName.push(group[0]);
    } else {
      let best = group[0];
      for (let i = 1; i < group.length; i++) best = pickBetter(best, group[i]);
      bestPerName.push(best);
    }
  }

  const kept: Site[] = [];
  const used = new Set<number>();
  const arr = bestPerName;

  for (let i = 0; i < arr.length; i++) {
    if (used.has(i)) continue;
    const a = arr[i];
    const aName = normalizeName(a.name);
    let best = a;

    for (let j = i + 1; j < arr.length; j++) {
      if (used.has(j)) continue;
      const b = arr[j];
      const bName = normalizeName(b.name);
      if (!aName || !bName || aName !== bName) continue;

      const d = calculateDistance(
        a.latitude,
        a.longitude,
        b.latitude,
        b.longitude
      );
      if (d <= 0.075) {
        // 75 meters
        best = pickBetter(best, b);
        used.add(j);
      }
    }

    kept.push(best);
    used.add(i);
  }

  return kept;
}

/* ------------------------------------------------------------------ */
/* Fetch Sites by City Name (Administrative Area Query)               */
/* ------------------------------------------------------------------ */
async function fetchSitesByCity(
  cityName: string,
  language: string = "en"
): Promise<Site[]> {
  // Check cache first before expensive query
  const cacheKey = `sparql_city_${cityName
    .toLowerCase()
    .replace(/\s+/g, "_")}_${language}`;
  const cached = await cacheManager.get(cacheKey);

  if (cached) {
    console.log(`⚡ Using cached SPARQL results for ${cityName}`);
    return cached as Site[];
  }

  const classes = `wd:Q33506 wd:Q207694 wd:Q1007870 wd:Q4989906 wd:Q839954 wd:Q5003624 wd:Q7075 wd:Q24354`;

  // FAST Query: Direct instances only (P31 without transitive closure)
  const fastQuery = `
    SELECT DISTINCT ?item ?itemLabel ?coord ?image ?description ?instance ?instanceLabel ?streetAddress ?location WHERE {
      # Use MWAPI to find the city entity more efficiently
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:endpoint "www.wikidata.org";
                        wikibase:api "EntitySearch";
                        mwapi:search "${cityName}";
                        mwapi:language "${language}".
        ?city wikibase:apiOutputItem mwapi:item.
      }

      # Verify it's a city (direct instance check only)
      ?city wdt:P31 wd:Q515 .

      # Find sites located in this city (one level only for speed)
      ?item wdt:P131 ?city .

      # Filter by cultural site types (direct instance only)
      VALUES ?class { ${classes} }
      ?item wdt:P31 ?class .
      ?item wdt:P31 ?instance .

      # Get coordinates
      ?item wdt:P625 ?coord .

      OPTIONAL { ?item wdt:P18 ?image }
      OPTIONAL { ?item schema:description ?description . FILTER(LANG(?description) = "${language}") }
      OPTIONAL { ?item wdt:P6375 ?streetAddress }
      OPTIONAL { ?item wdt:P131 ?location }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${language},en" }
    }
    LIMIT 80
  `;

  // COMPREHENSIVE Query: Includes subclasses (P31/P279*)
  // This will find items that are instances of subclasses of our target classes
  const comprehensiveQuery = `
    SELECT DISTINCT ?item ?itemLabel ?coord ?image ?description ?instance ?instanceLabel ?streetAddress ?location WHERE {
      # Use MWAPI to find the city entity
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:endpoint "www.wikidata.org";
                        wikibase:api "EntitySearch";
                        mwapi:search "${cityName}";
                        mwapi:language "${language}".
        ?city wikibase:apiOutputItem mwapi:item.
      }

      # Verify it's a city
      ?city wdt:P31 wd:Q515 .

      # Find sites located in city
      ?item wdt:P131 ?city .

      # Filter by cultural site types (with subclass support)
      VALUES ?class { ${classes} }
      ?item wdt:P31/wdt:P279* ?class .
      ?item wdt:P31 ?instance .

      # Get coordinates
      ?item wdt:P625 ?coord .

      OPTIONAL { ?item wdt:P18 ?image }
      OPTIONAL { ?item schema:description ?description . FILTER(LANG(?description) = "${language}") }
      OPTIONAL { ?item wdt:P6375 ?streetAddress }
      OPTIONAL { ?item wdt:P131 ?location }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${language},en" }
    }
    LIMIT 50
  `;

  try {
    console.log(`🚀 Running parallel queries for city: ${cityName}`);

    // Run both queries in parallel with timeout protection
    // If comprehensive query takes too long, we still return fast results
    const COMPREHENSIVE_TIMEOUT = 12000; // 12 seconds max for comprehensive query

    const comprehensiveWithTimeout = Promise.race([
      fetchSparql(comprehensiveQuery),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Comprehensive query timeout")),
          COMPREHENSIVE_TIMEOUT
        )
      ),
    ]);

    const [fastResults, comprehensiveResults] = await Promise.allSettled([
      fetchSparql(fastQuery),
      comprehensiveWithTimeout,
    ]);

    // Extract bindings from successful queries
    const fastBindings =
      fastResults.status === "fulfilled"
        ? fastResults.value?.results?.bindings ?? []
        : [];

    const comprehensiveBindings =
      comprehensiveResults.status === "fulfilled"
        ? comprehensiveResults.value?.results?.bindings ?? []
        : [];

    // Log detailed results
    console.log(`Fast query: ${fastBindings.length} results`);
    if (comprehensiveResults.status === "rejected") {
      console.log(
        `Comprehensive query failed/timed out: ${comprehensiveResults.reason}`
      );
    } else {
      console.log(
        `Comprehensive query: ${comprehensiveBindings.length} results`
      );
    }

    // Merge results (dedupe will happen later)
    const allBindings = [...fastBindings, ...comprehensiveBindings];
    console.log(
      `Total combined: ${allBindings.length} results before deduplication`
    );

    if (allBindings.length === 0) {
      // console.warn(`No sites found for city: ${cityName}`);
      return [];
    }

    const bindings = allBindings;

    // Get city center for distance calculation (use first site's location as reference)
    const firstCoord = bindings[0]?.coord?.value as string | undefined;
    let cityLat = 48.8566; // Default to Paris
    let cityLng = 2.3522;

    if (firstCoord?.startsWith("Point(")) {
      const [lonStr, latStr] = firstCoord.slice(6, -1).split(" ");
      cityLng = parseFloat(lonStr);
      cityLat = parseFloat(latStr);
    }

    // Process sites without fetching Wikipedia descriptions for instant loading
    const sites = bindings.map((b: any) => {
      const coord = b.coord?.value as string | undefined;
      if (!coord?.startsWith("Point(")) return null;

      const [lonStr, latStr] = coord.slice(6, -1).split(" ");
      const siteLon = parseFloat(lonStr);
      const siteLat = parseFloat(latStr);

      if (!Number.isFinite(siteLat) || !Number.isFinite(siteLon)) {
        return null;
      }

      const distanceKm = calculateDistance(cityLat, cityLng, siteLat, siteLon);

      let imageUrl: string | null = null;
      if (b.image?.value) {
        const fileName = decodeURIComponent(
          b.image.value.split("/").pop() || ""
        );
        imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
          fileName
        )}?width=400`;
      }

      const instanceLabel = b.instanceLabel?.value || "";
      const id = `wd_${b.item?.value?.split("/").pop()}`;
      const qid = b.item?.value?.split("/").pop();
      if (!qid) return null;

      // Use simple Wikidata description - no Wikipedia fetching!
      const descriptionHtml: string =
        b.description?.value || instanceLabel || "Notable site";

      return {
        id,
        name: b.itemLabel?.value || "Unknown Site",
        latitude: siteLat,
        longitude: siteLon,
        distance: distanceKm,
        description: descriptionHtml,
        address: b.streetAddress?.value || b.location?.value || "Unknown",
        image: imageUrl,
        type: getSiteType(instanceLabel),
        source: "wikidata",
        categories: [getSiteType(instanceLabel)],
        wikiPage: undefined, // Can be fetched on-demand later if needed
        rating: undefined,
        openingHours: undefined,
        isFeatured: undefined,
        reviewStats: undefined,
      } as Site;
    });

    const validSites = sites.filter((s: Site | null): s is Site => !!s);
    console.log(`Returning ${validSites.length} sites for ${cityName}`);

    // Cache the SPARQL results for 7 days (cities don't change often)
    const WEEK_TTL = 7 * 24 * 60 * 60 * 1000;
    await cacheManager.set(cacheKey, validSites, WEEK_TTL);
    console.log(`✅ Cached ${validSites.length} sites for ${cityName}`);

    return validSites;
  } catch (error) {
    console.warn(`Failed to fetch sites for city ${cityName}:`, error);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Fetch Wikimedia Sites (Museums and Other Notable Sites)            */
/* ------------------------------------------------------------------ */
async function fetchWikimediaSites(
  userLat: number,
  userLng: number,
  _radius: number, // Unused - we fetch all sites in the area regardless of radius
  isMuseumOnly: boolean,
  language: string = "en"
): Promise<Site[]> {
  // Check cache first
  const cacheKey = `sparql_radius_${Math.round(userLat * 100)}_${Math.round(
    userLng * 100
  )}_${isMuseumOnly ? "museums" : "all"}`;
  const cached = await cacheManager.get(cacheKey);

  if (cached) {
    console.log(`⚡ Using cached SPARQL results for location`);
    return cached as Site[];
  }

  // Use a generous radius to fetch all sites in the area
  const radiusKm = 50; // Always use 50km radius to get comprehensive results
  const classes = isMuseumOnly
    ? "wd:Q33506 wd:Q207694 wd:Q1007870 wd:Q4989906 wd:Q839954"
    : `wd:Q33506 wd:Q207694 wd:Q1007870 wd:Q4989906 wd:Q839954 wd:Q5003624 wd:Q7075 wd:Q24354`;

  // FAST Query: Direct instances only
  const fastQuery = `
    SELECT DISTINCT ?item ?itemLabel ?coord ?image ?description ?instance ?instanceLabel ?dist ?streetAddress ?location WHERE {
      SERVICE wikibase:around {
        ?item wdt:P625 ?coord .
        bd:serviceParam wikibase:center "Point(${userLng} ${userLat})"^^geo:wktLiteral .
        bd:serviceParam wikibase:radius "${radiusKm}" .
        bd:serviceParam wikibase:distance ?dist .
      }
      VALUES ?class { ${classes} }
      # Direct instance check only (no transitive closure) for 10-20x speed improvement
      ?item wdt:P31 ?class .
      ?item wdt:P31 ?instance .
      OPTIONAL { ?item wdt:P18 ?image }
      OPTIONAL { ?item schema:description ?description . FILTER(LANG(?description) = "${language}") }
      OPTIONAL { ?item wdt:P6375 ?streetAddress }
      OPTIONAL { ?item wdt:P131 ?location }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${language},en" }
    }
    ORDER BY ?dist
    LIMIT 100
  `;

  // COMPREHENSIVE Query: Includes subclasses for additional coverage
  const comprehensiveQuery = `
    SELECT DISTINCT ?item ?itemLabel ?coord ?image ?description ?instance ?instanceLabel ?dist ?streetAddress ?location WHERE {
      SERVICE wikibase:around {
        ?item wdt:P625 ?coord .
        bd:serviceParam wikibase:center "Point(${userLng} ${userLat})"^^geo:wktLiteral .
        bd:serviceParam wikibase:radius "${radiusKm}" .
        bd:serviceParam wikibase:distance ?dist .
      }
      VALUES ?class { ${classes} }
      # Includes subclass hierarchy for more complete results
      ?item wdt:P31/wdt:P279* ?class .
      ?item wdt:P31 ?instance .
      OPTIONAL { ?item wdt:P18 ?image }
      OPTIONAL { ?item schema:description ?description . FILTER(LANG(?description) = "${language}") }
      OPTIONAL { ?item wdt:P6375 ?streetAddress }
      OPTIONAL { ?item wdt:P131 ?location }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${language},en" }
    }
    ORDER BY ?dist
    LIMIT 60
  `;

  try {
    console.log(
      `🚀 Running parallel radius queries for ${
        isMuseumOnly ? "museums" : "sites"
      }`
    );

    // Run both queries in parallel with timeout protection
    const COMPREHENSIVE_TIMEOUT = 12000; // 12 seconds max

    const comprehensiveWithTimeout = Promise.race([
      fetchSparql(comprehensiveQuery),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Comprehensive query timeout")),
          COMPREHENSIVE_TIMEOUT
        )
      ),
    ]);

    const [fastResults, comprehensiveResults] = await Promise.allSettled([
      fetchSparql(fastQuery),
      comprehensiveWithTimeout,
    ]);

    // Extract bindings from successful queries
    const fastBindings =
      fastResults.status === "fulfilled"
        ? fastResults.value?.results?.bindings ?? []
        : [];

    const comprehensiveBindings =
      comprehensiveResults.status === "fulfilled"
        ? comprehensiveResults.value?.results?.bindings ?? []
        : [];

    // Log detailed results
    console.log(`✅ Fast query: ${fastBindings.length} results`);
    if (comprehensiveResults.status === "rejected") {
      console.log(
        `⚠️ Comprehensive query failed/timed out: ${comprehensiveResults.reason}`
      );
    } else {
      console.log(
        `✅ Comprehensive query: ${comprehensiveBindings.length} results`
      );
    }

    // Merge results
    const bindings = [...fastBindings, ...comprehensiveBindings];
    console.log(
      `📊 Found ${bindings.length} ${
        isMuseumOnly ? "museums" : "sites"
      } from Wikidata (before deduplication)`
    );

    // Process sites without fetching Wikipedia descriptions for instant loading
    const sites = bindings.map((b: any) => {
      const coord = b.coord?.value as string | undefined;
      if (!coord?.startsWith("Point(")) return null;

      const [lonStr, latStr] = coord.slice(6, -1).split(" ");
      const siteLon = parseFloat(lonStr);
      const siteLat = parseFloat(latStr);

      if (!Number.isFinite(siteLat) || !Number.isFinite(siteLon)) {
        return null;
      }

      // Calculate actual distance from user's position to site
      const distanceKm = calculateDistance(userLat, userLng, siteLat, siteLon);

      let imageUrl: string | null = null;
      if (b.image?.value) {
        const fileName = decodeURIComponent(
          b.image.value.split("/").pop() || ""
        );
        imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
          fileName
        )}?width=400`;
      }

      const instanceLabel = b.instanceLabel?.value || "";
      const id = `wd_${b.item?.value?.split("/").pop()}`;
      const qid = b.item?.value?.split("/").pop();
      if (!qid) return null;

      // Use simple Wikidata description - no Wikipedia fetching!
      const descriptionHtml: string =
        b.description?.value || instanceLabel || "Notable site";

      return {
        id,
        name: b.itemLabel?.value || "Unknown Site",
        latitude: siteLat,
        longitude: siteLon,
        distance: distanceKm,
        description: descriptionHtml,
        address: b.streetAddress?.value || b.location?.value || "Unknown",
        image: imageUrl,
        type: getSiteType(instanceLabel),
        source: "wikidata",
        categories: [getSiteType(instanceLabel)],
        wikiPage: undefined, // Can be fetched on-demand later if needed
        rating: undefined,
        openingHours: undefined,
        isFeatured: undefined,
        reviewStats: undefined,
      } as Site;
    });

    const validSites = sites.filter((s: Site | null): s is Site => !!s);
    console.log(`Valid sites after filtering: ${validSites.length}`);

    // Cache the results for 3 days
    const THREE_DAYS_TTL = 3 * 24 * 60 * 60 * 1000;
    await cacheManager.set(cacheKey, validSites, THREE_DAYS_TTL);
    console.log(`✅ Cached ${validSites.length} sites for location`);

    return validSites;
  } catch (error) {
    console.warn(
      `Wikidata API error (${isMuseumOnly ? "museums" : "sites"}):`,
      error
    );
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Thunks                                                            */
/* ------------------------------------------------------------------ */

// Store for abort controllers to allow cancellation of in-flight requests
let currentAbortController: AbortController | null = null;

export const getNearbySites = createAsyncThunk<
  Site[],
  {
    lat: number;
    lng: number;
    radius: number;
    useCache?: boolean;
    language?: string;
  },
  { rejectValue: string }
>(
  "sites/getNearbySites",
  async (
    { lat, lng, radius, useCache = true, language = "en" },
    { rejectWithValue, signal }
  ) => {
    console.log(
      `getNearbySites called with: lat=${lat}, lng=${lng}, radius=${radius}m`
    );

    // Cancel any previous in-flight request
    if (currentAbortController) {
      console.log("Cancelling previous fetch request");
      currentAbortController.abort();
    }

    // Create new abort controller for this request
    currentAbortController = new AbortController();
    const localAbortController = currentAbortController;

    const cacheKey = cacheManager.generateCoordinateKey(
      lat,
      lng,
      radius,
      "wikidata_nearby_sites"
    );

    try {
      // Check if request was aborted
      if (localAbortController.signal.aborted || signal.aborted) {
        console.log("Request aborted before starting");
        return rejectWithValue("Request cancelled");
      }

      if (useCache) {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          console.log("Using cached nearby sites:", (cached as Site[]).length);
          return cached as Site[];
        }
      }

      // Check again before expensive operation
      if (localAbortController.signal.aborted || signal.aborted) {
        console.log("Request aborted before fetching");
        return rejectWithValue("Request cancelled");
      }

      const sites = await fetchWikimediaSites(
        lat,
        lng,
        radius,
        false,
        language
      );

      // Check if aborted after fetch
      if (localAbortController.signal.aborted || signal.aborted) {
        console.log("Request aborted after fetching");
        return rejectWithValue("Request cancelled");
      }

      if (!sites.length) {
        console.warn("No nearby sites found");
        return [];
      }

      const deduped = dedupeSites(sites)
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
        .slice(0, 50);

      console.log(`Returning ${deduped.length} deduplicated sites`);
      await cacheManager.set(cacheKey, deduped, CACHE_TTL);

      // Clear the abort controller if this request completed successfully
      if (currentAbortController === localAbortController) {
        currentAbortController = null;
      }

      return deduped;
    } catch (error: any) {
      // Check if error is due to abort
      if (
        error?.name === "AbortError" ||
        localAbortController.signal.aborted ||
        signal.aborted
      ) {
        console.log("Request was cancelled");
        return rejectWithValue("Request cancelled");
      }

      console.error("getNearbySites error:", error);
      if (useCache) {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          console.log(
            "Falling back to cached nearby sites:",
            (cached as Site[]).length
          );
          return cached as Site[];
        }
      }
      Toast.show({ type: "error", text1: "Failed to fetch nearby sites" });
      return rejectWithValue(
        error?.message ?? "Failed to fetch nearby sites data"
      );
    }
  }
);

// Store for abort controllers to allow cancellation of in-flight requests
let currentMuseumsAbortController: AbortController | null = null;
let currentCityAbortController: AbortController | null = null;

export const getWikipediaMuseums = createAsyncThunk<
  Site[],
  {
    lat: number;
    lng: number;
    radius: number;
    useCache?: boolean;
    language?: string;
  },
  { rejectValue: string }
>(
  "sites/getWikipediaMuseums",
  async (
    { lat, lng, radius, useCache = true, language = "en" },
    { rejectWithValue, signal }
  ) => {
    console.log(
      `getWikipediaMuseums called with: lat=${lat}, lng=${lng}, radius=${radius}m`
    );

    // Cancel any previous in-flight request
    if (currentMuseumsAbortController) {
      console.log("Cancelling previous museums fetch request");
      currentMuseumsAbortController.abort();
    }

    // Create new abort controller for this request
    currentMuseumsAbortController = new AbortController();
    const localAbortController = currentMuseumsAbortController;

    const cacheKey = cacheManager.generateCoordinateKey(
      lat,
      lng,
      radius,
      "wikidata_museums"
    );

    try {
      // Check if request was aborted
      if (localAbortController.signal.aborted || signal.aborted) {
        console.log("Museums request aborted before starting");
        return rejectWithValue("Request cancelled");
      }

      if (useCache) {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          console.log("Using cached museums:", (cached as Site[]).length);
          return cached as Site[];
        }
      }

      // Check again before expensive operation
      if (localAbortController.signal.aborted || signal.aborted) {
        console.log("Museums request aborted before fetching");
        return rejectWithValue("Request cancelled");
      }

      const sites = await fetchWikimediaSites(lat, lng, radius, true, language);

      // Check if aborted after fetch
      if (localAbortController.signal.aborted || signal.aborted) {
        console.log("Museums request aborted after fetching");
        return rejectWithValue("Request cancelled");
      }

      if (!sites.length) {
        console.warn("No museums found");
        return [];
      }

      const deduped = dedupeSites(sites)
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
        .slice(0, 50);

      console.log(`Returning ${deduped.length} deduplicated museums`);
      await cacheManager.set(cacheKey, deduped, CACHE_TTL);

      // Clear the abort controller if this request completed successfully
      if (currentMuseumsAbortController === localAbortController) {
        currentMuseumsAbortController = null;
      }

      return deduped;
    } catch (error: any) {
      // Check if error is due to abort
      if (
        error?.name === "AbortError" ||
        localAbortController.signal.aborted ||
        signal.aborted
      ) {
        console.log("Museums request was cancelled");
        return rejectWithValue("Request cancelled");
      }

      console.error("getWikipediaMuseums error:", error);
      if (useCache) {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          console.log(
            "Falling back to cached museums:",
            (cached as Site[]).length
          );
          return cached as Site[];
        }
      }
      Toast.show({
        type: "error",
        text1: "Failed to fetch cultural sites data",
      });
      return rejectWithValue(error?.message ?? "Failed to fetch Wikidata data");
    }
  }
);

// Export helper function for on-demand Wikipedia fetching
export async function fetchWikipediaForSite(
  siteName: string,
  language: string = "en"
): Promise<string | null> {
  try {
    // First, get Wikipedia page title from Wikidata
    // Search for the entity by name
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      siteName
    )}&language=${language}&limit=1&format=json&origin=*`;

    await apiLimiter.wait();
    const searchResp = await fetch(searchUrl);
    if (!searchResp.ok) return null;

    const searchData = await searchResp.json();
    const qid = searchData?.search?.[0]?.id;
    if (!qid) return null;

    // Get Wikipedia page title
    const wikiTitles = await batchFetchWikipediaTitles([qid], language);
    const wikiPage = wikiTitles.get(qid);
    if (!wikiPage) return null;

    // Check cache first
    const cacheKey = `wiki_desc_${language}_${wikiPage}`;
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      console.log(`⚡ Using cached Wikipedia for ${siteName}`);
      return cached as string;
    }

    // Fetch Wikipedia description
    const description = await fetchWikipediaDescription(wikiPage, language);
    if (
      description &&
      description !== `<p>No description available from Wikipedia.</p>`
    ) {
      await cacheManager.set(cacheKey, description, CACHE_TTL);
      return description;
    }

    return null;
  } catch (error) {
    console.warn(`Failed to fetch Wikipedia for ${siteName}:`, error);
    return null;
  }
}

export const getSitesByCity = createAsyncThunk<
  Site[],
  {
    cityName: string;
    useCache?: boolean;
    language?: string;
  },
  { rejectValue: string }
>(
  "sites/getSitesByCity",
  async (
    { cityName, useCache = true, language = "en" },
    { rejectWithValue, signal }
  ) => {
    console.log(`getSitesByCity called for: ${cityName}`);

    // Cancel any previous in-flight request
    if (currentCityAbortController) {
      console.log("Cancelling previous city fetch request");
      currentCityAbortController.abort();
    }

    // Create new abort controller for this request
    currentCityAbortController = new AbortController();
    const localAbortController = currentCityAbortController;

    const cacheKey = `city_sites_${cityName
      .toLowerCase()
      .replace(/\s+/g, "_")}_${language}`;

    try {
      // Check if request was aborted
      if (localAbortController.signal.aborted || signal.aborted) {
        console.log("City request aborted before starting");
        return rejectWithValue("Request cancelled");
      }

      if (useCache) {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          console.log(
            `Using cached sites for ${cityName}:`,
            (cached as Site[]).length
          );
          return cached as Site[];
        }
      }

      // Check again before expensive operation
      if (localAbortController.signal.aborted || signal.aborted) {
        console.log("City request aborted before fetching");
        return rejectWithValue("Request cancelled");
      }

      const sites = await fetchSitesByCity(cityName, language);

      // Check if aborted after fetch
      if (localAbortController.signal.aborted || signal.aborted) {
        console.log("City request aborted after fetching");
        return rejectWithValue("Request cancelled");
      }

      if (!sites.length) {
        console.warn(`No sites found for city: ${cityName}`);
        return [];
      }

      const deduped = dedupeSites(sites)
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
        .slice(0, 100); // Reduced from 200 to prevent memory issues

      console.log(`Returning ${deduped.length} sites for ${cityName}`);
      await cacheManager.set(cacheKey, deduped, CACHE_TTL);

      // Clear the abort controller if this request completed successfully
      if (currentCityAbortController === localAbortController) {
        currentCityAbortController = null;
      }

      return deduped;
    } catch (error: any) {
      // Check if error is due to abort
      if (
        error?.name === "AbortError" ||
        localAbortController.signal.aborted ||
        signal.aborted
      ) {
        console.log("City request was cancelled");
        return rejectWithValue("Request cancelled");
      }

      console.error(`getSitesByCity error for ${cityName}:`, error);
      if (useCache) {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          console.log(
            `Falling back to cached sites for ${cityName}:`,
            (cached as Site[]).length
          );
          return cached as Site[];
        }
      }
      Toast.show({
        type: "error",
        text1: `Failed to fetch sites for ${cityName}`,
      });
      return rejectWithValue(
        error?.message ?? `Failed to fetch sites for ${cityName}`
      );
    }
  }
);
