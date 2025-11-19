import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { appImages } from "../assets";
import { baseUrl } from "../axios/http";
import {
  getBorderRadius,
  getFontSize,
  getSpacing,
} from "../constants/responsive";
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;
const data = [
  {
    id: "1",
    title: "The Chronicle Gallery",
    location: "Musée du Louvre, Paris 2.5KM away",
    image: require("../assets/images/onborading1.png"),
  },
  {
    id: "2",
    title: "City Modern Art",
    location: "New York Museum, 1.2KM away",
    image: require("../assets/images/onborading1.png"),
  },
  // Add more cards if needed
];
const FeaturedGalleryCard = ({
  title,
  location,
  image,
  rating,
  type,
  openTime,
}) => {
  const navigation = useNavigation();
  return (
    <View style={styles.featuredCardContainer}>
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() =>
          navigation.navigate("DetailScreenFeature", {
            gallery: {
              title,
              location,
              image,
              rating,
              type,
              openTime,
            },
          })
        }
      >
        <Image
          source={
            image && typeof image === "string"
              ? { uri: image.startsWith("http") ? image : `${baseUrl}${image}` }
              : appImages.defaultGallery
          }
          style={styles.cardImage}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.cardOverlay}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardLocation}>{location}</Text>
              <TouchableOpacity style={styles.seeNowButton}>
                <Text style={styles.seeNowText}>See Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Icon name="bookmark-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  featuredCardContainer: {
    marginRight: getSpacing(6),
  },
  featuredCard: {
    width: 376,
    height: 165,
    borderRadius: getBorderRadius(16),
    overflow: "hidden",
    backgroundColor: "#1E1B2E",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    padding: getSpacing(16),
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  cardTextContainer: {
    marginLeft: getSpacing(8),
  },
  cardTitle: {
    fontSize: getFontSize(14),
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: getSpacing(4),
    textAlign: "left",
  },
  cardLocation: {
    fontSize: getFontSize(12),
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: getSpacing(12),
  },
  seeNowButton: {
    backgroundColor: "#6C5DD3",
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(8),
    borderRadius: getBorderRadius(8),
    alignSelf: "flex-start",
  },
  seeNowText: {
    color: "#FFFFFF",
    fontSize: getFontSize(14),
    fontWeight: "500",
  },
  bookmarkButton: {
    position: "absolute",
    top: getSpacing(12),
    right: getSpacing(12),
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(108, 93, 211, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: getSpacing(12),
  },
});
export default FeaturedGalleryCard;
