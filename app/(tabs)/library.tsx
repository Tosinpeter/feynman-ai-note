import Colors from "@/constants/colors";
import { useExplanations } from "@/contexts/explanations";
import { BookOpen, ChevronDown, ChevronRight, Folder, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "all" | "notes" | "quizzes" | "flashcards" | "favorites";

export default function LibraryScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { getRecentExplanations } = useExplanations();

  const items = getRecentExplanations();

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All Notes" },
    { id: "notes", label: "Notes" },
    { id: "quizzes", label: "Quizzes" },
    { id: "flashcards", label: "Flashcards" },
    { id: "favorites", label: "Favorites" },
  ];

  const router = useRouter();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day} ${year}, ${hours}:${minutes}`;
  };

  const getEmojiForTopic = (topic: string) => {
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes('math') || lowerTopic.includes('number')) return '🔢';
    if (lowerTopic.includes('science') || lowerTopic.includes('physics')) return '🔬';
    if (lowerTopic.includes('history')) return '📜';
    if (lowerTopic.includes('art')) return '🎨';
    if (lowerTopic.includes('music')) return '🎵';
    if (lowerTopic.includes('computer') || lowerTopic.includes('code')) return '💻';
    return '🤔';
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>My Library</Text>
          <TouchableOpacity
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
            style={styles.filterButton}
            activeOpacity={0.7}
          >
            <Folder size={20} color="#8B5CF6" />
            <Text style={styles.filterText}>
              {filters.find(f => f.id === activeFilter)?.label || "All Notes"}
            </Text>
            <ChevronDown size={16} color={Colors.navInactive} />
          </TouchableOpacity>
        </View>

        {showFilterDropdown && (
          <View style={styles.filterDropdown}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={styles.filterOption}
                onPress={() => {
                  setActiveFilter(filter.id);
                  setShowFilterDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Folder size={18} color={Colors.navInactive} />
                <Text style={styles.filterOptionText}>{filter.label}</Text>
                {activeFilter === filter.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.navInactive} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your notes..."
            placeholderTextColor={Colors.navInactive}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <BookOpen size={64} color={Colors.navInactive} />
              <Text style={styles.emptyTitle}>No notes yet</Text>
              <Text style={styles.emptyDescription}>
                Create your first note to see it here
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push("/start-learning")}
                activeOpacity={0.8}
              >
                <Text style={styles.createButtonText}>Start Learning</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.notesListContainer}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.noteCard}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/explanation?explanationId=${item.id}`)}
                >
                  <View style={styles.emojiThumbnail}>
                    <Text style={styles.emojiText}>{getEmojiForTopic(item.topic)}</Text>
                  </View>
                  <View style={styles.noteInfo}>
                    <Text style={styles.noteTitle} numberOfLines={1}>
                      {item.topic}
                    </Text>
                    <Text style={styles.noteDate}>
                      {formatDate(item.timestamp)}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={Colors.navInactive} />
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
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  filterText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  filterDropdown: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      },
    }),
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterOptionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  checkmark: {
    fontSize: 18,
    color: "#8B5CF6",
    fontWeight: "700" as const,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 25,
    marginHorizontal: 16,
    marginBottom: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.navInactive,
    textAlign: "center" as const,
    marginTop: 8,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.gradientGreenStart,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  notesListContainer: {
    gap: 12,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    minHeight: 72,
  },
  emojiThumbnail: {
    width: 48,
    height: 48,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emojiText: {
    fontSize: 24,
  },
  noteInfo: {
    flex: 1,
    marginRight: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 13,
    color: Colors.navInactive,
  },
});
