import { Ionicons } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import RenderHtml from "react-native-render-html";

// Component for displaying formatted description
interface DescriptionSectionProps {
  description: string;
  colorScheme: "light" | "dark";
  t: (key: string) => string;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  description,
  colorScheme,
  t,
}) => {
  const { width } = useWindowDimensions();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const styles = createStyles(colorScheme);

  // Strip HTML tags to check length for truncation
  const getPlainTextLength = (html: string): number => {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim().length;
  };

  const plainTextLength = getPlainTextLength(description);
  const PREVIEW_LENGTH = 300;
  const needsTruncation = plainTextLength > PREVIEW_LENGTH;

  // Truncate HTML while preserving structure
  const truncateHtml = (html: string, maxLength: number): string => {
    let result = "";
    let textLength = 0;
    let inTag = false;

    for (let i = 0; i < html.length; i++) {
      const char = html[i];

      if (char === "<") {
        inTag = true;
        result += char;
      } else if (char === ">") {
        inTag = false;
        result += char;
      } else if (!inTag) {
        if (textLength < maxLength) {
          result += char;
          if (char !== " " && char !== "\n" && char !== "\r" && char !== "\t") {
            textLength++;
          }
        } else {
          result += "...</p>";
          break;
        }
      } else {
        result += char;
      }
    }

    return result;
  };

  const displayHtml =
    showFullDescription || !needsTruncation
      ? description
      : truncateHtml(description, PREVIEW_LENGTH);

  // Define styles for HTML elements - memoized to prevent re-renders
  const tagsStyles = useMemo(() => ({
    body: {
      color: colorScheme === "dark" ? "#D1D5DB" : "#374151",
      fontSize: 15,
      lineHeight: 24,
      fontFamily: "System",
    },
    p: {
      marginBottom: 12,
      color: colorScheme === "dark" ? "#D1D5DB" : "#374151",
    },
    a: {
      color: "#3B82F6",
      textDecorationLine: "underline" as const,
    },
    h1: {
      fontSize: 22,
      fontWeight: "bold" as const,
      marginBottom: 10,
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
    },
    h2: {
      fontSize: 20,
      fontWeight: "bold" as const,
      marginBottom: 8,
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
    },
    h3: {
      fontSize: 18,
      fontWeight: "600" as const,
      marginBottom: 6,
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
    },
    ul: {
      marginBottom: 12,
      paddingLeft: 10,
    },
    ol: {
      marginBottom: 12,
      paddingLeft: 10,
    },
    li: {
      marginBottom: 6,
      color: colorScheme === "dark" ? "#D1D5DB" : "#374151",
    },
    strong: {
      fontWeight: "bold" as const,
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
    },
    b: {
      fontWeight: "bold" as const,
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
    },
    em: {
      fontStyle: "italic" as const,
    },
    i: {
      fontStyle: "italic" as const,
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: "#3B82F6",
      paddingLeft: 12,
      marginLeft: 8,
      fontStyle: "italic" as const,
      color: colorScheme === "dark" ? "#9CA3AF" : "#6B7280",
    },
  }), [colorScheme]);

  const classesStyles = useMemo(() => ({
    "wiki-extract": {
      padding: 0,
    },
  }), []);

  const renderersProps = useMemo(() => ({
    a: {
      onPress: (_event: any, href: string) => {
        console.log("Link pressed:", href);
        // You can add custom link handling here
        // For example, open in browser or internal webview
      },
    },
  }), []);

  const defaultTextProps = useMemo(() => ({
    selectable: true,
  }), []);

  const source = useMemo(() => ({ html: displayHtml }), [displayHtml]);

  // Ignore problematic HTML tags that shouldn't be rendered in mobile
  const ignoredDomTags = useMemo(() => [
    'link',      // CSS links
    'style',     // Inline styles
    'script',    // JavaScript
    'meta',      // Metadata
    'head',      // Head section
    'noscript',  // No-script fallback
  ], []);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
        <Text style={styles.sectionTitle}>{t("Description")}</Text>
      </View>

      <View style={styles.descriptionContainer}>
        {description ? (
          <RenderHtml
            contentWidth={width - 64} // Account for padding (16 * 2 * 2)
            source={source}
            tagsStyles={tagsStyles}
            classesStyles={classesStyles}
            defaultTextProps={defaultTextProps}
            enableExperimentalMarginCollapsing={true}
            renderersProps={renderersProps}
            ignoredDomTags={ignoredDomTags}
          />
        ) : (
          <Text style={styles.noDescriptionText}>
            {t("No description available")}
          </Text>
        )}
      </View>

      {needsTruncation && (
        <TouchableOpacity
          onPress={() => setShowFullDescription(!showFullDescription)}
          style={styles.showMoreButton}
        >
          <Text style={styles.showMoreText}>
            {showFullDescription ? t("Show less") : t("Show more")}
          </Text>
          <Ionicons
            name={showFullDescription ? "chevron-up" : "chevron-down"}
            size={16}
            color="#3B82F6"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    section: {
      marginBottom: 20,
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255,255,255,0.1)"
          : "rgba(255,255,255,0.6)",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginLeft: 8,
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
    },
    descriptionContainer: {
      marginBottom: 8,
    },
    noDescriptionText: {
      fontSize: 15,
      lineHeight: 24,
      color: colorScheme === "dark" ? "#9CA3AF" : "#6B7280",
      fontStyle: "italic",
    },
    showMoreButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 8,
      alignSelf: "flex-start",
    },
    showMoreText: {
      color: "#3B82F6",
      fontSize: 14,
      fontWeight: "500",
    },
  });
