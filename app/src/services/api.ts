// API service layer for communicating with the FastAPI backend
const API_BASE_URL = __DEV__ ? 'http://localhost:8000' : 'https://your-api-domain.com';

export interface SearchItem {
  chunk_id: string;
  episode_id: string;
  episode_title: string;
  chunk_index: number;
  title_sent: string;
  why_sent: string;
  snippet: string;
  score: number;
}

export interface SearchResponse {
  items: SearchItem[];
  mode: string;
  count: number;
}

export interface RecommendResponse {
  items: SearchItem[];
  reasons: string[];
}

export interface TodayProtocol {
  date: string;
  protocol_slug: string;
  variant: string;
  reason: string;
  copy: {
    title: string;
    action: string;
    why: string;
    how: string;
  };
  source?: {
    episode_id: string;
    chunk_index: number;
  };
}

export interface UserProfile {
  user_id: string;
  goals: string[];
  tags: string[];
}

export interface ExplainResponse {
  episode_id: string;
  episode_title: string;
  excerpts: string[];
  snippet: string;
}

class ApiService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = API_BASE_URL, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async health(): Promise<{ status: string; chunks: number; protocols: number }> {
    return this.request('/v1/health');
  }

  // Search chunks
  async search(
    query: string,
    mode: 'bm25' | 'tfidf' = 'bm25',
    limit: number = 10,
    offset: number = 0
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query,
      mode,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.request(`/v1/search?${params}`);
  }

  // Get personalized recommendations
  async recommend(
    tags: string[] = [],
    topk: number = 10
  ): Promise<RecommendResponse> {
    const params = new URLSearchParams();
    tags.forEach(tag => params.append('tags', tag));
    params.append('topk', topk.toString());
    return this.request(`/v1/recommend?${params}`);
  }

  // Get today's protocol (bandit selection)
  async getTodayProtocol(
    userId: string,
    goals?: string[]
  ): Promise<TodayProtocol> {
    const params = new URLSearchParams({ user_id: userId });
    if (goals) {
      goals.forEach(goal => params.append('goals', goal));
    }
    return this.request(`/v1/next?${params}`);
  }

  // Explain why a result is relevant
  async explain(
    episodeId: string,
    chunkIndex: number
  ): Promise<ExplainResponse> {
    const params = new URLSearchParams({
      episode_id: episodeId,
      chunk_index: chunkIndex.toString(),
    });
    return this.request(`/v1/explain?${params}`);
  }

  // Log user events (requires API key)
  async logEvent(event: {
    user_id: string;
    event: 'completed' | 'like' | 'skip';
    protocol_slug?: string;
    variant?: string;
    score?: number;
    ts?: string;
  }): Promise<{ status: string }> {
    return this.request('/v1/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.request(`/v1/users/${userId}`);
  }

  // Update user profile (requires API key)
  async updateUserProfile(
    userId: string,
    profile: { goals?: string[]; tags?: string[] }
  ): Promise<UserProfile> {
    return this.request(`/v1/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ user_id: userId, ...profile }),
    });
  }

  // Admin: refresh artifacts (requires API key)
  async refreshArtifacts(): Promise<{ status: string; chunks: number }> {
    return this.request('/v1/admin/refresh', {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Helper function to generate user ID (simple approach)
export const getUserId = (): string => {
  let userId = localStorage?.getItem?.('huberman_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage?.setItem?.('huberman_user_id', userId);
  }
  return userId;
};

// Helper function to map focus tracks to API tags
export const mapFocusTracksToTags = (focusTracks: string[]): string[] => {
  const mapping: Record<string, string[]> = {
    sleep: ['sleep', 'circadian', 'recovery'],
    focus: ['focus', 'attention', 'productivity', 'cognitive'],
    energy: ['energy', 'metabolic', 'performance'],
  };

  const tags = new Set<string>();
  focusTracks.forEach(track => {
    const trackTags = mapping[track] || [track];
    trackTags.forEach(tag => tags.add(tag));
  });

  return Array.from(tags);
};
