// src/screens/HomeScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useIncrementalList } from "../../hooks/useIncrementalList";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { useDispatch, useSelector } from "react-redux";
import { ExhibitionsCard } from "../../Components-dui/ExhibitionsCard";
import { FeaturedCards } from "../../Components-dui/FeaturedCards";
import { getNearbySites, Site } from "../../redux/actions/nearbyAction";
import { fetchNotifications } from "../../redux/actions/notifictionAction";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getAllSitesAction,
  siteBookMarkedAction,
} from "../../redux/actions/sitesActions";
import type { AppDispatch } from "../../redux/store";

function Ghost({ height = 16, width = "100%", radius = 12, style }: any) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          height,
          width,
          borderRadius: radius,
          backgroundColor: "rgba(0,0,0,0.08)",
          opacity,
        },
        style,
      ]}
    />
  );
}

function GhostCardRow() {
  return (
    <View style={{ marginBottom: 14 }}>
      <Ghost height={180} radius={16} />
      <View style={{ height: 10 }} />
      <Ghost width={"70%"} height={16} />
      <View style={{ height: 6 }} />
      <Ghost width={"40%"} height={14} />
    </View>
  );
}

const { width } = Dimensions.get("window");

// ---------- Theme ----------
const Colors = {
  light: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    primary: "#4F46E5",
    secondary: "#8B5CF6",
    sectionTitle: "#1E293B",
    welcomeUser: "#0F172A",
    movieText: "#64748B",
    searchBorderColor: "#E2E8F0",
    searchBackground: "#F1F5F9",
    text: "#0F172A",
    textSecondary: "#64748B",
    inActiveDot: "#CBD5E1",
    activeDot: "#4F46E5",
    chipBackground: "#F8FAFC",
    chipActiveBackground: "#4F46E5",
    chipText: "#64748B",
    chipActiveText: "#FFFFFF",
    cardBackground: "#FFFFFF",
    divider: "#E2E8F0",
  },
  dark: {
    background: "#0F172A",
    surface: "#1E293B",
    primary: "#6366F1",
    secondary: "#A78BFA",
    sectionTitle: "#F8FAFC",
    welcomeUser: "#F8FAFC",
    movieText: "#CBD5E1",
    searchBorderColor: "#334155",
    searchBackground: "#1E293B",
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    inActiveDot: "#475569",
    activeDot: "#6366F1",
    chipBackground: "#1E293B",
    chipActiveBackground: "#6366F1",
    chipText: "#CBD5E1",
    chipActiveText: "#F8FAFC",
    cardBackground: "#1E293B",
    divider: "#334155",
  },
};

// ---------- Hardcoded demo images ----------
const HARDCODED_IMAGES = [
  "https://images.unsplash.com/photo-1578301978018-3005759f48f7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2044",
];

// ---------- Utils ----------
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

const mapSiteTypeToCategory = (type: string) => {
  const typeMap: Record<string, string> = {
    museum: "Musees",
    gallery: "Galerie d'art",
    monument: "Monuments",
    historic_site: "Monuments",
    religious_site: "Monuments",
    palace: "Monuments",
    castle: "Monuments",
    tower: "Monuments",
    bridge: "Monuments",
    memorial: "Monuments",
    archaeological_site: "Monuments",
    temple: "Monuments",
    landmark: "Monuments",
    library: "Musees",
    theater: "Musees",
    park: "Monuments",
    garden: "Monuments",
    square: "Monuments",
    market: "Monuments",
  };
  return typeMap[type] || "Musees";
};

const generateOpeningHours = () => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return days.map((day) => ({ day, opening: "09:00", closing: "18:00" }));
};

