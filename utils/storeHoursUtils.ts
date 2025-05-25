import { getDay, addMinutes, startOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { StoreHours, StoreOverride } from '@/types/store';
import {
  getCurrentTimeInTimezone,
  getTimezone,
  timeStringToDate,
} from './dateTimeUtils';
import { useTimezoneStore } from '@/store/timezoneStore';

/**
 * Check if the store is open at the current time
 */
export const getIsStoreOpen = (
  storeHours: StoreHours[] | undefined,
  storeOverrides: StoreOverride[] | undefined,
  date: Date
): boolean => {
  if (!storeHours || !storeOverrides) return false;

  const now = date;
  const currentMonth = now.getMonth() + 1; // 0-based to 1-based
  const currentDay = now.getDate();
  const dayOfWeek = getDay(now); // 0 is Sunday, 1 is Monday, etc.

  // Check if there's an override for today
  const todayOverride = storeOverrides.find(
    (override) => override.month === currentMonth && override.day === currentDay
  );

  if (todayOverride && todayOverride.is_open) {
    // Use override hours
    return isWithinStoreHours(
      now,
      todayOverride.start_time,
      todayOverride.end_time
    );
  }

  // Use regular hours for current day of week
  const todayHours = storeHours.filter(
    (hours) => hours.day_of_week === dayOfWeek && hours.is_open
  );

  console.log('todayHours', todayHours);

  // Check if within any of the opening slots
  return todayHours.some((hours) =>
    isWithinStoreHours(now, hours.start_time, hours.end_time)
  );
};

/**
 * Check if a date is within store hours
 */
const isWithinStoreHours = (
  date: Date,
  startTime: string,
  endTime: string
): boolean => {
  // Convert current time to NY timezone
  const dateInNY = toZonedTime(date, getTimezone());
  const todayInNY = startOfDay(dateInNY);

  // Parse times in HH:MM format
  const [openHour, openMinute] = startTime.split(':').map(Number);
  const [closeHour, closeMinute] = endTime.split(':').map(Number);

  // Create opening and closing times in NY timezone
  const openTime = new Date(todayInNY);
  openTime.setHours(openHour, openMinute, 0);

  const closeTime = new Date(todayInNY);
  closeTime.setHours(closeHour, closeMinute, 0);

  // Handle overnight hours (when close time is before open time)
  if (closeTime < openTime) {
    closeTime.setDate(closeTime.getDate() + 1);
  }

  console.log('openTime', openHour, openTime.toISOString());
  console.log('closeTime', closeHour, closeTime.toISOString());
  console.log('dateInNY', dateInNY.toISOString());

  // Check if current time is within opening hours
  return dateInNY >= openTime && dateInNY <= closeTime;
};

/**
 * Get the next opening time for the store
 */
export const getNextOpeningTime = (
  storeHours: StoreHours[],
  storeOverrides: StoreOverride[]
): Date | null => {
  // const now = new Date();
  const now = getCurrentTimeInTimezone();
  const currentDayOfWeek = getDay(now);
  const currentMonth = now.getMonth() + 1; // 0-based to 1-based
  const currentDay = now.getDate();

  // Check if there's an override for today
  const todayOverride = storeOverrides.find(
    (override) => override.month === currentMonth && override.day === currentDay
  );

  if (todayOverride && todayOverride.is_open) {
    const [openHour, openMinute] = todayOverride.start_time
      .split(':')
      .map(Number);
    const openingTime = timeStringToDate(
      now,
      openHour.toString(),
      openMinute.toString(),
      getTimezone()
    );

    if (openingTime > now) {
      return openingTime;
    }
  }

  // Check regular hours for today and next 7 days
  for (let i = 0; i < 7; i++) {
    const checkDay = (currentDayOfWeek + i) % 7;
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() + i);

    const dayHours = storeHours.filter(
      (hours) => hours.day_of_week === checkDay && hours.is_open
    );

    if (dayHours.length > 0) {
      // Sort by opening time
      dayHours.sort((a, b) => {
        const [aHour, aMinute] = a.start_time.split(':').map(Number);
        const [bHour, bMinute] = b.start_time.split(':').map(Number);

        if (aHour !== bHour) return aHour - bHour;
        return aMinute - bMinute;
      });

      for (const hours of dayHours) {
        const [openHour, openMinute] = hours.start_time.split(':').map(Number);
        const openingTime = timeStringToDate(
          checkDate,
          openHour.toString(),
          openMinute.toString(),
          getTimezone()
        );

        if (i === 0 && openingTime <= now) {
          // Skip if the opening time for today has already passed
          continue;
        }

        return openingTime;
      }
    }
  }

  return null; // No opening times found
};

