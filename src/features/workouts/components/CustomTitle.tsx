import { useEffect, useRef, useState } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { CheckIcon } from '@heroicons/react/solid';

export const CustomTitle = ({ 
  type, 
  index, 
  customTitle, 
  updateFunction, 
  isPumpDay = false,
  titleTranslations = {},
  selectedLanguages = [],
  translationField = 'titleTranslations'
}) => {
  const apiLanguages = useLanguageStore((state) => state.languages);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const currentValue = activeLanguage === 'en' ? customTitle : (titleTranslations[activeLanguage] || '');
    setTitle(currentValue);
  }, [activeLanguage, customTitle, titleTranslations]);

  useEffect(() => {
    if (activeLanguage !== 'en' && !selectedLanguages.includes(activeLanguage)) {
      setActiveLanguage('en');
    }
  }, [selectedLanguages, activeLanguage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        saveTitle();
      }
    };

    if (editingTitle) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingTitle, title, activeLanguage]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const saveTitle = () => {
    const key = activeLanguage === 'en' ? 'title' : `${translationField}.${activeLanguage}`;
    updateFunction(key, title);
    setEditingTitle(false);
    setActiveLanguage('en');
  };

  const handleLanguageChange = (langKey) => {
    const currentKey = activeLanguage === 'en' ? 'title' : `${translationField}.${activeLanguage}`;
    updateFunction(currentKey, title);
    setActiveLanguage(langKey);
  };

  useEffect(() => {
    if(editingTitle && inputRef.current)
      inputRef.current.focus();
  }, [editingTitle]);

  const isFieldValid = (langKey) => {
    const fieldValue = langKey === 'en' ? customTitle : titleTranslations[langKey];
    return fieldValue && fieldValue.trim().length > 0;
  };

  const hasOtherLanguages = apiLanguages.length > 0;
  const hasSelectedOtherLanguages = selectedLanguages.length > 0;

  const displayValue = activeLanguage === 'en' ? customTitle : (titleTranslations[activeLanguage] || customTitle);

  return (
    <div className="mb-2" ref={containerRef}>
      {editingTitle && hasOtherLanguages && hasSelectedOtherLanguages && (
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
              onChange={() => handleLanguageChange('en')}
              className="sr-only"
            />
            <span className="font-medium">Title (EN)</span>
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
                  onChange={() => handleLanguageChange(langKey)}
                  className="sr-only"
                />
                <span className="font-medium">
                  Title ({lang.key.toUpperCase()})
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

      <div className="flex justify-between items-center">
        <h2 className="text-md font-bold">
          {!isPumpDay && `${type} ${index && index}`}
          {editingTitle ? (
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
              className={`${!isPumpDay && "ml-7"} border rounded px-2 py-1`}
              ref={inputRef}
            />
          ) : (
            <span className= {`${!isPumpDay && "ml-7"} cursor-pointer`} onClick={() => setEditingTitle(true)}>
              {displayValue || 'Custom Title Here'}
            </span>
          )}
        </h2>
      </div>
    </div>
  );
};