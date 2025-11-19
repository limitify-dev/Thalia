import { DescriptionSection } from "@/Components-dui/Description";
import { Colors } from "@/constants/Colors";
import {
  getSiteByIdAction,
  likeSiteAction,
} from "@/redux/actions/sitesActions";
import { fetchWikipediaForSite } from "@/redux/actions/nearbyAction";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import moment from "moment";
import React, { JSX, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { useDispatch, useSelector } from "react-redux";

// TypeScript interfaces
interface RouteParams {
  item?: {
    _id?: string;
    id?: string;
    description?: string;
    name?: string;
    address?: string;
    categories?: string[];
    images?: string[];
    image?: string;
    location?: {
      coordinates?: [number, number];
    };
    likedBy?: Array<{ user: string }>;
    reviewStats?: {
      averageRating?: number;
    };
    reviews?: Review[];
  };
  Search?: boolean;
  siteId?: string;
  notification?: boolean;
  notificationData?: string;
}

interface Review {
  userName?: string;
  rating: number;
  review: string;
  createdAt: string;
  likedBy?: Array<{ user: string }>;
}

interface Gallery {
  _id?: string;
  id?: string;
  name?: string;
  address?: string;
  categories?: string[];
  images?: string[];
  image?: string;
  description?: string;
  location?: {
    coordinates?: [number, number];
  };
  likedBy?: Array<{ user: string }>;
  reviewStats?: {
    averageRating?: number;
  };
  reviews?: Review[];
}

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

interface RootState {
  sites: {
    site: Gallery;
    isLoading: boolean;
    isLiking: boolean;
    likedStatus: Record<string, boolean>;
  };
  auth: {
    user: {
      _id: string;
      id?: string;
    };
  };
}

const { width, height } = Dimensions.get("window");
const scaleFont = (size: number): number => (width / 375) * size;
// Action Buttons Component
const ActionButtons: React.FC<{
  isSiteLiked: boolean;
  onLike: () => void;
  onNavigate: () => void;
  onShare: () => void;
  galleryName: string;
  t: (key: string) => string;
}> = ({ isSiteLiked, onLike, onNavigate, onShare, galleryName, t }) => (
  <View style={styles.actionButtonsContainer}>
    <TouchableOpacity style={styles.actionButton} onPress={onLike}>
      <Ionicons
        name={isSiteLiked ? "bookmark" : "bookmark-outline"}
        size={24}
        color="white"
      />
      <Text style={styles.actionButtonText}>{t("detail.actions.save")}</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.actionButton} onPress={onNavigate}>
      <Ionicons name="navigate-outline" size={24} color="white" />
      <Text style={styles.actionButtonText}>
        {t("detail.actions.navigate")}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/ai-bot",
          params: { itemName: galleryName || "" },
        })
      }
    >
      <LinearGradient
        colors={["#8B5CF6", "#A855F7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionButton}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
        <Text style={styles.actionButtonText}>{t("detail.actions.askAI")}</Text>
      </LinearGradient>
    </TouchableOpacity>

    <TouchableOpacity style={styles.actionButton} onPress={onShare}>
      <Ionicons name="share-outline" size={24} color="white" />
      <Text style={styles.actionButtonText}>{t("detail.actions.share")}</Text>
    </TouchableOpacity>
  </View>
);

// Rating Component
const RatingStars: React.FC<{
  rating: number;
  size?: number;
  color?: string;
}> = ({ rating, size = 20, color = "#FFD700" }) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= rating ? "star" : "star-outline"}
        size={size}
        color={color}
      />
    ))}
  </View>
);

