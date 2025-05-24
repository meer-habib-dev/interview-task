import { MMKV } from 'react-native-mmkv';

// Create the storage instance
export const storage = new MMKV();

// Initialize storage
export const initializeStorage = async (): Promise<void> => {
  // Nothing special needed for initialization, but keeping this
  // function for potential future setup needs
  return Promise.resolve();
};

// Create a storage interface compatible with Zustand persist middleware
export const MMKVStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);

    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.delete(name);
  },
};
