import {create} from 'zustand';

type LockedBy = { id: string; name: string } | null;

interface LockStore {
  isReadOnly: boolean;
  lockedBy: LockedBy;
  setReadOnly: (val: boolean) => void;
  setLockedBy: (val: LockedBy) => void;
  reset: () => void;
}

export const useLockStore = create<LockStore>((set) => ({
  isReadOnly: false,
  lockedBy: null,
  setReadOnly: (isReadOnly) => set({ isReadOnly }),
  setLockedBy: (lockedBy) => set({ lockedBy }),
  reset: () => set({ isReadOnly: false, lockedBy: null }),
}));