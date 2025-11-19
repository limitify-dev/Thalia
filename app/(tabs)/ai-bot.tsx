import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const AiBotScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/"); // Fallback to home if can't go back
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
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
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Back Button */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity
              style={{
                ...styles.backButton,
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(255, 255, 255, 0.8)",
              }}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
              />
            </TouchableOpacity>
            <Text style={[styles.title, isDark && styles.darkTitle]}>
              {t("aiBot.title")}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Chat with Thaïa Section */}
          <View style={[styles.section, isDark && styles.darkSection]}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="chatbubble-outline"
                  size={32}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                />
              </View>
              <View style={styles.sectionTextContainer}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isDark && styles.darkSectionTitle,
                  ]}
                >
                  {t("aiBot.chatWithThaia")}
                </Text>
                <Text
                  style={[styles.sectionDescription, isDark && styles.darkText]}
                >
                  {t("aiBot.chatDescription")}
                </Text>
              </View>
            </View>

            {/* Start Conversation Button */}
            <TouchableOpacity
              style={[styles.startButton, isDark && styles.darkStartButton]}
              activeOpacity={0.8}
              onPress={() => router.push("/AiBot")} // Navigate to chat screen
            >
              <Text style={styles.startButtonText}>
                {t("aiBot.startConversation")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Image Search Options */}
          <View style={[styles.section, isDark && styles.darkSection]}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="camera-outline"
                  size={32}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                />
              </View>
              <View style={styles.sectionTextContainer}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isDark && styles.darkSectionTitle,
                  ]}
                >
                  {t("aiBot.imageSearch")}
                </Text>
                <Text
                  style={[styles.sectionDescription, isDark && styles.darkText]}
                >
                  {t("aiBot.imageSearchDescription")}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.cameraButton, isDark && styles.darkCameraButton]}
              activeOpacity={0.8}
              onPress={() => router.push("/AiBot")} // Navigate to camera screen
            >
              <Text
                style={[
                  styles.cameraButtonText,
                  isDark && styles.darkCameraButtonText,
                ]}
              >
                {t("aiBot.openCamera")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Interaction History */}
          <View style={styles.historySection}>
            <Text
              style={[
                styles.historySectionTitle,
                isDark && styles.darkHistorySectionTitle,
              ]}
            >
              {t("aiBot.interactionHistory")}
            </Text>

            {/* History Item 1 */}
            <TouchableOpacity
              style={[styles.historyItem, isDark && styles.darkHistoryItem]}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/",
                  params: { conversationId: "1" }, // Pass conversation ID
                })
              }
            >
              <View style={styles.historyIconContainer}>
                <Ionicons
                  name="chatbubble-outline"
                  size={20}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                />
              </View>
              <View style={styles.historyContent}>
                <Text
                  style={[
                    styles.historyTitle,
                    isDark && styles.darkHistoryTitle,
                  ]}
                >
                  {t("aiBot.modernArtRecommendations")}
                </Text>
                <Text
                  style={[styles.historyTime, isDark && styles.darkHistoryTime]}
                >
                  {t("aiBot.hoursAgo", { hours: 2 })}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.resumeButton, isDark && styles.darkResumeButton]}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent parent press
                  router.push({
                    pathname: "/",
                    params: { conversationId: "1" },
                  });
                }}
              >
                <Text
                  style={[
                    styles.resumeButtonText,
                    isDark && styles.darkResumeButtonText,
                  ]}
                >
                  {t("aiBot.resume")}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* History Item 2 */}
            <TouchableOpacity
              style={[styles.historyItem, isDark && styles.darkHistoryItem]}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/",
                  params: { conversationId: "2" }, // Pass conversation ID
                })
              }
            >
              <View style={styles.historyIconContainer}>
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                />
              </View>
              <View style={styles.historyContent}>
                <Text
                  style={[
                    styles.historyTitle,
                    isDark && styles.darkHistoryTitle,
                  ]}
                >
                  {t("aiBot.sculptureAtLouvre")}
                </Text>
                <Text
                  style={[styles.historyTime, isDark && styles.darkHistoryTime]}
                >
                  {t("aiBot.yesterday")}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.resumeButton, isDark && styles.darkResumeButton]}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent parent press
                  router.push({
                    pathname: "/",
                    params: { conversationId: "2" },
                  });
                }}
              >
                <Text
                  style={[
                    styles.resumeButtonText,
                    isDark && styles.darkResumeButtonText,
                  ]}
                >
                  {t("aiBot.review")}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginBottom: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  darkTitle: {
    color: "#FFFFFF",
  },
  headerSpacer: {
    width: 40,
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  darkSection: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  darkSectionTitle: {
    color: "#FFFFFF",
  },
  sectionDescription: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.8)",
    lineHeight: 20,
  },
  darkText: {
    color: "#FFFFFF",
  },
  startButton: {
    backgroundColor: "rgba(139, 92, 246, 0.8)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  darkStartButton: {
    backgroundColor: "rgba(109, 40, 217, 0.8)",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cameraButton: {
    backgroundColor: "rgba(139, 92, 246, 0.8)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  darkCameraButton: {
    backgroundColor: "rgba(109, 40, 217, 0.8)",
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  darkCameraButtonText: {
    color: "#FFFFFF",
  },
  historySection: {
    marginTop: 20,
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  darkHistorySectionTitle: {
    color: "#FFFFFF",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  darkHistoryItem: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  historyIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 4,
  },
  darkHistoryTitle: {
    color: "#FFFFFF",
  },
  historyTime: {
    fontSize: 12,
    color: "#64748B",
  },
  darkHistoryTime: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  resumeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  darkResumeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  resumeButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
  },
  darkResumeButtonText: {
    color: "#FFFFFF",
  },
});

export default AiBotScreen;
