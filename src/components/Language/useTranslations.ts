import { useState, useMemo, useCallback } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { extractAvailableLanguages, getTranslatedValue, TranslatableEntity } from './utils';

interface UseTranslationsConfig {
  entity: TranslatableEntity;
  translatableFields: string[];
  initialLang?: string | null;
}

export const useTranslations = <T extends TranslatableEntity>({
  entity,
  translatableFields,
  initialLang = null,
}: UseTranslationsConfig) => {
  const [selectedLang, setSelectedLang] = useState<string | null>(initialLang);
  const allLanguages = useLanguageStore((state) => state.languages);

  const availableLanguages = useMemo(
    () => extractAvailableLanguages(entity, translatableFields, allLanguages),
    [entity, translatableFields, allLanguages]
  );

  const getValue = useCallback(
    <K extends keyof T>(field: K): T[K] => {
      return getTranslatedValue<T[K]>(entity, field as string, selectedLang) as T[K];
    },
    [entity, selectedLang]
  );

  const resetLanguage = useCallback(() => {
    setSelectedLang(null);
  }, []);

  return {
    selectedLang,
    setSelectedLang,
    getValue,
    availableLanguages,
    hasTranslations: availableLanguages.length > 0,
    allLanguages,
    resetLanguage,
  };
};