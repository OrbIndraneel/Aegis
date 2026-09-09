import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../store/useUserStore';
import { en } from './translations/en';
import { hi } from './translations/hi';
import { gu } from './translations/gu';

export type LanguageCode = 'EN' | 'HI' | 'GU';

const LANGUAGE_STORAGE_KEY = '@suraksha_language';

const dictionaries: Record<LanguageCode, typeof en> = {
  EN: en,
  HI: hi,
  GU: gu,
};

/**
 * Translate a key into the active or specified language with English fallback.
 */
export function t(key: keyof typeof en, lang?: LanguageCode): string {
  const currentLang = lang || useUserStore.getState().profile.language || 'EN';
  const dict = dictionaries[currentLang] || dictionaries.EN;
  return dict[key] || dictionaries.EN[key] || key;
}

/**
 * Custom hook to get translation helper `t` and current language.
 * Re-renders automatically when `language` changes in Zustand store.
 */
export function useTranslation() {
  const language = useUserStore((state) => state.profile.language);
  const setLanguageStore = useUserStore((state) => state.setLanguage);

  const translate = (key: keyof typeof en): string => {
    const dict = dictionaries[language] || dictionaries.EN;
    return dict[key] || dictionaries.EN[key] || key;
  };

  const changeLanguage = async (newLang: LanguageCode) => {
    setLanguageStore(newLang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to persist language setting:', e);
    }
  };

  return {
    t: translate,
    language,
    changeLanguage,
  };
}

/**
 * Load saved language from AsyncStorage on app startup
 */
export async function loadSavedLanguage(): Promise<LanguageCode> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && (saved === 'EN' || saved === 'HI' || saved === 'GU')) {
      useUserStore.getState().setLanguage(saved as LanguageCode);
      return saved as LanguageCode;
    }
  } catch (e) {
    console.warn('Failed to load saved language:', e);
  }
  return 'EN';
}
