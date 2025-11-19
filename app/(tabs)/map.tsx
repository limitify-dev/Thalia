import { Ionicons } from "@expo/vector-icons";
import MapboxGL, { Camera, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@/utils/config";
import { useDynamicCities } from "@/hooks/useDynamicCities";

MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import debounce from "lodash.debounce";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  useColorScheme,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  getNearbySites,
  getSitesByCity,
  Site,
} from "../../redux/actions/nearbyAction";
import { AppDispatch, RootState } from "../../redux/store";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");
const scaleFont = (n: number) => (width / 375) * n;
const MAX_ZOOM = 15;
const MIN_ZOOM = 4;
const DEFAULT_ZOOM = 12;
// Store as [lon, lat]
const DEFAULT_LOCATION: [number, number] = [2.3522, 48.8566];

// ---- Types ----
type Suggestion = {
  name: string;
  country: string;
  latlng: [number, number];
};

// ---- Helpers ----
const haversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const radiusFromZoom = (zoom: number) => {
  if (zoom >= 13) return 5;
  if (zoom >= 11) return 15;
  if (zoom >= 9) return 30;
  return 50;
};

const normalizeName = (s: string | null | undefined) =>
  (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// ---- Component ----
export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? "light"];
  const cameraRef = useRef<Camera>(null);
  const isInitialLocationSet = useRef(false);
  const isUserInteracting = useRef(false);
  const lastFetchedCenter = useRef<[number, number] | null>(null);
  const lastFetchedZoom = useRef<number | null>(null);
  const isCitySearch = useRef(false); // Track if current view is from city search
  const isAnimating = useRef(false); // Track if camera is animating programmatically
  const router = useRouter();
  const { cities, fetchCities, loading, error } = useDynamicCities();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading: nearbySitesLoading } = useSelector(
    (state: RootState) => state.nearbySites
  );

  const [centerCoordinate, setCenterCoordinate] = useState<
    [number, number] | null
  >(null);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState<
    "All" | "Museums" | "Monuments" | "Art" | "Markets"
  >("All");
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Modal state
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);
  }, []);

  const centerToUserLocation = useCallback(
    async (useAnimation: boolean = true) => {
      setLoadingLoc(true);
      isUserInteracting.current = false;
      if (useAnimation) {
        isAnimating.current = true;
      }
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        let lon = DEFAULT_LOCATION[0];
        let lat = DEFAULT_LOCATION[1];
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lon = loc.coords.longitude;
          lat = loc.coords.latitude;
        }
        const animDuration = useAnimation ? 1000 : 0;
        setCenterCoordinate([lon, lat]);
        setZoomLevel(DEFAULT_ZOOM);
        cameraRef.current?.setCamera({
          centerCoordinate: [lon, lat],
          zoomLevel: DEFAULT_ZOOM,
          animationDuration: animDuration,
        });
        isInitialLocationSet.current = true;
        setQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
        Keyboard.dismiss();

        // Reset animation flag after animation completes
        if (useAnimation) {
          setTimeout(() => {
            isAnimating.current = false;
          }, animDuration + 50);
        }
      } catch (error) {
        console.warn("Center to user location error:", error);
        Alert.alert(
          "Error",
          "Could not get current location. Using Paris as default."
        );
        setCenterCoordinate(DEFAULT_LOCATION);
        setZoomLevel(DEFAULT_ZOOM);
        cameraRef.current?.setCamera({
          centerCoordinate: DEFAULT_LOCATION,
          zoomLevel: DEFAULT_ZOOM,
          animationDuration: 0,
        });
        isAnimating.current = false;
      } finally {
        setLoadingLoc(false);
      }
    },
    []
  );

  useEffect(() => {
    centerToUserLocation(false);
  }, [centerToUserLocation]);

  const applyLocalFilter = useCallback(
    (list: Site[], currentFilter: string) => {
      if (currentFilter === "All") return list;
      return list.filter((s) => {
        const cats = (s.categories || []).map((c) => c.toLowerCase());
        const name = s.name.toLowerCase();
        const type = s.type?.toLowerCase() || "";
        if (currentFilter === "Museums")
          return (
            cats.includes("museum") ||
            name.includes("museum") ||
            type.includes("museum") ||
            type.includes("library") ||
            type.includes("theater")
          );
        if (currentFilter === "Monuments")
          return (
            cats.includes("monument") ||
            name.includes("monument") ||
            type.includes("monument") ||
            type.includes("historic_site") ||
            type.includes("palace") ||
            type.includes("castle") ||
            type.includes("temple") ||
            type.includes("memorial") ||
            type.includes("bridge") ||
            type.includes("tower") ||
            type.includes("square") ||
            type.includes("garden") ||
            type.includes("park")
          );
        if (currentFilter === "Art")
          return (
            cats.includes("art") ||
            name.includes("art") ||
            type.includes("gallery") ||
            type.includes("art")
          );
        if (currentFilter === "Markets")
          return (
            cats.includes("market") ||
            name.includes("market") ||
            type.includes("market")
          );
        return false;
      });
    },
    []
  );

  const mergeAndSetSites = useCallback(
    async (fetchedSites: Site[], lat: number, lng: number) => {
      const byId = new Map<string, Site>();

      for (const s of allSites) {
        byId.set(s.id, s);
      }

      for (const s of fetchedSites) {
        if (!byId.has(s.id)) {
          byId.set(s.id, s);
        } else {
          const existing = byId.get(s.id)!;
          byId.set(s.id, {
            ...existing,
            description: s.description || existing.description,
            image: s.image || existing.image,
            categories: [
              ...new Set([
                ...(existing.categories || []),
                ...(s.categories || []),
              ]),
            ],
          });
        }
      }

      const byName = new Map<string, Site[]>();
      for (const s of byId.values()) {
        const n = normalizeName(s.name);
        if (!n) continue;
        if (!byName.has(n)) byName.set(n, []);
        byName.get(n)!.push(s);
      }

      const deduped: Site[] = [];
      for (const [, group] of byName) {
        if (group.length === 1) {
          deduped.push(group[0]);
        } else {
          let best = group[0];
          for (let i = 1; i < group.length; i++) {
            const d = haversineKm(
              best.latitude,
              best.longitude,
              group[i].latitude,
              group[i].longitude
            );
            if (d <= 0.075) {
              best = {
                ...best,
                description: group[i].description || best.description,
                image: group[i].image || best.image,
                categories: [
                  ...new Set([
                    ...(best.categories || []),
                    ...(group[i].categories || []),
                  ]),
                ],
              };
            } else {
              deduped.push(group[i]);
            }
          }
          deduped.push(best);
        }
      }

      const merged = deduped
        .map((s) => ({
          ...s,
          distance: haversineKm(lat, lng, s.latitude, s.longitude),
        }))
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

      setAllSites(merged);
    },
    [allSites]
  );

  const shouldFetchNewData = useCallback(
    (center: [number, number], zoom: number) => {
      if (!lastFetchedCenter.current || lastFetchedZoom.current === null)
        return true;
      const [lastLng, lastLat] = lastFetchedCenter.current;
      const [lng, lat] = center;
      const distance = haversineKm(lastLat, lastLng, lat, lng);
      const zoomDiff = Math.abs(zoom - lastFetchedZoom.current);
      return distance > 20 || zoomDiff > 2;
    },
    []
  );

  const refreshNearbyData = useMemo(
    () =>
      debounce(async (center: [number, number], zoom: number) => {
        if (!center) return;

        // Don't auto-fetch if this is a city search - user already has results
        if (isCitySearch.current) {
          console.log("Skipping auto-fetch - city search results active");
          return;
        }

        if (!shouldFetchNewData(center, zoom)) {
          console.log("Skipping fetch - using cached data");
          return;
        }

        const [lng, lat] = center;
        const radius = radiusFromZoom(zoom) * 1000;

        console.log(
          `Fetching sites: lat=${lat}, lng=${lng}, radius=${radius}m, zoom=${zoom}`
        );

        try {
          const fetchedSites = await dispatch(
            getNearbySites({
              lat,
              lng,
              radius,
              useCache: true,
            })
          ).unwrap();
          await mergeAndSetSites(fetchedSites, lat, lng);
          lastFetchedCenter.current = center;
          lastFetchedZoom.current = zoom;
        } catch (e: any) {
          // Don't show alert for cancelled requests
          if (e?.message !== "Request cancelled" && e !== "Request cancelled") {
            console.warn("Fetching sites failed:", e);
            Alert.alert(
              "Error",
              "Failed to refresh nearby places. Please try again."
            );
          }
        }
      }, 800), // Reduced from 1500ms to 800ms for faster response
    [shouldFetchNewData, dispatch, mergeAndSetSites]
  );

  useEffect(() => {
    if (!centerCoordinate || lastFetchedCenter.current) return;

    const loadData = async () => {
      const [lng, lat] = centerCoordinate;
      const radius = radiusFromZoom(DEFAULT_ZOOM) * 1000;

      console.log("Initial data fetch");

      try {
        const fetchedSites = await dispatch(
          getNearbySites({
            lat,
            lng,
            radius,
            useCache: true,
          })
        ).unwrap();
        await mergeAndSetSites(fetchedSites, lat, lng);
        lastFetchedCenter.current = centerCoordinate;
        lastFetchedZoom.current = DEFAULT_ZOOM;
      } catch (e: any) {
        // Don't log error for cancelled requests
        if (e?.message !== "Request cancelled" && e !== "Request cancelled") {
          console.warn("Initial data fetch failed:", e);
        }
      }
    };

    loadData();
  }, [centerCoordinate, dispatch, mergeAndSetSites]);

  const clampZoom = useCallback(
    (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z)),
    []
  );

  const zoom = useCallback(
    (direction: "in" | "out") => {
      const next = clampZoom(
        direction === "in" ? zoomLevel + 1 : zoomLevel - 1
      );
      setZoomLevel(next);
      isAnimating.current = true;
      cameraRef.current?.setCamera({ zoomLevel: next, animationDuration: 250 });
      isUserInteracting.current = true;

      // Reset animation flag after animation completes
      setTimeout(() => {
        isAnimating.current = false;
      }, 300);
    },
    [zoomLevel, clampZoom]
  );

  const recenter = useCallback(async () => {
    isCitySearch.current = false; // Reset city search flag to allow location-based fetching
    await centerToUserLocation(true);
  }, [centerToUserLocation]);

  const handleMapInteraction = useCallback(() => {
    isInitialLocationSet.current = true;
    isUserInteracting.current = true;
  }, []);

  // const handleChange = useCallback((text: string) => {
  //   setQuery(text);
  //   if (text.trim().length < 2) {
  //     setSuggestions([]);
  //     setShowSuggestions(false);
  //     return;
  //   }
  //   const lower = text.toLowerCase();
  //   const matchedCities: any = cities
  //     .filter(
  //       (c) =>
  //         c.name.toLowerCase().includes(lower) ||
  //         c.country.toLowerCase().includes(lower)
  //     )
  //     .map((c) => ({
  //       type: "city",
  //       name: c.name,
  //       country: c.country,
  //       latlng: c.latlng,
  //     }));
  //   const uniqueCountries = Array.from(
  //     new Set(
  //       cities
  //         .filter((c) => c.country.toLowerCase().includes(lower))
  //         .map((c) => c.country)
  //     )
  //   );
  //   const matchedCountries = uniqueCountries
  //     .map((country) => {
  //       const cityInCountry = cities.find((c) => c.country === country);
  //       return cityInCountry
  //         ? {
  //             type: "country" as const,
  //             name: country,
  //             capital: cityInCountry.name,
  //             latlng: cityInCountry.latlng,
  //           }
  //         : null;
  //     })
  //     .filter((x): x is any => x !== null);
  //   const combined = [...matchedCities, ...matchedCountries];
  //   setSuggestions(combined.slice(0, 12));
  //   setShowSuggestions(true);
  // }, []);
  const handleChange = async (text: string) => {
    setQuery(text);

    if (text.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      await fetchCities(text);
    } catch (error) {
      console.warn("Error fetching cities:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (cities.length > 0) {
      const mappedCities: Suggestion[] = cities.map((c) => ({
        name: c.name,
        country: c.country,
        latlng: c.latlng,
      }));
      setSuggestions(mappedCities.slice(0, 12));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(query.length >= 2); // Only hide if query is long enough
    }
  }, [cities, query]);

  const jumpToSuggestion = useCallback(
    async (s: Suggestion) => {
      const [lat, lon] = s.latlng;

      lastFetchedCenter.current = null;
      lastFetchedZoom.current = null;
      isCitySearch.current = true; // Mark as city search to prevent auto-fetching
      isAnimating.current = true; // Mark that we're animating

      const newCenter: [number, number] = [lon, lat];
      const newZoom = 10;

      setCenterCoordinate(newCenter);
      setZoomLevel(newZoom);
      cameraRef.current?.setCamera({
        centerCoordinate: newCenter,
        zoomLevel: newZoom,
        animationDuration: 600,
      });
      setQuery("");
      setShowSuggestions(false);
      Keyboard.dismiss();
      isUserInteracting.current = true;

      // Reset animation flag after animation completes
      setTimeout(() => {
        isAnimating.current = false;
      }, 650); // Slightly longer than animation duration

      // Use city-based fetching for city searches - single request for ALL sites in that city
      console.log(`Fetching all sites for city: ${s.name}`);

      try {
        const startTime = Date.now();
        const fetchedSites = await dispatch(
          getSitesByCity({
            cityName: s.name,
            useCache: true,
          })
        ).unwrap();

        const loadTime = Date.now() - startTime;

        // Replace all sites with city results (don't merge)
        setAllSites(
          fetchedSites
            .map((site) => ({
              ...site,
              distance: haversineKm(lat, lon, site.latitude, site.longitude),
            }))
            .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
        );

        lastFetchedCenter.current = newCenter;
        lastFetchedZoom.current = newZoom;

        console.log(
          `✅ Loaded ${fetchedSites.length} sites for ${s.name} in ${loadTime}ms`
        );

        if (fetchedSites.length === 0) {
          // Alert.alert(
          //   "No Sites Found",
          //   `No cultural sites found in ${s.name}. Try another city.`
          // );
        }
      } catch (e: any) {
        // Don't show alert for cancelled requests
        if (e?.message !== "Request cancelled" && e !== "Request cancelled") {
          console.warn("Fetching city sites failed:", e);
          Alert.alert(
            "Error",
            `Failed to load sites for ${s.name}. Please try again.`
          );
        }
      }
    },
    [dispatch]
  );

  const filters = useMemo(
    () => ["All", "Museums", "Monuments", "Art", "Markets"] as const,
    []
  );

  const clearSuggestions = useCallback(() => {
    setShowSuggestions(false);
    Keyboard.dismiss();
  }, []);

  const handleCameraChanged = useCallback(
    debounce((state: any) => {
      if (!state?.properties) return;

      // Don't process camera changes during programmatic animations
      if (isAnimating.current) return;

      const newLng = Math.round(state.properties.center[0] * 100000) / 100000;
      const newLat = Math.round(state.properties.center[1] * 100000) / 100000;
      const newZoom = Math.round(state.properties.zoom * 10) / 10;

      const newCenter: [number, number] = [newLng, newLat];
      setCenterCoordinate(newCenter);
      setZoomLevel(clampZoom(newZoom));
      handleMapInteraction();

      refreshNearbyData(newCenter, clampZoom(newZoom));
    }, 300), // Reduced from 500ms to 300ms for faster camera response
    [clampZoom, handleMapInteraction, refreshNearbyData]
  );

  const handleUserLocationUpdate = useCallback((location: any) => {
    if (!location?.coords || isUserInteracting.current) return;
    const { longitude, latitude } = location.coords;
    if (!isInitialLocationSet.current) {
      setCenterCoordinate([longitude, latitude]);
      setZoomLevel(DEFAULT_ZOOM);
      cameraRef.current?.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: DEFAULT_ZOOM,
        animationDuration: 800,
      });
    }
  }, []);

  const handleMarkerPress = useCallback((site: Site) => {
    if (site) {
      setSelectedSite(site);
      setModalVisible(true);
    }
  }, []);

  const handleViewMore = useCallback(() => {
    if (selectedSite) {
      setModalVisible(false);
      router.push({
        pathname: "/DetailScreen",
        params: {
          item: JSON.stringify(selectedSite),
          siteId: selectedSite.id,
        },
      });
    }
  }, [selectedSite, router]);

  const displaySites = useMemo(() => {
    return applyLocalFilter(allSites, filter);
  }, [allSites, filter, applyLocalFilter]);

  const sitesFC = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: displaySites.map((s) => {
        const primaryCategory =
          s.categories?.[0]?.toLowerCase() ||
          s.type?.toLowerCase() ||
          "default";
        let icon = "📍";
        if (
          primaryCategory.includes("museum") ||
          primaryCategory.includes("library") ||
          primaryCategory.includes("theater")
        )
          icon = "🏛️";
        else if (
          primaryCategory.includes("monument") ||
          primaryCategory.includes("historic_site") ||
          primaryCategory.includes("palace") ||
          primaryCategory.includes("castle") ||
          primaryCategory.includes("temple") ||
          primaryCategory.includes("memorial") ||
          primaryCategory.includes("bridge") ||
          primaryCategory.includes("tower") ||
          primaryCategory.includes("square") ||
          primaryCategory.includes("garden") ||
          primaryCategory.includes("park")
        )
          icon = "🗿";
        else if (
          primaryCategory.includes("art") ||
          primaryCategory.includes("gallery")
        )
          icon = "🎨";
        else if (primaryCategory.includes("market")) icon = "🛍️";
        return {
          type: "Feature" as const,
          properties: {
            id: s.id,
            name: s.name,
            categories: s.categories || [],
            hasImage: !!s.image,
            imageKey: s.image ? `site-${s.id}` : null,
            icon,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [s.longitude, s.latitude],
          },
        };
      }),
    };
  }, [displaySites]);

  const markerRadius = useMemo(() => {
    // Increased sizes for better visibility
    if (zoomLevel < 11) return 24;
    if (zoomLevel < 13) return 32;
    return 40;
  }, [zoomLevel]);

  useEffect(() => {
    let isMounted = true;

    // Only prefetch images for first 10 sites to reduce memory usage
    const urls = displaySites
      .slice(0, 10)
      .map((s) => s.image)
      .filter(Boolean) as string[];

    // Prefetch in background without blocking, only if component is mounted
    if (isMounted && urls.length > 0) {
      urls.forEach((u) => Image.prefetch(u).catch(() => {}));
    }

    return () => {
      isMounted = false;
    };
  }, [displaySites]);

  const handleManualRefresh = useCallback(() => {
    if (!centerCoordinate) return;
    isCitySearch.current = false; // Reset to allow manual refresh
    lastFetchedCenter.current = null;
    lastFetchedZoom.current = null;
    refreshNearbyData(centerCoordinate, zoomLevel);
  }, [centerCoordinate, zoomLevel, refreshNearbyData]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {centerCoordinate ? (
        <MapboxGL.MapView
          style={{ flex: 1 }}
          styleURL={MapboxGL.StyleURL.SatelliteStreet}
          onPress={clearSuggestions}
          onCameraChanged={handleCameraChanged}
          onDidFinishLoadingStyle={() => setMapLoaded(true)}
          compassEnabled
          zoomEnabled
          pitchEnabled
          scrollEnabled
          renderToHardwareTextureAndroid
        >
          <Camera
            ref={cameraRef}
            centerCoordinate={centerCoordinate}
            zoomLevel={zoomLevel}
            minZoomLevel={MIN_ZOOM}
            maxZoomLevel={MAX_ZOOM}
            animationMode="flyTo"
            animationDuration={1000}
          />
          <MapboxGL.UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
            androidRenderMode="gps"
            onUpdate={handleUserLocationUpdate}
            minDisplacement={10}
          />

          <ShapeSource
            id="sites-source"
            shape={sitesFC}
            onPress={(e) => {
              const feature = e.features?.[0];
              if (
                feature &&
                feature.properties != null &&
                !feature.properties.point_count
              ) {
                const site = allSites.find(
                  (s) => s.id === (feature.properties as { id?: string }).id
                );
                if (site) handleMarkerPress(site);
              }
            }}
          >
            <SymbolLayer
              id="site-fallback-icons"
              filter={["==", ["get", "hasImage"], false]}
              style={{
                textField: ["get", "icon"],
                textSize: 24, // Increased from 16 for better visibility
                textAllowOverlap: true,
                textAnchor: "center",
              }}
            />
            <SymbolLayer
              id="site-fallback-labels"
              filter={["==", ["get", "hasImage"], false]}
              style={{
                textField: ["get", "name"],
                textSize: 12, // Increased from 10 for better readability
                textColor: "#FFFFFF",
                textHaloColor: "#000000",
                textHaloWidth: 1.5, // Increased halo for better contrast
                textOffset: [0, 2],
                textAnchor: "top",
                textOptional: true,
                textAllowOverlap: false,
              }}
            />
          </ShapeSource>

          {mapLoaded &&
            displaySites.map((s) => {
              if (!s.image) return null;
              return (
                <MapboxGL.MarkerView
                  key={s.id}
                  coordinate={[s.longitude, s.latitude]}
                >
                  <TouchableOpacity
                    onPress={() => handleMarkerPress(s)}
                    style={{ alignItems: "center" }}
                  >
                    <View
                      style={{
                        width: markerRadius * 2,
                        height: markerRadius * 2,
                        borderRadius: markerRadius,
                        overflow: "hidden",
                        backgroundColor: "#FFFFFF",
                        borderWidth: 2,
                        borderColor: "#667EEA",
                      }}
                    >
                      <Image
                        source={{ uri: s.image }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    </View>
                    <Text
                      style={{
                        color: "#FFFFFF",
                        textShadowColor: "#000000",
                        textShadowRadius: 2,
                        textShadowOffset: { width: 0, height: 1 },
                        marginTop: 2,
                        fontSize: 12, // Increased from 10 for better readability
                        fontWeight: "600",
                      }}
                    >
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                </MapboxGL.MarkerView>
              );
            })}
        </MapboxGL.MapView>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#111",
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 12 }}>Loading map…</Text>
        </View>
      )}

      {/* Site Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View
            style={{
              backgroundColor: currentColors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: insets.bottom + 20,
              maxHeight: "70%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <View
              style={{
                alignItems: "center",
                paddingVertical: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor:
                    colorScheme === "dark" ? "#4B5563" : "#D1D5DB",
                  borderRadius: 2,
                }}
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {selectedSite?.image && (
                <Image
                  source={{ uri: selectedSite.image }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 16,
                    marginBottom: 16,
                  }}
                  resizeMode="cover"
                />
              )}

              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: currentColors.text,
                  marginBottom: 8,
                }}
              >
                {selectedSite?.name}
              </Text>

              {selectedSite?.distance !== undefined && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="location-outline" size={16} color="#667EEA" />
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#667EEA",
                      marginLeft: 4,
                      fontWeight: "500",
                    }}
                  >
                    {selectedSite.distance.toFixed(2)} km away
                  </Text>
                </View>
              )}

              {selectedSite?.categories &&
                selectedSite.categories.length > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      marginBottom: 16,
                    }}
                  >
                    {selectedSite.categories.map((cat, idx) => (
                      <View
                        key={idx}
                        style={{
                          backgroundColor:
                            colorScheme === "dark" ? "#374151" : "#F3F4F6",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#667EEA",
                            fontWeight: "500",
                          }}
                        >
                          {cat}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

              <LinearGradient
                colors={["#8B5CF6", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 16,
                  marginBottom: 10,
                  shadowColor: "#8B5CF6",
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                }}
              >
                <TouchableOpacity
                  onPress={handleViewMore}
                  style={{
                    paddingVertical: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    View More Details
                  </Text>
                </TouchableOpacity>
              </LinearGradient>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  paddingVertical: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: colorScheme === "dark" ? "#9CA3AF" : "#6B7280",
                    fontSize: 15,
                    fontWeight: "500",
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SafeAreaView
        style={{
          position: "absolute",
          top: insets.top,
          left: insets.left + 10,
          right: insets.right + 10,
          zIndex: 1000,
        }}
      >
        <LinearGradient
          colors={[
            "rgba(99, 102, 241, 0.8)",
            "rgba(129, 140, 248, 0.8)",
            "rgba(165, 180, 252, 0.8)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingVertical: 20, borderRadius: 20 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 12,
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                borderColor: "rgba(165, 180, 252, 0.8)",
                borderWidth: 1,
                backgroundColor: "rgba(99, 102, 241, 0.6)",
                alignItems: "center",
                justifyContent: "center",
                elevation: 6,
              }}
            >
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>
              Map
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <View
              style={{
                width: "90%",
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 10,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                paddingHorizontal: 12,
                paddingVertical: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons
                name="search"
                size={16}
                color="#667EEA"
                style={{ marginRight: 6 }}
              />
              <TextInput
                value={query}
                onChangeText={handleChange}
                placeholder="Search cities…"
                placeholderTextColor="#999"
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: "#333",
                  paddingVertical: 0,
                }}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {loading && <ActivityIndicator size="small" color="#667EEA" />}
            </View>
          </View>

          <View style={{ alignItems: "center" }}>
            <FlatList
              data={filters}
              keyExtractor={(x) => x}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 6 }}
              renderItem={({ item }) => {
                const active = filter === item;
                return (
                  <TouchableOpacity
                    onPress={() => setFilter(item)}
                    style={{
                      marginHorizontal: 3,
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: active
                        ? "rgba(165, 180, 252, 0.7)"
                        : "rgba(129, 140, 248, 0.5)",
                      borderWidth: active ? 0 : 1,
                      borderColor: "rgba(165, 180, 252, 0.8)",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: active ? 0.15 : 0.08,
                      shadowRadius: 3,
                      elevation: active ? 3 : 1,
                    }}
                  >
                    {active && (
                      <LinearGradient
                        colors={["#8B5CF6", "#818CF8", "#93C5FD"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          ...StyleSheet.absoluteFillObject,
                          borderRadius: 16,
                        }}
                      />
                    )}
                    <Text
                      style={{
                        color: "white",
                        fontWeight: active ? "600" : "500",
                        fontSize: 12,
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </LinearGradient>
      </SafeAreaView>

      {showSuggestions && (
        <View
          style={{
            position: "absolute",
            top: insets.top + 160,
            left: insets.left + 20,
            right: insets.right + 20,
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            borderRadius: 10,
            maxHeight: 180,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 6,
            zIndex: 1001,
          }}
        >
          {loading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#667EEA" />
              <Text style={{ marginTop: 8, color: "#666" }}>Searching...</Text>
            </View>
          ) : error ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "#666" }}>{error}</Text>
            </View>
          ) : suggestions.length > 0 ? (
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => jumpToSuggestion(item)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f0f0f0",
                  }}
                >
                  <Text
                    style={{ fontSize: 15, fontWeight: "500", color: "#333" }}
                  >
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                    {item.country}
                  </Text>
                </TouchableOpacity>
              )}
            />
          ) : query.length >= 2 ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "#666" }}>No cities found</Text>
            </View>
          ) : null}
        </View>
      )}

      <View
        style={{ position: "absolute", right: 16, bottom: 120, zIndex: 999 }}
      >
        <TouchableOpacity
          onPress={handleManualRefresh}
          disabled={nearbySitesLoading}
          style={{
            marginBottom: 10,
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: nearbySitesLoading
              ? "rgba(255, 255, 255, 0.5)"
              : "rgba(34, 197, 94, 0.9)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          {nearbySitesLoading ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <Ionicons name="refresh" size={22} color="#fff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => zoom("in")}
          style={{
            marginBottom: 10,
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Ionicons name="add" size={22} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => zoom("out")}
          style={{
            marginBottom: 10,
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Ionicons name="remove" size={22} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          disabled={loadingLoc}
          onPress={recenter}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(59, 130, 246, 0.9)",
            opacity: loadingLoc ? 0.6 : 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Ionicons name="locate" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
