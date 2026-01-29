interface PrepareTranslationsOptions {
  values: Record<string, any>;
  translations: Record<string, any>;
  selectedLanguages: string[];
  textFields?: string[];
  imageFields?: string[];
}

export const prepareTranslations = ({
  values,
  translations,
  selectedLanguages,
  textFields = [],
  imageFields = [],
}: PrepareTranslationsOptions): Record<string, any> => {
  if (selectedLanguages.length === 0) return translations;

  const allFields = [...textFields, ...imageFields];
  const result = { ...translations };

  allFields.forEach(field => {
    const key = `${field}Translations`;
    const fieldTranslations = result[key] || {};
    const isImageField = imageFields.includes(field);

    selectedLanguages.forEach(lang => {
      const hasValue = isImageField 
        ? !!fieldTranslations[lang]
        : fieldTranslations[lang]?.trim?.();

      if (!hasValue && values[field]) {
        fieldTranslations[lang] = values[field];
      }
    });

    result[key] = fieldTranslations;
  });

  return result;
};