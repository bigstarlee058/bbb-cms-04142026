import React, { createContext, useState, ReactNode } from "react";
import { Month } from "@/types";

// Define the context type
interface WorkoutContextType {
  originMonths: Month[];
  setOriginMonths: React.Dispatch<React.SetStateAction<Month[]>>;
}

// Create the context with a default value
const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
}

// Create the provider component
const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [originMonths, setOriginMonths] = useState<Month[]>([]);

  return (
    <WorkoutContext.Provider value={{ originMonths, setOriginMonths }}>
      {children}
    </WorkoutContext.Provider>
  );
};

// Custom hook to use the WorkoutContext
const useWorkoutContext = (): WorkoutContextType => {
  const context = React.useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkoutContext must be used within a WorkoutProvider");
  }
  return context;
};

export { WorkoutContext, WorkoutProvider, useWorkoutContext };
