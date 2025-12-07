import {create} from 'zustand';

type userStore = {
  currentPage: string;
  setCurrentPage: (newValue: string) => void;
};

export const useUserStore = create<userStore>((set) => ({
  currentPage: "",
  setCurrentPage: (newValue) =>
    set((state) => ({
      currentPage: newValue,
    }))
}));
