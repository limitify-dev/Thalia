import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import EditIcon from "../assets/dark_icons/edit.svg";
import { baseUrl } from "../axios/http";
import { colors } from "../constants/colors";
import {
  getAvatarSize,
  getBorderRadius,
  getFontSize,
  getIconSize,
  getSpacing,
  SPACING,
} from "../constants/responsive";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../utils/translate";

const ProfileCard = ({
  userUserName,
  username,
  imageSource,
  onEditPress,
  containerStyle,
  showGradient = true,
}) => {
  const { t } = useTranslation();
  const lang = useSelector((state) => state.language.lang);
  const dispatch = useDispatch();
  const { mode } = useTheme();
  const currentColors = colors[mode];
  const { user } = useSelector((state) => state.auth);

  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.profileContainer,
        { backgroundColor: currentColors.container },
      ]}
    >
      <View style={styles.profileInfo}>
        {user?.profilePicture ? (
          <Image
            source={{ uri: `${baseUrl}/${user.profilePicture}` }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.profileImage, styles.initialCircle]}>
            <Text style={styles.initialText}>
              {t(userUserName.charAt(0)?.toUpperCase() || "T")}
            </Text>
          </View>
        )}
        <View style={styles.profileTextContainer}>
          <Text
            style={[styles.profileName, { color: currentColors.textWhite }]}
          >
            {t(userUserName || "User Name")}
          </Text>
          <Text
            style={[styles.profileUsername, { color: "rgba(255,255,255,0.8)" }]}
          >
            {user?.email || "Email"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <EditIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
    backgroundColor: "#7788f5",
    borderRadius: getBorderRadius(16),
    padding: SPACING.md,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: getAvatarSize(),
    height: getAvatarSize(),
    borderRadius: getBorderRadius(28),
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  profileName: {
    fontSize: getFontSize(18),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    marginBottom: getSpacing(4),
    textAlign: "left",
  },
  profileUsername: {
    fontSize: getFontSize(14),
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
  },
  editButton: {
    width: getIconSize(36),
    height: getIconSize(36),
    borderRadius: getBorderRadius(18),
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  initialCircle: {
    backgroundColor: "rgb(85,75,119)",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    color: "white",
    fontWeight: "bold",
    fontSize: getFontSize(20),
    textAlign: "left",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "rgb(85,75,119)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "rgb(85,75,119)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileCard;
