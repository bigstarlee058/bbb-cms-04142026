import React, { createContext, useState, ReactNode } from "react";
import { Day } from "@/types";

// Define the context type
interface PumpDaysContextType {
  days: Day[];
  onSetDays: (months: Day[]) => void;
  selectedLanguagesByDay: Record<string, string[]>;
  setSelectedLanguagesForDay: (dayLocalId: string, langs: string[]) => void;
  handleLanguageToggleForDay: (dayLocalId: string, langKey: string) => void;
}

// Create the context with a default value
const PumpDaysContext = createContext<PumpDaysContextType | undefined>(undefined);

interface PumpDaysProviderProps {
  children: ReactNode;
}

// Create the provider component
export const PumpDaysContextProvider: React.FC<PumpDaysProviderProps> = ({ children }) => {
  const [days, setDays] = useState<Day[]>([]);

  const onSetDays = (d: Day[]) => {
    setDays(d)
  }
  const [selectedLanguagesByDay, setSelectedLanguagesByDay] = useState<Record<string, string[]>>({});

  const setSelectedLanguagesForDay = (dayLocalId: string, langs: string[]) => {
    setSelectedLanguagesByDay(prev => ({
      ...prev,
      [dayLocalId]: langs
    }));
  };

  const handleLanguageToggleForDay = (dayLocalId: string, langKey: string) => {
    setSelectedLanguagesByDay(prev => {
      const current = prev[dayLocalId] || [];
      const updated = current.includes(langKey)
        ? current.filter(k => k !== langKey)
        : [...current, langKey];

      return {
        ...prev,
        [dayLocalId]: updated
      };
    });
  };
  return (
    <PumpDaysContext.Provider value={{
      days,
      onSetDays,
      selectedLanguagesByDay,
      setSelectedLanguagesForDay,
      handleLanguageToggleForDay
    }}>
      {children}
    </PumpDaysContext.Provider>
  );
};

// Custom hook to use the PumpDaysContext
export const usePumpDaysContext = (): PumpDaysContextType => {
  const context = React.useContext(PumpDaysContext);
  if (!context) {
    throw new Error("usePumpDaysContext must be used within a PumpDaysProvider");
  }
  return context;
};