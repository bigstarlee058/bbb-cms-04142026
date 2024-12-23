import React, { createContext, useState, ReactNode } from "react";
import { Day } from "@/types";

// Define the context type
interface PumpDaysContextType {
  days: Day[];
  onSetDays: (months: Day[]) => void;
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

  return (
    <PumpDaysContext.Provider value={{ days, onSetDays }}>
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