import { createContext, useContext, useState } from 'react';
import zh from './zh.js';
import en from './en.js';

const translations = { zh, en };

export const LangContext = createContext({ lang: 'zh', setLang: () => {}, t: () => '' });

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('uno_lang') || 'zh');

  function t(key) {
    return translations[lang]?.[key] ?? translations.en[key] ?? key;
  }

  function switchLang(l) {
    setLang(l);
    localStorage.setItem('uno_lang', l);
  }

  return (
    <LangContext.Provider value={{ lang, setLang: switchLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
