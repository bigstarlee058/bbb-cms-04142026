export const appendToFormData = (
  formData: FormData,
  key: string,
  value: any
): void => {
  if (value === null || value === undefined) return;

  if (value instanceof File) {
    formData.append(key, value);
  } else if (typeof value === 'string' && value !== '') {
    formData.append(key, value);
  } else if (Array.isArray(value)) {
    formData.append(key, JSON.stringify(value));
  } else if (typeof value === 'object') {
    formData.append(key, JSON.stringify(value));
  } else {
    formData.append(key, String(value));
  }
};

export const buildFormDataWithImages = (
  data: Record<string, any>,
  imageFields: string[] = []
): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    const isImageField = imageFields.some(field => key === field);
    const isImageTranslation = imageFields.some(field => key === `${field}Translations`);

    if (isImageField) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'string' && value !== '') {
        formData.append(key, value);
      }
    } 
    else if (isImageTranslation && value && typeof value === 'object') {
      const jsonValue: Record<string, string> = {};
      
      Object.entries(value).forEach(([lang, file]) => {
        if (file instanceof File) {
          formData.append(`${key}[${lang}]`, file);
          jsonValue[lang] = 'FILE_UPLOAD';
        } else if (file) {
          jsonValue[lang] = file as string;
        }
      });
      
      formData.append(key, JSON.stringify(jsonValue));
    } 
    else {
      appendToFormData(formData, key, value);
    }
  });

  return formData;
};