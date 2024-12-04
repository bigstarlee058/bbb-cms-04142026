import React, { createContext, useState, ReactNode } from 'react';

interface MonthCoverContextType {
  count: number;
  onSetCount: () => void;
}

const MonthCoverContext = createContext<MonthCoverContextType | undefined>(undefined);

interface MonthCoverProviderProps {
  children: ReactNode;
}

export const MonthCoverContextProvider: React.FC<MonthCoverProviderProps> = ({ children }) => {
  const [count, setCount] = useState<number>(0);

  const onSetCount = () => {
    setCount((prev) => prev + 1);
  };

  return (
    <MonthCoverContext.Provider value={{ count, onSetCount}}>
      {children}
    </MonthCoverContext.Provider>
  );
};

export const useMonthCoverContext = (): MonthCoverContextType => {
  const context = React.useContext(MonthCoverContext);
  if (!context) {
    throw new Error('useMonthCoverContext must be used within a WorkoutProvider');
  }
  return context;
};
