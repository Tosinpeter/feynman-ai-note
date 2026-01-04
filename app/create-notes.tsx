import Colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { ArrowLeft, FileText, Lightbulb, CreditCard, Sparkles } from "lucide-react-native";
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
import { LinearGradient } from "expo-linear-gradient";

type ContentType = "notes" | "quiz" | "flashcards" | null;

export default function CreateNotesScreen() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [selectedType, setSelectedType] = useState<ContentType>(null);

  const contentTypes = [
    {
      id: "notes" as ContentType,
      title: "Notes",
      description: "Create detailed study notes",
      icon: <FileText size={32} color={Colors.white} />,
      gradient: [Colors.gradientGreenStart, Colors.gradientLimeEnd] as const,
    },
    {
      id: "quiz" as ContentType,
      title: "Quiz",
      description: "Generate practice questions",
      icon: <Lightbulb size={32} color={Colors.white} />,
      gradient: [Colors.gradientCoralStart, Colors.gradientCoralEnd] as const,
    },
    {
      id: "flashcards" as ContentType,
      title: "Flashcards",
      description: "Create memorization cards",
      icon: <CreditCard size={32} color={Colors.white} />,
      gradient: [Colors.gradientPurpleStart, Colors.gradientBlue] as const,
    },
  ];

  const handleCreate = () => {
    if (topic.trim() && selectedType) {
      console.log("Creating:", selectedType, "for topic:", topic);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Notes</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>What do you want to create?</Text>
          <Text style={styles.subtitle}>
            Enter a topic and choose what you&apos;d like to generate
          </Text>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Topic or Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., World War II, Calculus, Biology..."
              placeholderTextColor={Colors.navInactive}
              value={topic}
              onChangeText={setTopic}
              multiline
              numberOfLines={2}
            />
          </View>

          <Text style={styles.sectionTitle}>Choose Type</Text>
          <View style={styles.cardsContainer}>
            {contentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.typeCard}
                activeOpacity={0.95}
                onPress={() => setSelectedType(type.id)}
              >
                <LinearGradient
                  colors={type.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.typeCardGradient,
                    selectedType === type.id && styles.typeCardSelected,
                  ]}
                >
                  <View style={styles.iconContainer}>{type.icon}</View>
                  <Text style={styles.typeTitle}>{type.title}</Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                  {selectedType === type.id && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              (!topic.trim() || !selectedType) && styles.buttonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!topic.trim() || !selectedType}
          >
            <Sparkles size={20} color={Colors.white} />
            <Text style={styles.createButtonText}>Generate with AI</Text>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.navInactive,
    marginBottom: 32,
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  typeCard: {
    borderRadius: 20,
    overflow: "hidden",
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
  typeCardGradient: {
    padding: 20,
    minHeight: 140,
    justifyContent: "center",
    position: "relative",
  },
  typeCardSelected: {
    borderWidth: 3,
    borderColor: Colors.white,
  },
  iconContainer: {
    marginBottom: 12,
  },
  typeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  selectedBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBadgeText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.gradientGreenStart,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.navDark,
    borderRadius: 25,
    paddingVertical: 16,
    gap: 8,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
});
