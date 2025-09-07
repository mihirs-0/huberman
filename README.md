# 🧠 Huberman Protocols

A React Native app that delivers science-backed daily optimization protocols based on research from Dr. Andrew Huberman and leading neuroscience laboratories.

## ✨ Features

- **🎯 Personalized Protocols**: Daily science-backed protocols tailored to your focus areas (Sleep 🌙, Focus ⚡, Energy 🔋)
- **🔥 Streak Tracking**: Visual progress tracking with weekly dots and motivational milestones
- **📚 Protocol Library**: Comprehensive collection of 8+ protocols with detailed instructions and citations
- **💡 Science Insights**: Rotating educational content with source citations
- **🔔 Smart Notifications**: Daily reminders at your chosen time with motivational messages
- **📱 Cross-Platform**: Runs on iOS, Android, and Web via react-native-web
- **💾 Offline Storage**: All data stored locally using AsyncStorage

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- For mobile development: iOS Simulator or Android Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd huberman-protocols

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Platform-Specific Commands

```bash
# Development
npm run dev          # Start Expo dev server
npm run web          # Run on web browser
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator

# Production
npm run export:web   # Export for web deployment
```

## 🏗️ Tech Stack

- **Frontend**: React Native 0.74.3
- **Framework**: Expo SDK 51
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **Notifications**: Expo Notifications
- **Styling**: StyleSheet (React Native)
- **Web Support**: React Native Web
- **TypeScript**: Full type safety

## 📱 App Structure

### Screens

1. **Onboarding** (`/onboarding`)
   - Focus area selection (Sleep, Focus, Energy)
   - Daily reminder time picker
   - Welcome flow

2. **Today** (`/` - Home)
   - Daily protocol card with Action/Why/How format
   - Streak counter and weekly progress dots
   - Citations modal with "Why?" button
   - Quick navigation to other screens

3. **Streaks** (`/streaks`)
   - Detailed progress visualization
   - Weekly completion tracking
   - Motivational tips and statistics

4. **Library** (`/library`)
   - All protocols with filtering by focus area
   - Detailed protocol information
   - Scientific citations and sources

5. **Insights** (`/insights`)
   - Daily rotating science insights
   - Educational content from research
   - Source links and references

6. **About** (`/about`)
   - App information and disclaimer
   - Technology stack details
   - Resource links

### Core Protocols

1. **Morning Light Exposure** (Sleep) - Circadian rhythm optimization
2. **NSDR** (Focus) - Non-Sleep Deep Rest for neuroplasticity
3. **Strategic Caffeine Timing** (Energy) - Optimized caffeine consumption
4. **Ultradian Rhythm Work Blocks** (Focus) - 90-minute focus sessions
5. **Evening Light Management** (Sleep) - Melatonin production support
6. **Cold Exposure** (Energy) - Dopamine and resilience building
7. **Zone 2 Cardio** (Energy) - Mitochondrial function improvement
8. **Physiological Sigh** (Focus) - Rapid stress regulation

## 🔧 Configuration

### Notifications

The app uses Expo Notifications for daily reminders:

- **Mobile**: Full notification support with custom scheduling
- **Web**: Notifications gracefully disabled (not supported)

### Data Storage

All user data is stored locally using AsyncStorage:

- Onboarding preferences
- Streak data and completion history
- Focus area selections
- Notification settings

## 🌐 Deployment

### Web Deployment (Vercel/Netlify)

```bash
# Build for web
npm run export:web

# Deploy the 'dist' folder to your hosting platform
```

### Mobile Deployment

```bash
# Build for app stores using EAS Build
eas build --platform ios
eas build --platform android
```

## 📊 App Flow

```
Onboarding → Today Screen → Protocol Completion → Streak Update
     ↓            ↓              ↓                    ↓
Focus Areas → Daily Protocol → Citations Modal → Progress Tracking
     ↓            ↓              ↓                    ↓
Time Setup → Library Access → Science Learning → Motivation System
```

## 🧪 Scientific Foundation

All protocols are based on peer-reviewed research and expert recommendations:

- **Dr. Andrew Huberman**: Stanford neuroscientist and host of Huberman Lab podcast
- **Circadian Biology**: Light exposure and sleep optimization
- **Neuroplasticity**: Focus and learning enhancement protocols
- **Metabolic Health**: Energy and longevity optimization

## ⚠️ Important Disclaimer

This app is for educational and informational purposes only. It is not intended to provide medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals before making any changes to your health, fitness, or wellness routines.

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and enhancement requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Dr. Andrew Huberman** and the Huberman Lab for the scientific foundation
- **Stanford University** for the research backing these protocols
- **Expo Team** for the excellent development platform
- **React Native Community** for the cross-platform framework

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

Made with ❤️ and science for the optimization community 🧬
