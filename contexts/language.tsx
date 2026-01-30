import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'it' | 'de';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => Promise<void>;
  availableLanguages: { code: Language; name: string; nativeName: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@app_language';

export const availableLanguages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'it' as Language, name: 'Italian', nativeName: 'Italiano' },
  { code: 'de' as Language, name: 'German', nativeName: 'Deutsch' },
];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage && ['en', 'it', 'de'].includes(storedLanguage)) {
        const lang = storedLanguage as Language;
        setLanguage(lang);
        await i18n.changeLanguage(lang);
      }
    } catch (error) {
      console.error('Failed to load stored language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (lang: Language) => {
    try {
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguage(lang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
