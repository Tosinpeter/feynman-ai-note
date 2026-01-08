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
    
    // Animals
    if (lowerTopic.includes('shark')) return '🦈';
    if (lowerTopic.includes('whale')) return '🐋';
    if (lowerTopic.includes('dolphin')) return '🐬';
    if (lowerTopic.includes('fish') || lowerTopic.includes('ocean') || lowerTopic.includes('sea') || lowerTopic.includes('marine')) return '🐟';
    if (lowerTopic.includes('dog')) return '🐕';
    if (lowerTopic.includes('cat')) return '🐱';
    if (lowerTopic.includes('bird')) return '🐦';
    if (lowerTopic.includes('elephant')) return '🐘';
    if (lowerTopic.includes('lion') || lowerTopic.includes('tiger')) return '🦁';
    if (lowerTopic.includes('bear')) return '🐻';
    if (lowerTopic.includes('animal') || lowerTopic.includes('wildlife') || lowerTopic.includes('zoo')) return '🦁';
    if (lowerTopic.includes('dinosaur')) return '🦖';
    if (lowerTopic.includes('insect') || lowerTopic.includes('bug') || lowerTopic.includes('bee')) return '🐝';
    if (lowerTopic.includes('snake') || lowerTopic.includes('reptile')) return '🐍';
    
    // Science & Nature
    if (lowerTopic.includes('space') || lowerTopic.includes('planet') || lowerTopic.includes('star') || lowerTopic.includes('galaxy') || lowerTopic.includes('universe')) return '🌌';
    if (lowerTopic.includes('chemistry') || lowerTopic.includes('chemical')) return '🧪';
    if (lowerTopic.includes('biology') || lowerTopic.includes('cell') || lowerTopic.includes('dna')) return '🧬';
    if (lowerTopic.includes('physics') || lowerTopic.includes('quantum')) return '⚛️';
    if (lowerTopic.includes('science') || lowerTopic.includes('experiment')) return '🔬';
    if (lowerTopic.includes('math') || lowerTopic.includes('number') || lowerTopic.includes('algebra') || lowerTopic.includes('calculus')) return '🔢';
    if (lowerTopic.includes('earth') || lowerTopic.includes('geology') || lowerTopic.includes('volcano')) return '🌍';
    if (lowerTopic.includes('weather') || lowerTopic.includes('climate')) return '🌦️';
    if (lowerTopic.includes('plant') || lowerTopic.includes('tree') || lowerTopic.includes('flower') || lowerTopic.includes('garden')) return '🌱';
    
    // Technology
    if (lowerTopic.includes('computer') || lowerTopic.includes('code') || lowerTopic.includes('programming') || lowerTopic.includes('software')) return '💻';
    if (lowerTopic.includes('robot') || lowerTopic.includes('ai') || lowerTopic.includes('artificial intelligence')) return '🤖';
    if (lowerTopic.includes('phone') || lowerTopic.includes('mobile') || lowerTopic.includes('app')) return '📱';
    if (lowerTopic.includes('internet') || lowerTopic.includes('web') || lowerTopic.includes('network')) return '🌐';
    
    // Arts & Entertainment
    if (lowerTopic.includes('art') || lowerTopic.includes('paint') || lowerTopic.includes('draw')) return '🎨';
    if (lowerTopic.includes('music') || lowerTopic.includes('song') || lowerTopic.includes('instrument')) return '🎵';
    if (lowerTopic.includes('movie') || lowerTopic.includes('film') || lowerTopic.includes('cinema')) return '🎬';
    if (lowerTopic.includes('game') || lowerTopic.includes('gaming')) return '🎮';
    if (lowerTopic.includes('book') || lowerTopic.includes('read') || lowerTopic.includes('literature')) return '📚';
    if (lowerTopic.includes('photo') || lowerTopic.includes('camera')) return '📷';
    
    // Social Sciences
    if (lowerTopic.includes('history') || lowerTopic.includes('ancient') || lowerTopic.includes('civilization')) return '📜';
    if (lowerTopic.includes('geography') || lowerTopic.includes('country') || lowerTopic.includes('map')) return '🗺️';
    if (lowerTopic.includes('politic') || lowerTopic.includes('government') || lowerTopic.includes('democracy')) return '🏛️';
    if (lowerTopic.includes('econom') || lowerTopic.includes('finance') || lowerTopic.includes('money') || lowerTopic.includes('business')) return '💰';
    if (lowerTopic.includes('psychology') || lowerTopic.includes('mind') || lowerTopic.includes('brain')) return '🧠';
    if (lowerTopic.includes('language') || lowerTopic.includes('word') || lowerTopic.includes('speak')) return '💬';
    
    // Health & Sports
    if (lowerTopic.includes('health') || lowerTopic.includes('medicine') || lowerTopic.includes('doctor') || lowerTopic.includes('medical')) return '⚕️';
    if (lowerTopic.includes('food') || lowerTopic.includes('cook') || lowerTopic.includes('recipe') || lowerTopic.includes('nutrition')) return '🍳';
    if (lowerTopic.includes('sport') || lowerTopic.includes('exercise') || lowerTopic.includes('fitness')) return '⚽';
    if (lowerTopic.includes('yoga') || lowerTopic.includes('meditation')) return '🧘';
    
    // Miscellaneous
    if (lowerTopic.includes('travel') || lowerTopic.includes('trip') || lowerTopic.includes('vacation')) return '✈️';
    if (lowerTopic.includes('car') || lowerTopic.includes('vehicle') || lowerTopic.includes('transport')) return '🚗';
    if (lowerTopic.includes('build') || lowerTopic.includes('architecture') || lowerTopic.includes('house')) return '🏠';
    if (lowerTopic.includes('fashion') || lowerTopic.includes('cloth') || lowerTopic.includes('style')) return '👗';
    if (lowerTopic.includes('learn') || lowerTopic.includes('study') || lowerTopic.includes('education') || lowerTopic.includes('school')) return '📖';
    if (lowerTopic.includes('youtube') || lowerTopic.includes('video')) return '▶️';
    
    return '📝';
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
