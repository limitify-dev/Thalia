import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import BookMarkAddIcon from "../assets/svg/book_mark.svg";
import BookMarkRemoveIcon from "../assets/svg/bookmark_remove.svg";
import { Colors } from "../constants/Colors";
import {
  getBorderRadius,
  getCardWidth,
  getFontSize,
  getIconSize,
  getScreenHeightPercentage,
  getSpacing,
} from "../constants/responsive";
import {
  getAllSitesAction,
  siteBookMarkedAction,
} from "../redux/actions/sitesActions";
import { moderateScale } from "./ExhibitionsCard";

const { width, height } = Dimensions.get("window");

// Define proper TypeScript interfaces
interface FeaturedCardsProps {
  title?: string;
  location?: string;
  time?: string;
  type?: string;
  rating?: number;
  image: ImageSourcePropType;
  startDate?: string;
  endDate?: string;
  distance?: string;
  item?: any;
  userId?: string;
  onPress?: () => void;
}

export const FeaturedCards = (props: FeaturedCardsProps) => {
  const {
    title = "",
    location = "",
    time = "",
    type = "",
    rating = 0,
    image,
    startDate,
    endDate,
    distance = "",
    item = {},
    userId,
    onPress,
  } = props;

  const { t } = useTranslation();
  const scheme = useColorScheme() || "light";
  const currentColors = Colors[scheme] || {};

  const { data: nearbySites } = useSelector((state: any) => state.nearbySites);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const site_id = item?._id;

  // FIX: Wrap Animated.Value in useRef
  const imgOpacity = useRef(new Animated.Value(0)).current;

  // Updated gradient colors for better overlay effect
  const cardOverlayColors: [string, string] = [
    "rgba(0,0,0,0.1)",
    "rgba(0,0,0,0.7)",
  ];

  const fetchUserLocation = useCallback(async () => {
    try {
      setIsLocationLoading(true);
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        setIsLocationLoading(false);
        setLocationError("Location permission not granted.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setLocationError(null);
    } catch (error) {
      setLocationError("Unable to fetch location.");
      Alert.alert(
        "Location Error",
        "Unable to fetch location. Please enable location services or try again.",
      );
    } finally {
      setIsLocationLoading(false);
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch {
      setLocationError("Failed to request location permission.");
      return false;
    }
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const setupLocation = async () => {
      const ok = await requestLocationPermission();
      if (ok) {
        await fetchUserLocation();
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 100 },
          (pos) => {
            setUserLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          },
        );
      } else {
        setIsLocationLoading(false);
        setLocationError("Location permission denied.");
        Alert.alert(
          "Permission Denied",
          "Location permission is required to show nearby sites. Please enable it in settings.",
        );
        dispatch(getAllSitesAction({}) as any);
      }
    };

    setupLocation();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [fetchUserLocation, dispatch]);

  const bookmarkedSite = nearbySites?.find((s: any) => s._id === site_id);
  const [isBookmarked, setIsBookmarked] = useState(
    bookmarkedSite?.bookmarkBy?.some((b: any) => b.user === userId) || false,
  );

  useEffect(() => {
    const s = nearbySites?.find((x: any) => x._id === site_id);
    setIsBookmarked(
      s?.bookmarkBy?.some((b: any) => b.user === userId) || false,
    );
  }, [nearbySites, site_id, userId]);

  const handleBookmarkPress = () => {
    setIsBookmarked((v: boolean) => !v);
    if (site_id) {
      dispatch(
        siteBookMarkedAction({
          id: site_id,
          callback: (res: any) => {
            // Handle callback if needed
          },
        }) as any,
      );
    }
  };

  const handleCardPress = () => {
    if (item) {
      router.push({
        pathname: "/DetailScreen",
        params: {
          item: JSON.stringify(item),
          siteId: item._id || item.id,
        },
      });
    }
  };

  const onImgLoad = () =>
    Animated.timing(imgOpacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

  return (
    <View style={styles.featuredCardContainer}>
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={handleCardPress}
        activeOpacity={0.9}
      >
        <Animated.Image
          source={image}
          style={[styles.cardImage, { opacity: imgOpacity }]}
          onLoad={onImgLoad}
        />
        <LinearGradient
          colors={cardOverlayColors}
          style={styles.cardOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {t(title)}
            </Text>

            <View style={styles.locationContainer}>
              <View style={styles.locationDef}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#93c5fd"
                  style={styles.locationIcon}
                />
                <Text style={styles.cardLocation} numberOfLines={1}>
                  {t(location) || "Location not available"}
                </Text>
              </View>
              {distance && (
                <View style={styles.distanceContainer}>
                  <Text style={styles.distanceText}>{distance}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleCardPress}
              style={styles.seeNowButton}
              activeOpacity={0.8}
            >
              <Text style={styles.seeNowText}>
                {t("home.seeNow") || "See now"}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmarkPress}
          activeOpacity={0.7}
        >
          {isBookmarked ? (
            <BookMarkRemoveIcon
              width={getIconSize(12)}
              height={getIconSize(12)}
            />
          ) : (
            <BookMarkAddIcon width={getIconSize(12)} height={getIconSize(12)} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  featuredCardContainer: {
    marginRight: getSpacing(12),
    marginBottom: getSpacing(6),
  },
  featuredCard: {
    width: getCardWidth(),
    height: getScreenHeightPercentage(25),
    borderRadius: getBorderRadius(20),
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: getBorderRadius(20),
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: getSpacing(20),
    paddingBottom: getSpacing(24),
  },
  cardTitle: {
    fontSize: getFontSize(17),
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "left",
    marginBottom: getSpacing(12),
    fontFamily: "Poppins-Bold",
    lineHeight: getFontSize(28),
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getSpacing(16),
  },
  locationIcon: {
    marginRight: getSpacing(6),
  },
  locationDef: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 0,
    flexShrink: 1,
    maxWidth: getCardWidth() * 0.7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  cardLocation: {
    fontSize: getFontSize(12),
    textTransform: "capitalize",
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontWeight: "500",
    flexShrink: 1,
    marginRight: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  distanceContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: getSpacing(8),
    paddingVertical: getSpacing(4),
    borderRadius: getBorderRadius(12),
    marginLeft: getSpacing(8),
  },
  distanceText: {
    fontSize: getFontSize(12),
    color: "#4ade80",
    fontWeight: "800",
    fontFamily: "Poppins-SemiBold",
  },
  seeNowButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(10),
    borderRadius: getBorderRadius(12),
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  seeNowText: {
    fontSize: getFontSize(12),
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  bookmarkButton: {
    position: "absolute",
    top: getSpacing(16),
    right: getSpacing(16),
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: getBorderRadius(10),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
});
