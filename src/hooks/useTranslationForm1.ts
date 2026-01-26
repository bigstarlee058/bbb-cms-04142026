import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import { fetchLanguages } from '@/lib/api'
import { useLanguageStore } from '@/stores/languages';

export const useTranslationForm = (initialTranslations: Record<string, string> = {}) => {
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages, {
    staleTime: Infinity,
  });
  const setLanguages = useLanguageStore((state) => state.setLanguages);

  useEffect(() => {
    if (fetchedLanguages.length > 0) setLanguages(fetchedLanguages);
  }, [fetchedLanguages, setLanguages]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const handleLanguageToggle = useCallback((langKey: string) => {
    setSelectedLanguages((prev) => 
      prev.includes(langKey) ? prev.filter((l) => l !== langKey) : [...prev, langKey]
    );
  }, []);

  useEffect(() => {
    if (initialTranslations && Object.keys(initialTranslations).length > 0) {
      const existing = Object.keys(initialTranslations).filter(
        (key) => initialTranslations[key]?.trim()
      );
      if (existing.length > 0) setSelectedLanguages(existing);
    }
  }, [initialTranslations]);

  const validateTranslationField = (values: any, fieldName: string = 'titleTranslations') => {
    const errors: any = {};
    selectedLanguages.forEach((langKey) => {
      if (!values[fieldName]?.[langKey]?.trim()) {
        if (!errors[fieldName]) errors[fieldName] = {};
        errors[fieldName][langKey] = 'This field is required';
      }
    });
    return errors;
  };

  const getCleanTranslations = (values: any, fieldName: string = 'titleTranslations') => {
    const cleaned: Record<string, string> = {};
    selectedLanguages.forEach((langKey) => {
      if (values[fieldName]?.[langKey]) {
        cleaned[langKey] = values[fieldName][langKey];
      }
    });
    return cleaned;
  };

  return {
    selectedLanguages,
    handleLanguageToggle,
    validateTranslationField,
    getCleanTranslations,
    setSelectedLanguages
  };
};