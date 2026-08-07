import { Story, QuotaStatus, SavedStory } from './types';
import { SEED_STORIES, INITIAL_QUOTA } from './seedData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

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
        return data.map((item: any) => ({
          ...item,
          id: item.id || `story-${Math.random()}`,
          title: item.title || item.headline || 'Untitled Story Cluster',
          category: item.category || item.topic || 'General',
          sources_count: item.sources_count || item.article_count || (item.articles ? item.articles.length : 5),
          articles: item.articles || [],
          analysis: item.analysis || {
            balanced_summary: {
              overview: item.headline || item.title || 'Story cluster aggregated across multiple outlets.',
              consensus_points: [],
              key_disagreements: []
            }
          }
        }));
      }
    }
  } catch (error) {
    console.warn('Backend API unavailable, serving seed data fallback:', error);
  }

  // Fallback filtering on SEED_STORIES
  let stories = [...SEED_STORIES];
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
      if (data && data.id) return data;
    }
  } catch (error) {
    console.warn(`Backend API unavailable for story ${id}, serving seed fallback`);
  }

  const found = SEED_STORIES.find((s) => s.id === id);
  return found || SEED_STORIES[0];
}

export async function fetchQuotaStatus(): Promise<QuotaStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/quota`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
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

  // Local storage bookmark fallback
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
      if (res.ok) return await res.json();
    }
  } catch (error) {
    console.warn('Saved stories API error:', error);
  }

  // Fallback to local storage saved stories
  if (typeof window !== 'undefined') {
    const savedIds: string[] = JSON.parse(localStorage.getItem('prism_saved_stories') || '[]');
    const matching = SEED_STORIES.filter((s) => savedIds.includes(s.id));
    return matching.map((story) => ({
      id: `saved-${story.id}`,
      user_id: 'user-demo',
      story_id: story.id,
      saved_at: new Date().toISOString(),
      story,
    }));
  }
  return [];
}
