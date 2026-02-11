import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { CheckIcon } from '@heroicons/react/solid';
import { Dropzone } from '@/components/Form';

interface WorkoutTranslatableDropzoneProps {
  name: string;
  translationField?: string;
  label: string;
  selectedLanguages: string[];
  value: string | File | null;
  translations: Record<string, string | File>;
  onChange: (key: string, value: string | File | null) => void;
  onDelete?: (key: string) => void;
}

export const WorkoutTranslatableDropzone = ({
  name,
  translationField = `${name}Translations`,
  label,
  selectedLanguages,
  value,
  translations = {},
  onChange,
  onDelete
}: WorkoutTranslatableDropzoneProps) => {
  const apiLanguages = useLanguageStore((state) => state.languages);
  const [activeLanguage, setActiveLanguage] = useState('en');

  useEffect(() => {
    if (activeLanguage !== 'en' && !selectedLanguages.includes(activeLanguage)) {
      setActiveLanguage('en');
    }
  }, [selectedLanguages, activeLanguage]);

  const isFieldValid = (langKey: string) => {
    const fieldValue = langKey === 'en' ? value : translations[langKey];
    return fieldValue && (typeof fieldValue === 'string' || fieldValue instanceof File);
  };

  const handleDrop = (droppedFile: File) => {
    const currentKey = activeLanguage === 'en' ? name : `${translationField}.${activeLanguage}`;
    onChange(currentKey, droppedFile);
  };

  const handleDelete = () => {
    const currentKey = activeLanguage === 'en' ? name : `${translationField}.${activeLanguage}`;
    onChange(currentKey, '');
    if (onDelete) {
        onDelete(currentKey);
    }
  };

  const hasOtherLanguages = apiLanguages.length > 0;
  const hasSelectedOtherLanguages = selectedLanguages.length > 0;
  const currentImage = activeLanguage === 'en' ? value : translations[activeLanguage];
  const currentFieldName = activeLanguage === 'en' ? name : `${translationField}.${activeLanguage}`;

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

      <Dropzone
        key={currentFieldName}
        name={currentFieldName}
        label={hasSelectedOtherLanguages ? '' : label}
        defaultImg={typeof currentImage === 'string' ? currentImage : ''}
        file={currentImage instanceof File ? currentImage : undefined}
        onDrop={handleDrop}
        onDelete={handleDelete}
        formik={{ values: {}, errors: {}, touched: {} } as any}
      />
    </div>
  );
};