import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

export default function CaptureTextImageScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleGenerateNotes = () => {
    if (!selectedImage) {
      Alert.alert("No Image", "Please capture or select an image first.");
      return;
    }

    router.push({
      pathname: "/explanation",
      params: {
        topic: "Image Analysis",
        sourceImage: selectedImage,
        source: "capture",
        language: selectedLanguage,
      },
    });
  };

  return (
    <View style={styles.container}>
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
});
