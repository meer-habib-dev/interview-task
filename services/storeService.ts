import axios from 'axios';
import { StoreHours, StoreOverride } from '@/types/store';

const API_URL = 'https://coding-challenge-pd-1a25b1a14f34.herokuapp.com';

// API client with auth
const apiClient = axios.create({
  baseURL: API_URL,
  auth: {
    username: 'perdiem',
    password: 'perdiem',
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get store hours
 */
export const getStoreHours = async (): Promise<StoreHours[]> => {
  try {
    const response = await apiClient.get('/store-times');
    return response.data;
  } catch (error) {
    console.error('Error fetching store hours:', error);
    throw error;
  }
};

/**
 * Get store overrides
 */
export const getStoreOverrides = async (): Promise<StoreOverride[]> => {
  try {
    const response = await apiClient.get('/store-overrides');
    return response.data;
  } catch (error) {
    console.error('Error fetching store overrides:', error);
    throw error;
  }
};
