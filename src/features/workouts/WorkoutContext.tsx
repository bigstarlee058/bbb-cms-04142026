import React, { createContext, useState, ReactNode } from "react";
import { Month } from "@/types";

interface WorkoutContextType {
  months: Month[];
  onSetMonths: (months: Month[]) => void;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  selectedLanguagesByMonth: Record<string, string[]>;
  setSelectedLanguagesForMonth: (monthLocalId: string, langs: string[]) => void;
  handleLanguageToggleForMonth: (monthLocalId: string, langKey: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
}

export const WorkoutContextProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [months, setMonths] = useState<Month[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [selectedLanguagesByMonth, setSelectedLanguagesByMonth] = useState<Record<string, string[]>>({});

  const onSetMonths = (months: Month[]) => {
    setMonths(months);
  };

  const setSelectedLanguagesForMonth = (monthLocalId: string, langs: string[]) => {
    setSelectedLanguagesByMonth(prev => ({
      ...prev,
      [monthLocalId]: langs
    }));
  };

  const handleLanguageToggleForMonth = (monthLocalId: string, langKey: string) => {
    setSelectedLanguagesByMonth(prev => {
      const current = prev[monthLocalId] || [];
      const updated = current.includes(langKey)
        ? current.filter(k => k !== langKey)
        : [...current, langKey];
      
      return {
        ...prev,
        [monthLocalId]: updated
      };
    });
  };

  return (
    <WorkoutContext.Provider value={{ 
      months, 
      onSetMonths, 
      selectedLang, 
      setSelectedLang,
      selectedLanguagesByMonth,
      setSelectedLanguagesForMonth,
      handleLanguageToggleForMonth
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkoutContext = (): WorkoutContextType => {
  const context = React.useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkoutContext must be used within a WorkoutProvider");
  }
  return context;
};