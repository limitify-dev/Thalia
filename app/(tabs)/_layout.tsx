import { HapticTab } from "@/components/HapticTab";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import { Image, Platform, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

// Define gradient colors as const - fully opaque
const LIGHT_GRADIENT = [
  "rgba(243, 232, 255, 1)", // Light purple - fully opaque
  "rgba(219, 234, 254, 1)", // Light blue - fully opaque
  "rgba(255, 255, 255, 1)", // White - fully opaque
] as const;

const DARK_GRADIENT = [
  "rgba(15, 23, 42, 1)", // Dark slate - fully opaque
  "rgba(30, 41, 59, 1)", // Slate - fully opaque
  "rgba(51, 65, 85, 1)", // Light slate - fully opaque
] as const;

export function CustomTabButton({ children, onPress }: any) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginTop: -15,
        }}
      >
        <LinearGradient
          colors={
            isDark
              ? ["#8B5CF6", "#A855F7", "#C084FC"]
              : ["#8B5CF6", "#818CF8", "#93C5FD"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: isDark ? "#8B5CF6" : "#935AF0",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            ...(Platform.OS === "android" ? { elevation: 8 } : {}),
          }}
        >
          {children}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

export function RegularTabButton({ children, onPress, focused }: any) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: focused
            ? isDark
              ? "rgba(139, 92, 246, 0.2)"
              : "rgba(139, 92, 246, 0.1)"
            : "transparent",
          borderRadius: 16,
          paddingHorizontal: 20,
          paddingVertical: 12,
          minWidth: 60,
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
}

// Custom tab bar background with gradient
function TabBarBackground() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <LinearGradient
      colors={isDark ? DARK_GRADIENT : LIGHT_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderTopStartRadius: 20,
        borderTopEndRadius: 20,
      }}
    />
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#FFFFFF" : "#374151",
        tabBarInactiveTintColor: isDark ? "#9CA3AF" : "#6B7280",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 20,
          right: 20,
          height: Platform.OS === "ios" ? 90 : insets.bottom + 70,
          paddingTop: 2,
          paddingBottom: Math.max(insets.bottom, 50),
          backgroundColor: "transparent",
          borderTopStartRadius: 20,
          borderTopEndRadius: 20,
          borderWidth: 1,
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.3 : 0.15,
          shadowRadius: 20,
          ...(Platform.OS === "android" ? { elevation: 10 } : {}),
        },
        tabBarShowLabel: true,
        tabBarItemStyle: {
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={18}
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
          tabBarButton: (props) => (
            <RegularTabButton
              {...props}
              focused={props.accessibilityState?.selected}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: t("tabs.browse"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={22}
              name={focused ? "search" : "search-outline"}
              color={color}
            />
          ),
          tabBarButton: (props) => (
            <RegularTabButton
              {...props}
              focused={props.accessibilityState?.selected}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: t("tabs.map"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={26}
              name={focused ? "map" : "map-outline"}
              color="#FFFFFF"
            />
          ),
          tabBarLabelStyle: {
            color: "#FFFFFF",
          },
          tabBarButton: (props) => <CustomTabButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="ai-bot"
        options={{
          title: t("tabs.ai"),
          tabBarIcon: ({ size = 22, color, focused }) => (
            <Image
              source={require("../../assets/images/aiicon.png")}
              style={{
                width: size,
                height: size,
                tintColor: color,
                resizeMode: "contain",
              }}
            />
          ),
          tabBarButton: (props) => (
            <RegularTabButton
              {...props}
              focused={props.accessibilityState?.selected}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={22}
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
          tabBarButton: (props) => (
            <RegularTabButton
              {...props}
              focused={props.accessibilityState?.selected}
            />
          ),
        }}
      />
    </Tabs>
  );
}
