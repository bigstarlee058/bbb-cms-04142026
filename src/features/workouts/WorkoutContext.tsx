import React, { createContext, useState, ReactNode } from "react";
import { Month } from "@/types";

// Define the context type
interface WorkoutContextType {
  months: Month[];
  onSetMonths: (months: Month[]) => void;
}

// Create the context with a default value
const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
}

// Create the provider component
export const WorkoutContextProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [months, setMonths] = useState<Month[]>([]);

  const onSetMonths = (months: Month[]) => {
    setMonths(months)
  }

  return (
    <WorkoutContext.Provider value={{ months, onSetMonths }}>
      {children}
    </WorkoutContext.Provider>
  );
};

// Custom hook to use the WorkoutContext
export const useWorkoutContext = (): WorkoutContextType => {
  const context = React.useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkoutContext must be used within a WorkoutProvider");
  }
  return context;
};