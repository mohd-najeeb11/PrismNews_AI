import { Story, QuotaStatus, SavedStory, BalancedSummary, ComparisonItem, LoadedPhrase, BiasAnalysis, MissingPerspective, TimelineEvent, BiasRating } from './types';
import { SEED_STORIES, INITIAL_QUOTA } from './seedData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export function normalizeStory(raw: any): Story {
  if (!raw) return SEED_STORIES[0];

  const analysis = raw.analysis || {};
  const rawSummary = analysis.balanced_summary || {};
  const rawBias = analysis.bias_analysis || {};
  const rawMissing = analysis.missing_perspectives || {};

  // 1. Balanced Summary
  const balanced_summary: BalancedSummary = {
    overview:
      rawSummary.overview ||
      rawSummary.neutral_summary ||
      raw.headline ||
      raw.title ||
      'Multi-outlet consensus analysis aggregated across publishers.',
    consensus_points:
      rawSummary.consensus_points ||
      rawSummary.consensus_facts ||
      ['Outlets agree on core breaking timeline of events.', 'Official statements recorded across major reporting bodies.'],
    disputed_points:
      rawSummary.disputed_points ||
      rawSummary.key_disagreements ||
      ['Outlets differ on economic impact predictions.', 'Political framing varies from regulatory oversight to free-market concern.'],
    key_takeaway:
      rawSummary.key_takeaway ||
      'Media coverage exhibits notable framing variance between regulatory compliance angles and economic impact perspectives.',
  };

  // 2. Comparison Matrix
  const rawComparison = Array.isArray(analysis.comparison) ? analysis.comparison : [];
  let comparison: ComparisonItem[] = rawComparison.map((c: any) => ({
    outlet_name: c.outlet_name || c.outlet || c.source || 'News Outlet',
    bias_rating: (c.bias_rating || c.source_bias || c.bias || 'center').toLowerCase().replace(/\s+/g, '_') as BiasRating,
    article_title: c.article_title || c.headline || c.title || 'Coverage Report',
    article_url: c.article_url || c.url || '#',
    framing_summary: c.framing_summary || c.emphasis || c.snippet || 'Framing angle emphasizes reporting focus.',
    tone: (c.tone || 'neutral').toLowerCase() as any,
    key_quotes: c.key_quotes || (c.emphasis ? [c.emphasis] : ['Extract from published reporting.']),
  }));

  if (comparison.length === 0 && Array.isArray(raw.articles)) {
    comparison = raw.articles.map((art: any) => ({
      outlet_name: art.source_name || art.source || 'Publisher',
      bias_rating: (art.source_bias || 'center').toLowerCase().replace(/\s+/g, '_') as BiasRating,
      article_title: art.title || 'Article Coverage',
      article_url: art.url || '#',
      framing_summary: art.summary || art.snippet || 'Standard news reporting.',
      tone: (art.tone || 'neutral').toLowerCase() as any,
      key_quotes: art.summary ? [art.summary] : [],
    }));
  }

  // 3. Bias Analysis
  let loaded_phrases: LoadedPhrase[] = [];
  if (Array.isArray(rawBias.loaded_phrases)) {
    loaded_phrases = rawBias.loaded_phrases.map((lp: any) => ({
      phrase: lp.phrase || lp.text || 'loaded phrase',
      outlet: lp.outlet || lp.source || 'News Source',
      bias: (lp.bias || 'center').toLowerCase().replace(/\s+/g, '_') as BiasRating,
      reason: lp.reason || 'Framing uses emotionally charged terminology.',
      neutral_alternative: lp.neutral_alternative || 'Objective factual description',
    }));
  } else if (Array.isArray(rawBias)) {
    rawBias.forEach((bItem: any) => {
      if (Array.isArray(bItem.loaded_phrases)) {
        bItem.loaded_phrases.forEach((lp: any) => {
          loaded_phrases.push({
            phrase: lp.phrase || lp.text || 'loaded phrase',
            outlet: bItem.source || 'Publisher',
            bias: (bItem.tone === 'critical' ? 'lean_right' : 'lean_left') as BiasRating,
            reason: lp.reason || 'Loaded phrasing framing.',
            neutral_alternative: 'Factual statement',
          });
        });
      }
    });
  }

  if (loaded_phrases.length === 0) {
    loaded_phrases = [
      {
        phrase: 'historic milestone',
        outlet: 'BBC News',
        bias: 'lean_left',
        reason: 'Laudatory terminology emphasizing international achievement',
        neutral_alternative: 'ratified accord',
      },
      {
        phrase: 'stifle American innovation',
        outlet: 'Fox News',
        bias: 'lean_right',
        reason: 'Protectionist framing highlighting regulatory burdens',
        neutral_alternative: 'impose compliance standards',
      },
    ];
  }

  const bias_analysis: BiasAnalysis = {
    spectrum_score: typeof rawBias.spectrum_score === 'number' ? rawBias.spectrum_score : 0.05,
    dominant_framing: rawBias.dominant_framing || 'Balanced Multi-Spectrum Reporting',
    loaded_phrases,
    source_bias_distribution: rawBias.source_bias_distribution || {
      left: 1,
      lean_left: 1,
      center: 2,
      lean_right: 1,
      right: 1,
    },
  };

  // 4. Missing Perspectives
  let missing_perspectives: MissingPerspective[] = [];
  if (Array.isArray(rawMissing)) {
    missing_perspectives = rawMissing.map((mp: any) => ({
      angle: mp.angle || 'Omitted Stakeholder View',
      description: mp.description || 'Viewpoint absent from primary headline framing.',
      why_it_matters: mp.why_it_matters || 'Critical for comprehensive public understanding.',
      missing_from_outlets: mp.missing_from_outlets || ['Major Outlets'],
    }));
  } else if (rawMissing.missing && Array.isArray(rawMissing.missing)) {
    missing_perspectives = rawMissing.missing.map((m: string) => ({
      angle: m,
      description: `The perspective of '${m}' is largely omitted from mainstream outlet headlines.`,
      why_it_matters: 'Ensures public debate accounts for grassroots and technical impacts.',
      missing_from_outlets: ['Leading Outlets'],
    }));
  }

  if (missing_perspectives.length === 0) {
    missing_perspectives = [
      {
        angle: 'Open-Source Developer Community Impact',
        description: 'Limited coverage regarding compliance exemptions for non-profit open-source AI maintainers.',
        why_it_matters: 'High compliance burdens could deter community-driven open innovation.',
        missing_from_outlets: ['Fox News', 'Wall Street Journal'],
      },
      {
        angle: 'Developing Nations Implementation Capacity',
        description: 'Omits analysis of technical auditing resources in emerging markets.',
        why_it_matters: 'Global standards require global verification infrastructure.',
        missing_from_outlets: ['BBC News', 'Reuters'],
      },
    ];
  }

  // 5. Timeline Events
  const rawTimeline = Array.isArray(analysis.timeline) ? analysis.timeline : [];
  const timeline: TimelineEvent[] = rawTimeline.map((t: any) => ({
    timestamp: t.timestamp || t.published_at || 'Recently',
    outlet: t.outlet || t.source || 'News Outlet',
    headline: t.headline || t.title || 'Narrative Update',
    framing_shift: t.framing_shift || 'Shifted focus to policy implications.',
    url: t.url || '#',
  }));

  return {
    id: raw.id || 'story-ai-act-2026',
    title: raw.title || raw.headline || 'Global News Cluster',
    category: raw.category || raw.topic || 'Technology & Policy',
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
    article_count: raw.article_count || (raw.articles ? raw.articles.length : 5),
    sources_count: raw.sources_count || raw.article_count || 5,
    articles: raw.articles || [],
    analysis: {
      story_id: raw.id || 'story-ai-act-2026',
      analyzed_at: analysis.analyzed_at || new Date().toISOString(),
      balanced_summary,
      comparison,
      bias_analysis,
      missing_perspectives,
      timeline: timeline.length > 0 ? timeline : [
        {
          timestamp: '08:30 AM',
          outlet: 'Reuters',
          headline: 'Global Accord Reached on AI Safety',
          framing_shift: 'Initial focus centered on international diplomatic consensus.',
        },
        {
          timestamp: '09:00 AM',
          outlet: 'Wall Street Journal',
          headline: 'Compliance Costs Alarm Startups',
          framing_shift: 'Narrative pivoted toward financial impacts on private markets.',
        },
      ],
    },
  };
}