// Tab Navigation Component
const TabNavigation: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
  t: (key: string) => string;
}> = ({ activeTab, onTabChange, t }) => {
  const tabs = [
    { key: "Description", icon: "information-circle-outline" },
    { key: "History", icon: "time-outline" },
    { key: "Reviews", icon: "star-outline" },
    { key: "Exhibitions", icon: "images-outline" },
    { key: "Location", icon: "location-outline" },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabScrollContainer}
    >
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? "#3B82F6" : "#64748B"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {t(`detail.tabs.${tab.key.toLowerCase()}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

// Review Card Component
const ReviewCard: React.FC<{
  review: Review;
  onLike?: () => void;
  colorScheme: any;
  t: (key: string) => string;
}> = ({ review, onLike, colorScheme, t }) => (
  <View
    style={{
      ...styles.reviewCard,
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255,255,255,0.1)"
          : "rgba(255,255,255,0.9)",
    }}
  >
    <View style={styles.reviewHeader}>
      <View style={styles.reviewerAvatar}>
        <Text style={styles.avatarText}>
          {review.userName?.charAt(0)?.toUpperCase() || "U"}
        </Text>
      </View>
      <View style={styles.reviewerInfo}>
        <View style={styles.reviewerNameRow}>
          <Text
            style={{
              ...styles.reviewerName,
              color: colorScheme === "dark" ? "white" : "#000",
            }}
          >
            {review.userName || "Anonymous"}
          </Text>
          <Text style={styles.expertBadge}>{t("detail.reviews.expert")}</Text>
        </View>
        <View style={styles.reviewMetaRow}>
          <RatingStars rating={review.rating} size={14} />
          <Text style={styles.reviewDate}>
            {moment(review.createdAt).fromNow()}
          </Text>
          <Text style={styles.visitCount}>
            {Math.floor(Math.random() * 30) + 1} {t("detail.reviews.visits")}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#94A3B8" />
      </TouchableOpacity>
    </View>

    <Text
      style={{
        ...styles.reviewText,
        color: colorScheme === "dark" ? "#E2E8F0" : "#000",
      }}
    >
      {review.review}
    </Text>

    {/* Tags */}
    <View style={styles.tagContainer}>
      <View
        style={{
          ...styles.tag,
          backgroundColor:
            colorScheme === "dark"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.03)",
        }}
      >
        <Text
          style={{
            ...styles.tagText,
            color: colorScheme === "dark" ? "#94A3B8" : "#000",
          }}
        >
          {t("detail.reviews.tags.impressionism")}
        </Text>
      </View>
      <View
        style={{
          ...styles.tag,
          backgroundColor:
            colorScheme === "dark"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.03)",
        }}
      >
        <Text
          style={{
            ...styles.tagText,
            color: colorScheme === "dark" ? "#94A3B8" : "#000",
          }}
        >
          {t("detail.reviews.tags.audioGuide")}
        </Text>
      </View>
      <View
        style={{
          ...styles.tag,
          backgroundColor:
            colorScheme === "dark"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.03)",
        }}
      >
        <Text
          style={{
            ...styles.tagText,
            color: colorScheme === "dark" ? "#94A3B8" : "#000",
          }}
        >
          {t("detail.reviews.tags.family")}
        </Text>
      </View>
    </View>

    {/* Review Actions */}
    <View style={styles.reviewActions}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <TouchableOpacity style={styles.likeButton} onPress={onLike}>
          <Ionicons name="thumbs-up-outline" size={18} color="#64748B" />
          <Text style={styles.likeCount}>
            {review.likedBy?.length || Math.floor(Math.random() * 50) + 10}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.commentButton}>
          <Ionicons name="chatbubble-outline" size={18} color="#64748B" />
          <Text style={styles.commentCount}>
            {Math.floor(Math.random() * 10) + 1}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.shareButton}>
        <Ionicons name="share-outline" size={18} color="#64748B" />
      </TouchableOpacity>
    </View>
  </View>
);

// Community Reviews Section Component
const CommunityReviewsSection: React.FC<{
  reviews: Review[];
  averageRating: number;
  t: any;
  colorScheme: any;
}> = ({ reviews, averageRating, t, colorScheme }) => {
  return (
    <View
      style={{
        ...styles.communitySection,
        borderRadius: 25,
        padding: 10,
        backgroundColor:
          colorScheme === "dark"
            ? "rgba(255,255,255,0.1)"
            : "rgba(255,255,255,0.4)",
      }}
    >
      <View style={styles.communitySectionHeader}>
        <View style={styles.communityTitleRow}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#64748B" />
            <Text
              style={{
                ...styles.communitySectionTitle,
                color: colorScheme === "dark" ? "white" : "#000",
              }}
            >
              {t("detail.reviews.title")}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>{t("detail.reviews.viewAll")}</Text>
        </TouchableOpacity>
      </View>

      {/* Overall Rating */}
      <View style={styles.overallRatingContainer}>
        <Text
          style={{
            ...styles.overallRating,
            color: colorScheme === "dark" ? "white" : "#000",
          }}
        >
          {averageRating.toFixed(1)}
        </Text>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <RatingStars rating={Math.floor(averageRating)} size={16} />
          <Text style={styles.reviewCount}>
            {reviews.length} {t("detail.reviews.thaiaReviews")}
          </Text>
        </View>
        <TouchableOpacity style={styles.writeReviewButton}>
          <Text style={styles.writeReviewText}>
            {t("detail.reviews.writeReview")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Review List */}
      <ScrollView style={styles.reviewsList}>
        {reviews.map((review, index) => (
          <ReviewCard
            key={index}
            review={review}
            colorScheme={colorScheme}
            t={t}
          />
        ))}

        {/* See More Button */}
        <TouchableOpacity
          style={{
            ...styles.seeMoreReviewsButton,
            borderColor:
              colorScheme === "dark"
                ? "rgba(255,255,255,0.2)"
                : "rgba(0,0,0,0.2)",
          }}
        >
          <Text style={styles.seeMoreReviewsText}>
            {t("detail.reviews.viewMoreReviews")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// AI Help Footer Component
const AIHelpFooter: React.FC<{
  galleryName: string;
  t: (key: string) => string;
}> = ({ galleryName, t }) => {
  const insets = useSafeAreaInsets();
  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: insets.bottom + 0,
        left: 20,
        right: 20,
        borderRadius: 16,
        overflow: "hidden",
      }}
      onPress={() =>
        router.push({
          pathname: "/ai-bot",
          params: { itemName: galleryName || "" },
        })
      }
    >
      <LinearGradient
        colors={["#3B82F6", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.aiFooterGradient}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" />
        <Text style={styles.aiFooterText}>{t("detail.aiHelp")}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function DetailScreen() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const { site, isLoading } = useSelector((state: RootState) => state.sites);
  const insets = useSafeAreaInsets();
  // Fix for [object Object] issue
  const item = React.useMemo(() => {
    if (!params.item) return undefined;

    // If it's already an object, return it directly (best case)
    if (typeof params.item === "object" && params.item !== null) {
      return params.item;
    }

    // Check if it's a string
    if (typeof params.item === "string") {
      // Skip serialized objects that can't be parsed
      if (params.item === "[object Object]" || params.item.startsWith("Site")) {
        // Likely a stringified object reference, not JSON
        return undefined;
      }

      // Try to parse as JSON
      try {
        return JSON.parse(params.item);
      } catch (error) {
        // Silently fail - likely not JSON, rely on siteId instead
        return undefined;
      }
    }

    return undefined;
  }, [params.item]);

  const Search = params.Search === "true";
  const siteId = params.siteId as string;
  const notification = params.notification === "true";
  const notificationData = params.notificationData as string;

  const itemId: string =
    item?._id || item?.id || siteId || notificationData || "";
  const [activeTab, setActiveTab] = useState<string>("Description");
  const [description, setDescription] = useState<string>(
    item?.description || null,
  );
  const [showFullDescription, setShowFullDescription] =
    useState<boolean>(false);
  const [loadingWikipedia, setLoadingWikipedia] = useState<boolean>(false);

  const gallery: Gallery = {
    ...site,
    ...item,
    description: description,
    name: item?.name,
    categories: item?.categories,
    reviewStats: {
      averageRating: 4.8,
    },
    reviews: [
      {
        userName: "Marie Dubois",
        rating: 5,
        review:
          "Une expérience absolument magique ! La collection impressionniste est à couper le souffle. L'audioguide Thaïa a rendu la visite encore plus enrichissante avec ses explications détaillées.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        likedBy: Array(24).fill({ user: "user" }),
      },
      {
        userName: "Thomas Chen",
        rating: 4,
        review:
          "Architecture splendide et collections variées. Petit bémol sur l'affluence le weekend, mieux vaut réserver à l'avance. L'exposition temporaire sur l'art numérique est fascinante !",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        likedBy: Array(18).fill({ user: "user" }),
      },
      {
        userName: "Sophie Martin",
        rating: 5,
        review:
          "Passionnée d'art, je reviens régulièrement et c'est toujours un plaisir. Les commissaires d'exposition font un travail remarquable. Bravo à l'équipe !",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        likedBy: Array(31).fill({ user: "user" }),
      },
    ],
  };

  const currentColors = Colors[colorScheme || "light"];
  const auth = useSelector((state: RootState) => state.auth);
  const user = auth.user || { _id: "", id: "" };
  const userId: string = user._id;
  const isLiking = useSelector((state: RootState) => state.sites.isLiking);
  const likedStatus = useSelector(
    (state: RootState) => state.sites.likedStatus,
  );
  const [isSiteLiked, setIsSiteLiked] = useState<boolean>(
    likedStatus[itemId] !== undefined
      ? likedStatus[itemId]
      : gallery?.likedBy?.some((like) => like.user === user._id || user?.id) ||
          false,
  );

  useEffect(() => {
    if (itemId || notification) {
      dispatch(getSiteByIdAction(itemId) as any);
    }
  }, [itemId, notification, dispatch]);

  // Fetch Wikipedia description on mount if not already present
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    const initialDescription = item?.description || "";

    const loadWikipedia = async () => {
      // Only fetch if we have a basic description (from Wikidata) and need the full one
      // Use initialDescription to avoid re-triggering when state updates
      if (item?.name && (!initialDescription || initialDescription.length < 100)) {
        if (isMounted) {
          setLoadingWikipedia(true);
          console.log(`Fetching Wikipedia for ${item.name}...`);
        }

        try {
          const wikiDescription = await fetchWikipediaForSite(item.name, "en");

          // Only update state if component is still mounted
          if (isMounted) {
            if (wikiDescription) {
              setDescription(wikiDescription);
              console.log(`✅ Loaded Wikipedia for ${item.name}`);
            } else {
              console.log(`No Wikipedia found for ${item.name}, using Wikidata description`);
            }
            setLoadingWikipedia(false);
          }
        } catch (error) {
          console.error(`Error loading Wikipedia for ${item.name}:`, error);
          if (isMounted) {
            setLoadingWikipedia(false);
          }
        }
      }
    };

    loadWikipedia();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [item?.name, item?.description]);

  const handleLike = (): void => {
    const updatedLiked = !isSiteLiked;
    setIsSiteLiked(updatedLiked);
    dispatch(likeSiteAction({ id: itemId }) as any);
  };

  const handleBack = (): void => {
    router.canGoBack() ? router.back() : router.push("/");
  };
  const handleClose = (): void => {
    router.push("/");
  };

  const handleShare = useCallback(async (): Promise<void> => {
    try {
      if (!gallery) return;
      const message = `🎨 ${gallery?.name || "N/A"}
📍 ${gallery?.address || "N/A"}
🏷 ${gallery?.categories?.[0] || "N/A"}
⭐ ${gallery?.reviewStats?.averageRating || "N/A"}`.trim();
      Share.share({ message });
    } catch (error) {
      console.log("Share error:", error);
    }
  }, [gallery]);

  const handleNavigate = (): void => {
    const [longitude, latitude] = gallery?.location?.coordinates || [0, 0];
    if (!latitude || !longitude) {
      Alert.alert(t("common.error"), t("detail.errors.locationUnavailable"));
      return;
    }
    const url = Platform.select({
      ios: `maps://?q=${latitude},${longitude}&center=${latitude},${longitude}&z=15`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}&z=15`,
    });
    if (url) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert(t("common.error"), t("detail.errors.unableToOpenMaps"));
          }
        })
        .catch(() =>
          Alert.alert(t("common.error"), t("detail.errors.errorOpeningMaps")),
        );
    }
  };

  // Header Component
  const renderHeader = (): JSX.Element => (
    <View style={{ ...styles.header, top: insets.top + 10 }}>
      <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton} onPress={handleClose}>
          <Ionicons name="close-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImageGallery = (gallery: Gallery): JSX.Element => {
    const placeholderImage =
      "https://images.unsplash.com/photo-1578301978018-3005759f48f7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2044";
    const imageArray: string[] =
      gallery?.images && gallery.images.length > 0
        ? gallery.images
        : gallery?.image
          ? [gallery.image]
          : [placeholderImage];

    return (
      <View style={styles.imageGalleryContainer}>
        <View style={styles.textOverlay}>
          <Text style={styles.titlemain} numberOfLines={2} ellipsizeMode="tail">
            {gallery?.name || "--"}
          </Text>
          <View style={styles.categoryBadge}>
            <Text
              style={styles.subtitlemain}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {gallery?.categories?.[0]}
            </Text>
          </View>
        </View>

        <Swiper
          style={styles.wrapper}
          showsButtons={false}
          showsPagination={imageArray.length > 1}
          paginationStyle={styles.pagination}
          dot={
            <View
              style={[styles.dot, { backgroundColor: "rgba(255,255,255,0.4)" }]}
            />
          }
          activeDot={
            <View style={[styles.activeDot, { backgroundColor: "white" }]} />
          }
          loop={imageArray.length > 1}
        >
          {imageArray.map((img, index) => (
            <View key={index} style={styles.slide}>
              <Image
                source={{ uri: img }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </Swiper>
      </View>
    );
  };

  const renderTabContent = (colorScheme: any): JSX.Element => {
    switch (activeTab) {
      case "Description":
        return (
          <View style={styles.tabContent}>
            {loadingWikipedia && (
              <View style={{ padding: 16, alignItems: "center" }}>
                <Text style={{ color: currentColors.text, fontSize: 14 }}>
                  Loading detailed description...
                </Text>
              </View>
            )}
            <DescriptionSection
              description={
                description || item?.description || t("detail.noDescriptionAvailable")
              }
              colorScheme={colorScheme}
              t={t}
            />
            <View style={styles.infoGrid}>
              <View
                style={{
                  ...styles.infoBox,
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.6)",
                }}
              >
                <Ionicons name="time-outline" size={16} color="#8B5CF6" />
                <Text
                  style={{
                    ...styles.infoLabel,
                    color: colorScheme === "dark" ? "#94A3B8" : "#000",
                  }}
                >
                  {t("detail.info.opening")}
                </Text>
                <Text
                  style={{
                    ...styles.infoText,
                    color: colorScheme === "dark" ? "white" : "#000",
                  }}
                >
                  --
                </Text>
              </View>
              <View
                style={{
                  ...styles.infoBox,
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.6)",
                }}
              >
                <Ionicons name="trophy-outline" size={16} color="#10B981" />
                <Text
                  style={{
                    ...styles.infoLabel,
                    color: colorScheme === "dark" ? "#94A3B8" : "#000",
                  }}
                >
                  {t("detail.info.patrimoine")}
                </Text>
                <Text
                  style={{
                    ...styles.infoText,
                    color: colorScheme === "dark" ? "white" : "#000",
                  }}
                >
                  --
                </Text>
              </View>
            </View>
          </View>
        );
      case "Reviews":
        return (
          <CommunityReviewsSection
            reviews={gallery.reviews || []}
            averageRating={gallery.reviewStats?.averageRating || 4.8}
            t={t}
            colorScheme={colorScheme}
          />
        );

      default:
        return (
          <View style={styles.tabContent}>
            <Text style={styles.noContentText}>
              {t("detail.noContentFound", { tab: activeTab })}
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
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
          style={styles.scrollView}
        >
          {renderHeader()}
          {renderImageGallery(gallery)}
          <View style={styles.contentContainer}>
            <ActionButtons
              isSiteLiked={isSiteLiked}
              onLike={handleLike}
              onNavigate={handleNavigate}
              onShare={handleShare}
              galleryName={gallery?.name || ""}
              t={t}
            />
            <View style={styles.ratingContainer}>
              <RatingStars rating={gallery.reviewStats?.averageRating || 4.8} />
              <Text style={styles.ratingText}>
                {(gallery.reviewStats?.averageRating || 4.8).toFixed(1)}
              </Text>
              <View style={styles.visitorCount}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={currentColors.text}
                />
                <Text
                  style={{
                    ...styles.visitorCountText,
                    color: colorScheme === "dark" ? "#fff" : "#000",
                  }}
                >
                  2.1k
                </Text>
              </View>
            </View>
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              t={t}
            />
            {renderTabContent(colorScheme)}
          </View>
          <AIHelpFooter galleryName={gallery?.name || ""} t={t} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageGalleryContainer: {
    width: "100%",
    height: height * 0.6,
    position: "relative",
  },
  wrapper: {
    height: "100%",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  textOverlay: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  locationRow: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 0,
    flexShrink: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  locationText: {
    color: "white",
    fontSize: 14,
    marginLeft: 4,
    textTransform: "capitalize",
  },
  titlemain: {
    fontSize: scaleFont(32),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: "rgba(36,37,38,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  subtitlemain: {
    fontSize: scaleFont(14),
    color: "white",
    fontWeight: "500",
  },
  pagination: {
    bottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    width: (width - 60) / 4,
    height: 80,
    borderRadius: 16,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: "white",
    fontSize: scaleFont(12),
    marginTop: 6,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  starRow: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFD700",
    marginRight: 16,
  },
  visitorCount: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: "auto",
  },
  visitorCountText: {
    fontSize: 14,
    marginLeft: 4,
  },
  tabScrollContainer: {
    paddingHorizontal: 0,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flex: 1,
  },
  activeTabButton: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
    marginLeft: 4,
  },
  activeTabText: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  tabContent: {
    marginBottom: 20,
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#94A3B8",
    marginBottom: 8,
  },
  showMoreText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  infoBox: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,

    marginTop: 8,
    marginBottom: 4,
    fontWeight: "500",
  },
  infoText: {
    fontSize: 14,
    fontWeight: "600",
  },
  noContentText: {
    textAlign: "center",
    color: "#94A3B8",
    marginVertical: 40,
    fontSize: 16,
  },
  // Community Reviews Section
  communitySection: {
    marginTop: 24,
  },
  communitySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 16,
  },
  communityTitleRow: {
    flexDirection: "column",
    alignItems: "center",
  },
  communitySectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  thaiaBrand: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  overallRatingContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  overallRating: {
    fontSize: 32,
    fontWeight: "bold",
    marginRight: 16,
  },
  reviewCount: {
    fontSize: 14,
    color: "#94A3B8",
  },
  writeReviewButton: {
    backgroundColor: "#3B82F6",
    padding: 10,
    borderRadius: 10,
  },
  writeReviewText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  reviewsList: {
    maxHeight: 800,
  },
  reviewCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  expertBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  reviewMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewDate: {
    fontSize: 12,
    color: "#94A3B8",
  },
  visitCount: {
    fontSize: 12,
    color: "#94A3B8",
  },
  moreButton: {
    padding: 4,
  },
  reviewText: {
    fontSize: 14,

    lineHeight: 20,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,

    fontWeight: "500",
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  likeCount: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commentCount: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
  shareButton: {
    padding: 4,
  },
  seeMoreReviewsButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 8,
  },
  seeMoreReviewsText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
  },
  aiFooterButton: {},
  aiFooterGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  aiFooterText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
