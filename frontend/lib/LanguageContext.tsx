'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { en, LocaleKeys } from './locales/en';
import { hi } from './locales/hi';
import { te } from './locales/te';

export type LanguageCode = 'en' | 'hi' | 'te';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
];

const LOCALES: Record<LanguageCode, Record<LocaleKeys, string>> = {
  en,
  hi,
  te,
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: LocaleKeys) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => en[key] || key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    // Website always starts in English ('en') by default on load
    setLanguageState('en');
    if (typeof window !== 'undefined') {
      localStorage.setItem('prism_language', 'en');
    }
  }, []);



  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('prism_language', lang);
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    }
  };

  const t = (key: LocaleKeys): string => {
    const dict = LOCALES[language] || en;
    return dict[key] || en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
