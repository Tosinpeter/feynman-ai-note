import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import { ChevronDown, ChevronUp, Check } from "lucide-react-native";
import { Fonts } from "@/constants/fonts";
import {
  GenerateLanguage,
  LanguageOption,
  languageOptions,
  getLanguageByCode,
} from "@/constants/languageOptions";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface LanguagePickerProps {
  selectedLanguage: GenerateLanguage;
  onSelectLanguage: (language: GenerateLanguage) => void;
  showModal: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
}

export default function LanguagePicker({
  selectedLanguage,
  onSelectLanguage,
  showModal,
  onOpenModal,
  onCloseModal,
}: LanguagePickerProps) {
  const selectedLang = getLanguageByCode(selectedLanguage);

  // Animation refs for language button press effect
  const languageTranslateYAnim = useRef(new Animated.Value(0)).current;
  const languageShadowOpacityAnim = useRef(new Animated.Value(0.8)).current;

  const handleLanguagePressIn = () => {
    Animated.parallel([
      Animated.timing(languageTranslateYAnim, {
        toValue: 4,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(languageShadowOpacityAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleLanguagePressOut = () => {
    Animated.parallel([
      Animated.spring(languageTranslateYAnim, {
        toValue: 0,
        friction: 5,
        tension: 100,
        useNativeDriver: false,
      }),
      Animated.timing(languageShadowOpacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleSelectLanguage = (lang: LanguageOption) => {
    onSelectLanguage(lang.code);
    onCloseModal();
  };

  return (
    <>
      {/* Language Section */}
      <View style={styles.languageSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.robotEmoji}>🤖</Text>
          <Text style={styles.sectionTitle}>Topic generate language</Text>
        </View>

        <Animated.View
          style={[
            styles.languageSelector,
            {
              transform: [{ translateY: languageTranslateYAnim }],
              ...Platform.select({
                ios: {
                  shadowOpacity: languageShadowOpacityAnim,
                },
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.languageSelectorTouchable}
            onPress={onOpenModal}
            onPressIn={handleLanguagePressIn}
            onPressOut={handleLanguagePressOut}
            activeOpacity={1}
          >
            <View style={styles.languageSelectorContent}>
              <Text style={styles.languageEmoji}>{selectedLang?.emoji}</Text>
              <Text style={styles.languageName}>{selectedLang?.name}</Text>
            </View>
            <View style={styles.chevronContainer}>
              <ChevronUp size={16} color="#9CA3AF" />
              <ChevronDown size={16} color="#9CA3AF" style={styles.chevronDown} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Language Selection Bottom Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={onCloseModal}
      >
        <Pressable style={styles.languageModalOverlay} onPress={onCloseModal}>
          <Pressable
            style={styles.languageModalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.languageModalHandle} />

            {/* Current Selection Header */}
            <View style={styles.languageModalHeader}>
              <View style={styles.languageModalHeaderContent}>
                <Text style={styles.languageModalHeaderEmoji}>
                  {selectedLang?.emoji}
                </Text>
                <Text style={styles.languageModalHeaderText}>
                  {selectedLang?.name}
                </Text>
              </View>
              <View style={styles.languageModalHeaderChevron}>
                <ChevronUp size={16} color="#9CA3AF" />
                <ChevronDown size={16} color="#9CA3AF" style={styles.chevronDown} />
              </View>
            </View>

            <View style={styles.languageModalDivider} />

            {/* Language Options List */}
            <ScrollView
              style={styles.languageModalList}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {languageOptions.map((lang, index) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageModalOption,
                    index === languageOptions.length - 1 &&
                      styles.languageModalOptionLast,
                  ]}
                  onPress={() => handleSelectLanguage(lang)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.languageModalOptionEmoji}>{lang.emoji}</Text>
                  <Text
                    style={[
                      styles.languageModalOptionText,
                      selectedLanguage === lang.code &&
                        styles.languageModalOptionTextSelected,
                    ]}
                  >
                    {lang.name}
                  </Text>
                  {selectedLanguage === lang.code && (
                    <View style={styles.languageModalCheckmark}>
                      <Check size={18} color="#10B981" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "rgba(0,0,0,0.8)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    ...Platform.select({
      android: {
        elevation: 4,
      },
    }),
  },
  languageSelectorTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
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
  // Bottom Modal Styles
  languageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  languageModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  languageModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  languageModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderBottomWidth: 3,
    borderBottomColor: "#374151",
  },
  languageModalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  languageModalHeaderEmoji: {
    fontSize: 22,
  },
  languageModalHeaderText: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: "#1F2937",
  },
  languageModalHeaderChevron: {
    alignItems: "center",
  },
  languageModalDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 16,
  },
  languageModalList: {
    paddingHorizontal: 16,
  },
  languageModalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  languageModalOptionLast: {
    borderBottomWidth: 0,
  },
  languageModalOptionEmoji: {
    fontSize: 22,
    marginRight: 14,
  },
  languageModalOptionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.Regular,
    color: "#374151",
  },
  languageModalOptionTextSelected: {
    fontFamily: Fonts.SemiBold,
    color: "#1F2937",
  },
  languageModalCheckmark: {
    marginLeft: 8,
  },
});
