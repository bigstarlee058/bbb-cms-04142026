import {create} from 'zustand';
import { TitleResponse } from '@/types';

interface FixTranslationsState {
  isOpen: boolean;
  exerciseId: string;
  selectedTitleData: TitleResponse | null;
  selectedLanguages: string[];
  thumbnail: string;
  open: (exerciseId: string, titleData: TitleResponse, languages: string[]) => void;
  close: () => void;
}

export const useFixTranslationsStore = create<FixTranslationsState>((set) => ({
  isOpen: false,
  exerciseId: '',
  selectedTitleData: null,
  selectedLanguages: [],
  thumbnail: '',
  open: (exerciseId, titleData, languages) =>
    set({
      isOpen: true,
      exerciseId,
      selectedTitleData: titleData,
      selectedLanguages: languages,
      thumbnail: titleData.thumbnail || ''
    }),
  close: () =>
    set({
      isOpen: false,
      exerciseId: '',
      selectedTitleData: null,
      selectedLanguages: [],
      thumbnail: ''
    })
}));