import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { apiService, SearchItem, mapFocusTracksToTags, getUserId } from '../services/api';
import { router } from 'expo-router';

interface DiscoverSectionProps {
  focusTracks: string[];
}

export default function DiscoverSection({ focusTracks }: DiscoverSectionProps) {
  const [recommendations, setRecommendations] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [focusTracks]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tags = mapFocusTracksToTags(focusTracks);
      const response = await apiService.recommend(tags, 5); // Get 5 recommendations
      setRecommendations(response.items);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = async (item: SearchItem) => {
    // Log engagement event
    try {
      await apiService.logEvent({
        user_id: getUserId(),
        event: 'like',
        protocol_slug: item.chunk_id,
      });
    } catch (err) {
      console.warn('Failed to log event:', err);
    }

    // Navigate to insights page with this specific content
    router.push({
      pathname: '/insights',
      params: {
        episode_id: item.episode_id,
        chunk_index: item.chunk_index.toString(),
      },
    });
  };

  const getTrackEmoji = (episodeTitle: string): string => {
    const title = episodeTitle.toLowerCase();
    if (title.includes('sleep') || title.includes('dream')) return '🌙';
    if (title.includes('focus') || title.includes('attention') || title.includes('brain')) return '⚡';
    if (title.includes('energy') || title.includes('metabolism') || title.includes('exercise')) return '🔋';
    if (title.includes('nutrition') || title.includes('food')) return '🥗';
    if (title.includes('pain') || title.includes('health')) return '🏥';
    return '🧠';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Discover</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text style={styles.loadingText}>Finding personalized insights...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Discover</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load recommendations</Text>
          <Pressable style={styles.retryButton} onPress={loadRecommendations}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Discover</Text>
        <Text style={styles.subtitle}>Personalized insights based on your interests</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {recommendations.map((item, index) => (
          <Pressable
            key={item.chunk_id}
            style={styles.card}
            onPress={() => handleItemPress(item)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.emoji}>{getTrackEmoji(item.episode_title)}</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{Math.round(item.score * 100)}%</Text>
              </View>
            </View>
            
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title_sent || item.episode_title}
            </Text>
            
            <Text style={styles.cardSnippet} numberOfLines={3}>
              {item.snippet}
            </Text>
            
            <View style={styles.cardFooter}>
              <Text style={styles.episodeTitle} numberOfLines={1}>
                {item.episode_title}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    marginLeft: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  card: {
    width: 280,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
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
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
  },
  scoreContainer: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },
  cardSnippet: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  episodeTitle: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
