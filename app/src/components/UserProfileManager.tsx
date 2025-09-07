import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  Modal,
  SafeAreaView,
  Alert 
} from 'react-native';
import { apiService, getUserId, UserProfile } from '../services/api';
import useStore from '@/store/useStore';

interface UserProfileManagerProps {
  visible: boolean;
  onClose: () => void;
}

const AVAILABLE_TAGS = [
  { id: 'sleep', label: 'Sleep & Recovery', emoji: '🌙' },
  { id: 'focus', label: 'Focus & Attention', emoji: '⚡' },
  { id: 'energy', label: 'Energy & Metabolism', emoji: '🔋' },
  { id: 'stress', label: 'Stress Management', emoji: '🧘' },
  { id: 'nutrition', label: 'Nutrition & Diet', emoji: '🥗' },
  { id: 'exercise', label: 'Exercise & Fitness', emoji: '💪' },
  { id: 'pain', label: 'Pain Management', emoji: '🏥' },
  { id: 'learning', label: 'Learning & Memory', emoji: '🧠' },
  { id: 'mood', label: 'Mood & Mental Health', emoji: '😊' },
  { id: 'longevity', label: 'Longevity & Aging', emoji: '⏳' },
];

const AVAILABLE_GOALS = [
  { id: 'sleep', label: 'Better Sleep', emoji: '🌙' },
  { id: 'focus', label: 'Improved Focus', emoji: '⚡' },
  { id: 'energy', label: 'More Energy', emoji: '🔋' },
  { id: 'fitness', label: 'Physical Fitness', emoji: '💪' },
  { id: 'stress', label: 'Stress Reduction', emoji: '🧘' },
  { id: 'learning', label: 'Enhanced Learning', emoji: '🧠' },
];

export default function UserProfileManager({ visible, onClose }: UserProfileManagerProps) {
  const { focusTracks, setFocusTracks } = useStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      loadProfile();
    }
  }, [visible]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const userProfile = await apiService.getUserProfile(userId);
      setProfile(userProfile);
      setSelectedTags(userProfile.tags || []);
      setSelectedGoals(userProfile.goals || focusTracks);
    } catch (error) {
      console.warn('Failed to load profile:', error);
      // Initialize with current focus tracks
      setSelectedGoals(focusTracks);
      setSelectedTags([]);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const userId = getUserId();
      
      const updatedProfile = await apiService.updateUserProfile(userId, {
        tags: selectedTags,
        goals: selectedGoals,
      });
      
      setProfile(updatedProfile);
      
      // Update local store with new goals
      setFocusTracks(selectedGoals as any);
      
      Alert.alert(
        'Profile Updated',
        'Your preferences have been saved and will improve your personalized recommendations.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert(
        'Save Failed',
        'Unable to save your preferences. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const renderTagButton = (tag: { id: string; label: string; emoji: string }, isSelected: boolean, onPress: () => void) => (
    <Pressable
      key={tag.id}
      style={[
        styles.tagButton,
        isSelected && styles.tagButtonSelected,
      ]}
      onPress={onPress}
    >
      <Text style={styles.tagEmoji}>{tag.emoji}</Text>
      <Text style={[
        styles.tagLabel,
        isSelected && styles.tagLabelSelected,
      ]}>
        {tag.label}
      </Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Personalization</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Customize your experience to get better recommendations and protocols
          </Text>

          {/* Goals Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Your Goals</Text>
            <Text style={styles.sectionDescription}>
              What areas do you want to focus on improving?
            </Text>
            <View style={styles.tagGrid}>
              {AVAILABLE_GOALS.map(goal => 
                renderTagButton(
                  goal, 
                  selectedGoals.includes(goal.id), 
                  () => toggleGoal(goal.id)
                )
              )}
            </View>
          </View>

          {/* Interests Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Your Interests</Text>
            <Text style={styles.sectionDescription}>
              Which topics are you most interested in learning about?
            </Text>
            <View style={styles.tagGrid}>
              {AVAILABLE_TAGS.map(tag => 
                renderTagButton(
                  tag, 
                  selectedTags.includes(tag.id), 
                  () => toggleTag(tag.id)
                )
              )}
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>How this helps</Text>
            <Text style={styles.infoText}>
              • Get more relevant daily protocols{'\n'}
              • See personalized content recommendations{'\n'}
              • Improve AI-driven protocol selection{'\n'}
              • Better search results for your interests
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable 
            style={[styles.saveButton, (saving || selectedGoals.length === 0) && styles.saveButtonDisabled]}
            onPress={saveProfile}
            disabled={saving || selectedGoals.length === 0}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  tagButtonSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  tagEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  tagLabelSelected: {
    color: '#1e40af',
  },
  infoSection: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
