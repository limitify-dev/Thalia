import React from "react";
import { Dimensions, StyleSheet, View, useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";

const { width, height } = Dimensions.get("window");

const SkeletonBox = ({ style }) => <View style={[styles.skeletonBox, style]} />;

const SkeletonFeaturedCard = () => {
  const scheme = useColorScheme() || "light"; // "light" | "dark"
  const current = Colors[scheme];

  // subtle overlays that adapt to theme
  const imageShade =
    scheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const lineShade =
    scheme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";

  return (
    <View
      style={[styles.featuredCard, { backgroundColor: current.aiImageBg2 }]}
    >
      <View style={[styles.imageSkeleton, { backgroundColor: imageShade }]} />
      <View style={styles.contentContainer}>
        <SkeletonBox
          style={[styles.titleSkeleton, { backgroundColor: lineShade }]}
        />
        <SkeletonBox
          style={[styles.subtitleSkeleton, { backgroundColor: lineShade }]}
        />
        <SkeletonBox
          style={[styles.metaSkeleton, { backgroundColor: lineShade }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  featuredCard: {
    width: width - 20,
    height: height * 0.15,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 20,
    flexDirection: "row",
    alignSelf: "center",
    alignContent: "center",
    marginLeft: width * 0.05,
    marginBottom: 20,
  },
  imageSkeleton: {
    width: 110,
    height: "100%",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: "space-around",
  },
  skeletonBox: {
    borderRadius: 6,
  },
  titleSkeleton: {
    width: "60%",
    height: 14,
  },
  subtitleSkeleton: {
    width: "45%",
    height: 12,
  },
  metaSkeleton: {
    width: "30%",
    height: 12,
  },
});

export default SkeletonFeaturedCard;
