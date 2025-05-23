import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { StoreHours, StoreOverride } from '@/types/store';
import { getNextOpeningTime } from './storeHoursUtils';
import { useNotificationStore } from '@/store/notificationStore';

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
    (notification) => {
      console.log('Notification received:', notification);
    }
  );

  return Promise.resolve();
};

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
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
    console.log('Notifications not supported on web');
    return;
  }

  const { notificationsEnabled, nextNotificationId, setNextNotificationId } =
    useNotificationStore.getState();

  if (!notificationsEnabled) {
    console.log('Notifications not enabled by user');
    return;
  }

  // Request permissions if not already granted
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permissions not granted');
    return;
  }

  // Cancel any existing notification
  if (nextNotificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(nextNotificationId);
      console.log('Cancelled previous notification:', nextNotificationId);
    } catch (error) {
      console.error('Error cancelling previous notification:', error);
    }
  }

  // Get next opening time
  const nextOpeningTime = getNextOpeningTime(storeHours, storeOverrides);

  if (!nextOpeningTime) {
    console.log('No opening times found');
    return;
  }

  // Schedule notification 1 hour before opening
  const notificationTime = new Date(nextOpeningTime);
  notificationTime.setHours(notificationTime.getHours() - 1);

  if (notificationTime <= new Date()) {
    console.log('Notification time has already passed:', notificationTime);
    return;
  }

  // Calculate time until notification in seconds
  const seconds = Math.floor((notificationTime.getTime() - Date.now()) / 1000);
  console.log(
    `Scheduling notification for ${notificationTime.toLocaleString()}, ${seconds} seconds from now`
  );

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
        seconds,
      },
    });

    console.log('Notification scheduled with ID:', notificationId);

    // Save the notification ID
    setNextNotificationId(notificationId);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};
