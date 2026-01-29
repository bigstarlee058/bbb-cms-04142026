import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { CheckIcon } from '@heroicons/react/solid';
import { Textarea } from '@/components/Form';
import { getIn } from 'formik';

interface TranslatableTextareaProps {
  formik: any;
  name: string;
  translationField?: string;
  label: string;
  selectedLanguages: string[];
  placeholder?: string;
}

export const TranslatableTextarea = ({
  formik,
  name,
  translationField = `${name}Translations`,
  label,
  selectedLanguages,
  placeholder,
}: TranslatableTextareaProps) => {
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

    return !error && value && value.trim().length > 0;
  };

  const hasOtherLanguages = apiLanguages.length > 0;
  const hasSelectedOtherLanguages = selectedLanguages.length > 0;
  const activeLanguageData = apiLanguages.find((l) => l.key === activeLanguage);

  return (
    <div className="mb-4">
      {hasOtherLanguages && hasSelectedOtherLanguages && (
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
        <Textarea
          formik={formik}
          name={name}
          label={hasSelectedOtherLanguages ? '' : label}
          placeholder={placeholder || `${label} in English`}
        />
      ) : (
        activeLanguageData && (
          <Textarea
            formik={formik}
            name={`${translationField}.${activeLanguage}`}
            label=""
            placeholder={placeholder || `${label} in ${activeLanguageData.name}`}
          />
        )
      )}
    </div>
  );
};