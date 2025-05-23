import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Platform
} from 'react-native';
import { isToday, isSameDay } from 'date-fns';
import { COLORS } from '@/constants/theme';

interface DateItem {
  date: Date;
  formatted: string;
  display: string;
  dayName: string;
}

interface DateListProps {
  dates: DateItem[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export default function DateList({ dates, selectedDate, onSelectDate }: DateListProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Find index of selected date
  const selectedIndex = selectedDate 
    ? dates.findIndex(d => isSameDay(d.date, selectedDate))
    : dates.findIndex(d => isToday(d.date));

  // Scroll to selected date
  useEffect(() => {
    if (selectedIndex >= 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ 
        x: selectedIndex * 84 - 40, 
        animated: true 
      });
    }
  }, [selectedIndex]);

  // Animation for date selection
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {dates.map((item) => {
        const isSelected = selectedDate && isSameDay(item.date, selectedDate);
        const isCurrentDay = isToday(item.date);
        
        return (
          <Animated.View 
            key={item.formatted}
            style={[
              { transform: isSelected ? [{ scale: scaleAnim }] : [{ scale: 1 }] }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.dateItem,
                isSelected && styles.selectedDateItem,
                isCurrentDay && !isSelected && styles.todayDateItem,
              ]}
              onPress={() => {
                onSelectDate(item.date);
                if (isSelected) {
                  animatePress();
                }
              }}
            >
              <Text 
                style={[
                  styles.dayName,
                  isSelected && styles.selectedText,
                ]}
              >
                {item.dayName.slice(0, 3)}
              </Text>
              <Text 
                style={[
                  styles.dateText,
                  isSelected && styles.selectedText,
                ]}
              >
                {item.display}
              </Text>
              {isCurrentDay && !isSelected && (
                <View style={styles.todayIndicator} />
              )}
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dateItem: {
    width: 76,
    height: 96,
    marginHorizontal: 4,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  selectedDateItem: {
    backgroundColor: COLORS.primary,
  },
  todayDateItem: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dayName: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  dateText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  todayIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});