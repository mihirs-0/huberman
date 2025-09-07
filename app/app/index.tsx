import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, SafeAreaView, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useStore, { Protocol } from '@/store/useStore';
import protocols from '@/data/protocols.json';
import { router } from 'expo-router';

export default function TodayScreen() {
  const { 
    hasCompletedOnboarding, 
    focusTracks, 
    streak, 
    weeklyProgress,
    todaysProtocol, 
    todaysProtocolCompleted,
    setTodaysProtocol, 
    completeProtocol,
    initializeFromStorage 
  } = useStore();
  
  const [showCitations, setShowCitations] = useState(false);

  useEffect(() => {
    initializeFromStorage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Check onboarding status when screen comes into focus
      if (hasCompletedOnboarding === false) {
        // Use setTimeout to ensure navigation is ready
        setTimeout(() => {
          router.replace('/onboarding');
        }, 100);
        return;
      }

      // Set today's protocol if not already set
      if (hasCompletedOnboarding && !todaysProtocol && focusTracks.length > 0) {
        const relevantProtocols = protocols.filter(p => 
          p.track && focusTracks.includes(p.track as any)
        );
        
        if (relevantProtocols.length > 0) {
          // Simple rotation based on day of year
          const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
          const selectedProtocol = relevantProtocols[dayOfYear % relevantProtocols.length];
          setTodaysProtocol(selectedProtocol as Protocol);
        }
      }
    }, [hasCompletedOnboarding, focusTracks, todaysProtocol, setTodaysProtocol])
  );

  const handleComplete = () => {
    if (!todaysProtocolCompleted) {
      completeProtocol();
    }
  };

  const getTrackEmoji = (track?: string) => {
    switch (track) {
      case 'sleep': return '🌙';
      case 'focus': return '⚡';
      case 'energy': return '🔋';
      default: return '🧠';
    }
  };

  const getTrackColor = (track?: string) => {
    switch (track) {
      case 'sleep': return { bg: '#e0e7ff', border: '#6366f1', text: '#4338ca' };
      case 'focus': return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' };
      case 'energy': return { bg: '#dcfce7', border: '#10b981', text: '#065f46' };
      default: return { bg: '#f3f4f6', border: '#6b7280', text: '#374151' };
    }
  };

  if (!hasCompletedOnboarding) {
    return null; // Router will redirect
  }

  if (!todaysProtocol) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading today's protocol...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const trackColors = getTrackColor(todaysProtocol.track);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Today's Protocol</Text>
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>🔥 {streak} day streak</Text>
          </View>
          
          {/* Weekly Progress Dots */}
          <View style={styles.weeklyProgress}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <View key={index} style={styles.dayContainer}>
                <View style={[
                  styles.progressDot, 
                  weeklyProgress[index] && styles.progressDotCompleted
                ]} />
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Main Protocol Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.badge, { backgroundColor: trackColors.bg, borderColor: trackColors.border }]}>
              <Text style={styles.badgeIcon}>{getTrackEmoji(todaysProtocol.track)}</Text>
              <Text style={[styles.badgeText, { color: trackColors.text }]}>
                {todaysProtocol.track?.toUpperCase() || 'PROTOCOL'}
              </Text>
            </View>
            <Pressable 
              style={styles.infoButton}
              onPress={() => setShowCitations(true)}
            >
              <Text style={styles.infoIcon}>❓</Text>
            </Pressable>
          </View>
          
          <Text style={styles.cardTitle}>{todaysProtocol.title}</Text>
          
          <View style={styles.cardContent}>
            <Text style={styles.actionText}>{todaysProtocol.action}</Text>
            <Text style={styles.whyText}>{todaysProtocol.why}</Text>
            
            <View style={styles.howToCard}>
              <Text style={styles.howToText}>
                <Text style={styles.howToBold}>How to:</Text> {todaysProtocol.how}
              </Text>
            </View>

            <Pressable 
              style={[styles.completeButton, todaysProtocolCompleted && styles.completedButton]} 
              onPress={handleComplete}
            >
              <Text style={styles.completeIcon}>
                {todaysProtocolCompleted ? '✅' : '⭕'}
              </Text>
              <Text style={styles.completeButtonText}>
                {todaysProtocolCompleted ? '✓ Completed Today!' : 'Mark Complete'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Access Navigation */}
        <View style={styles.quickNav}>
          <Pressable 
            style={styles.navCard}
            onPress={() => router.push('/streaks')}
          >
            <Text style={styles.navCardIcon}>📊</Text>
            <Text style={styles.navCardTitle}>Streaks</Text>
            <Text style={styles.navCardSubtitle}>Track progress</Text>
          </Pressable>
          
          <Pressable 
            style={styles.navCard}
            onPress={() => router.push('/library')}
          >
            <Text style={styles.navCardIcon}>📚</Text>
            <Text style={styles.navCardTitle}>Library</Text>
            <Text style={styles.navCardSubtitle}>All protocols</Text>
          </Pressable>
          
          <Pressable 
            style={styles.navCard}
            onPress={() => router.push('/insights')}
          >
            <Text style={styles.navCardIcon}>💡</Text>
            <Text style={styles.navCardTitle}>Insights</Text>
            <Text style={styles.navCardSubtitle}>Learn more</Text>
          </Pressable>
        </View>

        {/* About Link */}
        <Pressable 
          style={styles.aboutLink}
          onPress={() => router.push('/about')}
        >
          <Text style={styles.aboutLinkText}>ℹ️ About & Disclaimer</Text>
        </Pressable>
      </ScrollView>

      {/* Citations Modal */}
      <Modal
        visible={showCitations}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Why This Works</Text>
            <Pressable 
              style={styles.closeButton}
              onPress={() => setShowCitations(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalProtocolTitle}>{todaysProtocol.title}</Text>
            <Text style={styles.modalDescription}>{todaysProtocol.why}</Text>
            
            {todaysProtocol.citations && todaysProtocol.citations.length > 0 && (
              <View style={styles.citationsSection}>
                <Text style={styles.citationsTitle}>Sources:</Text>
                {todaysProtocol.citations.map((citation, index) => (
                  <Text key={index} style={styles.citation}>• {citation}</Text>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  streakContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ea580c',
  },
  weeklyProgress: {
    flexDirection: 'row',
    gap: 8,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 4,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  progressDotCompleted: {
    backgroundColor: '#10b981',
  },
  dayLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },
  mainCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  infoIcon: {
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  cardContent: {
    gap: 16,
  },
  actionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  whyText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  howToCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  howToText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  howToBold: {
    fontWeight: '700',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  completedButton: {
    backgroundColor: '#059669',
  },
  completeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  quickNav: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  navCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navCardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  navCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  navCardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalProtocolTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
  },
  citationsSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  citationsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  citation: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  aboutLink: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  aboutLinkText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
});
