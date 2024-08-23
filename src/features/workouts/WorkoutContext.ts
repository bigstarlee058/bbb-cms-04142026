import React, { createContext, useState, useContext } from 'react';
import { Month } from '@/types'; // Import your Month type

interface WorkoutContextType {
  originMonths: Month[];
  setOriginMonths: React.Dispatch<React.SetStateAction<Month[]>>;
}

export const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);