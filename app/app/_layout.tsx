import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import useStore from '@/store/useStore';

export default function RootLayout() {
  const { initializeFromStorage } = useStore();

  useEffect(() => {
    // Initialize store from AsyncStorage
    initializeFromStorage();

    // Set up notification listeners only on mobile platforms
    if (Platform.OS !== 'web') {
      try {
        const Notifications = require('expo-notifications');
        
        const notificationListener = Notifications.addNotificationReceivedListener((notification: any) => {
          console.log('Notification received:', notification);
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener((response: any) => {
          console.log('Notification response:', response);
          // Handle notification tap - could navigate to specific screen
        });

        return () => {
          Notifications.removeNotificationSubscription(notificationListener);
          Notifications.removeNotificationSubscription(responseListener);
        };
      } catch (error) {
        console.warn('Expo Notifications not available:', error);
      }
    }
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
