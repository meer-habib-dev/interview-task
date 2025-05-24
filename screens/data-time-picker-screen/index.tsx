import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { COLORS } from '@/constants/theme';
import { X, Clock, Calendar } from 'lucide-react-native';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useTimezoneStore } from '@/store/timezoneStore';
import { getAvailableTimeSlots } from '@/utils/storeHoursUtils';
import {
  formatTimeForDisplay,
  formatDateForDisplay,
  getCurrentTimeInTimezone,
  formatDateForDateList,
} from '@/utils/dateTimeUtils';
import DateList from '@/components/DateList';
import { addDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getStoreHours } from '@/services/storeService';
import { getStoreOverrides } from '@/services/storeService';
import { router } from 'expo-router';

export default function DateTimePickerScreen() {
  const { selectedDate, setSelectedTimeSlot, setSelectedDate } =
    useAppointmentStore();
  const { isNycTimezone, userTimezone } = useTimezoneStore();
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);

  // Animation values
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(50), []);
  const buttonScale = useMemo(() => new Animated.Value(1), []);

  const { data: storeHours } = useQuery({
    queryKey: ['storeHours'],
    queryFn: getStoreHours,
  });

  const { data: storeOverrides } = useQuery({
    queryKey: ['storeOverrides'],
    queryFn: getStoreOverrides,
  });

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  // Generate time slots based on store hours
  useEffect(() => {
    if (selectedDate && storeHours && storeOverrides) {
      const activeTimezone = isNycTimezone ? 'America/New_York' : userTimezone;

      const slots = getAvailableTimeSlots(
        new Date(selectedDate),
        storeHours,
        storeOverrides,
        activeTimezone,
        15 // 15 minute intervals
      );

      setTimeSlots(slots.sort((a, b) => a.getTime() - b.getTime()));
    }
  }, [selectedDate, storeHours, storeOverrides, isNycTimezone, userTimezone]);

  const dates = useMemo(() => {
    const activeTimezone = isNycTimezone ? 'America/New_York' : userTimezone;
    const baseDate = getCurrentTimeInTimezone(activeTimezone);

    return Array.from({ length: 30 }, (_, i) => {
      const date = addDays(baseDate, i);
      const dateFormatted = formatDateForDateList(date, activeTimezone);
      return {
        date,
        ...dateFormatted,
      };
    });
  }, [isNycTimezone, userTimezone]);

  const handleConfirm = async () => {
    if (selectedTime && !isConfirming) {
      setIsConfirming(true);

      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        const activeTimezone = isNycTimezone
          ? 'America/New_York'
          : userTimezone;
        setSelectedTimeSlot(selectedTime, activeTimezone);
        onClose();
      }, 500);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header with improved design */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Calendar size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.headerTitle}>Book Appointment</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Date Selection Section */}
          <View style={styles.dateSection}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <DateList
              dates={dates}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
            />
          </View>

          {/* Time Selection Section */}
          <View style={styles.timeSection}>
            <View style={styles.timeSectionHeader}>
              <View style={styles.timeHeaderContent}>
                <Clock size={20} color={COLORS.primary} />
                <Text style={styles.timeSectionTitle}>
                  Available Times for{' '}
                  {formatDateForDisplay(
                    selectedDate ? new Date(selectedDate) : new Date(),
                    isNycTimezone ? 'America/New_York' : userTimezone
                  )}
                </Text>
              </View>
              <View style={styles.timezoneChip}>
                <Text style={styles.timezoneText}>
                  {isNycTimezone ? 'NYC' : 'Local'} Time
                </Text>
              </View>
            </View>

            <ScrollView
              style={styles.timeSlotContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.timeSlotContent}
            >
              {timeSlots.length > 0 ? (
                <View style={styles.timeGrid}>
                  {timeSlots.map((time, index) => {
                    const isSelected =
                      selectedTime && time.getTime() === selectedTime.getTime();

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.timeSlot,
                          isSelected && styles.selectedTimeSlot,
                        ]}
                        onPress={() => handleTimeSelect(time)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            isSelected && styles.selectedTimeText,
                          ]}
                        >
                          {formatTimeForDisplay(
                            time,
                            isNycTimezone ? 'America/New_York' : userTimezone
                          )}
                        </Text>
                        {isSelected && (
                          <View style={styles.selectedIndicator} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.noSlotsContainer}>
                  <View style={styles.noSlotsIcon}>
                    <Clock size={48} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.noSlotsText}>
                    No available time slots
                  </Text>
                  <Text style={styles.noSlotsSubtext}>
                    Please select a different date to see available times.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Footer with improved button */}
          <View style={styles.footer}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedTime && styles.disabledButton,
                  isConfirming && styles.confirmingButton,
                ]}
                onPress={handleConfirm}
                disabled={!selectedTime || isConfirming}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.confirmButtonText,
                    !selectedTime && styles.disabledButtonText,
                  ]}
                >
                  {isConfirming ? 'Confirming...' : 'Confirm Appointment'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  timeSection: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  timeSectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  timezoneChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timezoneText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: COLORS.primary,
  },
  timeSlotContainer: {
    flex: 1,
  },
  timeSlotContent: {
    padding: 20,
    paddingBottom: 40,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '31%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  timeText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  selectedTimeText: {
    color: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  noSlotsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  noSlotsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noSlotsText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  noSlotsSubtext: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  disabledButton: {
    backgroundColor: '#E8E8E8',
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  confirmingButton: {
    backgroundColor: '#A0A0A0',
  },
  confirmButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#A0A0A0',
  },
});
