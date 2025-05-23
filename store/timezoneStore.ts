import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKVStorage } from '@/storage/mmkvStorage';

interface TimezoneState {
  isNycTimezone: boolean;
  userTimezone: string;
  toggleTimezone: () => void;
  setUserTimezone: (timezone: string) => void;
}

export const useTimezoneStore = create<TimezoneState>()(
  persist(
    (set, get) => ({
      isNycTimezone: true,
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      toggleTimezone: () => set({ isNycTimezone: !get().isNycTimezone }),
      setUserTimezone: (timezone) => set({ userTimezone: timezone }),
    }),
    {
      name: 'timezone-storage',
      storage: createJSONStorage(() => MMKVStorage),
    }
  )
);