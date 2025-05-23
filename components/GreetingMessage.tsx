import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '@/constants/theme';
import { toZonedTime } from 'date-fns-tz';
import { getHours } from 'date-fns';

interface GreetingMessageProps {
  isNycTimezone: boolean;
  userCity: string;
  userTimezone: string;
}

export default function GreetingMessage({
  isNycTimezone,
  userCity,
  userTimezone,
}: GreetingMessageProps) {
  const [greeting, setGreeting] = useState('');
  const [location, setLocation] = useState('');

  // Animation for fade-in effect
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Update greeting based on time in selected timezone
    const updateGreeting = () => {
      const now = new Date();
      // Use the currently selected timezone
      const timeZone = isNycTimezone ? 'America/New_York' : userTimezone;

      const targetTime = toZonedTime(now, timeZone);
      const hour = getHours(targetTime);

      let message = '';

      // Use the exact time ranges as specified in requirements
      if (hour >= 5 && hour < 10) {
        message = 'Good Morning,';
      } else if (hour >= 10 && hour < 12) {
        message = 'Late Morning Vibes!';
      } else if (hour >= 12 && hour < 17) {
        message = 'Good Afternoon,';
      } else if (hour >= 17 && hour < 21) {
        message = 'Good Evening,';
      } else {
        message = 'Night Owl in';
      }

      setGreeting(message);
      setLocation(isNycTimezone ? 'NYC' : userCity || 'Local City');

      // Animate when the message changes
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    };

    updateGreeting();

    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, [isNycTimezone, userCity, userTimezone, fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.location}>
        {location}
        {greeting !== 'Late Morning Vibes!' ? '!' : ''}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  greeting: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    color: COLORS.textPrimary,
    marginRight: 4,
  },
  location: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    color: COLORS.primary,
  },
});
