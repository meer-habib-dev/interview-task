import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { addDays, format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useTimezoneStore } from '@/store/timezoneStore';
import { useLocationStore } from '@/store/locationStore';
import { COLORS } from '@/constants/theme';
import { getStoreHours, getStoreOverrides } from '@/services/storeService';
import DateList from '@/components/DateList';
import StoreStatusIndicator from '@/components/StoreStatusIndicator';
import GreetingMessage from '@/components/GreetingMessage';
import TimezoneToggle from '@/components/TimezoneToggle';
import DateTimePickerModal from '@/components/DateTimePickerModal';
import { getIsStoreOpen } from '@/utils/storeHoursUtils';
import { scheduleOpeningNotification } from '@/utils/notificationUtils';
import { getUserLocation } from '@/utils/locationUtils';
import {
  formatDateForDisplay,
  formatTimeForDisplay,
  formatDateForDateList,
  convertDateTimezone,
  getCurrentTimeInTimezone,
} from '@/utils/dateTimeUtils';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { selectedDate, selectedTimeSlot, selectedTimezone, setSelectedDate } =
    useAppointmentStore();

  const { isNycTimezone, toggleTimezone, userTimezone } = useTimezoneStore();

  const { userCity, loadingLocation, setUserLocation } = useLocationStore();

  const [isPickerVisible, setPickerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch store hours and overrides
  const {
    data: storeHours,
    isLoading: loadingHours,
    error: hoursError,
    refetch: refetchHours,
  } = useQuery({
    queryKey: ['storeHours'],
    queryFn: getStoreHours,
  });

  const {
    data: storeOverrides,
    isLoading: loadingOverrides,
    error: overridesError,
    refetch: refetchOverrides,
  } = useQuery({
    queryKey: ['storeOverrides'],
    queryFn: getStoreOverrides,
  });
  console.log('storeOverrides', storeHours, storeOverrides);
  // Check if the store is open - use timezone-aware current time
  const currentTime = useMemo(() => {
    const activeTimezone = isNycTimezone ? 'America/New_York' : userTimezone;
    return getCurrentTimeInTimezone(activeTimezone);
  }, [isNycTimezone, userTimezone]);

  const isStoreOpen = getIsStoreOpen(storeHours, storeOverrides, currentTime);

  // Get user's location
  useEffect(() => {
    async function getLocation() {
      const location = await getUserLocation();
      if (location) {
        setUserLocation(location.coords, location.city);
      }
    }

    getLocation();
  }, []);

  // Schedule notification for next opening time
  useEffect(() => {
    if (storeHours && storeOverrides) {
      scheduleOpeningNotification(storeHours, storeOverrides);
    }
  }, [storeHours, storeOverrides]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchHours(), refetchOverrides()]);
    setRefreshing(false);
  };

  // Generate dates for the next 30 days with timezone awareness
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

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setPickerVisible(true);
  };

  // Handle time display based on selected timezone
  const displayTime = useMemo(() => {
    if (!selectedTimeSlot) return null;

    // If current displayed timezone preference differs from the one used when time was selected
    if (
      selectedTimezone &&
      ((isNycTimezone && selectedTimezone !== 'America/New_York') ||
        (!isNycTimezone && selectedTimezone === 'America/New_York'))
    ) {
      // Convert the time to the currently selected timezone
      const currentTimezone = isNycTimezone ? 'America/New_York' : userTimezone;
      return convertDateTimezone(
        selectedTimeSlot,
        selectedTimezone,
        currentTimezone
      );
    }

    return selectedTimeSlot;
  }, [selectedTimeSlot, selectedTimezone, isNycTimezone, userTimezone]);

  // Show loading state
  if (loadingHours || loadingOverrides) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading store hours...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (hoursError || overridesError) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertTriangle size={40} color={COLORS.error} />
        <Text style={styles.errorTitle}>Error Loading Data</Text>
        <Text style={styles.errorMessage}>
          {hoursError?.message ||
            overridesError?.message ||
            'Failed to load store data'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <RefreshCw size={16} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <GreetingMessage
            isNycTimezone={isNycTimezone}
            userCity={userCity}
            userTimezone={userTimezone}
          />
          <Text style={styles.greeting}>Hi, {user?.displayName || 'User'}</Text>
        </View>

        <View style={styles.timezoneSection}>
          <TimezoneToggle
            isNycTimezone={isNycTimezone}
            toggleTimezone={toggleTimezone}
            userTimezone={userTimezone}
            loadingLocation={loadingLocation}
          />
        </View>

        <View style={styles.storeStatusSection}>
          <Text style={styles.sectionTitle}>Store Status</Text>
          <StoreStatusIndicator isOpen={isStoreOpen} />
        </View>

        <View style={styles.appointmentSection}>
          <Text style={styles.sectionTitle}>Select Appointment Date</Text>
          <DateList
            dates={dates}
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
          />
        </View>

        {selectedDate && selectedTimeSlot && (
          <View style={styles.selectedAppointmentSection}>
            <Text style={styles.sectionTitle}>Your Appointment</Text>
            <View style={styles.appointmentCard}>
              <View style={styles.appointmentDetail}>
                <Calendar size={20} color={COLORS.primary} />
                <Text style={styles.appointmentText}>
                  {formatDateForDisplay(
                    selectedDate,
                    isNycTimezone ? 'America/New_York' : userTimezone
                  )}
                </Text>
              </View>
              <View style={styles.appointmentDetail}>
                <Clock size={20} color={COLORS.primary} />
                <Text style={styles.appointmentText}>
                  {formatTimeForDisplay(
                    displayTime || selectedTimeSlot,
                    isNycTimezone ? 'America/New_York' : userTimezone
                  )}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setPickerVisible(true)}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <DateTimePickerModal
        visible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        date={
          selectedDate ||
          getCurrentTimeInTimezone(
            isNycTimezone ? 'America/New_York' : userTimezone
          )
        }
        storeHours={storeHours || []}
        storeOverrides={storeOverrides || []}
        isNycTimezone={isNycTimezone}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  timezoneSection: {
    marginBottom: 24,
  },
  storeStatusSection: {
    marginBottom: 24,
  },
  appointmentSection: {
    marginBottom: 24,
  },
  selectedAppointmentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  appointmentCard: {
    backgroundColor: COLORS.cardBackground,
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
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  changeButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  changeButtonText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  errorTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
