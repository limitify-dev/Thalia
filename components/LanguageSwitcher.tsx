import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { useTranslation } from "react-i18next";
import { saveLanguage } from "@/i18n/config";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const changeLanguage = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    await saveLanguage(languageCode);
  };

  return (
    <View style={styles.container}>
      {LANGUAGES.map((language) => {
        const isSelected = i18n.language === language.code;

        return (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageButton,
              {
                backgroundColor: isSelected
                  ? isDark
                    ? "#3B82F6"
                    : "#60A5FA"
                  : isDark
                    ? "#1F2937"
                    : "#F3F4F6",
                borderWidth: isSelected ? 2 : 0,
                borderColor: isDark ? "#60A5FA" : "#3B82F6",
              },
            ]}
            onPress={() => changeLanguage(language.code)}
          >
            <Text style={styles.flag}>{language.flag}</Text>
            <Text
              style={[
                styles.label,
                {
                  color: isSelected
                    ? "#FFFFFF"
                    : isDark
                      ? "#E5E7EB"
                      : "#1F2937",
                  fontWeight: isSelected ? "600" : "400",
                },
              ]}
            >
              {language.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  flag: {
    fontSize: 20,
  },
  label: {
    fontSize: 15,
  },
});
