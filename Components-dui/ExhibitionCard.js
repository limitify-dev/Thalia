import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { colors, gredientColors } from "../constants/colors";
import { useTheme } from "../contexts/ThemeContext";


const ExhibitionCard = ({
  title,
  location,
  time,
  type,
  rating,
  image,
  onPress,
}) => {
  const { mode } = useTheme();
  const currentColors = colors[mode];

  return (
    <TouchableOpacity style={styles.exhibitionCard} onPress={onPress}>
      <LinearGradient
        colors={gredientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <Image source={image} style={styles.exhibitionImage} />
        <View style={styles.exhibitionContent}>
          <View style={styles.exhibitionHeader}>
            <Text
              style={[styles.exhibitionTitle, { color: currentColors.white }]}
            >
              {title}
            </Text>
            {rating && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text
                  style={[styles.ratingText, { color: currentColors.white }]}
                >
                  {rating}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.exhibitionType, { color: currentColors.darkGray }]}
          >
            {type}
          </Text>
          <View style={styles.exhibitionDetails}>
            <View style={styles.detailRow}>
              <Icon
                name="location-outline"
                size={16}
                color={currentColors.white}
              />
              <Text
                style={[styles.detailText, { color: currentColors.darkGray }]}
              >
                {location}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="time-outline" size={16} color={currentColors.white} />
              <Text
                style={[styles.detailText, { color: currentColors.darkGray }]}
              >
                {time}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Icon name="bookmark-outline" size={20} color={currentColors.white} />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exhibitionCard: {
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
  },
  gradientBackground: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    paddingVertical: 16,
  },
  exhibitionImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 16,
    marginRight: 12,
  },
  exhibitionContent: {
    flex: 1,
    paddingRight: 16,
  },
  exhibitionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exhibitionTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
  },
  exhibitionType: {
    fontSize: 12,
    marginBottom: 8,
    color: "#666",
  },
  exhibitionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#666",
    textTransform: "capitalize",
  },
  bookmarkButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ExhibitionCard;