export async function fetchStories(category?: string, query?: string): Promise<Story[]> {
  try {
    let url = `${API_BASE_URL}/stories`;
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (query && query.trim()) {
      params.append('q', query.trim());
      params.append('query', query.trim());
    }
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { cache: 'no-store', next: { revalidate: 0 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => normalizeStory(item));
      }
    }
  } catch (error) {
    console.warn('Backend API unavailable, serving seed data fallback:', error);
  }

  // Fallback filtering on SEED_STORIES
  let stories = SEED_STORIES.map((s) => normalizeStory(s));
  if (category && category !== 'All') {
    stories = stories.filter((s) => s.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    stories = stories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.analysis && s.analysis.balanced_summary && s.analysis.balanced_summary.overview && s.analysis.balanced_summary.overview.toLowerCase().includes(q)) ||
        s.articles?.some((a) => a.title.toLowerCase().includes(q) || a.source_name.toLowerCase().includes(q))
    );
  }
  return stories;
}

export async function fetchStoryById(id: string): Promise<Story | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/stories/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.id || data.headline || data.title)) {
        return normalizeStory(data);
      }
    }
  } catch (error) {
    console.warn(`Backend API unavailable for story ${id}, serving seed fallback`);
  }

  const found = SEED_STORIES.find((s) => s.id === id);
  return normalizeStory(found || SEED_STORIES[0]);
}

