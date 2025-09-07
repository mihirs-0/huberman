import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import useStore, { FocusTrack } from '@/store/useStore';
import { router } from 'expo-router';

const FOCUS_TRACKS = [
  { key: 'sleep' as FocusTrack, emoji: '🌙', title: 'Sleep', description: 'Optimize rest & recovery' },
  { key: 'focus' as FocusTrack, emoji: '⚡', title: 'Focus', description: 'Enhance cognitive performance' },
  { key: 'energy' as FocusTrack, emoji: '🔋', title: 'Energy', description: 'Boost vitality & resilience' }
];

const NOTIFICATION_TIMES = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', 
  '10:00', '18:00', '19:00', '20:00', '21:00'
];

export default function Onboarding() {
  const { setOnboardingComplete } = useStore();
  const [selectedTracks, setSelectedTracks] = useState<FocusTrack[]>([]);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [currentStep, setCurrentStep] = useState<'welcome' | 'tracks' | 'time'>('welcome');

  const toggleTrack = (track: FocusTrack) => {
    setSelectedTracks(prev => 
      prev.includes(track) 
        ? prev.filter(t => t !== track)
        : [...prev, track]
    );
  };

  const handleComplete = () => {
    if (selectedTracks.length === 0) {
      Alert.alert('Please select at least one focus area');
      return;
    }
    
    setOnboardingComplete(selectedTracks, selectedTime);
    router.replace('/');
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>🧠</Text>
      <Text style={styles.title}>Welcome to Huberman Protocols</Text>
      <Text style={styles.subtitle}>
        Science-backed daily habits to optimize your sleep, focus, and energy
      </Text>
      <Text style={styles.description}>
        Based on research from Dr. Andrew Huberman and leading neuroscience labs
      </Text>
      <Pressable 
        style={styles.primaryButton} 
        onPress={() => setCurrentStep('tracks')}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </Pressable>
    </View>
  );

  const renderTrackSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Choose Your Focus</Text>
      <Text style={styles.subtitle}>Select the areas you want to optimize (pick 1-3)</Text>
      
      <View style={styles.tracksContainer}>
        {FOCUS_TRACKS.map(track => (
          <Pressable
            key={track.key}
            style={[
              styles.trackCard,
              selectedTracks.includes(track.key) && styles.trackCardSelected
            ]}
            onPress={() => toggleTrack(track.key)}
          >
            <Text style={styles.trackEmoji}>{track.emoji}</Text>
            <Text style={styles.trackTitle}>{track.title}</Text>
            <Text style={styles.trackDescription}>{track.description}</Text>
            {selectedTracks.includes(track.key) && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable 
        style={[styles.primaryButton, selectedTracks.length === 0 && styles.disabledButton]} 
        onPress={() => selectedTracks.length > 0 && setCurrentStep('time')}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </Pressable>
    </View>
  );

  const renderTimeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Daily Reminder</Text>
      <Text style={styles.subtitle}>When would you like your daily protocol reminder?</Text>
      
      <View style={styles.timeGrid}>
        {NOTIFICATION_TIMES.map(time => (
          <Pressable
            key={time}
            style={[
              styles.timeButton,
              selectedTime === time && styles.timeButtonSelected
            ]}
            onPress={() => setSelectedTime(time)}
          >
            <Text style={[
              styles.timeButtonText,
              selectedTime === time && styles.timeButtonTextSelected
            ]}>
              {time}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <Pressable 
          style={styles.secondaryButton} 
          onPress={() => setCurrentStep('tracks')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        
        <Pressable 
          style={styles.primaryButton} 
          onPress={handleComplete}
        >
          <Text style={styles.primaryButtonText}>Start Journey</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentStep === 'welcome' && renderWelcome()}
        {currentStep === 'tracks' && renderTrackSelection()}
        {currentStep === 'time' && renderTimeSelection()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stepContainer: {
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  tracksContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  trackCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  trackCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  trackEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  trackDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 32,
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    minWidth: 70,
    alignItems: 'center',
  },
  timeButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  timeButtonTextSelected: {
    color: '#ffffff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    flex: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
});
