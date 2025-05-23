import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Globe, MapPin } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface TimezoneToggleProps {
  isNycTimezone: boolean;
  toggleTimezone: () => void;
  userTimezone: string;
  loadingLocation: boolean;
}

export default function TimezoneToggle({ 
  isNycTimezone, 
  toggleTimezone,
  userTimezone,
  loadingLocation 
}: TimezoneToggleProps) {
  
  const formatTimezone = (timezone: string) => {
    return timezone.replace(/_/g, ' ').replace(/\//g, ' / ');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isNycTimezone && styles.activeToggleButton
          ]}
          onPress={() => {
            if (!isNycTimezone) toggleTimezone();
          }}
        >
          <Globe size={16} color={isNycTimezone ? '#FFFFFF' : COLORS.textSecondary} />
          <Text style={[
            styles.toggleText,
            isNycTimezone && styles.activeToggleText
          ]}>
            NYC Time
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !isNycTimezone && styles.activeToggleButton
          ]}
          onPress={() => {
            if (isNycTimezone) toggleTimezone();
          }}
        >
          <MapPin size={16} color={!isNycTimezone ? '#FFFFFF' : COLORS.textSecondary} />
          <Text style={[
            styles.toggleText,
            !isNycTimezone && styles.activeToggleText
          ]}>
            Local Time
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.timezoneInfo}>
        {loadingLocation ? (
          <ActivityIndicator size="small" color={COLORS.textSecondary} />
        ) : (
          <Text style={styles.timezoneText}>
            {isNycTimezone 
              ? 'America / New York' 
              : formatTimezone(userTimezone)
            }
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
  },
  activeToggleButton: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  timezoneInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  timezoneText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});