const normalizeName = (s: string | null | undefined) =>
  (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// ---- NearbyList (non-virtualized to avoid nested VirtualizedList warning) ----
function NearbyList({
  items,
  today,
  userId,
  colorScheme,
  onToggleBookmark,
  t,
}: any) {
  const { visible, loadMore, canLoadMore } = useIncrementalList(items, 8, 10);

  const renderItem = (item: any) => {
    const todayHours = Array.isArray(item.openingHours)
      ? item.openingHours.find((h: any) => h.day === today) || {
          opening: "Not available",
          closing: "Not available",
        }
      : { opening: "Not available", closing: "Not available" };

    return (
      <ExhibitionsCard
        key={item._id ?? item.id}
        title={item?.name || "Unknown"}
        location={item?.address || "Unknown"}
        distance={
          typeof item.distance === "number"
            ? item.distance > 1
              ? `${item.distance.toFixed(1)} km away`
              : `${(item.distance * 1000).toFixed(0)} m away`
            : "Unknown"
        }
        type={item?.categories?.[0] || "Unknown"}
        category={item?.categories?.[0] || ""}
        image={{
          uri:
            item.image ||
            (item.images?.length > 0
              ? `${item.images[0]}`
              : HARDCODED_IMAGES[0]),
        }}
        startDate={item?.startDate || ""}
        endDate={item?.endDate || ""}
        time={item?.time || ""}
        item={item}
        userId={userId}
        onPress={() => onToggleBookmark(item)}
        opening={todayHours.opening}
        closing={todayHours.closing}
      />
    );
  };

  // small auto-reveal after items arrive
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    if (!items?.length || !canLoadMore) return;

    let steps = 0;
    autoTimerRef.current = setInterval(() => {
      steps += 1;
      if (steps > 2 || !canLoadMore) {
        if (autoTimerRef.current) {
          clearInterval(autoTimerRef.current);
          autoTimerRef.current = null;
        }
        return;
      }
      loadMore();
    }, 250);

    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [items, canLoadMore, loadMore]);

  return (
    <View>
      {visible.map((item: any) => renderItem(item))}
      {canLoadMore && (
        <View style={{ paddingVertical: 16, alignItems: "center" }}>
          <ActivityIndicator
            size="small"
            color={colorScheme === "dark" ? "#fff" : "#000"}
          />
          <Text
            style={{
              color: colorScheme === "dark" ? "#fff" : "#000",
              marginTop: 8,
              fontSize: 12,
            }}
          >
            {t("home.loadingMore")}
          </Text>
        </View>
      )}
    </View>
  );
}

