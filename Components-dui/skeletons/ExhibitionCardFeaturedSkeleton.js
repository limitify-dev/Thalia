import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, StyleSheet, View, useColorScheme } from "react-native";
import { Colors, gredientColors } from "../../constants/Colors";

const { width, height } = Dimensions.get("window");

const ExhibitionCardFeaturedSkeleton = () => {
  const colorScheme = useColorScheme() || "light";
  const currentColors = Colors[colorScheme];

  return (
    <View style={styles.exhibitionCardBox}>
      <LinearGradient
        colors={gredientColors[colorScheme]} // ✅ theme-aware gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackgroundBox}
      >
        {/* Image Skeleton */}
        <View
          style={[
            styles.skeletonImage,
            { backgroundColor: currentColors.aiImageBg2 },
          ]}
        />

        {/* Bookmark Button Skeleton */}
        <View
          style={[
            styles.skeletonBookmarkButton,
            { backgroundColor: currentColors.aiImageBg2 },
          ]}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  exhibitionCardBox: {
    width: width * 0.85,
    borderRadius: 22,
    overflow: "hidden",
    marginRight: width * 0.04,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: "transparent",
  },
  gradientBackgroundBox: {
    width: "100%",
  },
  skeletonImage: {
    width: "100%",
    height: height * 0.22,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  skeletonBookmarkButton: {
    position: "absolute",
    top: height * 0.018,
    right: width * 0.04,
    width: width * 0.09,
    height: width * 0.09,
    borderRadius: width * 0.045,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default ExhibitionCardFeaturedSkeleton;
