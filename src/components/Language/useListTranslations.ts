import { useState, useMemo, useCallback } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { getTranslationsKey } from './utils';

interface UseListTranslationsConfig {
  data: any[] | undefined;
  translatableFields: string[];
}

export const useListTranslations = ({
  data,
  translatableFields,
}: UseListTranslationsConfig) => {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const languages = useLanguageStore((state) => state.languages);

  const availableLanguages = useMemo(() => {
    if (!data?.length) return [];
    return languages.filter((lang) =>
      lang.inUse &&
      data.some((item) =>
        translatableFields.some((field) => {
          const translations = item[getTranslationsKey(field)];
          return translations?.[lang.key];
        })
      )
    );
  }, [data, languages, translatableFields]);

  const getValue = useCallback(
    (item: any, field: string) => {
      if (!selectedLang) return item[field];
      const translations = item[getTranslationsKey(field)];
      return translations?.[selectedLang] || item[field];
    },
    [selectedLang]
  );

  return {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations: availableLanguages.length > 0,
    getValue,
  };
};