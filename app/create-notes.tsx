import { useRouter } from "expo-router";
import { ArrowLeft, Sparkles, Type, Clipboard } from "lucide-react-native";
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
import * as ExpoClipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExplanations } from "@/contexts/explanations";
import { Fonts } from "@/constants/fonts";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";
import LanguagePicker from "@/components/LanguagePicker";
import { GenerateLanguage, getLanguagePrompt } from "@/constants/languageOptions";

export default function CreateNotesScreen() {
  const router = useRouter();
  const { addExplanation } = useExplanations();
  const [customText, setCustomText] = useState("");
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<GenerateLanguage>("auto");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const handlePasteText = async () => {
    try {
      const clipboardText = await ExpoClipboard.getStringAsync();
      if (clipboardText) {
        setCustomText(clipboardText);
      }
    } catch (error) {
      console.error("Failed to paste text:", error);
    }
  };

  const handleGenerateNotes = async () => {
    const trimmedText = customText.trim();

    if (!trimmedText) {
      Alert.alert("No Text", "Please enter some text to generate notes from.");
      return;
    }

    if (trimmedText.length < 20) {
      Alert.alert("Text Too Short", "Please enter at least 20 characters to generate meaningful notes.");
      return;
    }

    setShowGeneratingModal(true);
    setAnalysisStep("Analyzing your text...");

    try {
      console.log("Starting text analysis...");

      setAnalysisStep("Processing with AI...");

      const analysisSchema = z.object({
        category: z.enum(["nature", "architecture", "food", "science", "art", "technology", "history", "math", "language", "general"]).describe("The main category of the text content"),
        title: z.string().describe("A concise, descriptive title for the learning notes (max 50 chars)"),
        emoji: z.string().describe("A single emoji that represents the content"),
        summary: z.string().describe("A 2-3 sentence summary explaining the main topic and its educational value"),
        content: z.string().describe("Detailed educational content explaining the topic using the Feynman Technique. Include: The Big Picture, Breaking It Down Simply (explain like to a 5-year-old), Key Concepts (4-5 bullet points), Why This Matters, and a Study Tip. Use markdown formatting with **bold** for headers."),
        keyPoints: z.array(z.string()).describe("5 key learning points from the text, each as a complete sentence"),
      });

      const languageInstruction = getLanguagePrompt(selectedLanguage);

      const result = await generateObject({
        messages: [
          {
            role: "user",
            content: `Analyze the following text and create comprehensive educational notes using the Feynman Technique.

${languageInstruction}

TEXT TO ANALYZE:
"${trimmedText}"

Provide:
1. A category that best fits the content
2. A concise title for the notes
3. An appropriate emoji
4. A brief summary (2-3 sentences)
5. Detailed educational content with sections: The Big Picture, Breaking It Down Simply (explain like to a 5-year-old), Key Concepts (4-5 bullet points), Why This Matters, and a Study Tip
6. 5 key learning points

Make the content engaging, educational, and easy to understand.`,
          },
        ],
        schema: analysisSchema,
      });

      console.log("AI analysis complete:", result);

      setAnalysisStep("Creating notes...");

      const noteDate = new Date();
      const formattedDate = noteDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      await addExplanation(`${result.emoji} ${result.title} - ${formattedDate}`, result.content, {
        summary: result.summary,
        keyPoints: result.keyPoints,
        source: "custom-text",
      });

      setShowGeneratingModal(false);
      setAnalysisStep("");
      setCustomText("");

      router.push("/(tabs)/library");
    } catch (error) {
      console.error("Error generating notes:", error);
      setShowGeneratingModal(false);
      setAnalysisStep("");
      Alert.alert("Error", "Failed to generate notes. Please try again.");
    }
  };

  const characterCount = customText.length;
  const isValidLength = characterCount >= 20;

  return (
    <View style={styles.container}>
      <Modal visible={showGeneratingModal} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.modalTitle}>Generating Topic...</Text>
            <Text style={styles.modalSubtext}>{analysisStep || "Processing your text"}</Text>
            <View style={styles.modalSteps}>
              <Text style={[styles.modalStep, analysisStep.includes("Analyzing") && styles.activeStep]}>📝 Analyzing text...</Text>
              <Text style={[styles.modalStep, analysisStep.includes("Processing") && styles.activeStep]}>🧠 AI processing content...</Text>
              <Text style={[styles.modalStep, analysisStep.includes("Creating") && styles.activeStep]}>✨ Creating notes...</Text>
            </View>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generate from Text</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Enter your text section */}
            <View style={styles.sectionHeader}>
              <Type size={20} color="#1F2937" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Enter your text</Text>
            </View>

            <View style={styles.textInputWrapper}>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type or paste your text here..."
                  placeholderTextColor="#9CA3AF"
                  value={customText}
                  onChangeText={setCustomText}
                  multiline
                  textAlignVertical="top"
                  autoCapitalize="sentences"
                />
              </View>

              <TouchableOpacity style={styles.pasteButton} onPress={handlePasteText} activeOpacity={0.7}>
                <Clipboard size={16} color="#374151" />
                <Text style={styles.pasteButtonText}>Paste text</Text>
              </TouchableOpacity>
            </View>

            {/* Topic generate language section */}
            <LanguagePicker
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
              showModal={showLanguageDropdown}
              onOpenModal={() => setShowLanguageDropdown(true)}
              onCloseModal={() => setShowLanguageDropdown(false)}
            />
          </ScrollView>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={[styles.generateButton, !isValidLength && styles.buttonDisabled]} onPress={handleGenerateNotes} disabled={!isValidLength}>
              <Sparkles size={20} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>Generate Topic</Text>
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
    paddingBottom: 120,
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
  robotEmoji: {
    fontSize: 18,
  },
  textInputWrapper: {
    marginBottom: 32,
  },
  textInputContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    minHeight: 220,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.Regular,
    color: "#1F2937",
    padding: 16,
    minHeight: 220,
    lineHeight: 22,
  },
  pasteButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  pasteButtonText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: "#374151",
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
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 12,
    height: 56,
    gap: 10,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  generateButtonText: {
    fontSize: 17,
    fontFamily: Fonts.SemiBold,
    color: "#FFFFFF",
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
    color: "#10B981",
    fontFamily: Fonts.SemiBold,
  },
});
