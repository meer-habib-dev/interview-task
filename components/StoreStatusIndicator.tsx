import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { COLORS } from '@/constants/theme';

interface StoreStatusIndicatorProps {
  isOpen: boolean;
}

export default function StoreStatusIndicator({
  isOpen,
}: StoreStatusIndicatorProps) {
  // Animation for the pulsing effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create a pulse animation
    const pulseSequence = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    // Run the animation in a loop
    Animated.loop(pulseSequence).start();

    return () => {
      // Stop animation on unmount
      pulseAnim.stopAnimation();
    };
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          { backgroundColor: isOpen ? COLORS.successLight : COLORS.errorLight },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.indicatorContainer}>
            <Animated.View
              style={[
                styles.indicator,
                {
                  backgroundColor: isOpen ? COLORS.success : COLORS.error,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.statusText,
                { color: isOpen ? COLORS.success : COLORS.error },
              ]}
            >
              {isOpen ? 'OPEN' : 'CLOSED'}
            </Text>
            <Text style={styles.message}>
              {isOpen
                ? 'The store is currently open for business'
                : 'The store is currently closed'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  textContainer: {
    marginLeft: 16,
  },
  statusText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  message: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
