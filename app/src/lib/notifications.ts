import { Platform } from 'react-native';

// Conditionally import Notifications only on mobile platforms
let Notifications: any = null;
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.warn('Expo Notifications not available:', error);
  }
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web' || !Notifications) {
    console.log('Push notifications not supported on this platform');
    return null;
  }

  let token;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    const projectId = ''; // Add your Expo project ID if needed for EAS
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Push token:', token);
  } catch (e) {
    console.log('Error getting push token:', e);
    token = null;
  }

  return token;
}

export async function scheduleDailyNotification(time: string, title: string = "Time for your protocol!", body: string = "Complete today's Huberman protocol to maintain your streak 🔥") {
  if (Platform.OS === 'web' || !Notifications) {
    console.log('Notifications not supported on this platform');
    return null;
  }
  
  try {
    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Parse time (HH:MM format)
    const [hours, minutes] = time.split(':').map(Number);
    
    // Schedule daily notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { 
          type: 'daily_reminder',
          timestamp: Date.now()
        },
        sound: true,
      },
      trigger: {
        type: 'calendar' as const,
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
    
    console.log('Scheduled daily notification:', identifier);
    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

export async function cancelAllNotifications() {
  if (Platform.OS === 'web' || !Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}

export async function sendImmediateNotification(title: string, body: string) {
  if (Platform.OS === 'web' || !Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'immediate' },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Motivational messages for different streak milestones
export const getMotivationalMessage = (streak: number) => {
  if (streak === 0) {
    return {
      title: "Start your journey! 🚀",
      body: "Your first protocol awaits. Small steps lead to big changes."
    };
  } else if (streak === 1) {
    return {
      title: "Great start! 💪",
      body: "Day 2 is calling. Keep the momentum going!"
    };
  } else if (streak < 7) {
    return {
      title: "Building habits! 🔥",
      body: `Day ${streak + 1} - You're creating lasting change, one day at a time.`
    };
  } else if (streak < 30) {
    return {
      title: "Streak master! ⚡",
      body: `${streak} days strong! Your dedication is paying off.`
    };
  } else if (streak < 100) {
    return {
      title: "Optimization legend! 🏆",
      body: `${streak} days of excellence! You're an inspiration.`
    };
  } else {
    return {
      title: "Hall of Fame! 👑",
      body: `${streak} days! You've mastered the art of consistency.`
    };
  }
};

// Different notification messages to keep things fresh
export const getDailyMessages = () => {
  const messages = [
    {
      title: "Protocol time! 🧠",
      body: "Your daily optimization awaits. Science-backed progress starts now."
    },
    {
      title: "Consistency is key! 🔑",
      body: "Small daily actions compound into extraordinary results."
    },
    {
      title: "Your future self thanks you! 🙏",
      body: "Every protocol completed is an investment in your best self."
    },
    {
      title: "Science in action! ⚗️",
      body: "Transform knowledge into results with today's protocol."
    },
    {
      title: "Level up time! 📈",
      body: "Ready to optimize? Your protocol is waiting."
    }
  ];
  
  // Rotate based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return messages[dayOfYear % messages.length];
};
