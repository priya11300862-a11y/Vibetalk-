import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  LanguageInfo,
  translations,
} from '../i18n/translations';

interface I18nContextType {
  language: SupportedLanguage;
  currentLanguageInfo: LanguageInfo;
  availableLanguages: LanguageInfo[];
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'vibetalk_language';

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }

    // Auto-detect browser language if matches one of our supported
    const navLang = navigator.language.slice(0, 2).toLowerCase();
    const matched = SUPPORTED_LANGUAGES.find((l) => l.code === navLang);
    if (matched) {
      return matched.code;
    }
  } catch (err) {
    console.warn('Unable to access localStorage for language preference:', err);
  }
  return 'en';
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  useEffect(() => {
    // Keep html lang attribute in sync for screen readers & browser accessibility tools
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (err) {
      console.warn('Unable to save language preference:', err);
    }
    document.documentElement.lang = newLang;
  };

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (key: string, params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.en;
    let text = langDict[key] || translations.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }

    return text;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        currentLanguageInfo,
        availableLanguages: SUPPORTED_LANGUAGES,
        setLanguage,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
