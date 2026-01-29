import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { CheckIcon } from '@heroicons/react/solid';
import { Textarea } from './Textarea';

interface WorkoutTranslatableTextareaProps {
  name: string;
  translationField?: string;
  label: string;
  selectedLanguages: string[];
  placeholder?: string;
  value: string;
  translations: Record<string, string>;
  onChange: (key: string, value: string) => void;
  hasHeight?: boolean;
}

export const WorkoutTranslatableTextarea = ({
  name,
  translationField = `${name}Translations`,
  label,
  selectedLanguages,
  placeholder,
  value,
  translations = {},
  onChange,
  hasHeight = false,
}: WorkoutTranslatableTextareaProps) => {
  const apiLanguages = useLanguageStore((state) => state.languages);
  const [activeLanguage, setActiveLanguage] = useState('en');

  useEffect(() => {
    if (activeLanguage !== 'en' && !selectedLanguages.includes(activeLanguage)) {
      setActiveLanguage('en');
    }
  }, [selectedLanguages, activeLanguage]);

  const isFieldValid = (langKey: string) => {
    const fieldValue = langKey === 'en' ? value : translations[langKey];
    return fieldValue && fieldValue.trim().length > 0;
  };

  const hasOtherLanguages = apiLanguages.length > 0;
  const hasSelectedOtherLanguages = selectedLanguages.length > 0;
  const activeLanguageData = apiLanguages.find((l) => l.key === activeLanguage);

  const currentValue = activeLanguage === 'en' ? value : (translations[activeLanguage] || '');
  const currentKey = activeLanguage === 'en' ? name : `${translationField}.${activeLanguage}`;

  return (
    <div>
      {hasOtherLanguages && hasSelectedOtherLanguages && (
        <div className="flex flex-wrap gap-2 mb-1">
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

      <Textarea
        name={currentKey}
        label={hasSelectedOtherLanguages ? '' : label}
        value={currentValue}
        onChange={onChange}
        hasHeight={hasHeight}
      />
    </div>
  );
};