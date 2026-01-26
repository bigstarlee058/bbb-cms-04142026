import { useState, useCallback } from 'react';

export const useLanguageSelection = (initialState: string[] = []) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialState);

  const handleLanguageToggle = useCallback((langKey: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(langKey)) {
        return prev.filter((l) => l !== langKey);
      } else {
        return [...prev, langKey];
      }
    });
  }, []);

  return {
    selectedLanguages,
    setSelectedLanguages,
    handleLanguageToggle
  };
};