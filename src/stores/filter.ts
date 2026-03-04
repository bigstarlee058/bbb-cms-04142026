import { create } from 'zustand';

export type SortBy = {
  label: string;
  value: string;
};

type FilterStore = {
  search: string;
  sortBy: SortBy | null;
  subscription: SortBy | null;
  source: SortBy | null;
  language: SortBy | null;
  setSearchBoxValue: (newValue: string) => void;
  setSortByValue: (label: string, value: string) => void;
  setSubscriptionByValue: (label: string, value: string) => void;
  setSourceByValue: (label: string, value: string) => void;
  setLanguageByValue: (label: string, value: string) => void;
};

export const useFilteringStore = create<FilterStore>((set) => ({
  search: '',
  sortBy: null,
  subscription: null,
  source: null,
  language: null,
  setSearchBoxValue: (newValue) =>
    set(() => ({
      search: newValue,
    })),
  setSortByValue: (label, value) =>
    set(() => ({
      sortBy: { label, value },
    })),
  setSubscriptionByValue: (label, value) =>
    set(() => ({
      subscription: { label, value },
    })),
  setSourceByValue: (label, value) =>
    set(() => ({
      source: { label, value },
    })),
  setLanguageByValue: (label, value) =>
    set(() => ({
      language: { label, value },
    })),
}));