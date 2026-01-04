import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/auth";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || "G"}
              </Text>
            </View>
            <Text style={styles.greeting}>Hi, {user?.name || "Guest"}!</Text>
          </View>
          <View style={styles.languageSelector}>
            <Text style={styles.languageFlag}>🇺🇸</Text>
            <Text style={styles.languageCode}>en</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.95}
            onPress={() => console.log("Back to school promo")}
          >
            <LinearGradient
              colors={[Colors.gradientCoralStart, Colors.gradientCoralEnd] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardTitle}>Back to school</Text>
                  <Text style={styles.cardSubtitle}>Sale 50% off</Text>
                  <TouchableOpacity style={styles.cardButton}>
                    <Text style={styles.cardButtonText}>Get Now 50% off 🎁</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardRight}>
                  <Image
                    source="https://r2-pub.rork.com/generated-images/kawaii-backpack.png"
                    style={styles.backpackImage}
                    contentFit="contain"
                  />
                  <Text style={styles.watermark}>BACK TO SCHOOL</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.95}
            onPress={() => router.push("/feynman-ai")}
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
                    <Text style={styles.cardTitleLarge}>Feynman AI</Text>
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeText}>A+</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDescription}>
                    <Text style={styles.bold}>Use Feynman Technique</Text>
                    {"\n"}to learn and memorize anything.
                  </Text>
                  <TouchableOpacity style={styles.cardButton}>
                    <Text style={styles.cardButtonText}>Start Learning ✨</Text>
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
            onPress={() => router.push("/create-notes")}
          >
            <LinearGradient
              colors={[Colors.gradientGreenStart, Colors.gradientLimeEnd] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardTitleLarge}>Create Notes</Text>
                  <Text style={styles.cardDescription}>
                    Create notes, quizzes, flashcards and more to help you learn faster.
                  </Text>
                  <TouchableOpacity style={styles.cardButton}>
                    <Text style={styles.cardButtonText}>Create Notes 🎁</Text>
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
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "700",
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
    gap: 16,
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
    padding: 20,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 160,
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
    fontSize: 24,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 4,
  },
  cardTitleLarge: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.white,
  },
  cardSubtitle: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.white,
    lineHeight: 20,
    marginTop: 8,
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
    marginTop: 12,
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
