import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/auth";
import { useExplanations } from "@/contexts/explanations";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  BookOpen,
  Brain,
  Calculator,
  Globe,
  Lightbulb,
  Settings,
  Star,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const categories: Category[] = [
  {
    id: "science",
    name: "Science",
    icon: <Brain size={28} color={Colors.white} />,
    color: Colors.coral,
  },
  {
    id: "math",
    name: "Math",
    icon: <Calculator size={28} color={Colors.white} />,
    color: Colors.orange,
  },
  {
    id: "history",
    name: "History",
    icon: <Globe size={28} color={Colors.white} />,
    color: Colors.darkBrown,
  },
  {
    id: "technology",
    name: "Technology",
    icon: <Lightbulb size={28} color={Colors.white} />,
    color: Colors.teal,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getRecentExplanations } = useExplanations();
  const [searchQuery, setSearchQuery] = useState("");

  const recentExplanations = getRecentExplanations();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: "/explanation",
        params: { topic: searchQuery },
      });
    }
  };

  const handleCategoryPress = (category: Category) => {
    setSearchQuery(category.name);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || "there"}!</Text>
            <Text style={styles.subtitle}>What do you want to learn today?</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={styles.settingsButton}
          >
            <Settings size={24} color={Colors.darkBrown} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="What do you want to learn about?"
              placeholderTextColor={Colors.grayText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={!searchQuery.trim()}
            >
              <Text style={styles.searchButtonText}>Ask</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mascotContainer}>
            <Image
              source="https://r2-pub.rork.com/generated-images/21a2188b-28ec-4fab-9231-8adc2cd797f9.png"
              style={styles.mascotImage}
              contentFit="contain"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Topics</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { backgroundColor: category.color }]}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.8}
                >
                  {category.icon}
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {recentExplanations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent</Text>
                <TouchableOpacity onPress={() => router.push("/saved")}>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>
              {recentExplanations.map((exp) => (
                <TouchableOpacity
                  key={exp.id}
                  style={styles.recentCard}
                  onPress={() =>
                    router.push({
                      pathname: "/explanation",
                      params: { topic: exp.topic, explanationId: exp.id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.recentIcon}>
                    <BookOpen size={20} color={Colors.orange} />
                  </View>
                  <View style={styles.recentContent}>
                    <Text style={styles.recentTopic} numberOfLines={1}>
                      {exp.topic}
                    </Text>
                    <Text style={styles.recentTime}>
                      {new Date(exp.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  {exp.isSaved && (
                    <Star size={18} color={Colors.orange} fill={Colors.orange} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.beige,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.darkText,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grayText,
  },
  settingsButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.white,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.darkText,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        outlineStyle: "none",
      },
    }),
  },
  searchButton: {
    backgroundColor: Colors.orange,
    borderRadius: 16,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  mascotContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  mascotImage: {
    width: 120,
    height: 120,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.darkText,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 15,
    color: Colors.orange,
    fontWeight: "600",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: "48%",
    aspectRatio: 1.5,
    borderRadius: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
      },
    }),
  },
  categoryName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      },
    }),
  },
  recentIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.lightCoral,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTopic: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkText,
    marginBottom: 4,
  },
  recentTime: {
    fontSize: 13,
    color: Colors.grayText,
  },
});
