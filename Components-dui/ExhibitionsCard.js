import { getCardWidth } from "@/constants/responsive";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/Colors";
import {
  getAllSitesAction,
  siteBookMarkedAction,
} from "../redux/actions/sitesActions";

const { width, height } = Dimensions.get("window");

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size) => (height / guidelineBaseHeight) * size;
export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const ExhibitionsCard = ({
  title,
  location,
  distance,
  time,
  type,
  category,
  image,
  startDate,
  endDate,
  item,
  userId,
  onPress,
  disableNavigation = false,
  isBookedMark = false,
  opening,
  closing,
  rating = 4.9,
}) => {
  const { t } = useTranslation();
  const scheme = useColorScheme() || "light";
  const currentColors = Colors[scheme];
  const [isPressed, setIsPressed] = useState(false);

  const site_id = item._id;
  const { data: nearbySites } = useSelector((state) => state.nearbySites);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Gradient colors for both light and dark modes
  const gradientBackgroundBoxColors = {
    light: [
      "rgba(255, 255, 255, 0.95)", // White with 95% opacity
      "rgba(241, 245, 249, 0.90)", // Light gray-blue with 90% opacity
      "rgba(226, 232, 240, 0.85)", // Medium gray-blue with 85% opacity
    ],
    dark: ["#1e3a8a", "#581c87", "#0f172a"],
  };

  // Handle press in/out for hover effect simulation
  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  const fetchUserLocation = useCallback(async () => {
    try {
      setIsLocationLoading(true);
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        setIsLocationLoading(false);
        setLocationError("Location permission not granted.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setLocationError(null);
    } catch (error) {
      console.warn("Location fetch error:", error);
      setLocationError(
        "Unable to fetch location. Please enable location services.",
      );
      Alert.alert(t("home.locationError"), t("home.unableToFetchLocationLong"));
    } finally {
      setIsLocationLoading(false);
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (err) {
      console.warn("Permission error:", err);
      setLocationError("Failed to request location permission.");
      return false;
    }
  };

  useEffect(() => {
    let subscription = null;
    const setupLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        await fetchUserLocation();
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 100 },
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
        );
      } else {
        setIsLocationLoading(false);
        setLocationError("Location permission denied.");
        Alert.alert(
          t("home.permissionDenied"),
          t("home.locationPermissionRequired"),
        );
        dispatch(getAllSitesAction());
      }
    };
    setupLocation();
    return () => subscription?.remove?.();
  }, [fetchUserLocation, dispatch]);

  const bookmarkedSite = nearbySites?.find((site) => site._id === item._id);
  const [isBookmarked, setIsBookmarked] = useState(
    bookmarkedSite?.bookmarkBy?.some((bookmark) => bookmark.user === userId) ||
      false,
  );

  useEffect(() => {
    const site = nearbySites?.find((site) => site._id === site_id);
    setIsBookmarked(site?.bookmarkBy?.some((b) => b.user === userId) || false);
  }, [nearbySites, site_id, userId]);

  const handleBookmarkPress = () => {
    const updatedBookmark = !isBookmarked;
    setIsBookmarked(updatedBookmark);
    dispatch(
      siteBookMarkedAction({
        id: site_id,
        callback: () => {},
      }),
    );
  };

  return (
    <TouchableOpacity
      style={[styles.exhibitionCard, isPressed && styles.exhibitionCardPressed]}
      onPress={() => {
        if (!disableNavigation) {
          router.push({
            pathname: "/DetailScreen",
            params: {
              item: JSON.stringify(item),
              siteId: item._id || item.id,
            },
          });
        } else if (onPress) {
          onPress();
        }
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <LinearGradient
        colors={gradientBackgroundBoxColors[scheme]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.5, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.imageWrapper}>
          <Image source={image} style={styles.exhibitionImage} />
        </View>

        <View style={styles.exhibitionContent}>
          {/* Title and Rating in one line */}
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.exhibitionTitle,
                { color: scheme === "dark" ? "#FFFFFF" : "#000000" },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={moderateScale(14)} color="#F59E0B" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>

          {/* Category Tag - Modern Art */}
          <View
            style={[
              styles.categoryContainer,
              { backgroundColor: scheme === "dark" ? "#374151" : "#F3F4F6" },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: scheme === "dark" ? "#D1D5DB" : "#4B5563" },
              ]}
            >
              {t(`home.categories.${type}`) || type}
            </Text>
          </View>

          {/* Details Container - Hours and Location */}
          <View style={styles.detailsContainer}>
            {/* Hours */}
            <View style={styles.detailRow}>
              <Icon
                name="time-outline"
                size={moderateScale(14)}
                color="#60a5fa"
              />
              <Text
                style={[
                  styles.detailText,
                  { color: scheme === "dark" ? "#E5E7EB" : "#6B7280" },
                ]}
              >
                {"--"}
              </Text>
            </View>

            {/* Location */}
            <View style={styles.detailRow}>
              <Icon
                name="location-outline"
                size={moderateScale(14)}
                color="#9333EA"
              />
              <Text
                style={[
                  styles.detailText,
                  { color: scheme === "dark" ? "#E5E7EB" : "#6B7280" },
                ]}
                numberOfLines={1}
              >
                {location}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exhibitionCard: {
    flexDirection: "row",
    borderRadius: moderateScale(12),
    width: "100%",
    alignSelf: "center",
    marginVertical: verticalScale(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 3,
    overflow: "hidden",
  },
  exhibitionCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.15,
  },
  gradientBackground: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    padding: moderateScale(16),
    shadowOffset: 1,
    shadowOpacity: 30,
  },
  exhibitionImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(8),
    resizeMode: "cover",
  },
  imageWrapper: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(8),
    overflow: "hidden",
    marginRight: moderateScale(16),
  },
  exhibitionContent: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(6),
  },
  exhibitionTitle: {
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
    marginRight: moderateScale(8),
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(10),
  },
  ratingText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    marginLeft: moderateScale(2),
    color: "#D97706",
  },
  categoryContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  categoryText: {
    fontSize: moderateScale(11),
    fontWeight: "500",
  },
  detailsContainer: {
    gap: verticalScale(4),
  },
  detailRow: {
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
  detailText: {
    fontSize: moderateScale(12),
    marginLeft: moderateScale(6),
    fontWeight: "400",
    textTransform: "capitalize",
  },
});

export default ExhibitionsCard;
