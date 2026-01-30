import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useExplanations } from "@/contexts/explanations";
import { generateText } from "@rork-ai/toolkit-sdk";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  MoreHorizontal,
  ChevronDown,
  Folder,
  Brain,
  User,
  Plus,
  ArrowUp,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Animated,
  Modal,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
import { SafeAreaView } from "react-native-safe-area-context";

// Helper function to strip markdown formatting from AI response
const stripMarkdown = (text: string): string => {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1") // Bold italic ***text***
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold **text**
    .replace(/\*(.*?)\*/g, "$1") // Italic *text*
    .replace(/__(.*?)__/g, "$1") // Bold __text__
    .replace(/_(.*?)_/g, "$1") // Italic _text_
    .replace(/~~(.*?)~~/g, "$1") // Strikethrough ~~text~~
    .replace(/`{3}[\s\S]*?`{3}/g, "") // Code blocks ```code```
    .replace(/`(.*?)`/g, "$1") // Inline code `code`
    .replace(/^#{1,6}\s+/gm, "") // Headers # ## ### etc
    .replace(/^\s*[-*+]\s+/gm, "• ") // Unordered lists
    .replace(/^\s*\d+\.\s+/gm, "") // Ordered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links [text](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // Images ![alt](url)
    .replace(/^\s*>\s+/gm, "") // Blockquotes
    .replace(/\n{3,}/g, "\n\n") // Multiple newlines
    .trim();
};

// Helper function to clean topic title (remove emojis and dates)
const cleanTopicTitle = (title: string): string => {
  return title
    // Remove emojis
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu, "")
    // Remove common date patterns (e.g., "Jan 11, 2026", "2026-01-11", "11/01/2026")
    .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/gi, "")
    .replace(/\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g, "")
    .replace(/\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g, "")
    // Remove time patterns (e.g., "02:46 PM", "14:30")
    .replace(/\b\d{1,2}:\d{2}\s*(AM|PM|am|pm)?\b/gi, "")
    // Clean up extra spaces and trim
    .replace(/\s+/g, " ")
    .trim();
};

