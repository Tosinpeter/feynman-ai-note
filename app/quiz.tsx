import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useExplanations } from "@/contexts/explanations";
import { generateText } from "@rork-ai/toolkit-sdk";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, RotateCcw, Shuffle, Sparkles } from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
}

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    explanationId?: string;
    topic?: string;
  }>();
  const { explanations } = useExplanations();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  const currentExplanation = params.explanationId
    ? explanations.find((e) => e.id === params.explanationId)
    : null;

  const rawTopic = currentExplanation?.topic || params.topic || "Topic";
  const topic = cleanTopicTitle(rawTopic);
  const content = currentExplanation?.content || "";

  const generateQuizMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Generate a quiz for studying the topic "${topic}".

${content ? `Context/Content about this topic:\n${content}\n\n` : ""}

Create exactly 10 multiple choice questions that test understanding of key concepts. Each question should have:
- A clear question
- 4 answer options (labeled A, B, C, D)
- One correct answer

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just the JSON):
[
  {
    "id": 1,
    "question": "What is the main concept of...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  },
  {
    "id": 2,
    "question": "Another question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 2
  }
]

Important:
- correctAnswer is the index (0-3) of the correct option
- Make questions progressively cover different aspects of the topic
- Questions should test understanding, not just memorization
- Keep questions concise but clear`;

      const response = await generateText({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      try {
        let cleanedResponse = response
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        const data = JSON.parse(cleanedResponse) as QuizQuestion[];
        return data;
      } catch (error) {
        console.error("Failed to parse quiz JSON:", error);
        return [
          {
            id: 1,
            question: `What is the main purpose of ${topic}?`,
            options: [
              "To provide basic understanding",
              "To test advanced knowledge",
              "To memorize facts",
              "To review concepts",
            ],
            correctAnswer: 0,
          },
          {
            id: 2,
            question: "Why is this topic important?",
            options: [
              "It helps with understanding",
              "It's not important",
              "Only for experts",
              "For entertainment",
            ],
            correctAnswer: 0,
          },
          {
            id: 3,
            question: "What are the key components?",
            options: [
              "Multiple elements",
              "Single element",
              "No elements",
              "Unknown",
            ],
            correctAnswer: 0,
          },
        ];
      }
    },
    onSuccess: (data) => {
      setQuestions(data);
      setOriginalQuestions(data);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setCorrectCount(0);
      setAnsweredQuestions(new Set());
    },
  });

  useEffect(() => {
    if (questions.length === 0 && !generateQuizMutation.isPending) {
      generateQuizMutation.mutate();
    }
  }, []);

  const handleSelectAnswer = (index: number) => {
    if (showResult || answeredQuestions.has(currentIndex)) return;
    setSelectedAnswer(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    setAnsweredQuestions(prev => new Set(prev).add(currentIndex));

    if (selectedAnswer === questions[currentIndex].correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }

    // Auto advance after 1.5 seconds
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1500);
  };

  const handleReset = () => {
    setQuestions([...originalQuestions]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setAnsweredQuestions(new Set());
  };

  const handleShuffle = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setAnsweredQuestions(new Set());
  };

  const handleRegenerate = () => {
    setQuestions([]);
    setOriginalQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setAnsweredQuestions(new Set());
    generateQuizMutation.mutate();
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index ? styles.optionSelected : styles.option;
    }

    const isCorrect = index === questions[currentIndex].correctAnswer;
    const isSelected = index === selectedAnswer;

    if (isCorrect) {
      return [styles.option, styles.optionCorrect];
    }
    if (isSelected && !isCorrect) {
      return [styles.option, styles.optionIncorrect];
    }
    return styles.option;
  };

  const getOptionTextStyle = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index ? styles.optionTextSelected : styles.optionText;
    }

    const isCorrect = index === questions[currentIndex].correctAnswer;
    const isSelected = index === selectedAnswer;

    if (isCorrect || isSelected) {
      return styles.optionTextSelected;
    }
    return styles.optionText;
  };

  const renderQuizComplete = () => (
    <View style={styles.completedContainer}>
      <Text style={styles.completedEmoji}>🎉</Text>
      <Text style={styles.completedTitle}>Quiz Complete!</Text>
      <Text style={styles.completedText}>
        You scored {correctCount} out of {questions.length}
      </Text>
      <View style={styles.scoreContainer}>
        <Text style={styles.scorePercentage}>
          {Math.round((correctCount / questions.length) * 100)}%
        </Text>
        <Text style={styles.scoreLabel}>
          {correctCount === questions.length
            ? "Perfect!"
            : correctCount >= questions.length * 0.7
              ? "Great job!"
              : correctCount >= questions.length * 0.5
                ? "Good effort!"
                : "Keep practicing!"}
        </Text>
      </View>
      <View style={styles.completedActions}>
        <TouchableOpacity style={styles.restartButton} onPress={handleReset}>
          <RotateCcw size={20} color={Colors.white} />
          <Text style={styles.restartButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.newQuizButton}
          onPress={handleRegenerate}
        >
          <Sparkles size={20} color="#8B5CF6" />
          <Text style={styles.newQuizButtonText}>New Quiz</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const currentQuestion = questions[currentIndex];
  const isQuizComplete = currentIndex >= questions.length - 1 && showResult && answeredQuestions.size === questions.length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quizzes</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.divider} />

        {generateQuizMutation.isPending ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Generating quiz questions...</Text>
          </View>
        ) : generateQuizMutation.isError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Failed to generate quiz. Please try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRegenerate}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : questions.length > 0 ? (
          isQuizComplete ? (
            renderQuizComplete()
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Progress Section */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Sparkles size={18} color={Colors.text} />
                  <Text style={styles.progressText}>
                    Question {currentIndex + 1} in {questions.length}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${((currentIndex + 1) / questions.length) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleReset}
                >
                  <RotateCcw size={18} color={Colors.text} />
                  <Text style={styles.actionButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShuffle}
                >
                  <Shuffle size={18} color={Colors.text} />
                  <Text style={styles.actionButtonText}>Shuffle</Text>
                </TouchableOpacity>
              </View>

              {/* Question */}
              <View style={styles.questionContainer}>
                <Text style={styles.questionNumber}>
                  Question: {currentIndex + 1}
                </Text>
                <Text style={styles.questionText}>
                  {currentQuestion?.question}
                </Text>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {currentQuestion?.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={getOptionStyle(index)}
                    onPress={() => handleSelectAnswer(index)}
                    activeOpacity={0.7}
                    disabled={showResult}
                  >
                    <Text style={getOptionTextStyle(index)}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Confirm Button */}
              {selectedAnswer !== null && !showResult && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmAnswer}
                >
                  <Text style={styles.confirmButtonText}>Confirm Answer</Text>
                </TouchableOpacity>
              )}

              {/* Result Feedback */}
              {showResult && (
                <View style={styles.resultContainer}>
                  <Text
                    style={[
                      styles.resultText,
                      selectedAnswer === currentQuestion?.correctAnswer
                        ? styles.resultCorrect
                        : styles.resultIncorrect,
                    ]}
                  >
                    {selectedAnswer === currentQuestion?.correctAnswer
                      ? "Correct!"
                      : "Incorrect!"}
                  </Text>
                  {currentIndex < questions.length - 1 && (
                    <Text style={styles.nextHint}>
                      Moving to next question...
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          )
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: Colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22C55E",
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.text,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: Colors.text,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionNumber: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    color: Colors.text,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontFamily: Fonts.Regular,
    color: Colors.text,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: {
    backgroundColor: "#E8E0FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#8B5CF6",
  },
  optionCorrect: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
    borderWidth: 2,
  },
  optionIncorrect: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  optionText: {
    fontSize: 15,
    fontFamily: Fonts.Regular,
    color: Colors.text,
  },
  optionTextSelected: {
    fontSize: 15,
    fontFamily: Fonts.Medium,
    color: Colors.text,
  },
  confirmButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: Colors.white,
  },
  resultContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  resultText: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    marginBottom: 8,
  },
  resultCorrect: {
    color: "#22C55E",
  },
  resultIncorrect: {
    color: "#EF4444",
  },
  nextHint: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: Colors.grayText,
  },
  completedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  completedEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 28,
    fontFamily: Fonts.Bold,
    color: Colors.text,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 16,
    fontFamily: Fonts.Regular,
    color: Colors.grayText,
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 48,
    marginBottom: 32,
  },
  scorePercentage: {
    fontSize: 48,
    fontFamily: Fonts.Bold,
    color: "#8B5CF6",
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: Colors.grayText,
    marginTop: 4,
  },
  completedActions: {
    flexDirection: "row",
    gap: 12,
  },
  restartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  restartButtonText: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: Colors.white,
  },
  newQuizButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  newQuizButtonText: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: "#8B5CF6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: Colors.grayText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.Regular,
    color: Colors.grayText,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: Colors.white,
  },
});
