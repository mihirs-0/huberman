import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  FlatList, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { apiService, SearchItem } from '../services/api';
import { router } from 'expo-router';

export default function SearchSection() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'bm25' | 'tfidf'>('bm25');

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      const response = await apiService.search(query.trim(), searchMode, 20);
      setResults(response.items);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: SearchItem) => {
    router.push({
      pathname: '/insights',
      params: {
        episode_id: item.episode_id,
        chunk_index: item.chunk_index.toString(),
      },
    });
  };

  const renderSearchResult = ({ item }: { item: SearchItem }) => (
    <Pressable style={styles.resultCard} onPress={() => handleItemPress(item)}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle} numberOfLines={2}>
          {item.title_sent || item.episode_title}
        </Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{Math.round(item.score * 100)}%</Text>
        </View>
      </View>
      
      <Text style={styles.resultSnippet} numberOfLines={3}>
        {item.snippet}
      </Text>
      
      <Text style={styles.resultEpisode} numberOfLines={1}>
        {item.episode_title}
      </Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search protocols and insights..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <Pressable style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </Pressable>
        </View>

        <View style={styles.modeSelector}>
          <Pressable
            style={[
              styles.modeButton,
              searchMode === 'bm25' && styles.modeButtonActive,
            ]}
            onPress={() => setSearchMode('bm25')}
          >
            <Text style={[
              styles.modeButtonText,
              searchMode === 'bm25' && styles.modeButtonTextActive,
            ]}>
              Keyword
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeButton,
              searchMode === 'tfidf' && styles.modeButtonActive,
            ]}
            onPress={() => setSearchMode('tfidf')}
          >
            <Text style={[
              styles.modeButtonText,
              searchMode === 'tfidf' && styles.modeButtonTextActive,
            ]}>
              Semantic
            </Text>
          </Pressable>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {results.length > 0 && (
        <FlatList
          data={results}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.chunk_id}
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!loading && query && results.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No results found for "{query}"</Text>
          <Text style={styles.emptySubtext}>Try different keywords or switch search modes</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchButtonText: {
    fontSize: 18,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#3b82f6',
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
  resultsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 12,
    lineHeight: 22,
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
  resultSnippet: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  resultEpisode: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
