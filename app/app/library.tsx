import { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, SafeAreaView, Modal, ScrollView } from 'react-native';
import protocols from '@/data/protocols.json';
import { router } from 'expo-router';
import { Protocol } from '@/store/useStore';

export default function Library() {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [filterTrack, setFilterTrack] = useState<string | null>(null);

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

  const filteredProtocols = filterTrack 
    ? protocols.filter(p => p.track === filterTrack)
    : protocols;

  const trackCounts = {
    all: protocols.length,
    sleep: protocols.filter(p => p.track === 'sleep').length,
    focus: protocols.filter(p => p.track === 'focus').length,
    energy: protocols.filter(p => p.track === 'energy').length,
  };

  const renderProtocolCard = ({ item }: { item: typeof protocols[0] }) => {
    const trackColors = getTrackColor(item.track);
    
    return (
      <Pressable 
        style={styles.protocolCard}
        onPress={() => setSelectedProtocol(item as Protocol)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.trackBadge, { backgroundColor: trackColors.bg, borderColor: trackColors.border }]}>
            <Text style={styles.trackEmoji}>{getTrackEmoji(item.track)}</Text>
            <Text style={[styles.trackText, { color: trackColors.text }]}>
              {item.track?.toUpperCase() || 'PROTOCOL'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.protocolTitle}>{item.title}</Text>
        <Text style={styles.protocolAction} numberOfLines={2}>{item.action}</Text>
        <Text style={styles.protocolWhy} numberOfLines={2}>{item.why}</Text>
        
        <Pressable style={styles.learnMoreButton}>
          <Text style={styles.learnMoreText}>Learn More →</Text>
        </Pressable>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Protocol Library</Text>
        <Text style={styles.subtitle}>Science-backed optimization strategies</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <Pressable 
          style={[styles.filterTab, !filterTrack && styles.filterTabActive]}
          onPress={() => setFilterTrack(null)}
        >
          <Text style={[styles.filterTabText, !filterTrack && styles.filterTabTextActive]}>
            All ({trackCounts.all})
          </Text>
        </Pressable>
        
        <Pressable 
          style={[styles.filterTab, filterTrack === 'sleep' && styles.filterTabActive]}
          onPress={() => setFilterTrack('sleep')}
        >
          <Text style={styles.filterTabEmoji}>🌙</Text>
          <Text style={[styles.filterTabText, filterTrack === 'sleep' && styles.filterTabTextActive]}>
            Sleep ({trackCounts.sleep})
          </Text>
        </Pressable>
        
        <Pressable 
          style={[styles.filterTab, filterTrack === 'focus' && styles.filterTabActive]}
          onPress={() => setFilterTrack('focus')}
        >
          <Text style={styles.filterTabEmoji}>⚡</Text>
          <Text style={[styles.filterTabText, filterTrack === 'focus' && styles.filterTabTextActive]}>
            Focus ({trackCounts.focus})
          </Text>
        </Pressable>
        
        <Pressable 
          style={[styles.filterTab, filterTrack === 'energy' && styles.filterTabActive]}
          onPress={() => setFilterTrack('energy')}
        >
          <Text style={styles.filterTabEmoji}>🔋</Text>
          <Text style={[styles.filterTabText, filterTrack === 'energy' && styles.filterTabTextActive]}>
            Energy ({trackCounts.energy})
          </Text>
        </Pressable>
      </ScrollView>

      <FlatList
        data={filteredProtocols}
        keyExtractor={(item) => item.slug}
        renderItem={renderProtocolCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Protocol Detail Modal */}
      <Modal
        visible={!!selectedProtocol}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedProtocol && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedProtocol.title}</Text>
              <Pressable 
                style={styles.closeButton}
                onPress={() => setSelectedProtocol(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={[
                styles.modalTrackBadge, 
                { backgroundColor: getTrackColor(selectedProtocol.track).bg }
              ]}>
                <Text style={styles.modalTrackEmoji}>{getTrackEmoji(selectedProtocol.track)}</Text>
                <Text style={[
                  styles.modalTrackText, 
                  { color: getTrackColor(selectedProtocol.track).text }
                ]}>
                  {selectedProtocol.track?.toUpperCase() || 'PROTOCOL'}
                </Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Action</Text>
                <Text style={styles.modalSectionContent}>{selectedProtocol.action}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Why It Works</Text>
                <Text style={styles.modalSectionContent}>{selectedProtocol.why}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>How To Do It</Text>
                <Text style={styles.modalSectionContent}>{selectedProtocol.how}</Text>
              </View>
              
              {selectedProtocol.citations && selectedProtocol.citations.length > 0 && (
                <View style={styles.citationsSection}>
                  <Text style={styles.modalSectionTitle}>Sources</Text>
                  {selectedProtocol.citations.map((citation, index) => (
                    <Text key={index} style={styles.citation}>• {citation}</Text>
                  ))}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
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
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterTabEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  protocolCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 12,
  },
  trackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  trackEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  trackText: {
    fontSize: 10,
    fontWeight: '700',
  },
  protocolTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  protocolAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  protocolWhy: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  learnMoreButton: {
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
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
    flex: 1,
    marginRight: 16,
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
  modalTrackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  modalTrackEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  modalTrackText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalSectionContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  citationsSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  citation: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 4,
  },
});
