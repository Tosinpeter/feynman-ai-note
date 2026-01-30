import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import {
  ArrowLeft,
  FolderOpen,
  X,
  CheckCircle2,
  Music,
  AlertCircle,
  Sparkles,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { Fonts } from "@/constants/fonts";
import LanguagePicker from "@/components/LanguagePicker";
import { GenerateLanguage, getLanguageByCode } from "@/constants/languageOptions";

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export default function UploadAudioScreen() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<GenerateLanguage>("auto");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const supportedFormats = ["mp3", "wav", "m4a", "mp4", "mpeg", "mpga", "webm", "ogg", "flac"];

  const pickAudioFile = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        copyToCacheDirectory: true,
      });

      console.log("Document picker result:", result);

      if (result.canceled) {
        console.log("User cancelled file picker");
        setIsLoading(false);
        return;
      }

      const file = result.assets[0];

      if (!file) {
        setError("No file selected");
        setIsLoading(false);
        return;
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

      if (!supportedFormats.includes(fileExtension)) {
        setError(`Unsupported format. Please use: ${supportedFormats.join(", ")}`);
        setIsLoading(false);
        return;
      }

      setSelectedFile({
        uri: file.uri,
        name: file.name,
        size: file.size || 0,
        mimeType: file.mimeType || `audio/${fileExtension}`,
      });

      console.log("File selected:", file.name, file.uri);
      setIsLoading(false);
    } catch (err) {
      console.error("Error picking file:", err);
      setError("Failed to pick file. Please try again.");
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
  };

  const getLanguageName = () => {
    return getLanguageByCode(selectedLanguage).name;
  };

  const handleGenerateNotes = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("Processing file:", selectedFile.name, "URI:", selectedFile.uri);

      if (Platform.OS === "web") {
        try {
          console.log("Fetching blob from URI...");
          const response = await fetch(selectedFile.uri);

          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status}`);
          }

          const blob = await response.blob();
          console.log("Blob fetched, size:", blob.size, "type:", blob.type);

          if (blob.size === 0) {
            throw new Error("File is empty");
          }

          // Convert blob to base64
          const audioBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              if (result) {
                resolve(result);
              } else {
                reject(new Error("Failed to read file"));
              }
            };
            reader.onerror = () => reject(new Error("FileReader error"));
            reader.readAsDataURL(blob);
          });

          console.log("Audio converted to base64, length:", audioBase64.length);

          // Store in sessionStorage for web to avoid URL size limits
          if (audioBase64.length > 0) {
            try {
              sessionStorage.setItem("uploadedAudioBase64", audioBase64);
              sessionStorage.setItem("uploadedAudioMimeType", selectedFile.mimeType);
              console.log("Audio stored in sessionStorage");
            } catch (storageError) {
              console.warn("SessionStorage failed, will pass via URL:", storageError);
            }
          }
        } catch (e) {
          console.error("Failed to process audio file:", e);
          setError("Failed to read audio file. Please try a different file.");
          setIsLoading(false);
          return;
        }
      }

      router.replace({
        pathname: "/note-generating",
        params: {
          audioUri: selectedFile.uri,
          fileName: selectedFile.name,
          language: getLanguageName(),
          duration: "00:00:00",
          webTranscript: "",
          sourceType: "upload",
          mimeType: selectedFile.mimeType,
          useSessionStorage: Platform.OS === "web" ? "true" : "false",
        },
      });
    } catch (err) {
      console.error("Error preparing file:", err);
      setError("Failed to process file. Please try again.");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleClose} activeOpacity={0.7}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Generate from audio</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Upload Area */}
            {!selectedFile ? (
              <TouchableOpacity style={styles.uploadArea} onPress={pickAudioFile} activeOpacity={0.7} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="large" color="#374151" />
                ) : (
                  <>
                    <FolderOpen size={40} color="#374151" strokeWidth={1.5} />
                    <Text style={styles.uploadTitle}>Press to upload audio</Text>
                    <Text style={styles.uploadSubtitle}>(Supported formats: mp3, wav, m4a, ogg, flac)</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.selectedFileContainer}>
                <View style={styles.selectedFileHeader}>
                  <CheckCircle2 size={20} color="#10B981" strokeWidth={2} />
                  <Text style={styles.selectedFileLabel}>File selected</Text>
                </View>

                <View style={styles.fileCard}>
                  <View style={styles.fileIconContainer}>
                    <Music size={24} color="#374151" strokeWidth={2} />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={handleRemoveFile} activeOpacity={0.7}>
                    <X size={20} color="#6B7280" strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.changeFileButton} onPress={pickAudioFile} activeOpacity={0.7}>
                  <Text style={styles.changeFileText}>Choose different file</Text>
                </TouchableOpacity>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={18} color="#EF4444" strokeWidth={2} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

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
            <TouchableOpacity style={[styles.generateButton, (!selectedFile || isLoading) && styles.buttonDisabled]} onPress={handleGenerateNotes} activeOpacity={0.8} disabled={!selectedFile || isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Sparkles size={20} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>Generate Topic</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </>
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
  uploadArea: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderBottomWidth: 3,
    borderBottomColor: "#374151",
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 32,
  },
  uploadTitle: {
    fontSize: 18,
    fontFamily: Fonts.SemiBold,
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: "#6B7280",
  },
  selectedFileContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderBottomWidth: 3,
    borderBottomColor: "#374151",
    padding: 16,
    marginBottom: 32,
  },
  selectedFileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  selectedFileLabel: {
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
    color: "#10B981",
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: "#1F2937",
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: "#6B7280",
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  changeFileButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  changeFileText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: "#374151",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: "#EF4444",
  },
  languageSection: {
    marginBottom: 20,
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
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderBottomWidth: 3,
    borderBottomColor: "#374151",
  },
  languageSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  languageEmoji: {
    fontSize: 20,
  },
  languageName: {
    fontSize: 15,
    fontFamily: Fonts.Medium,
    color: "#1F2937",
  },
  chevronContainer: {
    alignItems: "center",
  },
  chevronDown: {
    marginTop: -4,
  },
  languageDropdown: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  languageOptionSelected: {
    backgroundColor: "#F9FAFB",
  },
  languageOptionEmoji: {
    fontSize: 20,
  },
  languageOptionText: {
    fontSize: 15,
    fontFamily: Fonts.Regular,
    color: "#374151",
  },
  languageOptionTextSelected: {
    fontFamily: Fonts.Medium,
    color: "#1F2937",
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
});
