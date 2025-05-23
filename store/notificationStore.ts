import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKVStorage } from '@/storage/mmkvStorage';

interface NotificationState {
  notificationsEnabled: boolean;
  nextNotificationId: string | null;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNextNotificationId: (id: string | null) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      nextNotificationId: null,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setNextNotificationId: (id) => set({ nextNotificationId: id }),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => MMKVStorage),
    }
  )
);