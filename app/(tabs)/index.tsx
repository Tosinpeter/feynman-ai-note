import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/auth";
import { useLanguage, Language } from "@/contexts/language";
import BottomSheet from "@/components/BottomSheet";
import LanguageSelectionContent from "@/components/LanguageSelectionContent";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
 import { supabase } from "@/lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "@/constants/fonts";
import NetInfo from "@react-native-community/netinfo";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const router = useRouter();
  const { profile, setSession, refreshProfile } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLanguageChange = async (lang: Language) => {
    await changeLanguage(lang);
    setShowLanguageModal(false);
  };

  const getLanguageFlag = () => {
    switch (language) {
      case "it":
        return "🇮🇹";
      case "de":
        return "🇩🇪";
      case "en":
      default:
        return "🇬🇧";
    }
  };

  useEffect(() => {
    let cancelled = false;
    let unsubscribeNetInfo: (() => void) | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let inFlight = false;

    const clearRetry = () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
    };

    const subscribeForReconnect = () => {
      if (unsubscribeNetInfo) return;

      unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        const isOnline =
          Boolean(state.isConnected) && Boolean(state.isInternetReachable ?? true);

        if (isOnline) {
          clearRetry();
          void initializeUser();
        }
      });
    };

    const scheduleRetry = () => {
      clearRetry();
      attempts += 1;
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (cap)
      const delayMs = Math.min(30_000, 1000 * 2 ** Math.min(attempts - 1, 5));
      retryTimeout = setTimeout(() => {
        void initializeUser();
      }, delayMs);
    };

    const initializeUser = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;

      try {
        const state = await NetInfo.fetch();
        const isOnline =
          Boolean(state.isConnected) && Boolean(state.isInternetReachable ?? true);

        if (!isOnline) {
          // Wait for connection to come back, then retry.
          subscribeForReconnect();
          return;
        }

        console.log("Refreshing the user profile");

        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        setSession(initialSession);

        if (initialSession?.user) {
          // Pass the userId so refresh doesn't depend on session state timing.
          await refreshProfile(initialSession.user.id);
        }

        // Success: reset retry state + stop listening for reconnect.
        attempts = 0;
        clearRetry();
        unsubscribeNetInfo?.();
        unsubscribeNetInfo = null;
      } catch (error) {
        if (cancelled) return;

        console.error("Error initializing session:", error);

        // If the error is network-ish, also listen for reconnect.
        subscribeForReconnect();
        scheduleRetry();
      } finally {
        inFlight = false;
      }
    };

    void initializeUser();

    return () => {
      cancelled = true;
      clearRetry();
      unsubscribeNetInfo?.();
      unsubscribeNetInfo = null;
    };
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarText}>
                  {profile?.full_name?.charAt(0).toUpperCase() || "G"}
                </Text>
              )}
            </View>
            <Text style={styles.greeting}>
              {t("homeScreen.greeting")}, {profile?.full_name || t("homeScreen.guest")}!
            </Text>
          </View>
          <TouchableOpacity
            style={styles.languageSelector}
            activeOpacity={0.7}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={styles.languageFlag}>{getLanguageFlag()}</Text>
            <Text style={styles.languageCode}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.95}
            onPress={() => router.push("/paywall")}
          >
            <LinearGradient
              colors={[Colors.gradientCoralStart, Colors.gradientCoralEnd] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardTitle}>{t("homeScreen.backToSchool")}</Text>
                  <Text style={styles.cardSubtitle}>{t("homeScreen.sale50Off")}</Text>
                  <TouchableOpacity 
                    style={styles.cardButton}
                    onPress={() => router.push("/paywall")}
                  >
                    <Text style={styles.cardButtonText}>{t("homeScreen.getNow50Off")}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardRight}>
                  <Image
                    source="https://r2-pub.rork.com/generated-images/kawaii-backpack.png"
                    style={styles.backpackImage}
                    contentFit="contain"
                  />
                  <Text style={styles.watermark}>{t("homeScreen.backToSchoolWatermark")}</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.95}
            onPress={() => router.push("/start-learning")}
          >
            <LinearGradient
              colors={[
                Colors.gradientPurpleStart,
                Colors.gradientBlue,
                Colors.gradientTealEnd,
              ] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitleLarge}>{t("homeScreen.feynmanAI")}</Text>
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeText}>A+</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDescription}>
                    {t("homeScreen.learnAndMemorize")}
                  </Text>
                  <TouchableOpacity 
                    style={styles.cardButton}
                    onPress={() => router.push("/start-learning")}
                  >
                    <Text style={styles.cardButtonText}>{t("homeScreen.startLearning")}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardRight}>
                  <Image
                    source="https://r2-pub.rork.com/generated-images/21a2188b-28ec-4fab-9231-8adc2cd797f9.png"
                    style={styles.raccoonImage}
                    contentFit="contain"
                  />
                  <Text style={styles.heartEmoji}>❤️</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.95}
            onPress={() => router.push("/start-learning")}
          >
            <LinearGradient
              colors={[Colors.gradientGreenStart, Colors.gradientLimeEnd] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardTitleLarge}>{t("homeScreen.createNotes")}</Text>
                  <Text style={styles.cardDescription}>
                    {t("homeScreen.createNotesDescription")}
                  </Text>
                  <TouchableOpacity 
                    style={styles.cardButton}
                    onPress={() => router.push("/start-learning")}
                  >
                    <Text style={styles.cardButtonText}>{t("homeScreen.createNotesButton")}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardRight}>
                  <Image
                    source="https://r2-pub.rork.com/generated-images/kawaii-notebook.png"
                    style={styles.notebookImage}
                    contentFit="contain"
                  />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Language Selection Bottom Sheet */}
      <BottomSheet
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title={t("profile.changeLanguage")}
      >
        <LanguageSelectionContent
          currentLanguage={language}
          onLanguageSelect={handleLanguageChange}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.orange,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  greeting: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    color: Colors.text,
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.navInactive,
    backgroundColor: Colors.white,
  },
  languageFlag: {
    fontSize: 16,
  },
  languageCode: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 3,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      },
    }),
  },
  cardGradient: {
    padding: 15,
  },
  cardContent: {
    flexDirection: "row",
    minHeight: 120,
    justifyContent: "space-between",
  },
  cardLeft: {
    flex: 1,
    justifyContent: "space-between",
    paddingRight: 12,
  },
  cardRight: {
    width: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 4,
  },
  cardTitleLarge: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.white,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.white,
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.white,
    lineHeight: 20,
    marginTop: 1,
  },
  bold: {
    fontWeight: "700" as const,
  },
  cardButton: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  cardButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  gradeBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    transform: [{ rotate: "12deg" }],
  },
  gradeText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  backpackImage: {
    width: 100,
    height: 100,
  },
  raccoonImage: {
    width: 110,
    height: 110,
  },
  notebookImage: {
    width: 100,
    height: 120,
  },
  watermark: {
    position: "absolute",
    bottom: 0,
    right: 0,
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
  },
  heartEmoji: {
    position: "absolute",
    bottom: 10,
    left: 10,
    fontSize: 20,
  },
});
