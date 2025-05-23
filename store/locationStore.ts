import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKVStorage } from '@/storage/mmkvStorage';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationState {
  coordinates: Coordinates | null;
  userCity: string;
  loadingLocation: boolean;
  setUserLocation: (coords: Coordinates, city: string) => void;
  setLoadingLocation: (loading: boolean) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      coordinates: null,
      userCity: 'Your City',
      loadingLocation: true,
      setUserLocation: (coords, city) => 
        set({ coordinates: coords, userCity: city, loadingLocation: false }),
      setLoadingLocation: (loading) => set({ loadingLocation: loading }),
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => MMKVStorage),
    }
  )
);