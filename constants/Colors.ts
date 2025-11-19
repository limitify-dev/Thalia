const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    aiImageBg2: "#E6E6E6", // ✅ skeleton background for light mode
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    aiImageBg2: "#2C2C2C", // ✅ skeleton background for dark mode
  },
};

// ✅ Gradient colors for each theme
export const gredientColors = {
  light: ["#e0eafc", "#cfdef3"], // light blue → gray-blue
  dark: ["#434343", "#000000"], // dark gray → black
};
