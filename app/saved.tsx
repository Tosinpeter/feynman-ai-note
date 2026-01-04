import Colors from "@/constants/colors";
import { useExplanations } from "@/contexts/explanations";
import { useRouter } from "expo-router";
import { ArrowLeft, BookOpen, Search, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SavedScreen() {
  const router = useRouter();
  const { getSavedExplanations, deleteExplanation } =
    useExplanations();
  const [searchQuery, setSearchQuery] = useState("");

  const savedExplanations = getSavedExplanations();
  const filteredExplanations = savedExplanations.filter((exp) =>
    exp.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string, topic: string) => {
    if (Platform.OS === "web") {
      if (confirm(`Remove "${topic}" from saved?`)) {
        deleteExplanation(id);
      }
    } else {
      Alert.alert(
        "Remove from saved",
        `Are you sure you want to remove "${topic}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => deleteExplanation(id),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={Colors.darkBrown} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Explanations</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.grayText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved topics..."
            placeholderTextColor={Colors.grayText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredExplanations.length === 0 ? (
            <View style={styles.emptyState}>
              <BookOpen size={64} color={Colors.lightGray} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>
                {searchQuery
                  ? "No results found"
                  : "No saved explanations yet"}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "Try a different search term"
                  : "Save explanations by tapping the bookmark icon"}
              </Text>
            </View>
          ) : (
            filteredExplanations.map((exp) => (
              <View key={exp.id} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardContent}
                  onPress={() =>
                    router.push({
                      pathname: "/explanation",
                      params: { topic: exp.topic, explanationId: exp.id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.cardIcon}>
                    <BookOpen size={22} color={Colors.orange} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTopic} numberOfLines={1}>
                      {exp.topic}
                    </Text>
                    <Text style={styles.cardPreview} numberOfLines={2}>
                      {exp.content}
                    </Text>
                    <Text style={styles.cardDate}>
                      {new Date(exp.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(exp.id, exp.topic)}
                >
                  <Trash2 size={20} color={Colors.coral} />
                </TouchableOpacity>
              </View>
            ))
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.darkText,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
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
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.darkText,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.darkText,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.grayText,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  card: {
    flexDirection: "row",
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
  cardContent: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    backgroundColor: Colors.lightCoral,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardTopic: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.darkText,
    marginBottom: 6,
  },
  cardPreview: {
    fontSize: 14,
    color: Colors.grayText,
    lineHeight: 20,
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 12,
    color: Colors.grayText,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});
