import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { StoreHours, StoreOverride } from '@/types/store';
import { getNextOpeningTime } from './storeHoursUtils';
import { useNotificationStore } from '@/store/notificationStore';
import { getCurrentTimeInTimezone } from './dateTimeUtils';

/**
 * Initialize notifications
 */
export const initializeNotifications = async (): Promise<void> => {
  // Configure notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Register for notification events
  const subscription = Notifications.addNotificationReceivedListener(
    (notification) => {}
  );

  return Promise.resolve();
};

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  // Only ask if permissions have not already been determined
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

/**
 * Schedule notification for next store opening
 */
export const scheduleOpeningNotification = async (
  storeHours: StoreHours[],
  storeOverrides: StoreOverride[]
): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  const { notificationsEnabled, nextNotificationId, setNextNotificationId } =
    useNotificationStore.getState();

  if (!notificationsEnabled) {
    return;
  }

  // Request permissions if not already granted
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return;
  }

  // Cancel any existing notification
  if (nextNotificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(nextNotificationId);
    } catch (error) {
      console.log('Error cancelling previous notification:', error);
    }
  }

  // Get next opening time
  const nextOpeningTime = getNextOpeningTime(storeHours, storeOverrides);

  if (!nextOpeningTime) {
    return;
  }

  // Schedule notification 1 hour before opening
  const notificationTime = new Date(nextOpeningTime);
  console.log(
    'notificationTime',
    notificationTime.toISOString(),
    notificationTime.getHours(),
    getCurrentTimeInTimezone().toISOString(),
    getCurrentTimeInTimezone().getHours()
  );
  notificationTime.setHours(notificationTime.getHours());
  // notificationTime.setHours(notificationTime.getHours() - 1);

  if (notificationTime <= new Date()) {
    return;
  }

  // Calculate time until notification in seconds
  const seconds = Math.floor(
    (notificationTime.getTime() - getCurrentTimeInTimezone().getTime()) / 1000
  );

  console.log('seconds', seconds);
  try {
    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Store Opening Soon',
        body: `The store will open in 1 hour at ${nextOpeningTime.toLocaleTimeString(
          [],
          { hour: '2-digit', minute: '2-digit' }
        )}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: seconds <= 3600 && seconds > 0 ? 2 : 0,
      },
    });

    // Save the notification ID
    setNextNotificationId(notificationId);
  } catch (error) {
    throw error;
  }
};
