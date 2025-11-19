import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Modal,
  useColorScheme,
  Appearance,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { saveLanguage } from "@/i18n/config";

const Colors = {
  light: {
    background: "#F8FAFC",
    cardBackground: "#FFFFFF",
    primary: "#4F46E5",
    text: "#0F172A",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    modalOverlay: "rgba(0, 0, 0, 0.4)",
    thumbColor: "#4F46E5",
  },
  dark: {
    background: "#0F172A",
    cardBackground: "#1E293B",
    primary: "#FFFFFF",
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    border: "#334155",
    modalOverlay: "rgba(0, 0, 0, 0.7)",
    thumbColor: "#4F46E5",
  },
};

const languages = [
  { code: "fr", flag: "🇫🇷" },
  { code: "en", flag: "🇺🇸" },
  { code: "es", flag: "🇪🇸" },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const systemColorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemColorScheme === "dark");
  const [notifications, setNotifications] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const isDark = systemColorScheme === "dark";
  const insets = useSafeAreaInsets();
  const currentColors = Colors[darkMode ? "dark" : "light"];

  // Load saved preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Sync with system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem("darkModeOverride").then((override) => {
        if (override === null) {
          // No manual override, follow system
          setDarkMode(colorScheme === "dark");
        }
      });
    });

    return () => subscription.remove();
  }, []);

  const loadPreferences = async () => {
    try {
      const [savedDarkMode, savedLanguage, savedNotifications] =
        await Promise.all([
          AsyncStorage.getItem("darkModeOverride"),
          AsyncStorage.getItem("selectedLanguage"),
          AsyncStorage.getItem("notificationsEnabled"),
        ]);

      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode === "true");
      }

      if (savedLanguage !== null) {
        setSelectedLanguage(savedLanguage);
      }

      if (savedNotifications !== null) {
        setNotifications(savedNotifications === "true");
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkMode(value);
    try {
      await AsyncStorage.setItem("darkModeOverride", value.toString());
      // Force the app to use this preference
      Appearance.setColorScheme(value ? "dark" : "light");
    } catch (error) {
      console.error("Error saving dark mode preference:", error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotifications(value);
    try {
      await AsyncStorage.setItem("notificationsEnabled", value.toString());
    } catch (error) {
      console.error("Error saving notification preference:", error);
    }
  };

  const handleLanguageSelect = async (code: string) => {
    setSelectedLanguage(code);
    setShowLanguageModal(false);
    try {
      await i18n.changeLanguage(code);
      await saveLanguage(code);
      await AsyncStorage.setItem("selectedLanguage", code);
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  const currentLanguage = languages.find(
    (lang) => lang.code === selectedLanguage,
  );

  const getLanguageName = (code: string) => {
    return t(`settings.languages.${code}`);
  };

  return (
    <SafeAreaView
      style={[
        { ...styles.container, top: insets.top },
        { backgroundColor: currentColors.background, paddingTop: insets.top },
      ]}
    >
      <LinearGradient
        colors={
          darkMode
            ? ["#1e3a8a", "#581c87", "#0f172a"]
            : [
                "rgba(243, 232, 255, 0.95)",
                "rgba(219, 234, 254, 0.90)",
                "rgba(255, 255, 255, 0.85)",
              ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.9)",
              },
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={currentColors.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.primary }]}>
            {t("settings.title")}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Search Bar */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.9)",
                borderColor: currentColors.border,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={currentColors.textSecondary}
            />
            <Text
              style={[
                styles.searchPlaceholder,
                { color: currentColors.textSecondary },
              ]}
            >
              {t("settings.searchPlaceholder")}
            </Text>
          </View>

          {/* Préférences Section */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: currentColors.primary }]}
            >
              {t("settings.preferences")}
            </Text>

            {/* Language */}
            <TouchableOpacity
              style={[
                styles.settingCard,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.9)",
                },
              ]}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${currentColors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="language"
                    size={24}
                    color={currentColors.primary}
                  />
                </View>
                <View>
                  <Text
                    style={[styles.settingTitle, { color: currentColors.text }]}
                  >
                    {t("settings.language")}
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: currentColors.textSecondary },
                    ]}
                  >
                    {getLanguageName(selectedLanguage)}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={currentColors.textSecondary}
              />
            </TouchableOpacity>

            {/* Dark Mode */}
            <View
              style={[
                styles.settingCard,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.9)",
                },
              ]}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${currentColors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="moon"
                    size={24}
                    color={currentColors.primary}
                  />
                </View>
                <View>
                  <Text
                    style={[styles.settingTitle, { color: currentColors.text }]}
                  >
                    {t("settings.darkMode")}
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: currentColors.textSecondary },
                    ]}
                  >
                    {t("settings.darkModeDescription")}
                  </Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{
                  false: currentColors.border,
                  true: currentColors.thumbColor,
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: currentColors.primary }]}
            >
              {t("settings.notifications")}
            </Text>

            <View
              style={[
                styles.settingCard,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.9)",
                },
              ]}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${currentColors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="notifications"
                    size={24}
                    color={currentColors.primary}
                  />
                </View>
                <View>
                  <Text
                    style={[styles.settingTitle, { color: currentColors.text }]}
                  >
                    {t("settings.pushNotifications")}
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: currentColors.textSecondary },
                    ]}
                  >
                    {t("settings.pushNotificationsDescription")}
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={handleNotificationsToggle}
                trackColor={{
                  false: currentColors.border,
                  true: currentColors.thumbColor,
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Confidentialité Section */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: currentColors.primary }]}
            >
              {t("settings.privacy")}
            </Text>

            <TouchableOpacity
              style={[
                styles.settingCard,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.9)",
                },
              ]}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${currentColors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={24}
                    color={currentColors.primary}
                  />
                </View>
                <View>
                  <Text
                    style={[styles.settingTitle, { color: currentColors.text }]}
                  >
                    {t("settings.privacy")}
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: currentColors.textSecondary },
                    ]}
                  >
                    {t("settings.privacyDescription")}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={currentColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: currentColors.primary }]}
            >
              {t("settings.support")}
            </Text>

            <TouchableOpacity
              style={[
                styles.settingCard,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.9)",
                },
              ]}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${currentColors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="help-circle"
                    size={24}
                    color={currentColors.primary}
                  />
                </View>
                <View>
                  <Text
                    style={[styles.settingTitle, { color: currentColors.text }]}
                  >
                    {t("settings.helpSupport")}
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: currentColors.textSecondary },
                    ]}
                  >
                    {t("settings.helpSupportDescription")}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={currentColors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View
            style={[
              styles.modalOverlay,
              { backgroundColor: currentColors.modalOverlay },
            ]}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: currentColors.cardBackground },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[styles.modalTitle, { color: currentColors.text }]}
                >
                  {t("settings.selectLanguage")}
                </Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Ionicons name="close" size={24} color={currentColors.text} />
                </TouchableOpacity>
              </View>

              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    selectedLanguage === lang.code && {
                      backgroundColor: `${currentColors.primary}15`,
                      borderColor: currentColors.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleLanguageSelect(lang.code)}
                >
                  <View style={styles.languageLeft}>
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text
                      style={[
                        styles.languageName,
                        { color: currentColors.text },
                      ]}
                    >
                      {getLanguageName(lang.code)}
                    </Text>
                  </View>
                  {selectedLanguage === lang.code && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={currentColors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}

              <Text
                style={[
                  styles.modalFooter,
                  { color: currentColors.textSecondary },
                ]}
              >
                {t("settings.changesApplied")}
              </Text>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  languageLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalFooter: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 16,
  },
});
