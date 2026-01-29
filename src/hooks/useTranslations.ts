import { useState, useCallback } from 'react';

interface UseTranslationsOptions {
  translationFields: string[];
}

interface UseTranslationsReturn {
  selectedLanguages: string[];
  handleLanguageToggle: (langKey: string) => void;
  setSelectedLanguages: (languages: string[]) => void;
  getFilteredTranslations: (values: any, fillFromEnglish?: boolean) => Record<string, Record<string, any>>;
  validateTranslations: (values: any) => any;
  resetLanguages: () => void;
}

export const useTranslations = ({
  translationFields = [],
}: UseTranslationsOptions): UseTranslationsReturn => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const handleLanguageToggle = useCallback((langKey: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(langKey)
        ? prev.filter((l) => l !== langKey)
        : [...prev, langKey]
    );
  }, []);

  const resetLanguages = useCallback(() => {
    setSelectedLanguages([]);
  }, []);

  const isValidValue = (value: any): boolean => {
    if (!value) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (value instanceof File) return value.size > 0;
    return true;
  };

  const validateTranslations = useCallback(
    (values: any) => {
      const errors: any = {};

      translationFields.forEach((field) => {
        const translationKey = `${field}Translations`;
        selectedLanguages.forEach((langKey) => {
          const value = values[translationKey]?.[langKey];
          if (!isValidValue(value)) {
            if (!errors[translationKey]) {
              errors[translationKey] = {};
            }
            errors[translationKey][langKey] = `${field} is required`;
          }
        });
      });

      return errors;
    },
    [selectedLanguages, translationFields]
  );

  const getFilteredTranslations = useCallback(
    (values: any, fillFromEnglish: boolean = false) => {
      const result: Record<string, any> = {};

      translationFields.forEach((field) => {
        if (field === 'slides') {
          if (Array.isArray(values.slides)) {
            result.slidesTranslations = values.slides.map((slide: any) => {
              const titleTranslations: Record<string, string> = {};
              selectedLanguages.forEach((langKey) => {
                const value = slide.titleTranslations?.[langKey];
                if (value && typeof value === 'string' && value.trim()) {
                  titleTranslations[langKey] = value;
                } else if (fillFromEnglish) {
                  titleTranslations[langKey] = slide.title || '';
                }
              });

              const descriptionTranslations: Record<string, string> = {};
              selectedLanguages.forEach((langKey) => {
                const value = slide.descriptionTranslations?.[langKey];
                if (value && typeof value === 'string' && value.trim()) {
                  descriptionTranslations[langKey] = value;
                } else if (fillFromEnglish) {
                  descriptionTranslations[langKey] = slide.description || '';
                }
              });

              return {
                title: slide.title || '',
                description: slide.description || '',
                titleTranslations,
                descriptionTranslations,
              };
            });
          } else {
            result.slidesTranslations = [];
          }
        } else {
          const translationKey = `${field}Translations`;
          const filteredTranslations: Record<string, any> = {};

          selectedLanguages.forEach((langKey) => {
            const value = values[translationKey]?.[langKey];
            
            if (isValidValue(value)) {
              filteredTranslations[langKey] = value;
            } else if (fillFromEnglish && values[field]) {
              filteredTranslations[langKey] = values[field];
            }
          });

          result[translationKey] = filteredTranslations;
        }
      });

      return result;
    },
    [selectedLanguages, translationFields]
  );

  return {
    selectedLanguages,
    handleLanguageToggle,
    setSelectedLanguages,
    getFilteredTranslations,
    validateTranslations,
    resetLanguages,
  };
};