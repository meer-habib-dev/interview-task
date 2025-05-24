import * as Location from 'expo-location';

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
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
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
      city,
    };
  } catch (error) {
    throw error;
  }
};