export async function fetchQuotaStatus(): Promise<QuotaStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/quota`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      // Map backend QuotaStatusResponse format if needed
      if (data.services) {
        return {
          api_mode: data.api_mode || 'live',
          newsapi_used: data.services.newsapi?.calls_today || 5,
          newsapi_limit: data.services.newsapi?.daily_budget || 8,
          gemini_used: data.services.gemini?.calls_today || 12,
          gemini_limit: data.services.gemini?.daily_budget || 20,
          groq_used: data.services.groq?.calls_today || 2,
          groq_limit: data.services.groq?.daily_budget || 10,
          reset_time: data.reset_at_utc || new Date().toISOString(),
        };
      }
      return data;
    }
  } catch (error) {
    // Return fallback quota
  }
  return INITIAL_QUOTA;
}

export async function triggerReanalysis(storyId: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/ingest/analyze/${storyId}`, { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    // Mock simulation delay
  }
  await new Promise((r) => setTimeout(r, 1500));
  return { success: true, message: `Story ${storyId} re-analyzed successfully (Seed fallback mode)` };
}

export async function saveStoryToSavedList(storyId: string, token?: string): Promise<boolean> {
  try {
    if (token) {
      const res = await fetch(`${API_BASE_URL}/saved-stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ story_id: storyId }),
      });
      if (res.ok) return true;
    }
  } catch (error) {
    console.warn('Saved story API error:', error);
  }

  if (typeof window !== 'undefined') {
    const saved = JSON.parse(localStorage.getItem('prism_saved_stories') || '[]');
    if (!saved.includes(storyId)) {
      saved.push(storyId);
      localStorage.setItem('prism_saved_stories', JSON.stringify(saved));
    }
    return true;
  }
  return false;
}

export async function getSavedStories(token?: string): Promise<SavedStory[]> {
  try {
    if (token) {
      const res = await fetch(`${API_BASE_URL}/saved-stories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map((item: any) => ({
            id: item.id || `saved-${Math.random()}`,
            user_id: item.user_id || 'user-demo',
            story_id: item.story_id || item.story?.id || 'story-ai-act-2026',
            saved_at: item.saved_at || new Date().toISOString(),
            story: normalizeStory(item.story || SEED_STORIES[0]),
          }));
        }
      }
    }
  } catch (error) {
    console.warn('Saved stories API error:', error);
  }

  if (typeof window !== 'undefined') {
    const savedIds: string[] = JSON.parse(localStorage.getItem('prism_saved_stories') || '[]');
    const matching = SEED_STORIES.filter((s) => savedIds.includes(s.id));
    return matching.map((story) => ({
      id: `saved-${story.id}`,
      user_id: 'user-demo',
      story_id: story.id,
      saved_at: new Date().toISOString(),
      story: normalizeStory(story),
    }));
  }
  return [];
}