// Animated Button Component with press in/out effect
interface AnimatedButtonProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  shadowColor?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  style,
  onPress,
  shadowColor = "rgba(0,0,0,0.15)",
}) => {
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const shadowOpacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: 4,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(shadowOpacityAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 5,
        tension: 100,
        useNativeDriver: false,
      }),
      Animated.timing(shadowOpacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateY: translateYAnim }],
          ...Platform.select({
            ios: {
              shadowOpacity: shadowOpacityAnim,
            },
          }),
        },
      ]}
    >
      <TouchableOpacity
        style={styles.buttonTouchable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ExplanationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    topic?: string;
    explanationId?: string;
    sourceImage?: string;
    source?: string;
    language?: string;
  }>();
  const { addExplanation, toggleSave, explanations, deleteExplanation } = useExplanations();
  const [currentExplanation, setCurrentExplanation] = useState<{
    id: string;
    topic: string;
    content: string;
    isSaved: boolean;
    timestamp?: number;
  } | null>(null);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [generatingType, setGeneratingType] = useState<"flashcards" | "mindmap" | "quiz" | null>(null);
  const [showAiChatModal, setShowAiChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    role: "ai" | "user";
    content: string;
    timestamp: Date;
  }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);

  // Initialize chat with welcome message when modal opens
  const initializeChat = () => {
    setChatMessages([{
      id: "welcome",
      role: "ai",
      content: "Hello! I'm Feynman AI, you can ask me anything about this note.",
      timestamp: new Date(),
    }]);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsAiTyping(true);

    try {
      const noteContent = currentExplanation?.content || "";
      const noteTopic = currentExplanation?.topic || params.topic || "";
      
      const contextPrompt = `You are Feynman AI, a helpful learning assistant. You are helping a user understand their note about "${noteTopic}". Here is the note content:\n\n${noteContent}\n\nAnswer questions about this note in a clear, simple, and helpful way. Use the Feynman technique - explain concepts as if teaching a beginner.\n\nUser question: ${userMessage.content}`;
      
      const response = await generateText({
        messages: [
          {
            role: "user",
            content: contextPrompt,
          },
        ],
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai" as const,
        content: response,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai" as const,
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const formatChatTime = (date: Date) => {
    const day = date.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${day} ${month} ${year} - ${displayHours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const generateMutation = useMutation({
    mutationFn: async (topic: string) => {
      let prompt: string;

      if (params.source === "capture" && params.sourceImage) {
        const languageInstruction =
          params.language && params.language !== "Auto Detect"
            ? `Please provide the explanation in ${params.language}.`
            : "Please provide the explanation in the language that best fits the content.";

        prompt = `You are analyzing an image for educational purposes using the Feynman Technique. ${languageInstruction}

Provide a simple, clear explanation of what you observe in the image as if teaching a curious learner. Break down any concepts, text, diagrams, or educational content you can identify.

Keep your explanation:
- Simple and conversational
- Easy to understand
- Around 150-200 words
- Focused on key learning points

Format your response naturally as if you're a friendly teacher explaining what's in the image.`;
      } else {
        prompt = `Explain "${topic}" in the simplest way possible, as if explaining to a 5-year-old child. Use simple words, short sentences, and friendly examples. Keep it conversational and easy to understand. Maximum 200 words.`;
      }

      const content = await generateText({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return content;
    },
    onSuccess: async (content) => {
      if (params.topic) {
        const newExp = await addExplanation(params.topic, content);
        setCurrentExplanation({
          id: newExp.id,
          topic: newExp.topic,
          content: newExp.content,
          isSaved: newExp.isSaved,
          timestamp: newExp.timestamp,
        });
      }
    },
  });

  useEffect(() => {
    if (params.explanationId) {
      const existing = explanations.find((e) => e.id === params.explanationId);
      if (existing) {
        setCurrentExplanation({
          id: existing.id,
          topic: existing.topic,
          content: existing.content,
          isSaved: existing.isSaved,
          timestamp: existing.timestamp,
        });
      }
    } else if (
      params.topic &&
      !generateMutation.isPending &&
      !currentExplanation
    ) {
      generateMutation.mutate(params.topic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.topic, params.explanationId, explanations]);

  const handleToggleSave = () => {
    if (currentExplanation) {
      toggleSave(currentExplanation.id);
      setCurrentExplanation({
        ...currentExplanation,
        isSaved: !currentExplanation.isSaved,
      });
    }
  };

  const handleRegenerate = () => {
    if (params.topic) {
      setCurrentExplanation(null);
      generateMutation.mutate(params.topic);
    }
  };

  const handleDeleteNote = () => {
    setShowDropdown(false);
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (currentExplanation) {
              deleteExplanation(currentExplanation.id);
            }
            router.back();
          },
        },
      ]
    );
  };

  const handleEditNote = () => {
    if (currentExplanation) {
      router.push({
        pathname: "/edit-note",
        params: {
          noteId: currentExplanation.id,
          topic: currentExplanation.topic,
          content: currentExplanation.content,
        },
      });
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${month} ${day}, ${year} ${displayHours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const renderActionButton = (
    icon: React.ReactNode,
    label: string,
    bgColor: string,
    shadowColor: string = "rgba(0,0,0,0.15)",
    onPress?: () => void
  ) => (
    <AnimatedButton
      style={[styles.actionButton, { backgroundColor: bgColor }]}
      shadowColor={shadowColor}
      onPress={onPress}
    >
      {icon}
      <Text style={styles.actionButtonText}>{label}</Text>
    </AnimatedButton>
  );

  if (generateMutation.isPending && !currentExplanation) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.orange} />
            <Text style={styles.loadingText}>
              Preparing your explanation...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (generateMutation.isError) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerIcon}>📝</Text>
            </View>
            <View style={styles.headerButton} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Oops! Something went wrong. Please try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRegenerate}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Generating Modal */}
      <Modal visible={showGeneratingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.modalTitle}>
              {generatingType === "flashcards"
                ? "Generating Flashcards"
                : generatingType === "mindmap"
                ? "Generating Mind Map"
                : "Generating Quiz"}
            </Text>
            <Text style={styles.modalSubtitle}>
              Creating personalized content for "
              {cleanTopicTitle(currentExplanation?.topic || params.topic || "Topic")}"
            </Text>
            <View style={styles.modalDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Dropdown Overlay - must be inside SafeAreaView for proper z-index */}
        {showDropdown && (
          <TouchableOpacity 
            style={styles.dropdownOverlay} 
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}
          />
        )}

        {/* Header */}
        <View style={[styles.header, { zIndex: 1001 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerIcon}>📝</Text>
          </View>
          <View style={styles.headerButtonContainer}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <MoreHorizontal size={24} color={Colors.text} />
            </TouchableOpacity>
            {showDropdown && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={handleDeleteNote}
                >
                  <Trash2 size={18} color="#EF4444" />
                  <Text style={styles.dropdownItemTextDanger}>Delete Note</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.noteTitle}>
              {cleanTopicTitle(currentExplanation?.topic || params.topic || "Note")}
            </Text>
            <View style={styles.titleRow}>
              <Text style={styles.dateText}>
                {formatDate(currentExplanation?.timestamp)}
              </Text>
              <TouchableOpacity style={styles.folderButton} activeOpacity={0.7}>
                <Folder size={16} color="#3B82F6" fill="#3B82F6" />
                <Text style={styles.folderButtonText}>Add to Folder</Text>
                <ChevronDown size={14} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Memory Practice Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Memory Practice</Text>
              <Brain size={20} color={Colors.text} />
            </View>
            <View style={styles.buttonRow}>
              {renderActionButton(
                <Text style={styles.buttonEmoji}>🗂️</Text>,
                "Flashcards",
                "#B8E6E6",
                "rgba(0,180,180,0.3)",
                () => {
                  setGeneratingType("flashcards");
                  setShowGeneratingModal(true);
                  setTimeout(() => {
                    setShowGeneratingModal(false);
                    if (currentExplanation) {
                      router.push({
                        pathname: "/flashcards",
                        params: {
                          explanationId: currentExplanation.id,
                          topic: currentExplanation.topic,
                        },
                      });
                    } else if (params.topic) {
                      router.push({
                        pathname: "/flashcards",
                        params: { topic: params.topic },
                      });
                    }
                  }, 1500);
                }
              )}
              {renderActionButton(
                <Text style={styles.buttonEmoji}>🎯</Text>,
                "Quiz",
                "#FFB8B8",
                "rgba(255,100,100,0.3)",
                () => {
                  setGeneratingType("quiz");
                  setShowGeneratingModal(true);
                  setTimeout(() => {
                    setShowGeneratingModal(false);
                    if (currentExplanation) {
                      router.push({
                        pathname: "/quiz",
                        params: {
                          explanationId: currentExplanation.id,
                          topic: currentExplanation.topic,
                        },
                      });
                    } else if (params.topic) {
                      router.push({
                        pathname: "/quiz",
                        params: { topic: params.topic },
                      });
                    }
                  }, 1500);
                }
              )}
            </View>
          </View>

          {/* Visual Section */}
          {/* <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Visual</Text>
              <Sparkles size={20} color={Colors.text} />
            </View>
            <View style={styles.buttonRow}>
              {renderActionButton(
                <Text style={styles.buttonEmoji}>🧠</Text>,
                "Mind Map",
                "#FFF3B8",
                "rgba(230,180,50,0.3)",
                () => {
                  setGeneratingType("mindmap");
                  setShowGeneratingModal(true);
                  setTimeout(() => {
                    setShowGeneratingModal(false);
                    if (currentExplanation) {
                      router.push({
                        pathname: "/mind-map",
                        params: { 
                          explanationId: currentExplanation.id,
                          topic: currentExplanation.topic,
                        },
                      });
                    } else if (params.topic) {
                      router.push({
                        pathname: "/mind-map",
                        params: { topic: params.topic },
                      });
                    }
                  }, 1500);
                }
              )}
              {renderActionButton(
                <Text style={styles.buttonEmoji}>📖</Text>,
                "Transcript",
                "#FFFDE0",
                "rgba(200,180,100,0.3)"
              )}
            </View>
          </View> */}

          {/* Actions Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <User size={20} color={Colors.text} />
            </View>
            <View style={styles.buttonRow}>
              {renderActionButton(
                <Text style={styles.buttonEmoji}>🌐</Text>,
                "Translate",
                "#E8E0FF",
                "rgba(139,92,246,0.3)"
              )}
              {renderActionButton(
                <Text style={styles.buttonEmoji}>✏️</Text>,
                "Edit notes",
                "#E8E0FF",
                "rgba(139,92,246,0.3)",
                handleEditNote
              )}
            </View>
          </View>

          {/* Smart Notes Section */}
          <View style={styles.smartNotesSection}>
            <Text style={styles.smartNotesHeader}>Smart Notes</Text>
            <View style={styles.smartNotesCard}>
              <Text style={styles.smartNotesTitle}>
                {cleanTopicTitle(currentExplanation?.topic || params.topic || "Note")}
              </Text>
              <Text style={styles.smartNotesContent}>
                {currentExplanation?.content
                  ? stripMarkdown(currentExplanation.content)
                  : "This note details the contents of the transcript. The analysis provides a comprehensive view of the key points and insights presented throughout the document."}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <AnimatedButton
            style={styles.askAiButton}
            shadowColor="rgba(139,92,246,0.4)"
            onPress={() => {
              initializeChat();
              setShowAiChatModal(true);
            }}
          >
            <Image
              source={require("@/assets/images/img_profile.png")}
              style={styles.askAiIcon}
              contentFit="contain"
            />
            <Text style={styles.askAiText}>Ask AI</Text>
          </AnimatedButton>

          <AnimatedButton
            style={styles.feynmanAiButton}
            shadowColor="rgba(16,185,129,0.4)"
            onPress={() => {
              const topic = currentExplanation?.topic 
                ? cleanTopicTitle(currentExplanation.topic)
                : params.topic || "Topic";
              router.push({
                pathname: "/character-picker",
                params: { 
                  topic,
                  parentTopic: topic,
                },
              });
            }}
          >
            <Text style={styles.feynmanAiEmoji}>🦝</Text>
            <Text style={styles.feynmanAiText}>Feynman AI</Text>
          </AnimatedButton>
        </View>

        {/* AI Chat Modal */}
        <Modal
          visible={showAiChatModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAiChatModal(false)}
        >
          <KeyboardAvoidingView 
            style={styles.chatModalContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <SafeAreaView style={styles.chatModalSafeArea} edges={["top", "bottom"]}>
              {/* Chat Header */}
              <View style={styles.chatHeader}>
                <View style={styles.chatHeaderHandle} />
                <Text style={styles.chatHeaderTitle}>Feynman AI Chat Bot</Text>
              </View>

              {/* Chat Messages */}
              <ScrollView
                ref={chatScrollRef}
                style={styles.chatMessagesContainer}
                contentContainerStyle={styles.chatMessagesContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
              >
                {chatMessages.map((message) => (
                  <View key={message.id} style={styles.chatMessageWrapper}>
                    {message.role === "ai" ? (
                      <>
                        <View style={styles.aiMessageHeader}>
                          <View style={styles.aiAvatarContainer}>
                            <Image
                              source={require("@/assets/images/img_profile.png")}
                              style={styles.aiAvatar}
                              contentFit="cover"
                            />
                          </View>
                          <View style={styles.aiMessageInfo}>
                            <Text style={styles.aiName}>Feynman AI</Text>
                            <Text style={styles.messageTime}>{formatChatTime(message.timestamp)}</Text>
                          </View>
                        </View>
                        <View style={styles.aiMessageBubble}>
                          <Text style={styles.aiMessageText}>{message.content}</Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.userMessageContainer}>
                        <View style={styles.userMessageBubble}>
                          <Text style={styles.userMessageText}>{message.content}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
                {isAiTyping && (
                  <View style={styles.chatMessageWrapper}>
                    <View style={styles.aiMessageHeader}>
                      <View style={styles.aiAvatarContainer}>
                        <Image
                          source={require("@/assets/images/img_profile.png")}
                          style={styles.aiAvatar}
                          contentFit="cover"
                        />
                      </View>
                      <View style={styles.aiMessageInfo}>
                        <Text style={styles.aiName}>Feynman AI</Text>
                        <Text style={styles.messageTime}>Typing...</Text>
                      </View>
                    </View>
                    <View style={styles.aiMessageBubble}>
                      <ActivityIndicator size="small" color={Colors.grayText} />
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Chat Input */}
              <View style={styles.chatInputContainer}>
                <TouchableOpacity style={styles.chatAddButton}>
                  <Plus size={20} color={Colors.grayText} />
                </TouchableOpacity>
                <View style={styles.chatInputWrapper}>
                  <TextInput
                    style={styles.chatInput}
                    placeholder="Ask me anything"
                    placeholderTextColor={Colors.grayText}
                    value={chatInput}
                    onChangeText={setChatInput}
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity
                    style={[
                      styles.chatSendButton,
                      (!chatInput.trim() || isAiTyping) && styles.chatSendButtonDisabled,
                    ]}
                    onPress={handleSendMessage}
                    disabled={!chatInput.trim() || isAiTyping}
                  >
                    <ArrowUp size={18} color={(!chatInput.trim() || isAiTyping) ? Colors.grayText : Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
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
  dropdownMenu: {
    position: "absolute",
    top: 44,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
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
    borderWidth: 1,
    borderColor: "#E5E7EB",
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownItemTextDanger: {
    fontSize: 15,
    fontFamily: Fonts.Medium,
    color: "#EF4444",
  },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  headerButtonContainer: {
    zIndex: 1000,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  noteTitle: {
    fontSize: 24,
    fontFamily: Fonts.Bold,
    color: Colors.text,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    fontFamily: Fonts.Regular,
    color: Colors.navInactive,
  },
  folderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  folderButtonText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    color: Colors.text,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0,0,0,0.15)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 8,
  },
  buttonEmoji: {
    fontSize: 20,
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
  },
  smartNotesSection: {
    marginTop: 8,
  },
  smartNotesHeader: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    color: Colors.text,
    marginBottom: 12,
  },
  smartNotesCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    }),
  },
  smartNotesTitle: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    color: "#00B4D8",
    marginBottom: 8,
  },
  smartNotesSubtitle: {
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
    color: "#F97316",
    marginBottom: 8,
  },
  smartNotesContent: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: Colors.text,
    lineHeight: 22,
  },
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  askAiButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3E8FF",
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(139,92,246,0.4)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  askAiIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  askAiText: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
  },
  feynmanAiButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(16,185,129,0.4)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  feynmanAiEmoji: {
    fontSize: 24,
  },
  feynmanAiText: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
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
    ...Platform.select({
      ios: {
        shadowColor: "rgba(230,126,34,0.5)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: Colors.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: SCREEN_WIDTH - 60,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    color: Colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: Colors.grayText,
    textAlign: "center",
    marginBottom: 20,
  },
  modalDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  dotActive: {
    backgroundColor: "#8B5CF6",
  },
  // Chat Modal Styles
  chatModalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  chatModalSafeArea: {
    flex: 1,
  },
  chatHeader: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  chatHeaderHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    marginBottom: 12,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: Colors.grayText,
  },
  chatMessagesContainer: {
    flex: 1,
  },
  chatMessagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  chatMessageWrapper: {
    marginBottom: 20,
  },
  aiMessageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  aiAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E9D5FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  aiMessageInfo: {
    flex: 1,
  },
  aiName: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
    marginBottom: 2,
  },
  messageTime: {
    fontSize: 13,
    fontFamily: Fonts.Regular,
    color: Colors.grayText,
  },
  aiMessageBubble: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignSelf: "flex-start",
    maxWidth: "90%",
  },
  aiMessageText: {
    fontSize: 15,
    fontFamily: Fonts.Regular,
    color: Colors.text,
    lineHeight: 22,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  userMessageBubble: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    maxWidth: "90%",
  },
  userMessageText: {
    fontSize: 15,
    fontFamily: Fonts.Regular,
    color: Colors.white,
    lineHeight: 22,
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  chatAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  chatInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  chatInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.Regular,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: 0,
  },
  chatSendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  chatSendButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
});
