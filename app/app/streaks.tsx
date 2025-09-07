import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import useStore from '@/store/useStore';
import { router } from 'expo-router';

export default function StreaksScreen() {
  const { streak, weeklyProgress, resetStreak } = useStore();

  const getDayName = (index: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[index];
  };

  const getStreakMessage = () => {
    if (streak === 0) return "Start your journey today!";
    if (streak === 1) return "Great start! Keep it up!";
    if (streak < 7) return "Building momentum!";
    if (streak < 30) return "Fantastic consistency!";
    if (streak < 100) return "You're on fire! 🔥";
    return "Legendary dedication! 🏆";
  };

  const getStreakColor = () => {
    if (streak === 0) return '#9ca3af';
    if (streak < 7) return '#f59e0b';
    if (streak < 30) return '#ea580c';
    if (streak < 100) return '#dc2626';
    return '#7c2d12';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Your Progress</Text>
        </View>

        {/* Main Streak Display */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={[styles.streakNumber, { color: getStreakColor() }]}>
            {streak}
          </Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
          <Text style={styles.streakMessage}>{getStreakMessage()}</Text>
        </View>

        {/* Weekly Progress */}
        <View style={styles.weeklyCard}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weeklyGrid}>
            {weeklyProgress.map((completed, index) => (
              <View key={index} style={styles.dayItem}>
                <Text style={styles.dayName}>{getDayName(index).slice(0, 3)}</Text>
                <View style={[
                  styles.dayCircle,
                  completed && styles.dayCircleCompleted
                ]}>
                  {completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weeklyProgress.filter(Boolean).length}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Math.floor(streak / 7)}</Text>
              <Text style={styles.statLabel}>Weeks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{streak > 0 ? Math.round((weeklyProgress.filter(Boolean).length / 7) * 100) : 0}%</Text>
              <Text style={styles.statLabel}>Weekly Rate</Text>
            </View>
          </View>
        </View>

        {/* Motivational Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>💡 Tips for Success</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tip}>• Start small - consistency beats intensity</Text>
            <Text style={styles.tip}>• Set a daily reminder at the same time</Text>
            <Text style={styles.tip}>• Track your energy levels and sleep quality</Text>
            <Text style={styles.tip}>• Focus on one protocol at a time initially</Text>
          </View>
        </View>

        {/* Reset Button */}
        {streak > 0 && (
          <Pressable 
            style={styles.resetButton}
            onPress={() => {
              // Add confirmation dialog in real app
              resetStreak();
            }}
          >
            <Text style={styles.resetButtonText}>Reset Streak</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  streakCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  streakEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: '700',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  streakMessage: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  weeklyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    gap: 8,
  },
  dayName: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  dayCircleCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  tipsCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  tipsList: {
    gap: 8,
  },
  tip: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});