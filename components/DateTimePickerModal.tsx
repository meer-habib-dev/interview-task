import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS } from '@/constants/theme';
import { format } from 'date-fns';
import { X } from 'lucide-react-native';
import { StoreHours, StoreOverride } from '@/types/store';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useTimezoneStore } from '@/store/timezoneStore';
import { getAvailableTimeSlots } from '@/utils/storeHoursUtils';
import {
  formatTimeForDisplay,
  formatDateForDisplay,
} from '@/utils/dateTimeUtils';

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  date: Date;
  storeHours: StoreHours[];
  storeOverrides: StoreOverride[];
  isNycTimezone: boolean;
}

const { height } = Dimensions.get('window');

export default function DateTimePickerModal({
  visible,
  onClose,
  date,
  storeHours,
  storeOverrides,
  isNycTimezone,
}: DateTimePickerModalProps) {
  const { setSelectedTimeSlot } = useAppointmentStore();
  const { userTimezone } = useTimezoneStore();
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);

  // Animation for the modal slide up
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      setSelectedTime(null);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // Generate time slots based on store hours
  useEffect(() => {
    if (visible && date && storeHours && storeOverrides) {
      // Use the selected timezone (NYC or user's local timezone)
      const activeTimezone = isNycTimezone ? 'America/New_York' : userTimezone;

      const slots = getAvailableTimeSlots(
        new Date(date),
        storeHours,
        storeOverrides,
        activeTimezone,
        15 // 15 minute intervals
      );

      // Sort slots chronologically
      setTimeSlots(slots.sort((a, b) => a.getTime() - b.getTime()));
    }
  }, [visible, date, storeHours, storeOverrides, isNycTimezone, userTimezone]);

  const handleConfirm = () => {
    if (selectedTime) {
      // Store the selected time slot with the current timezone context
      const activeTimezone = isNycTimezone ? 'America/New_York' : userTimezone;
      setSelectedTimeSlot(selectedTime, activeTimezone);
      onClose();
    }
  };

  // Close the modal when clicking outside
  const handleOverlayPress = () => {
    onClose();
  };

  // Prevent propagation to overlay
  const handleModalPress = (e: any) => {
    e.stopPropagation();
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={handleModalPress}
          >
            <View style={styles.header}>
              <Text style={styles.headerText}>
                Select Time for{' '}
                {formatDateForDisplay(
                  date,
                  isNycTimezone ? 'America/New_York' : userTimezone
                )}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.timezoneInfo}>
              <Text style={styles.timezoneText}>
                All times shown in {isNycTimezone ? 'NYC' : 'local'} time
              </Text>
            </View>

            <ScrollView style={styles.timeSlotContainer}>
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
                        onPress={() => setSelectedTime(time)}
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
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.noSlotsContainer}>
                  <Text style={styles.noSlotsText}>
                    No available time slots for this date.
                  </Text>
                  <Text style={styles.noSlotsSubtext}>
                    Please select a different date.
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedTime && styles.disabledButton,
                ]}
                onPress={handleConfirm}
                disabled={!selectedTime}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalContent: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 8,
  },
  timezoneInfo: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundSecondary,
  },
  timezoneText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  timeSlotContainer: {
    flex: 1,
    padding: 16,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  timeSlot: {
    width: '30%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
  },
  timeText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  selectedTimeText: {
    color: '#FFFFFF',
  },
  noSlotsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  confirmButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
