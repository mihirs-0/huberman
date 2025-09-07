import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView, Linking } from 'react-native';
import { router } from 'expo-router';

export default function AboutScreen() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
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
          <Text style={styles.title}>About</Text>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.appTitle}>🧠 Huberman Protocols</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>
            Science-backed daily optimization protocols based on research from 
            Dr. Andrew Huberman and leading neuroscience laboratories.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresList}>
            <Text style={styles.feature}>• Daily personalized protocols</Text>
            <Text style={styles.feature}>• Streak tracking and progress visualization</Text>
            <Text style={styles.feature}>• Comprehensive protocol library</Text>
            <Text style={styles.feature}>• Science insights and citations</Text>
            <Text style={styles.feature}>• Daily reminder notifications</Text>
            <Text style={styles.feature}>• Cross-platform compatibility</Text>
          </View>
        </View>

        {/* Tech Stack */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technology</Text>
          <View style={styles.techStack}>
            <Text style={styles.techItem}>⚛️ React Native</Text>
            <Text style={styles.techItem}>📱 Expo</Text>
            <Text style={styles.techItem}>🔄 Zustand</Text>
            <Text style={styles.techItem}>🌐 React Native Web</Text>
            <Text style={styles.techItem}>💾 AsyncStorage</Text>
            <Text style={styles.techItem}>🔔 Expo Notifications</Text>
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <Pressable 
            style={styles.linkButton}
            onPress={() => handleOpenLink('https://hubermanlab.com')}
          >
            <Text style={styles.linkText}>🎧 Huberman Lab Podcast</Text>
            <Text style={styles.linkArrow}>→</Text>
          </Pressable>
          
          <Pressable 
            style={styles.linkButton}
            onPress={() => handleOpenLink('https://github.com')}
          >
            <Text style={styles.linkText}>📂 GitHub Repository</Text>
            <Text style={styles.linkArrow}>→</Text>
          </Pressable>
          
          <Pressable 
            style={styles.linkButton}
            onPress={() => handleOpenLink('https://stanfordhubermanlab.com')}
          >
            <Text style={styles.linkText}>🏫 Stanford Lab</Text>
            <Text style={styles.linkArrow}>→</Text>
          </Pressable>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerTitle}>⚠️ Important Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            This app is for educational and informational purposes only. It is not intended 
            to provide medical advice, diagnosis, or treatment. Always consult with qualified 
            healthcare professionals before making any changes to your health, fitness, or 
            wellness routines.
          </Text>
          <Text style={styles.disclaimerText}>
            The protocols and information presented are based on scientific research and 
            expert recommendations, but individual results may vary. Listen to your body 
            and seek professional guidance when needed.
          </Text>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>
          <Text style={styles.creditsText}>
            Protocols and insights based on the work of Dr. Andrew Huberman and 
            research from Stanford University's Huberman Lab.
          </Text>
          <Text style={styles.creditsText}>
            App developed with ❤️ for the optimization community.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with science and care 🧬
          </Text>
          <Text style={styles.footerText}>
            © 2024 Huberman Protocols
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
  },
  section: {
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
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  feature: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techItem: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  linkText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  linkArrow: {
    fontSize: 16,
    color: '#6b7280',
  },
  disclaimerSection: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
    marginBottom: 12,
  },
  creditsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
});
