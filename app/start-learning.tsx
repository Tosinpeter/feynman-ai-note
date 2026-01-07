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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StartLearningScreen() {
  const router = useRouter();
  const [topic, setTopic] = useState("");

  const handleSubmitTopic = () => {
    if (!topic.trim()) {
      return;
    }

    router.push({
      pathname: "/explanation",
      params: { topic: topic.trim() },
    });
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
              <View style={styles.purpleRing}>
                <View style={styles.innerRing}>
                  <Text style={styles.raccoonEmoji}>🦝</Text>
                </View>
              </View>
              <View style={[styles.sparkle, styles.sparkle1]} />
              <View style={[styles.sparkle, styles.sparkle2]} />
              <View style={[styles.sparkle, styles.sparkle3]} />
              <View style={[styles.sparkle, styles.sparkle4]} />
            </View>

            <Text style={styles.title}>
              What topic do you{"\n"}want to explore{"\n"}today?
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.fromNotesContainer}
              onPress={handleGoToLibrary}
            >
              <Text style={styles.fromNotesText}>Or from your notes</Text>
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
                  placeholder="Enter any topic"
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
  purpleRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#C4B5FD",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.gradientPurpleStart,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: "0 0 40px rgba(139, 92, 246, 0.3)",
      },
    }),
  },
  innerRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#A78BFA",
    justifyContent: "center",
    alignItems: "center",
  },
  raccoonEmoji: {
    fontSize: 80,
  },
  sparkle: {
    position: "absolute" as const,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E9D5FF",
  },
  sparkle1: {
    top: 20,
    left: 60,
  },
  sparkle2: {
    top: 40,
    right: 50,
  },
  sparkle3: {
    bottom: 30,
    left: 40,
  },
  sparkle4: {
    bottom: 50,
    right: 60,
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
