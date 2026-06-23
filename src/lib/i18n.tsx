import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'fa';
export type Translatable = string | { en: string; fa: string };

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (str: Translatable, ...args: (string | number)[]) => string;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      return (localStorage.getItem('fitpro_lang') as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('fitpro_lang', newLang);
    } catch {}
  };

  const isRtl = lang === 'fa';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    if (isRtl) {
      document.documentElement.classList.add('farsi-font');
    } else {
      document.documentElement.classList.remove('farsi-font');
    }
  }, [lang, isRtl]);

  const t = (str: Translatable, ...args: (string | number)[]) => {
    let result = typeof str === 'string' ? str : (str[lang] || str.en || '');
    args.forEach((arg, i) => {
      result = result.replace(new RegExp(`\\{${i}\\}`, 'g'), String(arg));
    });
    return result;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