// ---------- Component ----------
function HomeScreen() {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  const currentColors = Colors[colorScheme];
  const dispatch = useDispatch<AppDispatch>();
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();
  // Redux state
  const { data: nearbySites, isLoading: nearbySitesLoading } = useSelector(
    (state: any) => state.nearbySites
  );
  const { user } = useSelector((state: any) => state.auth);
  const { data: notifications } = useSelector(
    (state: any) => state.notifications
  );

  // Local state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | "Museum" | "Landmark" | "Gallery"
  >("All");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    radius: number;
  } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cachedSites, setCachedSites] = useState<Site[] | null>(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [hasShownSkeletonOnce, setHasShownSkeletonOnce] = useState(false);
  const [showUpdating, setShowUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  // Track if initial fetch has been done
  const hasFetchedOnce = useRef(false);
  const hasRequestedLocation = useRef(false);
  const lastFetchKeyRef = useRef<string | null>(null);
  const hasPrefetchedMapRef = useRef(false);
  const ENABLE_PREFETCH = false; // optional: set true to fetch 50km once after first fetch

  const userId = user?._id || "";

  // ---------- Caching ----------
  const CACHE_KEY = "@NearbySites";
  const CACHE_EXPIRY = 60 * 60 * 1000; // 1h

  // Deduplicate and merge sites from nearbySites
  const transformedSites = useMemo(() => {
    const allSites: Site[] = [...(nearbySites || [])];

    const byId = new Map<string, Site>();
    const byName = new Map<string, Site[]>();
    for (const site of allSites) {
      const id = String(site.id);
      if (!byId.has(id)) byId.set(id, site);
      else {
        const existing = byId.get(id)!;
        byId.set(id, {
          ...existing,
          description: site.description || existing.description,
          image: site.image || existing.image,
          categories: [
            ...new Set([
              ...(existing.categories || []),
              ...(site.categories || []),
            ]),
          ],
        });
      }
    }

    for (const site of byId.values()) {
      const n = normalizeName(site.name);
      if (!n) continue;
      if (!byName.has(n)) byName.set(n, []);
      byName.get(n)!.push(site);
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

    return deduped.map((site: any) => ({
      ...site,
      _id: site.id,
      address:
        site.address || site.description || `${site.type} in ${site.name}`,
      categories: site.categories?.length
        ? site.categories
        : [mapSiteTypeToCategory(site.type || "landmark")],
      time: site.time || "09:00AM To 06:00PM",
      rating: site.rating || 4.5,
      images: site.image ? [site.image] : [],
      openingHours: site.openingHours?.length
        ? site.openingHours
        : generateOpeningHours(),
      isFeatured: !!site.isFeatured || Math.random() > 0.7,
      reviewStats: site.reviewStats || {
        averageRating: 4.5,
        totalReviews: Math.floor(Math.random() * 100) + 10,
      },
    }));
  }, [nearbySites]);

  const sites = useMemo(
    () => (transformedSites.length ? transformedSites : cachedSites || []),
    [transformedSites, cachedSites]
  );

  // ---------- Location (FETCH ONCE) ----------
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied.");
        return false;
      }
      return true;
    } catch (error) {
      console.warn("Permission error:", error);
      setLocationError("Failed to request location permission.");
      return false;
    }
  };

  const loadCacheForCoords = useCallback(async (lat: number, lng: number) => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (!cachedData) return;
      const { sites, latitude, longitude, timestamp } = JSON.parse(cachedData);
      const isCacheValid = Date.now() - timestamp < CACHE_EXPIRY;
      const isSameLocation = haversineKm(lat, lng, latitude, longitude) < 0.1;
      if (isCacheValid && isSameLocation) {
        setCachedSites(sites);
        console.log("[cache:loaded]", sites?.length ?? 0);
      }
    } catch (error) {
      console.warn("Error loading cached sites:", error);
    }
  }, []);

  const acquireLocationOnce = useCallback(async () => {
    if (hasRequestedLocation.current) return;
    hasRequestedLocation.current = true;

    setIsLocationLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsLocationLoading(false);
        Alert.alert(
          t("home.permissionDenied"),
          t("home.locationPermissionRequired")
        );
        dispatch(getAllSitesAction({}) as any);
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude, radius: 5000 });
      setIsLocationLoading(false);
      setLocationError(null);
      await loadCacheForCoords(latitude, longitude);
      console.log("[location]", latitude, longitude);
    } catch (error) {
      console.warn("Location fetch error:", error);
      setLocationError(
        "Unable to fetch location. Please enable location services."
      );
      setIsLocationLoading(false);
      Alert.alert(t("home.locationError"), t("home.unableToFetchLocationLong"));
    }
  }, [dispatch, loadCacheForCoords]);

  useEffect(() => {
    acquireLocationOnce();
  }, [acquireLocationOnce]);

  // First-load skeleton control
  useEffect(() => {
    if (!isLocationLoading && !nearbySitesLoading) {
      setHasShownSkeletonOnce(true);
    }
  }, [isLocationLoading, nearbySitesLoading]);

  // Smooth "updating..." pill
  useEffect(() => {
    const isLoadingSomething = nearbySitesLoading || isPrefetching;
    if (isLoadingSomething) {
      setShowUpdating(true);
    } else if (showUpdating) {
      const timer = setTimeout(() => setShowUpdating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [nearbySitesLoading, isPrefetching, showUpdating]);

  // Deduped dispatch wrapper
  const fetchNearbyOnce = useCallback(
    async (params: {
      lat: number;
      lng: number;
      radius: number;
      useCache: boolean;
    }) => {
      const key = JSON.stringify(params);
      if (lastFetchKeyRef.current === key) {
        return; // identical fetch already ran
      }
      lastFetchKeyRef.current = key;
      await dispatch(
        getNearbySites({ ...params, language: i18n.language }) as any
      );
    },
    [dispatch, i18n.language]
  );

  // ---------- Fetch sites (ONLY ONCE on initial load) ----------
  useEffect(() => {
    if (userLocation && !isLocationLoading && !hasFetchedOnce.current) {
      hasFetchedOnce.current = true;
      fetchNearbyOnce({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radius: userLocation.radius,
        useCache: true,
      });
    }
  }, [userLocation, isLocationLoading, fetchNearbyOnce]);

  // ---------- Prefetch wider area for MapScreen (optional, one-time) ----------
  useEffect(() => {
    if (
      ENABLE_PREFETCH &&
      userLocation &&
      !isLocationLoading &&
      !nearbySitesLoading &&
      hasFetchedOnce.current &&
      !hasPrefetchedMapRef.current
    ) {
      const prefetchTimer = setTimeout(() => {
        hasPrefetchedMapRef.current = true;
        const MAP_RADIUS = 50000; // 50km
        setIsPrefetching(true);

        fetchNearbyOnce({
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          radius: MAP_RADIUS,
          useCache: true,
        }).finally(() => setIsPrefetching(false));
      }, 2000);

      return () => clearTimeout(prefetchTimer);
    }
  }, [
    ENABLE_PREFETCH,
    userLocation,
    isLocationLoading,
    nearbySitesLoading,
    fetchNearbyOnce,
  ]);

  // ---------- Pull to Refresh Handler ----------
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    console.log("[refresh] User triggered refresh");

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude, radius: 5000 });

      // Force fresh nearby sites (new key due to useCache: false)
      await fetchNearbyOnce({
        lat: latitude,
        lng: longitude,
        radius: 5000,
        useCache: false,
      });

      // Optional: prefetch map (fresh) if enabled
      if (ENABLE_PREFETCH) {
        await fetchNearbyOnce({
          lat: latitude,
          lng: longitude,
          radius: 50000,
          useCache: false,
        });
      }
    } catch (error) {
      console.warn("[refresh:error]", error);
      Alert.alert(t("home.refreshFailed"), t("home.unableToRefresh"));
    } finally {
      setRefreshing(false);
    }
  }, [fetchNearbyOnce]);

  // Save cache after successful loads
  useEffect(() => {
    const save = async () => {
      if (sites && sites.length && userLocation && !nearbySitesLoading) {
        try {
          const cacheData = {
            sites,
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            timestamp: Date.now(),
          };
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
          console.log("[cache:saved]", sites?.length ?? 0);
        } catch (error) {
          console.warn("Error saving cached sites:", error);
        }
      }
    };
    save();
  }, [sites, userLocation, nearbySitesLoading]);

  // Retry handler for location error
  const handleRetryLocation = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch {}
    hasRequestedLocation.current = false;
    hasFetchedOnce.current = false;
    lastFetchKeyRef.current = null;
    setLocationError(null);
    setUserLocation(null);
    acquireLocationOnce();
  }, [acquireLocationOnce]);

  // Notifications
  useEffect(() => {
    dispatch(fetchNotifications() as any);
  }, [dispatch]);

  // ---------- Filters & sorting ----------
  const onCategoryPress = (key: "All" | "Museum" | "Landmark" | "Gallery") =>
    setSelectedCategory(key);

  const sortedSites = useMemo(() => {
    if (!sites.length) return sites;

    console.log("[sortedSites] Sample site distances:");
    sites.slice(0, 5).forEach((site: any) => {
      console.log(`- ${site.name}: ${site.distance} km`);
    });

    return [...sites]
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
      .slice(0, 50);
  }, [sites]);

  const filteredResults = useMemo(() => {
    let results = sortedSites;

    if (searchQuery) {
      results = results.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      results = results.filter((item) =>
        item.categories?.some(
          (cat: any) => cat?.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }

    console.log(
      `[ui:filteredResults] ${results.length} sites (category: ${selectedCategory}, search: "${searchQuery}")`
    );
    return results;
  }, [searchQuery, selectedCategory, sortedSites]);

  // ---------- Handlers ----------

  const handleSettings = () => navigation.navigate("SettingsScreen");
  const handleNotification = () => navigation.navigate("NotificationScreen");

  const handleToggleBookMarked = (item: any) => {
    dispatch(
      siteBookMarkedAction({
        id: String(item._id ?? item.id),
        callback: () => {},
      }) as any
    );
  };

  const hasUnreadNotification = useMemo(
    () => notifications?.some((n: any) => n.isRead === false),
    [notifications]
  );

  useFocusEffect(
    useCallback(() => {
      return () => setSearchQuery("");
    }, [])
  );

  // ---------- UI Helpers ----------
  const today = new Date().toLocaleString("en-US", { weekday: "long" });

  const renderNoDataView = () => (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="search-outline"
          size={48}
          color={currentColors.textSecondary}
        />
      </View>

      <Text style={[styles.primaryText, { color: currentColors.text }]}>
        {filteredResults.length === 0 && sites.length > 0
          ? t("home.noSitesMatchFilters")
          : t("home.noSitesNearby")}
      </Text>

      <Text
        style={[styles.secondaryText, { color: currentColors.textSecondary }]}
      >
        {filteredResults.length === 0 && sites.length > 0
          ? t("home.tryDifferentFilters")
          : t("home.tryDifferentLocation")}
      </Text>
    </View>
  );

  const renderSkeletonLoading = () => (
    <>
      <View style={{ margin: 50 }}>
        <View />
      </View>
      <View style={{ height: 250, padding: 20 }}>
        {[1, 2].map((i) => (
          <GhostCardRow key={i} />
        ))}
      </View>
    </>
  );

  const displayFeaturedItems =
    filteredResults.filter((item: any) => item.isFeatured).length > 0
      ? filteredResults.filter((item: any) => item.isFeatured)
      : null;

  const displayNearbyItems =
    filteredResults.length > 0 ? filteredResults : null;

  return (
    <SafeAreaView style={{ flex: 1, marginBottom: 40, position: "relative" }}>
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#1e3a8a", "#581c87", "#0f172a"]
            : [
                "rgba(243, 232, 255, 0.95)", // Light purple
                "rgba(219, 234, 254, 0.90)", // Light blue
                "rgba(255, 255, 255, 0.85)", // White
              ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 90,
            marginTop: insets.top + 10,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colorScheme === "dark" ? "#FFFFFF" : "#4F46E5"}
              colors={["#4F46E5", "#8B5CF6"]}
              progressBackgroundColor={
                colorScheme === "dark" ? "#1E293B" : "#FFFFFF"
              }
            />
          }
        >
          {(isLocationLoading || nearbySitesLoading) &&
            !hasShownSkeletonOnce &&
            renderSkeletonLoading()}

          {/* Centered location error overlay */}
          {!isLocationLoading && locationError && !nearbySitesLoading && (
            <View
              pointerEvents="auto"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(0, 0, 0, 0.8)"
                      : "rgba(255, 255, 255, 0.9)",
                  zIndex: 9999,
                  elevation: 20,
                },
              ]}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(254, 226, 226, 1)",
                  borderRadius: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={32}
                  color={currentColors.text}
                />
              </View>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 8,
                  textAlign: "center",
                  color: currentColors.text,
                }}
              >
                {t("home.locationError")}
              </Text>

              <Text
                style={{
                  textAlign: "center",
                  marginBottom: 16,
                  color: currentColors.textSecondary,
                  paddingHorizontal: 24,
                }}
              >
                {locationError}
              </Text>

              <TouchableOpacity
                onPress={handleRetryLocation}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: currentColors.primary,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  {t("home.retry")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {isManualRefresh && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                zIndex: 1000,
              }}
            >
              <View
                style={{
                  backgroundColor:
                    colorScheme === "dark" ? "#1E293B" : "#FFFFFF",
                  borderRadius: 16,
                  padding: 24,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <ActivityIndicator
                  size="large"
                  color={colorScheme === "dark" ? "#FFFFFF" : "#4F46E5"}
                />
              </View>
            </View>
          )}
          {!isLocationLoading && !locationError && !nearbySitesLoading && (
            <View
              style={{
                paddingHorizontal: 10,
                paddingBottom: 20,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginHorizontal: 10,
                      borderWidth: 0,
                      shadowColor: "#000",
                      elevation: 2,
                      borderColor:
                        colorScheme === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={["#8B5CF6", "#818CF8", "#93C5FD"]}
                      locations={[0, 0.5, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    {user?.profilePicture ? (
                      <Image
                        source={{ uri: user.profilePicture }}
                        style={{ width: 44, height: 44, borderRadius: 22 }}
                      />
                    ) : (
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 20,
                          fontWeight: "700",
                        }}
                      >
                        {(user?.userName?.[0] || "M").toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
                        fontSize: 18,
                        fontWeight: "700",
                        marginBottom: 4,
                      }}
                    >
                      {t("home.hello")}, {user?.userName || "Visitor"}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={{
                        color:
                          colorScheme === "dark"
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(0,0,0,0.6)",
                        fontSize: 14,
                        lineHeight: 18,
                        fontWeight: "400",
                      }}
                    >
                      {t("home.discoverSites", { count: sites.length })}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleSettings}
                    activeOpacity={0.7}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                      borderWidth: 1,
                      borderColor:
                        colorScheme === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.2)",
                    }}
                  >
                    <Ionicons
                      name="settings-outline"
                      size={20}
                      color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleNotification}
                    activeOpacity={0.7}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      borderWidth: 1,
                      borderColor:
                        colorScheme === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.2)",
                    }}
                  >
                    <Ionicons
                      name="notifications-outline"
                      size={20}
                      color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                    />
                    {hasUnreadNotification && (
                      <View
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: "#EF4444",
                          borderWidth: 2,
                          borderColor:
                            colorScheme === "dark" ? "#000000" : "#FFFFFF",
                        }}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Bar */}
              <View
                style={{
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  height: 42,
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor:
                    colorScheme === "dark"
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.2)",
                  marginBottom: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={
                      colorScheme === "dark"
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(0,0,0,0.5)"
                    }
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    style={{
                      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
                      fontSize: 16,
                      fontWeight: "400",
                      flex: 1,
                      paddingVertical: 8,
                    }}
                    placeholder={t("home.searchPlaceholder")}
                    placeholderTextColor={
                      colorScheme === "dark"
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.4)"
                    }
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Category Filters */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  justifyContent: "center",
                  paddingHorizontal: 2,
                }}
              >
                {[
                  { key: "All", label: t("home.categories.all") },
                  { key: "Museum", label: t("home.categories.museum") },
                  { key: "Landmark", label: t("home.categories.landmark") },
                  { key: "Gallery", label: t("home.categories.gallery") },
                ].map((category) => {
                  const isActive =
                    (category.key === "All" && selectedCategory === "All") ||
                    (category.key === "Museum" &&
                      selectedCategory === "Museum") ||
                    (category.key === "Landmark" &&
                      selectedCategory === "Landmark") ||
                    (category.key === "Gallery" &&
                      selectedCategory === "Gallery");

                  return (
                    <TouchableOpacity
                      key={category.key}
                      style={{
                        paddingHorizontal: 16,
                        marginHorizontal: 4,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: isActive ? 0 : 1,
                        shadowColor: "#000",
                        elevation: isActive ? 4 : 2,
                        borderColor: isActive
                          ? "transparent"
                          : colorScheme === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.2)",
                        minWidth: 80,
                        alignItems: "center",
                        overflow: "hidden",
                        backgroundColor: isActive
                          ? "transparent"
                          : colorScheme === "dark"
                          ? "rgba(30, 30, 30, 0.7)"
                          : "rgba(200, 200, 200, 0.4)",
                      }}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (category.key === "All") setSelectedCategory("All");
                        else if (category.key === "Museum")
                          setSelectedCategory("Museum");
                        else if (category.key === "Landmark")
                          setSelectedCategory("Landmark");
                        else setSelectedCategory("Gallery");
                      }}
                    >
                      {isActive && (
                        <LinearGradient
                          colors={["#8B5CF6", "#818CF8", "#93C5FD"]}
                          locations={[0, 0.5, 1]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={StyleSheet.absoluteFillObject}
                        />
                      )}
                      <Text
                        style={{
                          color: isActive
                            ? "#FFFFFF"
                            : colorScheme === "dark"
                            ? "rgba(255,255,255,0.6)"
                            : "rgba(0,0,0,0.6)",
                          fontSize: 14,
                          fontWeight: isActive ? "600" : "500",
                        }}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Loading/Prefetching Indicator */}
              {(isLocationLoading || showUpdating) && (
                <View style={{ marginTop: 6, alignItems: "center" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: "rgba(0,0,0,0.15)",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                    }}
                  >
                    <ActivityIndicator
                      size="small"
                      color={colorScheme === "dark" ? "#fff" : "#000"}
                    />
                    <Text
                      style={{
                        color: colorScheme === "dark" ? "#fff" : "#000",
                        fontSize: 12,
                      }}
                    >
                      {isPrefetching
                        ? t("home.loadingMapData")
                        : t("home.updating")}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {!isLocationLoading && !locationError && !nearbySitesLoading && (
            <>
              {/* Featured Section */}
              <View
                style={{
                  padding: 12,
                  width: "auto",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: currentColors.sectionTitle,
                    fontFamily: "Poppins-Bold",
                    fontSize: 20,
                    fontWeight: "700",
                  }}
                >
                  {t("home.discoveries")}
                </Text>
                <TouchableOpacity>
                  <Text style={{ color: currentColors.primary }}>
                    {t("home.seeAll")}
                  </Text>
                </TouchableOpacity>
              </View>
              {Array.isArray(displayFeaturedItems) &&
              displayFeaturedItems.length > 0 ? (
                <View style={{ height: 250 }}>
                  <Swiper
                    showsPagination
                    loop={false}
                    autoplay={false}
                    dot={
                      <View
                        style={{ backgroundColor: currentColors.inActiveDot }}
                      />
                    }
                    activeDot={
                      <View
                        style={{ backgroundColor: currentColors.activeDot }}
                      />
                    }
                    horizontal
                    style={{ paddingLeft: 20 }}
                  >
                    {displayFeaturedItems.map((item: any) => (
                      <View key={item.id}>
                        <FeaturedCards
                          title={item?.name || "Unknown"}
                          location={item?.address || "Unknown"}
                          distance={
                            typeof item.distance === "number"
                              ? item.distance > 1
                                ? `${item.distance.toFixed(1)} km`
                                : `${(item.distance * 1000).toFixed(0)} m`
                              : "Unknown"
                          }
                          type={item?.categories?.[0] || "Unknown"}
                          time={item?.time || ""}
                          startDate={item?.startDate || ""}
                          endDate={item?.endDate || ""}
                          rating={
                            item?.rating ||
                            item?.reviewStats?.averageRating ||
                            0
                          }
                          image={{
                            uri:
                              item.image ||
                              (item.images?.length > 0
                                ? `${item.images[0]}`
                                : HARDCODED_IMAGES[0]),
                          }}
                          item={item}
                          userId={userId}
                          onPress={() => handleToggleBookMarked(item)}
                        />
                      </View>
                    ))}
                  </Swiper>
                </View>
              ) : (
                renderNoDataView()
              )}

              {/* Nearby Section */}
              <View style={{ paddingHorizontal: 18, paddingTop: 6 }}>
                <View
                  style={{
                    width: "auto",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: currentColors.sectionTitle,
                      fontFamily: "Poppins-Bold",
                      fontSize: 20,
                      fontWeight: "700",
                    }}
                  >
                    {t("home.selection")}
                  </Text>
                  <TouchableOpacity>
                    <Text style={{ color: currentColors.primary }}>
                      {t("home.seeAll")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {Array.isArray(displayNearbyItems) &&
                displayNearbyItems.length === 0 ? (
                  renderNoDataView()
                ) : (
                  <NearbyList
                    items={displayNearbyItems}
                    today={today}
                    userId={userId}
                    colorScheme={colorScheme}
                    onToggleBookmark={handleToggleBookMarked}
                    t={t}
                  />
                )}
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

export { HomeScreen as default };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.05)", // subtle background for icon
    borderRadius: 50,
  },
  primaryText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  secondaryText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.7,
  },
});
