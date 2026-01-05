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
  setSearchBoxValue: (newValue: string) => void;
  setSortByValue: (label: string, value: string) => void;
  setSubscriptionByValue: (label: string, value: string) => void;
  setSourceByValue: (label: string, value: string) => void;
};

export const useFilteringStore = create<FilterStore>((set) => ({
  search: '',
  sortBy: null,
  subscription: null,
  source: null,
  setSearchBoxValue: (newValue) =>
    set(() => ({
      search: newValue,
    })),
  setSortByValue: (label, value) =>
    set(() => ({
      sortBy: { label: label, value: value },
    })),
  setSubscriptionByValue: (label, value) =>
    set(() => ({
      subscription: { label: label, value: value },
    })),
  setSourceByValue: (label, value) =>
    set(() => ({
      source: { label: label, value: value },
    })),
}));