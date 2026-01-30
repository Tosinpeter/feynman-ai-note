import Colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { Sparkles, ArrowRight, FileText } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";

const RACCOON_MASCOT = "https://r2-pub.rork.com/generated-images/97b402cd-3c09-435e-803e-c6c62955985a.png";

export default function StartLearningScreen() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const { t } = useTranslation();

  const handleSubmitTopic = () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      Alert.alert(t('startLearning.enterTopic'), t('startLearning.enterTopicMessage'));
      return;
    }

    router.push({
      pathname: "/topic-picker",
      params: { topic: trimmedTopic },
    });
    setTopic("");
  };

  const handleGoToLibrary = () => {
    router.push("/(tabs)/library");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowRight
            size={24}
            color={Colors.darkBrown}
            style={{ transform: [{ rotate: "180deg" }] }}
          />
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={styles.topSection}>
            <View style={styles.mascotContainer}>
              <View style={styles.purpleBlobOuter}>
                <View style={styles.purpleBlobInner}>
                  <Image
                    source={RACCOON_MASCOT}
                    style={styles.mascotImage}
                    contentFit="contain"
                  />
                </View>
              </View>
            </View>

            <Text style={styles.title}>
              {t('startLearning.title')}
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.fromNotesContainer}
              onPress={handleGoToLibrary}
            >
              <Text style={styles.fromNotesText}>{t('startLearning.orFromNotes')}</Text>
              <ArrowRight size={18} color={Colors.orange} />
              <View style={styles.notesIconContainer}>
                <FileText size={22} color={Colors.gradientPurpleStart} />
              </View>
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Sparkles size={22} color={Colors.gradientPurpleStart} />
                <TextInput
                  style={styles.textInput}
                  placeholder={t('startLearning.placeholder')}
                  placeholderTextColor={Colors.grayText}
                  value={topic}
                  onChangeText={setTopic}
                  onSubmitEditing={handleSubmitTopic}
                  returnKeyType="go"
                  autoCapitalize="sentences"
                />
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    topic.trim() && styles.submitButtonActive,
                  ]}
                  onPress={handleSubmitTopic}
                  disabled={!topic.trim()}
                >
                  <ArrowRight
                    size={20}
                    color={topic.trim() ? Colors.white : Colors.grayText}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  backButton: {
    position: "absolute" as const,
    top: Platform.OS === "ios" ? 60 : 20,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mascotContainer: {
    alignItems: "center",
    marginBottom: 32,
    position: "relative" as const,
  },
  purpleBlobOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#E0D4FC",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scaleX: 1.05 }, { rotate: "-5deg" }],
  },
  purpleBlobInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#C4B5FD",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "5deg" }],
    overflow: "hidden",
  },
  mascotImage: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.darkText,
    textAlign: "center",
    lineHeight: 38,
  },
  bottomSection: {
    paddingBottom: Platform.OS === "ios" ? 20 : 32,
  },
  fromNotesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  fromNotesText: {
    fontSize: 16,
    color: Colors.grayText,
  },
  notesIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.navInactive,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.darkText,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonActive: {
    backgroundColor: Colors.gradientPurpleStart,
  },
  });
