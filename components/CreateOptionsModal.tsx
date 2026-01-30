import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Mic, Camera, Video, FileText, Edit3, X, Upload, LucideIcon } from "lucide-react-native";
import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  View,
  Text,
  Modal,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
  Alert,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

interface CreateOption {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  route: string;
}

interface CreateOptionsModalProps {
  visible: boolean;
  onClose: () => void;
}

const options: CreateOption[] = [
  {
    id: "record-audio",
    title: "Record Audio",
    description: "Generate a note from any audio recording",
    icon: Mic,
    iconColor: "#EF4444",
    bgColor: "#FEE2E2",
    route: "/record-audio",
  },
  {
    id: "upload-audio",
    title: "Upload Audio",
    description: "Upload an audio file to generate notes",
    icon: Upload,
    iconColor: "#3B82F6",
    bgColor: "#DBEAFE",
    route: "/upload-audio",
  },
  {
    id: "capture",
    title: "Capture Text or Image",
    description: "Capture anything to generate a topic",
    icon: Camera,
    iconColor: "#A855F7",
    bgColor: "#E9D5FF",
    route: "/capture-text-image",
  },
  {
    id: "youtube",
    title: "YouTube Video",
    description: "Enter a youtube video link to generate a topic",
    icon: Video,
    iconColor: "#EF4444",
    bgColor: "#FECDD3",
    route: "/youtube-video",
  },
  {
    id: "pdf",
    title: "PDF book or document",
    description: "Upload a pdf document to generate a topic",
    icon: FileText,
    iconColor: "#F97316",
    bgColor: "#FED7AA",
    route: "/upload-pdf",
  },
  {
    id: "custom-text",
    title: "Custom text",
    description: "Enter custom text to generate a topic",
    icon: Edit3,
    iconColor: "#10B981",
    bgColor: "#D1FAE5",
    route: "/create-notes",
  },
];

export default function CreateOptionsModal({ visible, onClose }: CreateOptionsModalProps) {
  const router = useRouter();

  // Modal animations
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  // Open modal with smooth animation (overlay and modal animate together)
  const openModal = () => {
    dragY.setValue(0);

    // Animate both overlay and modal together for a smoother feel
    Animated.parallel([
      // Fade in overlay
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Slide up modal with smooth easing (no bounce)
      Animated.timing(modalTranslateY, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close modal with smooth animation
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalTranslateY, {
        toValue: MODAL_HEIGHT,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      dragY.setValue(0);
    });
  };

  // Trigger open animation when visible changes to true
  useEffect(() => {
    if (visible) {
      openModal();
    } else {
      // Reset animations when modal is hidden
      overlayOpacity.setValue(0);
      modalTranslateY.setValue(MODAL_HEIGHT);
      dragY.setValue(0);
    }
  }, [visible]);

  // PanResponder for drag-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward gestures
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down (positive dy)
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
          // Fade overlay as user drags
          const newOpacity = 1 - gestureState.dy / MODAL_HEIGHT;
          overlayOpacity.setValue(Math.max(0, newOpacity));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If dragged more than 100px or with velocity, close modal
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeModal();
        } else {
          // Snap back with smooth easing
          Animated.parallel([
            Animated.timing(dragY, {
              toValue: 0,
              duration: 250,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
              toValue: 1,
              duration: 200,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const handleCapturePhoto = async () => {
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
      closeModal();
      setTimeout(() => {
        router.push({
          pathname: "/capture-text-image",
          params: { imageUri: result.assets[0].uri },
        } as any);
      }, 250);
    }
  };

  const handleOptionPress = (optionId: string, route: string) => {
    if (optionId === "capture") {
      handleCapturePhoto();
    } else {
      closeModal();
      setTimeout(() => router.push(route as any), 250);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeModal}>
      {/* Animated Overlay - fades in independently */}
      <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
      </Animated.View>

      {/* Animated Modal Content - slides up with drag support */}
      <Animated.View
        style={[
          styles.modalContent,
          {
            transform: [{ translateY: Animated.add(modalTranslateY, dragY) }],
          },
        ]}
      >
        {/* Drag Handle Area */}
        <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
          <View style={styles.modalHandle} />
        </View>

        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderLeft}>
            <Text style={styles.modalHeaderEmoji}>✨</Text>
            <Text style={styles.modalHeaderText}>Create Note/Game/Learning</Text>
          </View>
          <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal} activeOpacity={0.7}>
            <X size={24} color={Colors.navDark} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {options.map((option) => {
          const IconComponent = option.icon;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, { backgroundColor: option.bgColor }]}
              onPress={() => handleOptionPress(option.id, option.route)}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconContainer}>
                <IconComponent size={20} color={option.iconColor} strokeWidth={2} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "70%",
  },
  dragHandleArea: {
    paddingVertical: 16,
    alignItems: "center",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalHeaderEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  modalHeaderText: {
    fontSize: 18,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
    marginBottom: 1,
  },
  optionDescription: {
    fontSize: 11,
    fontFamily: Fonts.Regular,
    color: "#6B7280",
    lineHeight: 15,
  },
});
