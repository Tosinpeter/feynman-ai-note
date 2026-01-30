import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Sparkles, Type, RefreshCw } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExplanations } from "@/contexts/explanations";
import { Fonts } from "@/constants/fonts";
import { generateText } from "@rork-ai/toolkit-sdk";
import Colors from "@/constants/colors";

// Helper function to clean topic title (remove emojis and dates)
const cleanTopicTitle = (title: string): string => {
  return title
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu, "")
    .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/gi, "")
    .replace(/\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g, "")
    .replace(/\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g, "")
    .replace(/\b\d{1,2}:\d{2}\s*(AM|PM|am|pm)?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

export default function EditNoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    noteId: string;
    topic: string;
    content: string;
  }>();

  const { addExplanation, deleteExplanation } = useExplanations();
  const [noteTitle, setNoteTitle] = useState(cleanTopicTitle(params.topic || ""));
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");

  const originalTitle = cleanTopicTitle(params.topic || "");
  const hasChanges = noteTitle.trim() !== originalTitle;
  const isValidTitle = noteTitle.trim().length >= 3;

  const handleSaveAndRegenerate = async () => {
    const trimmedTitle = noteTitle.trim();

    if (!trimmedTitle) {
      Alert.alert("No Title", "Please enter a title for your note.");
      return;
    }

    if (trimmedTitle.length < 3) {
      Alert.alert("Title Too Short", "Please enter at least 3 characters for the title.");
      return;
    }

    // If title hasn't changed, just go back
    if (trimmedTitle === originalTitle) {
      router.back();
      return;
    }

    setShowGeneratingModal(true);
    setAnalysisStep("Generating new summary...");

    try {
      // Generate new content based on the new title
      const prompt = `Explain "${trimmedTitle}" in the simplest way possible, as if explaining to a 5-year-old child. Use simple words, short sentences, and friendly examples. Keep it conversational and easy to understand. Maximum 200 words.`;

      setAnalysisStep("AI is processing...");

      const newContent = await generateText({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      setAnalysisStep("Saving your note...");

      // Delete the old note
      if (params.noteId) {
        deleteExplanation(params.noteId);
      }

      // Create new note with updated title and content
      await addExplanation(trimmedTitle, newContent);

      setShowGeneratingModal(false);
      setAnalysisStep("");

      // Navigate back to library
      router.replace("/(tabs)/library");
    } catch (error) {
      console.error("Error regenerating note:", error);
      setShowGeneratingModal(false);
      setAnalysisStep("");
      Alert.alert("Error", "Failed to regenerate the note. Please try again.");
    }
  };

  const handleSaveTitleOnly = async () => {
    const trimmedTitle = noteTitle.trim();

    if (!trimmedTitle) {
      Alert.alert("No Title", "Please enter a title for your note.");
      return;
    }

    // If title hasn't changed, just go back
    if (trimmedTitle === originalTitle) {
      router.back();
      return;
    }

    setShowGeneratingModal(true);
    setAnalysisStep("Saving your note...");

    try {
      // Delete the old note
      if (params.noteId) {
        deleteExplanation(params.noteId);
      }

      // Create new note with updated title but keep old content
      await addExplanation(trimmedTitle, params.content || "");

      setShowGeneratingModal(false);
      setAnalysisStep("");

      // Navigate back to library
      router.replace("/(tabs)/library");
    } catch (error) {
      console.error("Error saving note:", error);
      setShowGeneratingModal(false);
      setAnalysisStep("");
      Alert.alert("Error", "Failed to save the note. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Generating Modal */}
      <Modal visible={showGeneratingModal} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.modalTitle}>Updating Note...</Text>
            <Text style={styles.modalSubtext}>{analysisStep || "Processing"}</Text>
            <View style={styles.modalSteps}>
              <Text style={[styles.modalStep, analysisStep.includes("Generating") && styles.activeStep]}>
                ✏️ Generating new summary...
              </Text>
              <Text style={[styles.modalStep, analysisStep.includes("AI") && styles.activeStep]}>
                🧠 AI processing content...
              </Text>
              <Text style={[styles.modalStep, analysisStep.includes("Saving") && styles.activeStep]}>
                💾 Saving your note...
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Note</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Note Title Section */}
            <View style={styles.sectionHeader}>
              <Type size={20} color="#1F2937" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Note Title</Text>
            </View>

            <View style={styles.textInputWrapper}>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter note title..."
                  placeholderTextColor="#9CA3AF"
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                  autoCapitalize="sentences"
                  autoFocus
                />
              </View>
              <Text style={styles.characterCount}>
                {noteTitle.length} characters
              </Text>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <RefreshCw size={20} color="#8B5CF6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>Regenerate Summary</Text>
                  <Text style={styles.infoDescription}>
                    Changing the title and tapping "Save & Regenerate" will create a new AI-generated summary based on the new topic.
                  </Text>
                </View>
              </View>
            </View>

            {/* Current Content Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Current Summary Preview</Text>
              <View style={styles.previewCard}>
                <Text style={styles.previewText} numberOfLines={5}>
                  {params.content || "No content available"}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Buttons */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.saveButton, styles.saveTitleButton, !isValidTitle && styles.buttonDisabled]}
              onPress={handleSaveTitleOnly}
              disabled={!isValidTitle}
            >
              <Text style={styles.saveTitleButtonText}>Save Title Only</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, styles.regenerateButton, (!isValidTitle || !hasChanges) && styles.buttonDisabled]}
              onPress={handleSaveAndRegenerate}
              disabled={!isValidTitle || !hasChanges}
            >
              <Sparkles size={20} color="#FFFFFF" />
              <Text style={styles.regenerateButtonText}>Save & Regenerate</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.SemiBold,
    color: "#1F2937",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 140,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: "#1F2937",
  },
  textInputWrapper: {
    marginBottom: 24,
  },
  textInputContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textInput: {
    fontSize: 16,
    fontFamily: Fonts.Regular,
    color: "#1F2937",
    padding: 16,
    minHeight: 56,
  },
  characterCount: {
    fontSize: 13,
    fontFamily: Fonts.Regular,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "right",
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#F3E8FF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
    color: "#1F2937",
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: "#6B7280",
    lineHeight: 20,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: "#6B7280",
    marginBottom: 8,
  },
  previewCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewText: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: "#374151",
    lineHeight: 22,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    height: 56,
    gap: 8,
  },
  saveTitleButton: {
    backgroundColor: "#F3F4F6",
  },
  saveTitleButtonText: {
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
    color: "#374151",
  },
  regenerateButton: {
    backgroundColor: "#8B5CF6",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(139,92,246,0.4)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  regenerateButtonText: {
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
    color: "#FFFFFF",
  },
  buttonDisabled: {
    backgroundColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 32,
    minWidth: 280,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    color: "#1F2937",
    marginTop: 16,
  },
  modalSubtext: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: "#6B7280",
    marginTop: 4,
  },
  modalSteps: {
    marginTop: 20,
    gap: 8,
    alignItems: "flex-start",
  },
  modalStep: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: "#9CA3AF",
  },
  activeStep: {
    color: "#8B5CF6",
    fontFamily: Fonts.SemiBold,
  },
});
