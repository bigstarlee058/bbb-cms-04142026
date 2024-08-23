import create from 'zustand';

export type SortBy = {
    label: string;
    value: string;
  };

type FilterStore = {
  search: string;
  sortBy: SortBy;
  setSearchBoxValue: (newValue: string) => void;
  setSortByValue: (label: string, value: string) => void;
};

export const useFilteringStore = create<FilterStore>((set) => ({
    search: '',
    sortBy: null,
    setSearchBoxValue: (newValue) =>
      set((state) => ({
        search: newValue,
      })),
    setSortByValue: (label, value) =>
      set((state) => ({
          sortBy: { label: label, value: value },
      })),
}));
