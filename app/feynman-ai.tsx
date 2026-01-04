import Colors from "@/constants/colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ArrowLeft, Mic, Sparkles } from "lucide-react-native";
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

const suggestedTopics = [
  "Quantum Physics",
  "Black Holes",
  "Machine Learning",
  "Photosynthesis",
  "Blockchain",
  "DNA",
  "Climate Change",
  "Neural Networks",
];

export default function FeynmanAIScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [topic, setTopic] = useState((params.topic as string) || "");

  const handleExplain = () => {
    if (topic.trim()) {
      router.push({
        pathname: "/explanation",
        params: { topic: topic.trim() },
      });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          Colors.gradientPurpleStart,
          Colors.gradientBlue,
          Colors.gradientTealEnd,
        ] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Feynman AI</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.mascotContainer}>
              <Image
                source="https://r2-pub.rork.com/generated-images/21a2188b-28ec-4fab-9231-8adc2cd797f9.png"
                style={styles.mascotImage}
                contentFit="contain"
              />
            </View>

            <Text style={styles.title}>What do you want to learn about?</Text>
            <Text style={styles.subtitle}>
              I&apos;ll explain it like you&apos;re 5 using the Feynman Technique
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter any topic..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={topic}
                onChangeText={setTopic}
                multiline
                numberOfLines={3}
                onSubmitEditing={handleExplain}
              />
              <TouchableOpacity style={styles.micButton}>
                <Mic size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.explainButton, !topic.trim() && styles.buttonDisabled]}
              onPress={handleExplain}
              disabled={!topic.trim()}
            >
              <Sparkles size={20} color={Colors.text} />
              <Text style={styles.explainButtonText}>Explain it to me!</Text>
            </TouchableOpacity>

            <View style={styles.suggestedSection}>
              <Text style={styles.suggestedTitle}>Suggested Topics</Text>
              <View style={styles.chipsContainer}>
                {suggestedTopics.map((suggestedTopic, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.chip}
                    onPress={() => setTopic(suggestedTopic)}
                  >
                    <Text style={styles.chipText}>{suggestedTopic}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
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
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  mascotContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  mascotImage: {
    width: 140,
    height: 140,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    minHeight: 120,
  },
  input: {
    fontSize: 16,
    color: Colors.white,
    flex: 1,
    textAlignVertical: "top",
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  micButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  explainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingVertical: 16,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  explainButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  suggestedSection: {
    marginTop: 32,
  },
  suggestedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
});
