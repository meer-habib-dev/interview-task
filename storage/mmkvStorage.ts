import { MMKV } from 'react-native-mmkv';

// Create the storage instance
export const storage = new MMKV();

// Initialize storage
export const initializeStorage = async (): Promise<void> => {
  // Nothing special needed for initialization, but keeping this
  // function for potential future setup needs
  console.log('MMKV storage initialized');
  return Promise.resolve();
};

// Create a storage interface compatible with Zustand persist middleware
export const MMKVStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    console.log(`[MMKV] Getting item ${name}:`, value ? 'found' : 'not found');
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    console.log(`[MMKV] Setting item ${name}`);
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    console.log(`[MMKV] Removing item ${name}`);
    storage.delete(name);
  },
};
