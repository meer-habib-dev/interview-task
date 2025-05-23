import * as Location from 'expo-location';
import { Platform } from 'react-native';
import axios from 'axios';

interface LocationResult {
  coords: {
    latitude: number;
    longitude: number;
  };
  city: string;
}

/**
 * Get user's location (coordinates and city)
 */
export const getUserLocation = async (): Promise<LocationResult | null> => {
  try {
    if (Platform.OS === 'web') {
      // Web fallback with approximate location
      return {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        city: 'Your City'
      };
    }

    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Location permission denied');
      return null;
    }
    
    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    // Reverse geocode to get city
    const geocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    
    let city = 'Your City';
    
    if (geocode && geocode.length > 0) {
      city = geocode[0].city || geocode[0].region || 'Your City';
    }
    
    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      city
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};