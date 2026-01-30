import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useExplanations } from "@/contexts/explanations";
import { generateText } from "@rork-ai/toolkit-sdk";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw, Star } from "lucide-react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;

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

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

// Card colors for the stack
const CARD_COLORS = [
  "#A8E6CF", // Mint green
  "#FFB6C1", // Light pink
  "#87CEEB", // Sky blue
  "#DDA0DD", // Plum
  "#F0E68C", // Khaki
  "#98D8C8", // Seafoam
  "#FFB347", // Pastel orange
  "#B19CD9", // Light purple
];

// Swipeable Card Component
const SwipeableCard: React.FC<{
  card: Flashcard;
  cardColor: string;
  isFirst: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}> = ({ card, cardColor, isFirst, onSwipeLeft, onSwipeRight }) => {
  const position = useRef(new Animated.ValueXY()).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Use a ref to track the current isFirst value so pan responder can access updated value
  const isFirstRef = useRef(isFirst);
  isFirstRef.current = isFirst;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-15deg", "0deg", "15deg"],
    extrapolate: "clamp",
  });

  const knowOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const forgotOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isFirstRef.current,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return isFirstRef.current && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onPanResponderGrant: () => {
        position.setOffset({
          x: (position.x as any)._value,
          y: (position.y as any)._value,
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        position.flattenOffset();
        
        if (gestureState.dx > SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            onSwipeRight();
          });
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            onSwipeLeft();
          });
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  if (!isFirst) {
    return (
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={styles.cardText}>{card.front}</Text>
      </View>
    );
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.cardWrapper,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
          ],
        },
      ]}
    >
      {/* Know Label */}
      <Animated.View
        style={[
          styles.swipeLabel,
          styles.knowLabel,
          { opacity: knowOpacity },
        ]}
      >
        <Text style={styles.knowText}>Know</Text>
      </Animated.View>

      {/* Forgot Label */}
      <Animated.View
        style={[
          styles.swipeLabel,
          styles.forgotLabel,
          { opacity: forgotOpacity },
        ]}
      >
        <Text style={styles.forgotText}>Forgot</Text>
      </Animated.View>

      <TouchableOpacity
        activeOpacity={1}
        onPress={flipCard}
        style={styles.cardTouchable}
      >
        {/* Front of card */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: cardColor },
            { transform: [{ rotateY: frontInterpolate }] },
          ]}
        >
          <Text style={styles.cardText}>{card.front}</Text>
          <View style={styles.flipHint}>
            <RefreshCw size={16} color="rgba(0,0,0,0.4)" />
            <Text style={styles.flipHintText}>Click card to flip</Text>
          </View>
        </Animated.View>

        {/* Back of card */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { backgroundColor: cardColor },
            { transform: [{ rotateY: backInterpolate }] },
          ]}
        >
          <Text style={styles.cardTextBack}>{card.back}</Text>
          <View style={styles.flipHint}>
            <RefreshCw size={16} color="rgba(0,0,0,0.4)" />
            <Text style={styles.flipHintText}>Click card to flip</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function FlashcardsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    explanationId?: string;
    topic?: string;
  }>();
  const { explanations } = useExplanations();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [forgotCount, setForgotCount] = useState(0);

  const currentExplanation = params.explanationId
    ? explanations.find((e) => e.id === params.explanationId)
    : null;

  const rawTopic = currentExplanation?.topic || params.topic || "Topic";
  const topic = cleanTopicTitle(rawTopic);
  const content = currentExplanation?.content || "";

  const generateFlashcardsMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Generate flashcards for studying the topic "${topic}".

${content ? `Context/Content about this topic:\n${content}\n\n` : ""}

Create 8-10 flashcards that help memorize key concepts. Each flashcard should have:
- Front: A question or key term (keep it concise, max 15 words)
- Back: The answer or explanation (2-3 sentences max)

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just the JSON):
[
  {
    "id": 1,
    "front": "Question or key term here?",
    "back": "Answer or explanation here."
  },
  {
    "id": 2,
    "front": "Another question?",
    "back": "Another answer."
  }
]

