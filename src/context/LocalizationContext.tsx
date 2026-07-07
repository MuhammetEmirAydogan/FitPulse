import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';
import { Language } from '../types';

const supportedLanguages: Language[] = ['en', 'es', 'de', 'fr', 'zh', 'tr'];

const localeFiles: Record<Language, any> = {
  en: require('../locales/en.json'),
  tr: require('../locales/tr.json'),
  de: require('../locales/de.json'),
  es: require('../locales/es.json'),
  fr: require('../locales/fr.json'),
  zh: require('../locales/zh.json'),
};

const LANG_KEY = 'fitpulse-lang';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('tr');
  const [translations, setTranslations] = useState<Record<string, string>>(localeFiles['tr']);
  const [isLoading, setIsLoading] = useState(true);

  // Dili uygula (state + translations)
  const applyLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setTranslations(localeFiles[lang]);
  }, []);

  // İlk yükleme: önce AsyncStorage (hızlı), sonra Firestore (güncel)
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        // AsyncStorage'dan hemen yükle — uygulama hızlı açılsın
        const stored = await AsyncStorage.getItem(LANG_KEY);
        if (stored && supportedLanguages.includes(stored as Language)) {
          applyLanguage(stored as Language);
        }
      } catch (e) { }
      finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, [applyLanguage]);

  // Auth durumu değişince Firestore'dan dil tercihini çek
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const firestoreLang = userDoc.data()?.settings?.language;
          if (firestoreLang && supportedLanguages.includes(firestoreLang as Language)) {
            applyLanguage(firestoreLang as Language);
            // AsyncStorage'ı da güncelle
            await AsyncStorage.setItem(LANG_KEY, firestoreLang);
          }
        }
      } catch (e) { }
    });
    return () => unsubscribe();
  }, [applyLanguage]);

  // Dil değiştir: AsyncStorage + Firestore + state
  const setLanguage = useCallback(async (lang: Language) => {
    applyLanguage(lang);

    // AsyncStorage — hızlı yerel kayıt
    try {
      await AsyncStorage.setItem(LANG_KEY, lang);
    } catch (e) { }

    // Firestore — bulut senkronizasyonu
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      try {
        await setDoc(
          doc(db, 'users', firebaseUser.uid),
          { settings: { language: lang }, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch (e) {
        console.error('Dil tercihi Firestore kayıt hatası:', e);
      }
    }
  }, [applyLanguage]);

  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    let translation = translations[key] || key;
    if (options) {
      Object.entries(options).forEach(([optKey, value]) => {
        translation = translation.replace(new RegExp(`{${optKey}}`, 'g'), String(value));
      });
    }
    return translation;
  }, [translations]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  if (isLoading) return null;

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) throw new Error('useLocalization must be used within LocalizationProvider');
  return context;
};
