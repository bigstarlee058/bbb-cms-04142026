import { create } from 'zustand';

import { User } from '@/stores/api/users/types';

import storage from '@/utils/storage';

interface State {
  isLogged: boolean;
  setIsLogged: (isLogged: boolean) => void;

  user: User | null;
  setUser: (user: User | null) => void;
}

const useAuthStore = create<State>((set) => ({
  isLogged: storage.getToken() ? true : false,
  setIsLogged: (isLogged: boolean) => set({ isLogged }),

  user: null,
  setUser: (user: User | null) => set({ user })
})
);

export { useAuthStore };
