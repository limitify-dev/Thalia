import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { getBorderRadius } from "../constants/responsive";

const { width, height } = Dimensions.get("window");

const FilterChip = ({
  label,
  active,
  onPress,
  activeBackgroundColor,
  inactiveBackgroundColor,
  activeTextColor,
  inactiveTextColor,
}) => {
  const colorScheme = useColorScheme();
  const mode = colorScheme ?? "light";

  // Default colors based on the screenshot design
  const defaultActiveBg = mode === "light" ? "#4F46E5" : "#6366F1";
  const defaultInactiveBg = mode === "light" ? "#F8FAFC" : "#1E293B";
  const defaultActiveText = "#FFFFFF";
  const defaultInactiveText = mode === "light" ? "#64748B" : "#CBD5E1";

  const backgroundColor = active
    ? activeBackgroundColor || defaultActiveBg
    : inactiveBackgroundColor || defaultInactiveBg;

  const textColor = active
    ? activeTextColor || defaultActiveText
    : inactiveTextColor || defaultInactiveText;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.chipContainer,
          {
            backgroundColor,
            borderColor: active
              ? backgroundColor
              : mode === "light"
                ? "#E2E8F0"
                : "#334155",
            borderWidth: 1,
          },
        ]}
      >
        <Text style={[styles.chipText, { color: textColor }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: getBorderRadius(20),
    marginRight: width * 0.03,
    marginBottom: height * 0.01,
    alignSelf: "flex-start",
    minWidth: width * 0.22,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: width * 0.035,
    fontFamily: "Poppins-Medium",
    fontWeight: "500",
    includeFontPadding: false,
  },
});

export default FilterChip;
