# Internationalization (i18n) Guide

This app now supports multiple languages using i18next and react-i18next.

## Supported Languages

- **English** (en) - Default
- **Italiano** (it) - Italian
- **Deutsch** (de) - German

## How to Use

### 1. In React Components

Import the `useTranslation` hook and use the `t` function to translate strings:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <Text>{t('welcome.appName')}</Text>;
}
```

### 2. Language Switcher Component

The `LanguageSwitcher` component is available for users to change their language preference:

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

function MyScreen() {
  return (
    <View>
      <LanguageSwitcher />
      {/* Your other components */}
    </View>
  );
}
```

### 3. Using the Language Context

Access the current language and change it programmatically:

```tsx
import { useLanguage } from '@/contexts/language';

function MyComponent() {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  
  // Current language code (e.g., 'en', 'it', 'de')
  console.log(language);
  
  // Change language
  await changeLanguage('it');
  
  // Get all available languages
  console.log(availableLanguages);
}
```

## Adding Translations

### Step 1: Add to Translation Files

Add your new translation keys to all language files in the `locales/` directory:

**locales/en.json**
```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is my feature"
  }
}
```

**locales/it.json**
```json
{
  "myFeature": {
    "title": "La Mia Funzionalità",
    "description": "Questa è la mia funzionalità"
  }
}
```

**locales/de.json**
```json
{
  "myFeature": {
    "title": "Meine Funktion",
    "description": "Das ist meine Funktion"
  }
}
```

### Step 2: Use in Your Component

```tsx
import { useTranslation } from 'react-i18next';

function MyFeature() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('myFeature.title')}</Text>
      <Text>{t('myFeature.description')}</Text>
    </View>
  );
}
```

## Adding More Languages

To add a new language:

1. Create a new JSON file in `locales/` (e.g., `locales/fr.json` for French)
2. Add translations following the same structure as existing files
3. Update `lib/i18n.ts` to import and register the new language:

```typescript
import fr from '../locales/fr.json';

const resources = {
  en: { translation: en },
  it: { translation: it },
  de: { translation: de },
  fr: { translation: fr }, // Add new language
};
```

4. Update `contexts/language.tsx` to include the new language:

```typescript
export const availableLanguages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'it' as Language, name: 'Italian', nativeName: 'Italiano' },
  { code: 'de' as Language, name: 'German', nativeName: 'Deutsch' },
  { code: 'fr' as Language, name: 'French', nativeName: 'Français' }, // Add here
];
```

5. Update the `Language` type in `contexts/language.tsx`:

```typescript
export type Language = 'en' | 'it' | 'de' | 'fr';
```

## Language Persistence

The user's language preference is automatically saved to AsyncStorage and will persist across app restarts.

## Features

- ✅ Three languages supported (English, Italian, German)
- ✅ Automatic language persistence
- ✅ Easy-to-use language switcher UI
- ✅ Fallback to English if translation is missing
- ✅ Context-based language management
- ✅ Type-safe translation keys

## Current Implementation

The following screens are fully localized:
- ✅ Authentication page (`app/auth-page.tsx`)
- ✅ Home screen (`app/home.tsx`)
- ✅ Profile screen (`app/(tabs)/profile.tsx`)
- ✅ Settings screen (`app/settings.tsx`)
- ✅ Library screen (`app/(tabs)/library.tsx`)
- ✅ Start Learning screen (`app/start-learning.tsx`)
- ✅ Upload PDF screen (`app/upload-pdf.tsx`)
- ✅ Not Found page (`app/+not-found.tsx`)

The language switcher is integrated into:
- Authentication page (top-right corner)
- Profile page (settings menu)

For a complete overview of the localization, see `docs/localization-summary.md`.
