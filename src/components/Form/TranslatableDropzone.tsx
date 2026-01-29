import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { CheckIcon } from '@heroicons/react/solid';
import { getIn } from 'formik';
import { Dropzone } from '@/components/Form';

interface TranslatableDropzoneProps {
  formik: any;
  name: string;
  translationField?: string;
  label: string;
  selectedLanguages: string[];
}

export const TranslatableDropzone = ({
  formik,
  name,
  translationField = `${name}Translations`,
  label,
  selectedLanguages,
}: TranslatableDropzoneProps) => {
  const apiLanguages = useLanguageStore((state) => state.languages);
  const [activeLanguage, setActiveLanguage] = useState('en');

  useEffect(() => {
    if (activeLanguage !== 'en' && !selectedLanguages.includes(activeLanguage)) {
      setActiveLanguage('en');
    }
  }, [selectedLanguages, activeLanguage]);

  const isFieldValid = (langKey: string) => {
    let value, error;

    if (langKey === 'en') {
      value = getIn(formik.values, name);
      error = getIn(formik.errors, name);
    } else {
      value = getIn(formik.values, `${translationField}.${langKey}`);
      error = getIn(formik.errors, `${translationField}.${langKey}`);
    }
    return !error && value && (typeof value === 'string' || value instanceof File);
  };

  const hasSelectedOtherLanguages = selectedLanguages.length > 0;
  const activeLanguageData = apiLanguages.find((l) => l.key === activeLanguage);
  const handleEnglishDrop = (file: File) => {
    formik.setFieldValue(name, file);
  };

  const handleEnglishDelete = () => {
    formik.setFieldValue(name, '');
    formik.setFieldValue('deleteImage', true);
  };
  const handleTranslationDrop = (langKey: string) => (file: File) => {
    formik.setFieldValue(`${translationField}.${langKey}`, file);
  };

  const handleTranslationDelete = (langKey: string) => () => {
    formik.setFieldValue(`${translationField}.${langKey}`, '');
    const deleteField = `delete${translationField.charAt(0).toUpperCase() + translationField.slice(1)}`;
    const currentDeleteState = formik.values[deleteField] || {};
    formik.setFieldValue(deleteField, {
      ...currentDeleteState,
      [langKey]: true
    });
  };

  return (
    <div className="mb-4">
      {hasSelectedOtherLanguages && (
        <div className="flex flex-wrap gap-2 mb-2">
          <label
            className={`inline-flex items-center px-2 py-1 rounded text-xs cursor-pointer transition-all border ${
              activeLanguage === 'en'
                ? 'bg-bbb border-bbb text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              checked={activeLanguage === 'en'}
              onChange={() => setActiveLanguage('en')}
              className="sr-only"
            />
            <span className="font-medium">{label} (EN)</span>
            {isFieldValid('en') && (
              <CheckIcon
                className={`h-3 w-3 ml-1 ${
                  activeLanguage === 'en' ? 'text-white' : 'text-green-600'
                }`}
              />
            )}
          </label>

          {selectedLanguages.map((langKey) => {
            const lang = apiLanguages.find((l) => l.key === langKey);
            if (!lang) return null;

            return (
              <label
                key={langKey}
                className={`inline-flex items-center px-2 py-1 rounded text-xs cursor-pointer transition-all border ${
                  activeLanguage === langKey
                    ? 'bg-bbb border-bbb text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  checked={activeLanguage === langKey}
                  onChange={() => setActiveLanguage(langKey)}
                  className="sr-only"
                />
                <span className="font-medium">
                  {label} ({lang.key.toUpperCase()})
                </span>
                {isFieldValid(langKey) && (
                  <CheckIcon
                    className={`h-3 w-3 ml-1 ${
                      activeLanguage === langKey ? 'text-white' : 'text-green-600'
                    }`}
                  />
                )}
              </label>
            );
          })}
        </div>
      )}

      {activeLanguage === 'en' ? (
        <Dropzone
          formik={formik}
          key={"en"}
          name={name}
          label={hasSelectedOtherLanguages ? '' : label}
          defaultImg={typeof formik.values[name] === 'string' ? formik.values[name] : ''}
          onDrop={handleEnglishDrop}
          onDelete={handleEnglishDelete}
          file={formik.values[name] instanceof File ? formik.values[name] : undefined}
        />
      ) : (
        activeLanguageData && (
          <Dropzone
            formik={formik}
            key={activeLanguage}
            name={`${translationField}.${activeLanguage}`}
            label=""
            defaultImg={
              typeof getIn(formik.values, `${translationField}.${activeLanguage}`) === 'string'
                ? getIn(formik.values, `${translationField}.${activeLanguage}`)
                : ''
            }
            onDrop={handleTranslationDrop(activeLanguage)}
            onDelete={handleTranslationDelete(activeLanguage)}
            file={
              getIn(formik.values, `${translationField}.${activeLanguage}`) instanceof File
                ? getIn(formik.values, `${translationField}.${activeLanguage}`)
                : undefined
            }
          />
        )
      )}
    </div>
  );
};