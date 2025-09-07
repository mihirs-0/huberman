# Frontend-API Integration Mapping

This document maps all FastAPI endpoints to their corresponding frontend features and components.

## ✅ **Currently Implemented**

### 🏠 **Home Screen (`app/index.tsx`)**
- **`GET /v1/next`** - Today's Protocol Card
  - Replaces hardcoded protocol selection with AI-driven bandit selection
  - Uses user's focus tracks as goals parameter
  - Fallback to local protocols if API fails
  
- **`GET /v1/recommend`** - Discover Section
  - Shows personalized content recommendations below main protocol
  - Uses focus tracks mapped to API tags (sleep → ['sleep', 'circadian', 'recovery'])
  - Horizontal scrolling cards with relevance scores

- **`POST /v1/events`** - Protocol Completion Tracking
  - Logs when user completes daily protocol
  - Feeds into bandit algorithm for better future selections

### 🔍 **Insights Screen (`app/insights.tsx`)**
- **`GET /v1/search`** - Search Section
  - Toggle-able search interface with BM25 and TF-IDF modes
  - Real-time search with pagination support
  - Results navigate to detailed explanations

- **`GET /v1/explain`** - Detailed Content View
  - Shows when user clicks on search results or discover cards
  - Displays key excerpts, snippets, and source information
  - URL parameters: `?episode_id=X&chunk_index=Y`

### 🔧 **API Service Layer (`src/services/api.ts`)**
- **All endpoints** - Centralized service with error handling
- **User ID management** - Automatic generation and storage
- **Focus track mapping** - Converts app categories to API tags
- **Environment detection** - Different base URLs for dev/prod

## 🚧 **Ready to Implement**

### 📚 **Library Screen (`app/library.tsx`)**
**Recommended Integration:**
```typescript
// Add search functionality to library
import SearchSection from '@/components/SearchSection';

// Add protocol browsing by category
const browseByCategory = async (category: string) => {
  const tags = mapFocusTracksToTags([category]);
  const results = await apiService.recommend(tags, 50);
  // Display as grid/list
};
```

### 👤 **User Profile Management**
**Missing Component:** User Settings/Profile Screen
```typescript
// New component: src/components/UserProfile.tsx
const UserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>();
  
  const updateProfile = async (updates: Partial<UserProfile>) => {
    await apiService.updateUserProfile(userId, updates);
  };
  
  // UI for managing:
  // - Focus tracks (goals)
  // - Interest tags
  // - Notification preferences
};
```

### 📊 **Analytics & Progress Tracking**
**Enhanced Streaks Screen:**
```typescript
// Add to app/streaks.tsx
const StreaksScreen = () => {
  const [analytics, setAnalytics] = useState();
  
  const loadUserAnalytics = async () => {
    // Could add new endpoint: GET /v1/users/{id}/analytics
    // Show completion rates by protocol type
    // Show engagement patterns
  };
};
```

## 🎯 **Feature-Endpoint Mapping**

### Core Search & Discovery
| Feature | Endpoint | Status | Location |
|---------|----------|--------|----------|
| Daily Protocol Selection | `GET /v1/next` | ✅ Implemented | Home screen |
| Personalized Recommendations | `GET /v1/recommend` | ✅ Implemented | Home discover section |
| Content Search | `GET /v1/search` | ✅ Implemented | Insights search |
| Content Explanation | `GET /v1/explain` | ✅ Implemented | Insights detail view |

### User Management & Personalization
| Feature | Endpoint | Status | Location |
|---------|----------|--------|----------|
| User Profile | `GET /v1/users/{id}` | 🚧 Ready | Need profile screen |
| Update Preferences | `PATCH /v1/users/{id}` | 🚧 Ready | Need profile screen |
| Activity Logging | `POST /v1/events` | ✅ Implemented | Home completion |

### System & Admin
| Feature | Endpoint | Status | Location |
|---------|----------|--------|----------|
| Health Check | `GET /v1/health` | ✅ Available | For diagnostics |
| Refresh Data | `POST /v1/admin/refresh` | ✅ Available | For updates |

## 🎨 **UI/UX Enhancements**

### 1. **Enhanced Home Screen**
- ✅ Discover section with personalized recommendations
- ✅ AI-driven protocol selection with fallback
- ✅ Event logging for completion tracking
- 🚧 Add "Why this protocol?" explanation button
- 🚧 Add alternative protocol suggestions

### 2. **Smart Search Experience**
- ✅ Dual-mode search (keyword + semantic)
- ✅ Relevance scoring display
- ✅ Direct navigation to explanations
- 🚧 Search suggestions/autocomplete
- 🚧 Search history and saved searches

### 3. **Personalization Features**
- ✅ Focus track mapping to API tags
- ✅ User ID generation and persistence
- 🚧 Explicit user preferences management
- 🚧 Learning from user interactions
- 🚧 Customizable recommendation parameters

### 4. **Content Discovery**
- ✅ Horizontal scrolling recommendation cards
- ✅ Episode-specific content linking
- ✅ Relevance-based ranking
- 🚧 Topic-based browsing
- 🚧 Related content suggestions

## 📱 **Mobile-Specific Considerations**

### Performance Optimizations
- ✅ API service with error handling and timeouts
- ✅ Fallback to local data when API unavailable
- 🚧 Add caching for search results
- 🚧 Add offline mode for critical features

### User Experience
- ✅ Loading states for all API calls
- ✅ Error handling with retry options
- ✅ Seamless navigation between features
- 🚧 Add pull-to-refresh for recommendations
- 🚧 Add swipe gestures for content cards

## 🔄 **Data Flow Examples**

### Daily Protocol Flow
```
User opens app → 
Check if protocol exists → 
If not: Call /v1/next with user_id + focus_tracks → 
Display AI-selected protocol → 
User completes → Log to /v1/events → 
Update bandit for better future selections
```

### Discovery Flow
```
User views home → 
Call /v1/recommend with mapped tags → 
Display recommendation cards → 
User taps card → Navigate to insights with episode_id + chunk_index → 
Call /v1/explain → Show detailed content
```

### Search Flow
```
User opens insights → Toggle search → 
Enter query → Call /v1/search with mode (bm25/tfidf) → 
Display results with scores → 
User taps result → Navigate to explanation view
```

## 🚀 **Next Steps**

### High Priority
1. **User Profile Screen** - Enable explicit preference management
2. **Enhanced Library** - Add search and category browsing
3. **Protocol Alternatives** - Show multiple options with reasoning

### Medium Priority
4. **Analytics Dashboard** - User progress and patterns
5. **Offline Support** - Cache critical content
6. **Search Enhancements** - Autocomplete, history, filters

### Future Enhancements
7. **Social Features** - Share protocols, community insights
8. **Advanced Personalization** - ML-driven content curation
9. **Integration APIs** - Health apps, wearables, calendars

This mapping provides a clear roadmap for expanding the API integration and demonstrates how the ML-powered backend enhances the user experience with personalized, intelligent content discovery.