/**
 * Get available time slots for a specific date
 */
export const getAvailableTimeSlots = (
  date: Date,
  storeHours: StoreHours[],
  storeOverrides: StoreOverride[],
  timezone: string,
  intervalMinutes: number
): Date[] => {
  const slots: Date[] = [];

  // Always work with the date in the selected timezone
  const dateInSelectedTz = toZonedTime(date, timezone);
  const dayOfWeek = getDay(dateInSelectedTz);
  const month = dateInSelectedTz.getMonth() + 1; // 0-based to 1-based
  const day = dateInSelectedTz.getDate();

  // Check if there's an override for this date
  const dateOverride = storeOverrides.find(
    (override) => override.month === month && override.day === day
  );

  // The timezone for store hours is always NYC
  const storeTimezone = 'America/New_York';

  if (dateOverride && dateOverride.is_open) {
    // Use override hours
    const [openHour, openMinute] = dateOverride.start_time
      .split(':')
      .map(Number);
    const [closeHour, closeMinute] = dateOverride.end_time
      .split(':')
      .map(Number);

    // Create the opening time in NYC timezone
    const openTimeNYC = timeStringToDate(
      dateInSelectedTz,
      openHour.toString(),
      openMinute.toString(),
      storeTimezone
    );

    // Create the closing time in NYC timezone
    const closeTimeNYC = timeStringToDate(
      dateInSelectedTz,
      closeHour.toString(),
      closeMinute.toString(),
      storeTimezone
    );

    // Generate slots - always working in the NYC timezone first
    let slotTimeNYC = new Date(openTimeNYC);
    while (slotTimeNYC < closeTimeNYC) {
      // If displaying in user's local timezone, convert the slot time
      const slotTimeToAdd =
        timezone === storeTimezone
          ? new Date(slotTimeNYC)
          : fromZonedTime(slotTimeNYC, storeTimezone);

      slots.push(new Date(slotTimeToAdd));
      slotTimeNYC = addMinutes(slotTimeNYC, intervalMinutes);
    }

    return slots;
  } else {
    // Use regular hours for this day of week
    const dayHours = storeHours.filter(
      (hours) => hours.day_of_week === dayOfWeek && hours.is_open
    );

    // Generate slots for each opening period
    dayHours.forEach((hours) => {
      const [openHour, openMinute] = hours.start_time.split(':').map(Number);
      const [closeHour, closeMinute] = hours.end_time.split(':').map(Number);

      // Create times in NYC timezone
      const openTimeNYC = timeStringToDate(
        dateInSelectedTz,
        openHour.toString(),
        openMinute.toString(),
        storeTimezone
      );

      const closeTimeNYC = timeStringToDate(
        dateInSelectedTz,
        closeHour.toString(),
        closeMinute.toString(),
        storeTimezone
      );

      // Handle overnight hours
      let adjustedCloseTimeNYC = closeTimeNYC;
      if (closeTimeNYC < openTimeNYC) {
        adjustedCloseTimeNYC = new Date(closeTimeNYC);
        adjustedCloseTimeNYC.setDate(adjustedCloseTimeNYC.getDate() + 1);
      }

      // Generate slots
      let slotTimeNYC = new Date(openTimeNYC);
      while (slotTimeNYC < adjustedCloseTimeNYC) {
        // If displaying in user's local timezone, convert the slot time
        const slotTimeToAdd =
          timezone === storeTimezone
            ? new Date(slotTimeNYC)
            : fromZonedTime(slotTimeNYC, storeTimezone);

        slots.push(new Date(slotTimeToAdd));
        slotTimeNYC = addMinutes(slotTimeNYC, intervalMinutes);
      }
    });

    return slots;
  }
};
