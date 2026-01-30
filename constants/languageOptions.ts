export type GenerateLanguage = "auto" | "en" | "it" | "de" | "es" | "fr" | "pt" | "zh" | "ja" | "ko";

export interface LanguageOption {
  code: GenerateLanguage;
  name: string;
  emoji: string;
}

export const languageOptions: LanguageOption[] = [
  { code: "auto", name: "Auto detect", emoji: "🤖" },
  { code: "en", name: "English", emoji: "🇬🇧" },
  { code: "it", name: "Italian", emoji: "🇮🇹" },
  { code: "de", name: "German", emoji: "🇩🇪" },
  { code: "es", name: "Spanish", emoji: "🇪🇸" },
  { code: "fr", name: "French", emoji: "🇫🇷" },
  { code: "pt", name: "Portuguese", emoji: "🇵🇹" },
  { code: "zh", name: "Chinese", emoji: "🇨🇳" },
  { code: "ja", name: "Japanese", emoji: "🇯🇵" },
  { code: "ko", name: "Korean", emoji: "🇰🇷" },
];

export const getLanguageByCode = (code: GenerateLanguage): LanguageOption => {
  return languageOptions.find((lang) => lang.code === code) || languageOptions[0];
};

export const getLanguagePrompt = (code: GenerateLanguage): string => {
  if (code === "auto") {
    return "Detect the language of the input and generate the content in that same language.";
  }
  const lang = getLanguageByCode(code);
  return `Generate all content in ${lang.name}.`;
};
