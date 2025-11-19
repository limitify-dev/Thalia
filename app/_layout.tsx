import "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";
import { useState } from "react";
import { store } from "@/redux/store";
import "@/i18n/config";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Platform, useColorScheme, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import AnimatedSplash from "../components/AnimatedSplash";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import SettingsScreen from "@/screens/SettingsScreen";
// Prevent auto hide
SplashScreen.preventAutoHideAsync();

function HeaderBG() {
  const scheme = useColorScheme();
  return Platform.OS === "ios" ? (
    <View
      style={{
        flex: 1,
        backgroundColor:
          scheme === "dark"
            ? "rgba(18, 18, 18, 0.9)"
            : "rgba(255, 255, 255, 0.9)",
      }}
    />
  ) : (
    <View style={{ flex: 1, backgroundColor: "transparent" }} />
  );
}

function GradientStatusBar() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const lightGradient = [
    "rgba(243, 232, 255, 0.95)", // Light purple
    "rgba(219, 234, 254, 0.90)", // Light blue
    "rgba(255, 255, 255, 0.85)", // White
  ] as const;

  const darkGradient = [
    "rgba(15, 23, 42, 0.98)", // Dark slate
    "rgba(30, 41, 59, 0.95)", // Slate
    "rgba(51, 65, 85, 0.90)", // Light slate
  ] as const;

  return (
    <View
      style={[
        styles.statusBarContainer,
        {
          height: insets.top,
          backgroundColor: scheme === "dark" ? "#0F172A" : "#FFFFFF",
        },
      ]}
    >
      <LinearGradient
        colors={scheme === "dark" ? darkGradient : lightGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.statusBarGradient,
          {
            height: insets.top,
          },
        ]}
      >
        <StatusBar
          style={scheme === "dark" ? "light" : "dark"}
          translucent={true}
          backgroundColor="transparent"
        />
      </LinearGradient>

      {/* Optional: Bottom border for definition */}
      <View
        style={[
          styles.bottomBorder,
          {
            borderBottomColor:
              scheme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          },
        ]}
      />
    </View>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = async () => {
    setShowSplash(false);
    await SplashScreen.hideAsync();
  };

  // Show animated splash first
  if (showSplash) {
    return <AnimatedSplash onFinish={handleSplashFinish} />;
  }

  // Then show main app
  return (
    <SafeAreaProvider>
      <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
        <Provider store={store}>
          <GradientStatusBar />
          <Stack
            screenOptions={{
              headerShown: false,
              headerTransparent: true,
              headerBackground: HeaderBG,
              headerShadowVisible: false,
              headerTitleStyle: { fontFamily: "Poppins-Medium" },
              headerTintColor: scheme === "dark" ? "#fff" : "#111",
              contentStyle: { backgroundColor: "transparent", flex: 1 },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="SettingsScreen"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DetailScreen"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="AiBot" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </Provider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles: any = {
  statusBarGradient: {
    height: "100%",
    width: "100%",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  statusBarContainer: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottomWidth: 1,
  },
};
