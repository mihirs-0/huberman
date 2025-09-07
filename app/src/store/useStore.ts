import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleDailyNotification, getMotivationalMessage, registerForPushNotificationsAsync } from '@/lib/notifications';

export type FocusTrack = 'sleep' | 'focus' | 'energy';

export interface Protocol {
  slug: string;
  title: string;
  action: string;
  why: string;
  how: string;
  track?: FocusTrack;
  citations?: string[];
}

type State = {
  // Onboarding & Settings
  hasCompletedOnboarding: boolean;
  focusTracks: FocusTrack[];
  notificationTime: string; // HH:MM format
  
  // Streak & Progress
  streak: number;
  weeklyProgress: boolean[]; // 7 days, true if completed
  lastCompletionDate: string | null;
  todaysProtocolCompleted: boolean;
  
  // Current Protocol
  todaysProtocol: Protocol | null;
  
  // Actions
  setOnboardingComplete: (tracks: FocusTrack[], notificationTime: string) => void;
  setFocusTracks: (tracks: FocusTrack[]) => void;
  setNotificationTime: (time: string) => void;
  setTodaysProtocol: (protocol: Protocol) => void;
  completeProtocol: () => void;
  initializeFromStorage: () => Promise<void>;
  resetStreak: () => void;
};

const useStore = create<State>((set, get) => ({
  // Initial state
  hasCompletedOnboarding: false,
  focusTracks: [],
  notificationTime: '09:00',
  streak: 0,
  weeklyProgress: [false, false, false, false, false, false, false],
  lastCompletionDate: null,
  todaysProtocolCompleted: false,
  todaysProtocol: null,
  
  // Actions
  setOnboardingComplete: async (tracks: FocusTrack[], notificationTime: string) => {
    set({ 
      hasCompletedOnboarding: true, 
      focusTracks: tracks, 
      notificationTime 
    });
    
    await AsyncStorage.multiSet([
      ['hasCompletedOnboarding', 'true'],
      ['focusTracks', JSON.stringify(tracks)],
      ['notificationTime', notificationTime]
    ]);
    
    // Register for push notifications and schedule daily reminder
    try {
      await registerForPushNotificationsAsync();
      const message = getMotivationalMessage(0); // Starting message
      await scheduleDailyNotification(notificationTime, message.title, message.body);
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  },
  
  setFocusTracks: (tracks: FocusTrack[]) => {
    set({ focusTracks: tracks });
    AsyncStorage.setItem('focusTracks', JSON.stringify(tracks));
  },
  
  setNotificationTime: async (time: string) => {
    set({ notificationTime: time });
    await AsyncStorage.setItem('notificationTime', time);
    
    // Reschedule notifications with new time
    try {
      const state = get();
      const message = getMotivationalMessage(state.streak);
      await scheduleDailyNotification(time, message.title, message.body);
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
    }
  },
  
  setTodaysProtocol: (protocol: Protocol) => {
    set({ todaysProtocol: protocol });
  },
  
  completeProtocol: async () => {
    const today = new Date().toDateString();
    const state = get();
    
    // Don't allow multiple completions per day
    if (state.lastCompletionDate === today) return;
    
    const newStreak = state.streak + 1;
    const newWeeklyProgress = [...state.weeklyProgress];
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    newWeeklyProgress[dayOfWeek] = true;
    
    set({ 
      streak: newStreak,
      weeklyProgress: newWeeklyProgress,
      lastCompletionDate: today,
      todaysProtocolCompleted: true
    });
    
    await AsyncStorage.multiSet([
      ['streak', String(newStreak)],
      ['weeklyProgress', JSON.stringify(newWeeklyProgress)],
      ['lastCompletionDate', today],
      ['todaysProtocolCompleted', 'true']
    ]);
    
    // Update notification message for new streak level
    try {
      const message = getMotivationalMessage(newStreak);
      await scheduleDailyNotification(state.notificationTime, message.title, message.body);
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  },
  
  resetStreak: () => {
    set({ 
      streak: 0, 
      weeklyProgress: [false, false, false, false, false, false, false],
      lastCompletionDate: null,
      todaysProtocolCompleted: false
    });
    AsyncStorage.multiSet([
      ['streak', '0'],
      ['weeklyProgress', JSON.stringify([false, false, false, false, false, false, false])],
      ['lastCompletionDate', ''],
      ['todaysProtocolCompleted', 'false']
    ]);
  },
  
  initializeFromStorage: async () => {
    try {
      const keys = [
        'hasCompletedOnboarding',
        'focusTracks', 
        'notificationTime',
        'streak',
        'weeklyProgress',
        'lastCompletionDate',
        'todaysProtocolCompleted'
      ];
      
      const values = await AsyncStorage.multiGet(keys);
      const storage: Record<string, string | null> = {};
      
      values.forEach(([key, value]) => {
        storage[key] = value;
      });
      
      // Check if today's completion should be reset
      const today = new Date().toDateString();
      const lastCompletion = storage.lastCompletionDate;
      const shouldResetDaily = lastCompletion && lastCompletion !== today;
      
      set({
        hasCompletedOnboarding: storage.hasCompletedOnboarding === 'true',
        focusTracks: storage.focusTracks ? JSON.parse(storage.focusTracks) : [],
        notificationTime: storage.notificationTime || '09:00',
        streak: parseInt(storage.streak || '0'),
        weeklyProgress: storage.weeklyProgress ? JSON.parse(storage.weeklyProgress) : [false, false, false, false, false, false, false],
        lastCompletionDate: storage.lastCompletionDate,
        todaysProtocolCompleted: shouldResetDaily ? false : (storage.todaysProtocolCompleted === 'true')
      });
      
      // Reset today's completion if it's a new day
      if (shouldResetDaily) {
        AsyncStorage.setItem('todaysProtocolCompleted', 'false');
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }
}));

export default useStore;