Make the questions progressively cover different aspects of the topic. Focus on the most important concepts.`;

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

        const data = JSON.parse(cleanedResponse) as Flashcard[];
        return data;
      } catch (error) {
        console.error("Failed to parse flashcards JSON:", error);
        return [
          {
            id: 1,
            front: `What is ${topic}?`,
            back: "The main concept and its key characteristics.",
          },
          {
            id: 2,
            front: "Why is this important?",
            back: "Understanding its significance and applications.",
          },
          {
            id: 3,
            front: "What are the key components?",
            back: "The essential parts that make up this concept.",
          },
        ];
      }
    },
    onSuccess: (data) => {
      setFlashcards(data);
      setCurrentIndex(0);
    },
  });

  useEffect(() => {
    if (flashcards.length === 0 && !generateFlashcardsMutation.isPending) {
      generateFlashcardsMutation.mutate();
    }
  }, []);

  const handleSwipeRight = useCallback(() => {
    setKnownCount((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleSwipeLeft = useCallback(() => {
    setForgotCount((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleRegenerate = () => {
    setFlashcards([]);
    setCurrentIndex(0);
    setKnownCount(0);
    setForgotCount(0);
    generateFlashcardsMutation.mutate();
  };

  const renderCards = () => {
    if (currentIndex >= flashcards.length) {
      return (
        <View style={styles.completedContainer}>
          <Text style={styles.completedEmoji}>🎉</Text>
          <Text style={styles.completedTitle}>All Done!</Text>
          <Text style={styles.completedText}>
            You've reviewed all {flashcards.length} cards
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{knownCount}</Text>
              <Text style={styles.statLabelKnow}>Know</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{forgotCount}</Text>
              <Text style={styles.statLabelForgot}>Forgot</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.restartButton}
            onPress={handleRegenerate}
          >
            <RefreshCw size={20} color={Colors.white} />
            <Text style={styles.restartButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Render visible cards (current + 2 behind)
    const visibleCards = [];
    for (let i = Math.min(currentIndex + 2, flashcards.length - 1); i >= currentIndex; i--) {
      const card = flashcards[i];
      const isFirst = i === currentIndex;
      const stackPosition = i - currentIndex;
      const cardColor = CARD_COLORS[i % CARD_COLORS.length];

      visibleCards.push(
        <View
          key={`card-${card.id}-${i}`}
          style={[
            styles.cardContainer,
            {
              top: stackPosition * 8,
              transform: [{ scale: 1 - stackPosition * 0.05 }],
              zIndex: flashcards.length - i,
            },
          ]}
        >
          <SwipeableCard
            card={card}
            cardColor={cardColor}
            isFirst={isFirst}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />
        </View>
      );
    }

    return visibleCards;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flashcards</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleRegenerate}
            disabled={generateFlashcardsMutation.isPending}
          >
            <RefreshCw
              size={22}
              color={
                generateFlashcardsMutation.isPending
                  ? Colors.navInactive
                  : Colors.text
              }
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Progress Section */}
        {flashcards.length > 0 && currentIndex < flashcards.length && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Star size={18} color={Colors.text} />
              <Text style={styles.progressText}>
                Card {currentIndex + 1} in {flashcards.length}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Cards Container */}
        <View style={styles.cardsContainer}>
          {generateFlashcardsMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={styles.loadingText}>Loading flashcards...</Text>
            </View>
          ) : generateFlashcardsMutation.isError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Failed to generate flashcards. Please try again.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRegenerate}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            renderCards()
          )}
        </View>

        {/* Swipe Instructions */}
        {flashcards.length > 0 && currentIndex < flashcards.length && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructions}>
              Swipe left to <Text style={styles.forgotWord}>forgot</Text>, swipe
              right to <Text style={styles.knowWord}>know</Text>
            </Text>
          </View>
        )}
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
  progressSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
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
  cardsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  cardContainer: {
    position: "absolute",
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.55,
  },
  cardWrapper: {
    width: "100%",
    height: "100%",
  },
  cardTouchable: {
    width: "100%",
    height: "100%",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 24,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    borderWidth: 3,
    borderColor: "rgba(0,0,0,0.1)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardBack: {
    position: "absolute",
  },
  cardText: {
    fontSize: 22,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 32,
  },
  cardTextBack: {
    fontSize: 18,
    fontFamily: Fonts.Regular,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 28,
  },
  flipHint: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  flipHintText: {
    fontSize: 13,
    fontFamily: Fonts.Regular,
    color: "rgba(0,0,0,0.4)",
  },
  swipeLabel: {
    position: "absolute",
    top: "40%",
    zIndex: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  knowLabel: {
    right: 20,
    borderColor: "#22C55E",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    transform: [{ rotate: "15deg" }],
  },
  forgotLabel: {
    left: 20,
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    transform: [{ rotate: "-15deg" }],
  },
  knowText: {
    fontSize: 24,
    fontFamily: Fonts.Bold,
    color: "#22C55E",
  },
  forgotText: {
    fontSize: 24,
    fontFamily: Fonts.Bold,
    color: "#EF4444",
  },
  instructionsContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  instructions: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: Colors.grayText,
  },
  forgotWord: {
    color: "#EF4444",
    fontFamily: Fonts.SemiBold,
  },
  knowWord: {
    color: "#22C55E",
    fontFamily: Fonts.SemiBold,
  },
  completedContainer: {
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
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 32,
    fontFamily: Fonts.Bold,
    color: Colors.text,
  },
  statLabelKnow: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: "#22C55E",
  },
  statLabelForgot: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: "#EF4444",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#D1D5DB",
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
  loadingContainer: {
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
