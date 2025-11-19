import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  useColorScheme,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
const BrowsePage = () => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const categories = [
    { name: t("browse.categories.modernArt"), icon: "brush" as const },
    { name: t("browse.categories.history"), icon: "time" as const },
    { name: t("browse.categories.photography"), icon: "camera" as const },
    { name: t("browse.categories.sculpture"), icon: "cube" as const },
    { name: t("browse.categories.painting"), icon: "color-palette" as const },
    { name: t("browse.categories.architecture"), icon: "business" as const },
  ];

  const featuredExhibitions = [
    {
      title: "The Chronicle Gallery",
      museum: "Musée du Louvre, Paris",
      distance: "2.5KM away",
      image:
        "https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Chronicle+Gallery",
    },
    {
      title: "Echoes of the Past",
      museum: "Musée d'Orsay, Paris",
      distance: "3.2KM away",
      image:
        "https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Echoes+of+Past",
    },
  ];

  const nearbyMuseums = [
    {
      name: "Musée du Louvre",
      distance: "2.5KM away",
      rating: 4.8,
      visitors: "12.5K",
    },
    {
      name: "Musée d'Orsay",
      distance: "3.2KM away",
      rating: 4.7,
      visitors: "8.3K",
    },
    {
      name: "Centre Pompidou",
      distance: "4.1KM away",
      rating: 4.6,
      visitors: "10.2K",
    },
  ];

  return (
    <SafeAreaView
      style={{
        ...styles.container,
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
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 90,
            marginTop: insets.top + 2,
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={{
                ...styles.headerTitle,
                color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
              }}
            >
              {t("browse.title")}
            </Text>
            <TouchableOpacity>
              <Ionicons
                name="search"
                size={24}
                color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
              />
            </TouchableOpacity>
          </View>

          {/* Featured Exhibitions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={{
                  ...styles.sectionTitle,
                  color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
                }}
              >
                {t("browse.recentSearches")}
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>{t("browse.viewAll")}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {featuredExhibitions.map((exhibition, index) => (
                <TouchableOpacity key={index} style={styles.exhibitionCard}>
                  <View style={styles.exhibitionImage}>
                    <View style={styles.exhibitionImagePlaceholder}>
                      <Ionicons name="image" size={40} color="#8E8E93" />
                    </View>
                  </View>
                  <View style={styles.exhibitionInfo}>
                    <Text style={styles.exhibitionTitle}>
                      {exhibition.title}
                    </Text>
                    <Text style={styles.exhibitionMuseum}>
                      {exhibition.museum}
                    </Text>
                    <Text style={styles.exhibitionDistance}>
                      {exhibition.distance}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Nearby Museums */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={{
                  ...styles.sectionTitle,
                  color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
                }}
              >
                {t("browse.recentlyViewed")}
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>{t("browse.viewAll")}</Text>
              </TouchableOpacity>
            </View>
            {nearbyMuseums.map((museum, index) => (
              <TouchableOpacity key={index} style={styles.museumItem}>
                <View style={styles.museumIconContainer}>
                  <Ionicons name="business" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.museumInfo}>
                  <Text style={styles.museumName}>{museum.name}</Text>
                  <Text style={styles.museumDistance}>{museum.distance}</Text>
                </View>
                <View style={styles.museumStats}>
                  <Text style={styles.museumRating}>⭐ {museum.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  seeAllButton: {
    fontSize: 14,
    color: "#8B5CF6",
    fontWeight: "500",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  exhibitionCard: {
    width: 280,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
  },
  exhibitionImage: {
    width: "100%",
    height: 160,
  },
  exhibitionImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  exhibitionInfo: {
    padding: 12,
  },
  exhibitionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  exhibitionMuseum: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  exhibitionDistance: {
    fontSize: 12,
    color: "#8E8E93",
  },
  museumItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  museumIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  museumInfo: {
    flex: 1,
  },
  museumName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  museumDistance: {
    fontSize: 12,
    color: "#ffffff",
  },
  museumStats: {
    alignItems: "flex-end",
  },
  museumRating: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  museumVisitors: {
    fontSize: 12,
    color: "#ffffff",
  },
});

export default BrowsePage;
