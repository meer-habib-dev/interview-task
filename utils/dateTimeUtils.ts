import { format, getHours, setHours, setMinutes } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

/**
 * Format time for display with timezone support
 */
export const formatTimeForDisplay = (date: Date, timezone?: string): string => {
  if (timezone) {
    return formatInTimeZone(date, timezone, 'h:mm a');
  }
  return format(date, 'h:mm a');
};

/**
 * Format date for display with timezone support
 */
export const formatDateForDisplay = (date: Date, timezone?: string): string => {
  if (timezone) {
    return formatInTimeZone(date, timezone, 'EEEE, MMMM d, yyyy');
  }
  return format(date, 'EEEE, MMMM d, yyyy');
};

/**
 * Format date for DateList display with timezone support
 */
export const formatDateForDateList = (date: Date, timezone?: string) => {
  if (timezone) {
    return {
      formatted: formatInTimeZone(date, timezone, 'yyyy-MM-dd'),
      display: formatInTimeZone(date, timezone, 'MMM d'),
      dayName: formatInTimeZone(date, timezone, 'EEEE'),
    };
  }
  return {
    formatted: format(date, 'yyyy-MM-dd'),
    display: format(date, 'MMM d'),
    dayName: format(date, 'EEEE'),
  };
};

/**
 * Convert time string to Date object
 */
export const timeStringToDate = (
  dateObj: Date,
  hourStr: string,
  minuteStr: string,
  timeZone: string
): Date => {
  // Create a new date with the given hour and minute
  const localDate = new Date(dateObj);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Set hours and minutes
  const withTime = setHours(setMinutes(localDate, minute), hour);

  // Convert to the given timezone
  return toZonedTime(withTime, timeZone);
};

/**
 * Get the current time in a specific timezone
 */
export const getCurrentTimeInTimezone = (timezone: string): Date => {
  const now = new Date('2025-05-23T05:00:00Z');
  return toZonedTime(now, timezone);
};

/**
 * Convert a date from one timezone to another
 */
export const convertDateTimezone = (
  date: Date,
  fromTimezone: string,
  toTimezone: string
): Date => {
  // First convert the date to the fromTimezone
  const dateInSourceTz = toZonedTime(date, fromTimezone);
  // Then convert to the target timezone
  return toZonedTime(dateInSourceTz, toTimezone);
};
