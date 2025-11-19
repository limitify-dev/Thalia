import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import translations
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";

const LANGUAGE_STORAGE_KEY = "app_language";

// Get device language
const deviceLanguage = Localization.getLocales()[0]?.languageCode || "en";

// Initialize i18n with AsyncStorage for persistence
const initI18n = async () => {
  let savedLanguage = deviceLanguage;

  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage) {
      savedLanguage = storedLanguage;
    }
  } catch (error) {
    console.error("Error loading saved language:", error);
  }

  i18n.use(initReactI18next).init({
    // compatibilityJSON: "v3",
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
    },
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};

// Save language preference
export const saveLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error("Error saving language:", error);
  }
};

initI18n();

export default i18n;
