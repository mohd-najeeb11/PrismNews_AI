export type BiasRating = 'left' | 'lean_left' | 'center' | 'lean_right' | 'right';
export type ToneType = 'neutral' | 'critical' | 'sympathetic' | 'alarmist' | 'optimistic';

export interface Article {
  id: string;
  source_id: string;
  source_name: string;
  source_bias?: BiasRating;
  title: string;
  url: string;
  author?: string;
  published_at: string;
  summary?: string;
  content?: string;
  tone?: ToneType;
}

export interface BalancedSummary {
  overview: string;
  consensus_points: string[];
  disputed_points: string[];
  key_takeaway: string;
}

export interface ComparisonItem {
  outlet_name: string;
  bias_rating: BiasRating;
  article_title: string;
  article_url: string;
  framing_summary: string;
  tone: ToneType;
  key_quotes: string[];
}

export interface LoadedPhrase {
  phrase: string;
  outlet: string;
  bias: BiasRating;
  reason: string;
  neutral_alternative: string;
}

export interface BiasAnalysis {
  spectrum_score: number; // -1.0 (Left) to +1.0 (Right)
  dominant_framing: string;
  loaded_phrases: LoadedPhrase[];
  source_bias_distribution: Record<BiasRating, number>;
}

export interface MissingPerspective {
  angle: string;
  description: string;
  why_it_matters: string;
  missing_from_outlets: string[];
}

export interface TimelineEvent {
  timestamp: string;
  outlet: string;
  headline: string;
  framing_shift: string;
  url?: string;
}

export interface StoryAnalysis {
  story_id: string;
  analyzed_at: string;
  balanced_summary: BalancedSummary;
  comparison: ComparisonItem[];
  bias_analysis: BiasAnalysis;
  missing_perspectives: MissingPerspective[];
  timeline: TimelineEvent[];
}

export interface Story {
  id: string;
  title: string;
  category: string;
  created_at: string;
  updated_at: string;
  article_count: number;
  sources_count: number;
  dominant_bias?: BiasRating;
  articles?: Article[];
  analysis?: StoryAnalysis;
}

export interface QuotaStatus {
  api_mode: 'seed' | 'live' | 'hybrid';
  newsapi_used: number;
  newsapi_limit: number;
  gemini_used: number;
  gemini_limit: number;
  groq_used: number;
  groq_limit: number;
  reset_time: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface SavedStory {
  id: string;
  user_id: string;
  story_id: string;
  saved_at: string;
  notes?: string;
  story?: Story;
}
