import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import {
  FileText,
  X,
  CheckCircle2,
  File,
  AlertCircle,
  Upload,
  Sparkles,
  ArrowLeft,
  Trash2,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { generateText } from "@rork-ai/toolkit-sdk";
import { useExplanations } from "@/contexts/explanations";
import "@/lib/pdfjs-polyfills";
import * as pdfjsLib from "pdfjs-dist";
import { useTranslation } from "react-i18next";
import LanguagePicker from "@/components/LanguagePicker";
import { GenerateLanguage } from "@/constants/languageOptions";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export default function UploadPDFScreen() {
  const router = useRouter();
  const { addExplanation } = useExplanations();
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<GenerateLanguage>("auto");
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Animation for upload area
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const animatePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const pickPDFFile = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log("Document picker result:", JSON.stringify(result, null, 2));

      if (result.canceled) {
        console.log("User cancelled file picker");
        setIsLoading(false);
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        setError("No file selected");
        setIsLoading(false);
        return;
      }

      const file = result.assets[0];

      if (!file || !file.uri) {
        setError("Failed to get file information");
        setIsLoading(false);
        return;
      }

      // Validate file extension
      const fileExtension = file.name?.split(".").pop()?.toLowerCase() || "";
      if (fileExtension !== "pdf") {
        setError("Please select a PDF file");
        setIsLoading(false);
        return;
      }

      setSelectedFile({
        uri: file.uri,
        name: file.name || "document.pdf",
        size: file.size || 0,
        mimeType: file.mimeType || "application/pdf",
      });

      console.log("PDF selected:", file.name, file.uri);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error picking file:", err);
      setError(err.message || "Failed to pick file. Please try again.");
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setProcessingProgress(0);
  };

  const extractTextFromPDF = async (uri: string): Promise<string> => {
    console.log("Attempting to extract text from PDF...");

    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "";

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      console.log("PDF loaded, size:", arrayBuffer.byteLength);

      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      console.log("PDF parsed, pages:", pdf.numPages);

      let fullText = "";
      const totalPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();

          const pageText = textContent.items
            .map((item: any) => {
              if ("str" in item) {
                return item.str;
              }
              return "";
            })
            .join(" ");

          fullText += pageText + "\n\n";
          
          // Update progress
          const progress = (pageNum / totalPages) * 50; // First 50% for extraction
          setProcessingProgress(progress);
          
          console.log(`Page ${pageNum}/${totalPages} extracted`);
        } catch (pageError) {
          console.error(`Error extracting page ${pageNum}:`, pageError);
        }
      }

      const cleanedText = fullText
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();

      console.log("Total extracted text length:", cleanedText.length);
      return cleanedText;
    } catch (e) {
      console.error("PDF text extraction error:", e);
      return "";
    }
  };

  const handleGenerateNotes = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(0);
    setProcessingStep("Reading PDF file...");

    try {
      console.log("Processing PDF:", selectedFile.name);

      setProcessingStep("Extracting text content...");
      const extractedText = await extractTextFromPDF(selectedFile.uri);

      setProcessingStep("Generating smart notes...");
      setProcessingProgress(60);

      let generatedContent = "";
      let topicName = selectedFile.name.replace(".pdf", "").replace(/_/g, " ").replace(/-/g, " ");

      if (extractedText.length > 100) {
        const truncatedText =
          extractedText.length > 15000
            ? extractedText.substring(0, 15000) + "...[content truncated]"
            : extractedText;

        const prompt = `You are an AI learning assistant. A user has uploaded a PDF document and here is the extracted text content:

"${truncatedText}"

Based on this PDF content, create comprehensive study notes.

Please provide:
1. Main Topic: Identify the main topic of this document (this will be the title)
2. Summary: Write a 2-3 sentence summary of the document
3. Key Concepts: Extract 5-8 key concepts or main points from the document
4. Detailed Explanation: Provide a clear, organized explanation of the content with proper sections
5. Important Terms: List any important terms or definitions found
6. Review Questions: Create 3-5 review questions to test understanding

Format your response as follows:
MAIN TOPIC:
[Identified main topic - keep it concise, max 5 words]

SUMMARY:
[Your 2-3 sentence summary]

KEY CONCEPTS:
- [Concept 1]
- [Concept 2]
- [Concept 3]
- [Concept 4]
- [Concept 5]

DETAILED EXPLANATION:
[Your organized explanation with proper structure and sections]

IMPORTANT TERMS:
- [Term 1]: [Definition]
- [Term 2]: [Definition]

REVIEW QUESTIONS:
1. [Question 1]
2. [Question 2]
3. [Question 3]`;

        setProcessingProgress(75);
        generatedContent = await generateText({
          messages: [{ role: "user", content: prompt }],
        });

        const topicMatch = generatedContent.match(/MAIN TOPIC:\s*([^\n]+)/);
        if (topicMatch && topicMatch[1].trim()) {
          topicName = topicMatch[1].trim();
        }
      } else {
        const prompt = `You are an AI learning assistant. A user has uploaded a PDF document titled "${selectedFile.name}".

The PDF text could not be fully extracted (it may be a scanned document or image-based PDF).

Based on the file name "${selectedFile.name}", create a template for study notes that the user can fill in.

Provide a structured template with:
1. A suggested topic name based on the filename
2. Empty sections for: Summary, Key Concepts, Notes, Important Terms, and Review Questions
3. Tips for how to manually add notes from the document`;

        generatedContent = await generateText({
          messages: [{ role: "user", content: prompt }],
        });

        const topicMatch = generatedContent.match(/MAIN TOPIC:\s*([^\n]+)/);
        if (topicMatch && topicMatch[1].trim()) {
          topicName = topicMatch[1].trim();
        }
      }

      setProcessingProgress(100);
      setProcessingStep("Saving notes...");

      console.log("Notes generated successfully");
      await addExplanation(topicName, generatedContent);

      setTimeout(() => {
        setIsProcessing(false);
        router.replace("/(tabs)/library");
      }, 500);
    } catch (err) {
      console.error("Error processing PDF:", err);
      setError("Failed to process PDF. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) {
      Alert.alert(
        "Cancel Processing?",
        "Are you sure you want to cancel? The current progress will be lost.",
        [
          { text: "Continue", style: "cancel" },
          { text: "Cancel", style: "destructive", onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generate from PDF</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Upload Area */}
          {!selectedFile ? (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={pickPDFFile}
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                activeOpacity={0.9}
                disabled={isLoading || isProcessing}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.text} />
                    <Text style={styles.loadingText}>Opening file picker...</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.pdfIconContainer}>
                      <FileText size={28} color={Colors.text} strokeWidth={1.5} />
                      <Text style={styles.pdfLabel}>PDF</Text>
                    </View>
                    <Text style={styles.uploadTitle}>Press to upload PDF</Text>
                    <Text style={styles.uploadSubtitle}>
                      (Supported formats: pdf max size 30MB)
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={styles.selectedFileCard}>
              <View style={styles.fileHeader}>
                <CheckCircle2 size={20} color="#22C55E" strokeWidth={2} />
                <Text style={styles.fileHeaderText}>File Selected</Text>
              </View>

              <View style={styles.fileInfo}>
                <View style={styles.fileIconWrapper}>
                  <File size={28} color={Colors.text} strokeWidth={1.5} />
                </View>
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatFileSize(selectedFile.size)} • PDF Document
                  </Text>
                </View>
                {!isProcessing && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={handleRemoveFile}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              {!isProcessing && (
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={pickPDFFile}
                  activeOpacity={0.7}
                >
                  <Text style={styles.changeButtonText}>Choose a different file</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Topic Generate Language Section */}
          <LanguagePicker
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            showModal={languageModalVisible}
            onOpenModal={() => setLanguageModalVisible(true)}
            onCloseModal={() => setLanguageModalVisible(false)}
          />

          {/* Processing State */}
          {isProcessing && (
            <View style={styles.processingCard}>
              <View style={styles.processingHeader}>
                <ActivityIndicator size="small" color={Colors.text} />
                <Text style={styles.processingTitle}>{processingStep}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${processingProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(processingProgress)}% complete
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.errorCard}>
              <AlertCircle size={20} color="#EF4444" strokeWidth={2} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              (!selectedFile || isLoading || isProcessing) && styles.generateButtonDisabled,
            ]}
            onPress={handleGenerateNotes}
            activeOpacity={0.8}
            disabled={!selectedFile || isLoading || isProcessing}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Processing...</Text>
              </>
            ) : (
              <>
                <Sparkles size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.generateButtonText}>Generate Topic</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  uploadArea: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 32,
    borderBottomWidth: 3,
    borderBottomColor: "#1F2937",
  },
  loadingContainer: {
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: Colors.grayText,
  },
  pdfIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  pdfLabel: {
    fontSize: 10,
    fontFamily: Fonts.Medium,
    color: Colors.text,
    marginTop: 2,
  },
  uploadTitle: {
    fontSize: 18,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: Colors.grayText,
  },
  selectedFileCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderBottomWidth: 3,
    borderBottomColor: "#1F2937",
  },
  fileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  fileHeaderText: {
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
    color: "#22C55E",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
  },
  fileIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 13,
    fontFamily: Fonts.Regular,
    color: Colors.grayText,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  changeButton: {
    alignItems: "center",
    paddingTop: 16,
  },
  changeButtonText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: Colors.text,
  },
  // Language Section
  languageSection: {
    marginBottom: 24,
  },
  languageLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  languageLabelIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  languageLabel: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: "#1F2937",
  },
  languageEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.Regular,
    color: Colors.text,
  },
  languageChevron: {
    marginLeft: 8,
  },
  // Processing Card
  processingCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  processingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  processingTitle: {
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#1F2937",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontFamily: Fonts.Medium,
    color: Colors.text,
    textAlign: "center",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: "#EF4444",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F2937",
    paddingVertical: 18,
    borderRadius: 12,
    gap: 10,
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
    }),
  },
  generateButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: Colors.white,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    color: Colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  languageOptionActive: {
    backgroundColor: "#1F2937",
  },
  languageOptionEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  languageOptionName: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: Colors.text,
  },
  languageOptionNameActive: {
    color: Colors.white,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
    color: "#1F2937",
  },
  closeModalButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  closeModalButtonText: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
    textAlign: "center",
  },
});
