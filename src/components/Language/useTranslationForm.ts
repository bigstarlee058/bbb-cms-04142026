import { useState, useCallback } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { getTranslationsKey } from './utils';

type TranslationFormData = {
  [field: string]: Record<string, string>;
};

interface UseTranslationFormConfig {
  translatableFields: string[];
  initialData?: Record<string, any>;
}

export const useTranslationForm = ({
  translatableFields,
  initialData = {},
}: UseTranslationFormConfig) => {
  const allLanguages = useLanguageStore((state) => state.languages);

  const getInitialSelectedLanguages = (): string[] => {
    const langs = new Set<string>();
    translatableFields.forEach((field) => {
      const translationsKey = getTranslationsKey(field);
      const fieldTranslations = initialData[translationsKey];
      if (fieldTranslations) {
        Object.keys(fieldTranslations).forEach((langKey) => {
          if (fieldTranslations[langKey]) {
            langs.add(langKey);
          }
        });
      }
    });
    return Array.from(langs);
  };

  const getInitialTranslations = (): TranslationFormData => {
    const initial: TranslationFormData = {};
    translatableFields.forEach((field) => {
      const translationsKey = getTranslationsKey(field);
      initial[field] = initialData[translationsKey] || {};
    });
    return initial;
  };

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(getInitialSelectedLanguages);
  const [activeEditLang, setActiveEditLang] = useState<string | null>(null);
  const [translations, setTranslations] = useState<TranslationFormData>(getInitialTranslations);

  const toggleLanguage = useCallback((langKey: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(langKey)) {
        if (activeEditLang === langKey) {
          setActiveEditLang(null);
        }
        return prev.filter((l) => l !== langKey);
      }
      return [...prev, langKey];
    });
  }, [activeEditLang]);

  const updateTranslation = useCallback((field: string, langKey: string, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [langKey]: value,
      },
    }));
  }, []);

  const getTranslation = useCallback((field: string, langKey: string): string => {
    return translations[field]?.[langKey] || '';
  }, [translations]);

  const clearLanguageTranslations = useCallback((langKey: string) => {
    setTranslations((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((field) => {
        if (updated[field][langKey]) {
          const { [langKey]: _, ...rest } = updated[field];
          updated[field] = rest;
        }
      });
      return updated;
    });
  }, []);

  const getFormattedTranslations = useCallback(() => {
    const formatted: Record<string, Record<string, string>> = {};
    
    translatableFields.forEach((field) => {
      const translationsKey = getTranslationsKey(field);
      const fieldTranslations: Record<string, string> = {};
      
      selectedLanguages.forEach((langKey) => {
        const value = translations[field]?.[langKey];
        if (value) {
          fieldTranslations[langKey] = value;
        }
      });
      
      if (Object.keys(fieldTranslations).length > 0) {
        formatted[translationsKey] = fieldTranslations;
      }
    });
    
    return formatted;
  }, [translations, selectedLanguages, translatableFields]);

  return {
    selectedLanguages,
    toggleLanguage,
    setSelectedLanguages,
    activeEditLang,
    setActiveEditLang,
    translations,
    updateTranslation,
    getTranslation,
    clearLanguageTranslations,
    getFormattedTranslations,
    allLanguages,
  };
};