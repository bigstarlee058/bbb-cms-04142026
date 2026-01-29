import { create } from 'zustand';

interface Language {
  key: string;
  name: string;
  inUse:boolean;
  _id?: string;
}

interface LanguageStore {
  languages: Language[];
  setLanguages: (languages: Language[]) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  languages: [],
  setLanguages: (languages) => set({ languages }),
}));