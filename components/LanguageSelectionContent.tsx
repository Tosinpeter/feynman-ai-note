import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "@/constants/colors";
import { Language } from "@/contexts/language";

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const languageOptions: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
];

interface LanguageSelectionContentProps {
  currentLanguage: Language;
  onLanguageSelect: (lang: Language) => void;
}

export default function LanguageSelectionContent({
  currentLanguage,
  onLanguageSelect,
}: LanguageSelectionContentProps) {
  return (
    <View style={styles.container}>
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionIcon}>🌐</Text>
        <Text style={styles.description}>
          Choose your preferred language for the app interface
        </Text>
      </View>

      <View style={styles.languageList}>
        {languageOptions.map((lang) => {
          const isSelected = currentLanguage === lang.code;

          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                isSelected && styles.languageOptionSelected,
              ]}
              onPress={() => onLanguageSelect(lang.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <View style={styles.languageInfo}>
                <Text
                  style={[
                    styles.languageNativeName,
                    isSelected && styles.languageNameSelected,
                  ]}
                >
                  {lang.nativeName}
                </Text>
                <Text
                  style={[
                    styles.languageName,
                    isSelected && styles.languageNameSelected,
                  ]}
                >
                  {lang.name}
                </Text>
              </View>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.note}>
        Language changes will take effect immediately throughout the app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  descriptionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  description: {
    flex: 1,
    fontSize: 15,
    color: Colors.navDark,
    lineHeight: 22,
  },
  languageList: {
    gap: 12,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  languageOptionSelected: {
    backgroundColor: Colors.orange,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageNativeName: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  languageName: {
    fontSize: 14,
    color: Colors.navInactive,
  },
  languageNameSelected: {
    color: Colors.white,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.orange,
  },
  note: {
    fontSize: 13,
    color: Colors.navInactive,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 20,
  },
});
