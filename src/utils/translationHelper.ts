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

export const cleanupNestedTranslations = (
  data: any,
  selectedLanguages: string[]
): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  if (data instanceof File) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => cleanupNestedTranslations(item, selectedLanguages));
  }

  const cleaned = { ...data };

  Object.keys(cleaned).forEach(key => {
    if (key.endsWith('Translations')) {
      const translations = cleaned[key];
      if (translations && typeof translations === 'object') {
        cleaned[key] = Object.keys(translations).reduce((acc, lang) => {
          if (selectedLanguages.includes(lang)) {
            acc[lang] = translations[lang];
          }
          return acc;
        }, {} as Record<string, any>);
      }
    } else if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
      cleaned[key] = cleanupNestedTranslations(cleaned[key], selectedLanguages);
    }
  });

  return cleaned;
};