export type TranslationMap = Record<string, string>;

export type TranslatableEntity = {
  [key: string]: any;
};

export const getTranslationsKey = (field: string): string => {
  return `${field}Translations`;
};

export const extractAvailableLanguages = (
  entity: TranslatableEntity,
  translatableFields: string[],
  allLanguages: Array<{ key: string; name: string }>
): Array<{ key: string; name: string }> => {
  if (!translatableFields.length) return [];
  
  return allLanguages.filter((lang) => {
    return translatableFields.some((field) => {
      const transMap = entity[getTranslationsKey(field)];
      return transMap && transMap[lang.key];
    });
  });
};

export const getTranslatedValue = <T>(
  entity: TranslatableEntity,
  field: string,
  selectedLang: string | null
): T | null => {
  const baseValue = entity[field];
  if (!selectedLang) return baseValue;
  
  const translations = entity[getTranslationsKey(field)];
  return translations?.[selectedLang] ?? baseValue;
};