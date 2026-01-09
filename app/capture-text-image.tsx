import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { ArrowLeft, Camera, Images, Text as TextIcon, ChevronDown, Crop } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useExplanations } from "@/contexts/explanations";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";

export default function CaptureTextImageScreen() {
  const router = useRouter();
  const { addExplanation } = useExplanations();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [selectedLanguage] = useState("Auto Detect");

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed to take photos. Please enable it in settings."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      processImage();
    }
  };

  const handleSelectFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photos permission is needed to select images. Please enable it in settings."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      processImage();
    }
  };

  const processImage = async () => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      console.error("Image processing error:", error);
      Alert.alert("Error", "Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });
        return base64;
      }
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  const handleGenerateNotes = async () => {
    if (!selectedImage) {
      Alert.alert("No Image", "Please capture or select an image first.");
      return;
    }

    setShowGeneratingModal(true);
    setAnalysisStep("Converting image...");

    try {
      console.log('Starting image analysis...');
      
      const base64Image = await convertImageToBase64(selectedImage);
      console.log('Image converted to base64');
      
      setAnalysisStep("Analyzing image with AI...");
      
      const analysisSchema = z.object({
        category: z.enum(['nature', 'architecture', 'food', 'science', 'art', 'technology', 'general']).describe('The main category of the image content'),
        title: z.string().describe('A concise, descriptive title for the learning notes (max 50 chars)'),
        emoji: z.string().describe('A single emoji that represents the content'),
        summary: z.string().describe('A 2-3 sentence summary explaining what the image shows and its educational value'),
        content: z.string().describe('Detailed educational content explaining the image using the Feynman Technique. Include: The Big Picture, Breaking It Down Simply (explain like to a 5-year-old), Key Observations (4-5 bullet points), Why This Matters, and a Study Tip. Use markdown formatting with **bold** for headers.'),
        keyPoints: z.array(z.string()).describe('5 key learning points from the image, each as a complete sentence'),
      });

      const imageData = `data:image/jpeg;base64,${base64Image}`;
      
      const result = await generateObject({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: imageData,
              },
              {
                type: 'text',
                text: `Analyze this image and create comprehensive educational notes using the Feynman Technique. 

Provide:
1. A category that best fits the image content
2. A concise title for the notes
3. An appropriate emoji
4. A brief summary (2-3 sentences)
5. Detailed educational content with sections: The Big Picture, Breaking It Down Simply (explain like to a 5-year-old), Key Observations (4-5 bullet points), Why This Matters, and a Study Tip
6. 5 key learning points

Make the content engaging, educational, and easy to understand.`,
              },
            ],
          },
        ],
        schema: analysisSchema,
      });

      console.log('AI analysis complete:', result);
      
      setAnalysisStep("Creating notes...");

      const noteDate = new Date();
      const formattedDate = noteDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });

      addExplanation(
        `${result.emoji} ${result.title} - ${formattedDate}`,
        result.content,
        {
          imageUri: selectedImage ?? undefined,
          summary: result.summary,
          keyPoints: result.keyPoints,
          source: 'capture',
          language: selectedLanguage,
        }
      );

      setShowGeneratingModal(false);
      setAnalysisStep("");

      router.push('/(tabs)/library');
    } catch (error) {
      console.error('Error generating notes:', error);
      setShowGeneratingModal(false);
      setAnalysisStep("");
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={showGeneratingModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.modalTitle}>Analyzing Image...</Text>
            <Text style={styles.modalSubtext}>{analysisStep || 'Generating AI-powered notes'}</Text>
            <View style={styles.modalSteps}>
              <Text style={[styles.modalStep, analysisStep.includes('Converting') && styles.activeStep]}>🔍 Processing image...</Text>
              <Text style={[styles.modalStep, analysisStep.includes('Analyzing') && styles.activeStep]}>🧠 AI analyzing content...</Text>
              <Text style={[styles.modalStep, analysisStep.includes('Creating') && styles.activeStep]}>📝 Creating notes...</Text>
            </View>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capture Text or Image</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.imagePreviewContainer,
              selectedImage && styles.imagePreviewWithImage,
            ]}
          >
            {!selectedImage ? (
              <View style={styles.emptyState}>
                <Images size={64} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>No image selected</Text>
                <Text style={styles.emptyStateSubtext}>
                  Take a photo or select from gallery
                </Text>
              </View>
            ) : (
              <>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} contentFit="contain" />
                <TouchableOpacity style={styles.clearButton} onPress={handleClearImage}>
                  <View style={styles.clearButtonCircle}>
                    <Text style={styles.clearButtonText}>✕</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.captureOptions}>
            <TouchableOpacity style={styles.optionButton} onPress={handleTakePhoto}>
              <View style={[styles.iconCircle, styles.iconCirclePurple]}>
                <Camera size={28} color="#8B5CF6" />
              </View>
              <Text style={styles.optionLabel}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handleSelectFromGallery}>
              <View style={[styles.iconCircle, styles.iconCircleBlue]}>
                <Images size={28} color="#3B82F6" />
              </View>
              <Text style={styles.optionLabel}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={styles.processingText}>Processing image...</Text>
            </View>
          )}

          {selectedImage && !isProcessing && (
            <View style={styles.readyContainer}>
              <View style={styles.readyHeader}>
                <TextIcon size={24} color="#10B981" />
                <Text style={styles.readyTitle}>Image Ready</Text>
              </View>
              <Text style={styles.readyText}>
                Your image has been captured. Tap &ldquo;Generate notes&rdquo; to analyze this image and create AI-powered learning notes using the Feynman Technique.
              </Text>
            </View>
          )}

          <View style={styles.languageSection}>
            <View style={styles.languageLabelRow}>
              <Text style={styles.robotEmoji}>🤖</Text>
              <Text style={styles.languageLabel}>Note Language</Text>
            </View>
            <View style={styles.languageDropdown}>
              <Text style={styles.dropdownEmoji}>🤖</Text>
              <Text style={styles.dropdownText}>{selectedLanguage}</Text>
              <ChevronDown size={20} color="#374151" />
            </View>
          </View>

          <View style={styles.bottomActionBar}>
            <TouchableOpacity style={styles.circleActionButton} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.generateButton,
                (!selectedImage || isProcessing) && styles.buttonDisabled,
              ]}
              onPress={handleGenerateNotes}
              disabled={!selectedImage || isProcessing}
            >
              <Text style={styles.generateButtonEmoji}>✨</Text>
              <Text style={styles.generateButtonText}>Generate notes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.circleActionButton}>
              <Crop size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  imagePreviewContainer: {
    minHeight: 250,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  imagePreviewWithImage: {
    borderStyle: "solid",
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  previewImage: {
    width: "100%",
    height: 250,
  },
  clearButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  clearButtonCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      },
    }),
  },
  clearButtonText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "600",
  },
  captureOptions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 20,
  },
  optionButton: {
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCirclePurple: {
    backgroundColor: "#EDE9FE",
  },
  iconCircleBlue: {
    backgroundColor: "#DBEAFE",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  processingContainer: {
    alignItems: "center",
    marginTop: 20,
    gap: 12,
  },
  processingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  readyContainer: {
    marginTop: 20,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 16,
    padding: 16,
  },
  readyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  readyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
  },
  readyText: {
    fontSize: 14,
    color: "#047857",
    lineHeight: 20,
  },
  languageSection: {
    marginTop: 20,
  },
  languageLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  robotEmoji: {
    fontSize: 20,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  languageDropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 8,
  },
  dropdownEmoji: {
    fontSize: 18,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  bottomActionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
  circleActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  generateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#374151",
    borderRadius: 24,
    height: 48,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  generateButtonEmoji: {
    fontSize: 20,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
      web: {
        boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
  },
  modalSubtext: {
    fontSize: 14,
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
    color: "#9CA3AF",
  },
  activeStep: {
    color: "#8B5CF6",
    fontWeight: "600" as const,
  },
  
});
