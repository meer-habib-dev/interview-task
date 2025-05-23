import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKVStorage } from '@/storage/mmkvStorage';

interface AppointmentState {
  selectedDate: Date | null;
  selectedTimeSlot: Date | null;
  selectedTimezone: string | null;
  setSelectedDate: (date: Date) => void;
  setSelectedTimeSlot: (timeSlot: Date, timezone?: string) => void;
  setSelectedTimezone: (timezone: string) => void;
  clearSelection: () => void;
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set) => ({
      selectedDate: null,
      selectedTimeSlot: null,
      selectedTimezone: null,
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedTimeSlot: (timeSlot, timezone) =>
        set((state) => ({
          selectedTimeSlot: timeSlot,
          selectedTimezone: timezone || state.selectedTimezone,
        })),
      setSelectedTimezone: (timezone) => set({ selectedTimezone: timezone }),
      clearSelection: () =>
        set({
          selectedDate: null,
          selectedTimeSlot: null,
          selectedTimezone: null,
        }),
    }),
    {
      name: 'appointment-storage',
      storage: createJSONStorage(() => MMKVStorage),
    }
  )
);
