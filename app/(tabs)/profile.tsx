import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();
  const interests = [
    t("profile.interests.modernArt"),
    t("profile.interests.history"),
    t("profile.interests.photography"),
    t("profile.interests.sculpture"),
  ];
  const handleSettings = () => navigation.navigate("SettingsScreen");

  const stats = [
    {
      icon: "location" as const,
      label: t("profile.museumsVisited"),
      value: "12",
    },
    {
      icon: "time" as const,
      label: t("profile.explorationTime"),
      value: "1440 min",
    },
    { icon: "heart" as const, label: t("profile.favoriteExpos"), value: "8" },
  ];

  const menuItems = [
    {
      icon: "star-outline" as const,
      label: t("profile.mySubscription"),
      hasChevron: true,
    },
    {
      icon: "help-circle-outline" as const,
      label: t("profile.helpSupport"),
      hasChevron: true,
    },
    {
      icon: "settings-outline" as const,
      label: t("settings.title"),
      hasChevron: true,
    },
    {
      icon: "information-circle-outline" as const,
      label: t("profile.about"),
      hasChevron: true,
    },
  ];

  return (
    <SafeAreaView
      style={{
        ...styles.container,
        backgroundColor: isDark ? "#000000" : "#F5F5F7",
      }}
    >
      <LinearGradient
        colors={
          isDark
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
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 90,
            marginTop: insets.top + 2,
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity>
              <Ionicons
                name="arrow-back"
                size={24}
                color={isDark ? "#FFFFFF" : "#000000"}
                onPress={() => {
                  router.back();
                }}
              />
            </TouchableOpacity>
            <Text
              style={{
                ...styles.headerTitle,
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              {t("profile.account")}
            </Text>
            <TouchableOpacity>
              <Ionicons
                name="create-outline"
                size={24}
                color={isDark ? "#FFFFFF" : "#000000"}
              />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View
            style={{
              ...styles.profileCard,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(255,255,255,0.9)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0 : 0.1,
              shadowRadius: 8,
              elevation: isDark ? 0 : 3,
            }}
          >
            <View style={styles.avatarContainer}>
              <View
                style={{
                  ...styles.avatar,
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(139, 92, 246, 0.2)",
                }}
              >
                <Text
                  style={{
                    ...styles.avatarText,
                    color: isDark ? "#FFFFFF" : "#8B5CF6",
                  }}
                >
                  M
                </Text>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameContainer}>
                <Text
                  style={{
                    ...styles.profileName,
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  Mohit Abidoye
                </Text>
                <Text style={styles.trophy}>🏆</Text>
              </View>
              <Text
                style={{
                  ...styles.profileUsername,
                  color: isDark
                    ? "rgba(255, 255, 255, 0.8)"
                    : "rgba(0, 0, 0, 0.6)",
                }}
              >
                @mohit.explorer
              </Text>

              <View style={styles.badgesContainer}>
                <View style={styles.badge}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.badgeText}>
                    {t("profile.premiumMember")}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.badgeSecondary,
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(139, 92, 246, 0.15)",
                  }}
                >
                  <Text
                    style={{
                      ...styles.badgeTextSecondary,
                      color: isDark ? "#FFFFFF" : "#8B5CF6",
                    }}
                  >
                    {t("profile.culturalExplorer")}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.bioContainer}>
              <Text
                style={{
                  ...styles.bioText,
                  color: isDark
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(0, 0, 0, 0.7)",
                }}
              >
                {t("profile.bio")}
              </Text>
            </View>

            <View style={styles.interestsContainer}>
              {interests.map((interest, index) => (
                <View
                  key={index}
                  style={{
                    ...styles.interestTag,
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(139, 92, 246, 0.1)",
                  }}
                >
                  <Text
                    style={{
                      ...styles.interestText,
                      color: isDark ? "#FFFFFF" : "#8B5CF6",
                    }}
                  >
                    {interest}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <Text
              style={{
                ...styles.sectionTitle,
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              {t("profile.culturalStatistics")}
            </Text>
            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View
                  key={index}
                  style={{
                    ...styles.statCard,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.9)",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0 : 0.1,
                    shadowRadius: 4,
                    elevation: isDark ? 0 : 2,
                  }}
                >
                  <View
                    style={{
                      ...styles.statIconContainer,
                      backgroundColor: isDark
                        ? "rgba(139, 92, 246, 0.2)"
                        : "rgba(139, 92, 246, 0.15)",
                    }}
                  >
                    <Ionicons name={stat.icon} size={24} color="#8B5CF6" />
                  </View>
                  <Text
                    style={{
                      ...styles.statValue,
                      color: isDark ? "#FFFFFF" : "#000000",
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={{
                      ...styles.statLabel,
                      color: isDark ? "#8E8E93" : "#666666",
                    }}
                  >
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Menu Section */}
          <View style={styles.section}>
            <Text
              style={{
                ...styles.sectionTitle,
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              {t("profile.general")}
            </Text>
            <View
              style={{
                ...styles.menuContainer,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.9)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0 : 0.1,
                shadowRadius: 4,
                elevation: isDark ? 0 : 2,
              }}
            >
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (item.label === t("settings.title")) {
                      handleSettings();
                    }
                  }}
                  style={[
                    styles.menuItem,
                    {
                      borderBottomColor: isDark ? "#38383A" : "#E5E5E7",
                    },
                    index === menuItems.length - 1 && styles.menuItemLast,
                  ]}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon} size={22} color="#8B5CF6" />
                    <Text
                      style={{
                        ...styles.menuItemText,
                        color: isDark ? "#FFFFFF" : "#000000",
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {item.hasChevron && (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={isDark ? "#8E8E93" : "#C7C7CC"}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={{
              ...styles.logoutButton,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(255,255,255,0.9)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0 : 0.1,
              shadowRadius: 4,
              elevation: isDark ? 0 : 2,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>{t("profile.logout")}</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    marginRight: 6,
  },
  trophy: {
    fontSize: 20,
  },
  profileUsername: {
    fontSize: 14,
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFD700",
  },
  badgeSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeTextSecondary: {
    fontSize: 12,
    fontWeight: "500",
  },
  bioContainer: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 13,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  menuContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ProfilePage;
