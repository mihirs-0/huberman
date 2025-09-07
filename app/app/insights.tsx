import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import insights from '@/data/insights.json';
import { router } from 'expo-router';
import { apiService, ExplainResponse } from '@/services/api';
import SearchSection from '@/components/SearchSection';

interface Insight {
  text: string;
  source_title: string;
}

export default function InsightsScreen() {
  const params = useLocalSearchParams();
  const [currentInsight, setCurrentInsight] = useState<Insight>(insights[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [apiExplanation, setApiExplanation] = useState<ExplainResponse | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    // Check if we have specific content to show from API
    if (params.episode_id && params.chunk_index) {
      loadApiExplanation(params.episode_id as string, parseInt(params.chunk_index as string));
    } else {
      // Rotate insights daily
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      const index = dayOfYear % insights.length;
      setCurrentIndex(index);
      setCurrentInsight(insights[index]);
    }
  }, [params]);

  const loadApiExplanation = async (episodeId: string, chunkIndex: number) => {
    try {
      const explanation = await apiService.explain(episodeId, chunkIndex);
      setApiExplanation(explanation);
    } catch (error) {
      console.error('Failed to load explanation:', error);
    }
  };

  const handleNextInsight = () => {
    const nextIndex = (currentIndex + 1) % insights.length;
    setCurrentIndex(nextIndex);
    setCurrentInsight(insights[nextIndex]);
  };

  const handlePrevInsight = () => {
    const prevIndex = currentIndex === 0 ? insights.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentInsight(insights[prevIndex]);
  };

  const renderInsightCard = ({ item, index }: { item: Insight; index: number }) => (
    <Pressable 
      style={[
        styles.insightCard,
        index === currentIndex && styles.insightCardActive
      ]}
      onPress={() => {
        setCurrentIndex(index);
        setCurrentInsight(item);
      }}
    >
      <Text style={styles.insightText} numberOfLines={3}>
        {item.text}
      </Text>
      <Text style={styles.insightSource}>{item.source_title}</Text>
    </Pressable>
  );

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
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Science Insights</Text>
              <Text style={styles.subtitle}>Knowledge from neuroscience research</Text>
            </View>
            <Pressable 
              style={styles.searchButton}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Text style={styles.searchButtonIcon}>🔍</Text>
            </Pressable>
          </View>
        </View>

        {/* Search Section */}
        {showSearch && <SearchSection />}

        {/* API-Driven Content or Featured Insight */}
        {apiExplanation ? (
          <View style={styles.featuredCard}>
            <View style={styles.featuredHeader}>
              <Text style={styles.featuredLabel}>🧠 Research Insight</Text>
              <Pressable 
                style={styles.closeButton}
                onPress={() => setApiExplanation(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
            
            <Text style={styles.featuredText}>{apiExplanation.snippet}</Text>
            
            {apiExplanation.excerpts.length > 0 && (
              <View style={styles.excerptsContainer}>
                <Text style={styles.excerptsLabel}>Key Points:</Text>
                {apiExplanation.excerpts.map((excerpt, index) => (
                  <Text key={index} style={styles.excerptText}>• {excerpt}</Text>
                ))}
              </View>
            )}
            
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceLabel}>Source:</Text>
              <Text style={styles.sourceText}>{apiExplanation.episode_title}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.featuredCard}>
          <View style={styles.featuredHeader}>
            <Text style={styles.featuredLabel}>💡 Today's Insight</Text>
            <Text style={styles.insightCounter}>
              {currentIndex + 1} of {insights.length}
            </Text>
          </View>
          
          <Text style={styles.featuredText}>{currentInsight.text}</Text>
          
          <View style={styles.sourceContainer}>
            <Text style={styles.sourceLabel}>Source:</Text>
            <Text style={styles.sourceText}>{currentInsight.source_title}</Text>
          </View>
          
          <View style={styles.navigationButtons}>
            <Pressable 
              style={styles.navButton}
              onPress={handlePrevInsight}
            >
              <Text style={styles.navButtonText}>← Previous</Text>
            </Pressable>
            
            <Pressable 
              style={styles.navButton}
              onPress={handleNextInsight}
            >
              <Text style={styles.navButtonText}>Next →</Text>
            </Pressable>
          </View>
        </View>
        )}

        {/* All Insights Grid */}
        <View style={styles.allInsightsSection}>
          <Text style={styles.sectionTitle}>All Insights</Text>
          <FlatList
            data={insights}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderInsightCard}
            scrollEnabled={false}
            numColumns={1}
          />
        </View>

        {/* Learning Resources */}
        <View style={styles.resourcesCard}>
          <Text style={styles.sectionTitle}>📚 Learn More</Text>
          <View style={styles.resourcesList}>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceIcon}>🎧</Text>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>Huberman Lab Podcast</Text>
                <Text style={styles.resourceDescription}>
                  Deep dives into neuroscience and optimization protocols
                </Text>
              </View>
            </View>
            
            <View style={styles.resourceItem}>
              <Text style={styles.resourceIcon}>📖</Text>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>Research Papers</Text>
                <Text style={styles.resourceDescription}>
                  Original studies behind the protocols and insights
                </Text>
              </View>
            </View>
            
            <View style={styles.resourceItem}>
              <Text style={styles.resourceIcon}>🧪</Text>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>Lab Studies</Text>
                <Text style={styles.resourceDescription}>
                  Latest findings from neuroscience laboratories
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>⚠️ Important Note</Text>
          <Text style={styles.disclaimerText}>
            This information is for educational purposes only and is not medical advice. 
            Always consult with healthcare professionals before making significant changes 
            to your health routines.
          </Text>
        </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f3f4f6',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonIcon: {
    fontSize: 18,
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
  excerptsContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  excerptsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  excerptText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
    marginBottom: 4,
  },
  featuredCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuredLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f59e0b',
  },
  insightCounter: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  featuredText: {
    fontSize: 18,
    color: '#111827',
    lineHeight: 28,
    marginBottom: 20,
  },
  sourceContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sourceLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  allInsightsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  insightCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightSource: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  resourcesCard: {
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
  resourcesList: {
    gap: 16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  resourceIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});