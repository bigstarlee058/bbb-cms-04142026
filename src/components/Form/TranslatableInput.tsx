import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { CheckIcon } from '@heroicons/react/solid';
import { Field } from '@/components/Form';
import { getIn } from 'formik';

interface TranslatableInputProps {
  formik: any;
  name: string;
  translationField?: string;
  label: string;
  selectedLanguages: string[];
  placeholder?: string;
  type?: 'text' | 'textarea';
}

export const TranslatableInput = ({
  formik,
  name,
  translationField = `${name}Translations`,
  label,
  selectedLanguages,
  placeholder,
  type = 'text',
}: TranslatableInputProps) => {
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
    <div >
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
        <Field
          formik={formik}
          name={name}
          label={hasSelectedOtherLanguages ? '' : label}
          placeholder={placeholder || `${label} ${selectedLanguages.length>0?"English":""}`}
          type={type}
        />
      ) : (
        activeLanguageData && (
          <Field
            formik={formik}
            name={`${translationField}.${activeLanguage}`}
            label=""
            placeholder={placeholder || `${label} ${activeLanguageData.name}`}
            type={type}
          />
        )
      )}
    </div>
  );
};