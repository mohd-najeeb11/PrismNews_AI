'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Story } from '@/lib/types';
import { fetchStories, fetchLiveStoryByQuery } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';
import { Sparkles, Layers, ArrowRight, Compass, Scale, Newspaper, EyeOff, Clock, Search, Loader2 } from 'lucide-react';

const CATEGORIES = ['All', 'Technology & Policy', 'Economy & Markets', 'Energy & Environment', 'World News'];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  const { t } = useLanguage();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveSearching, setLiveSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState(queryParam);

  useEffect(() => {
    setSearchTerm(queryParam);
    if (queryParam && queryParam.trim()) {
      handleSearchSubmit(queryParam.trim());
    }
  }, [queryParam]);

  const handleSearchSubmit = async (query: string) => {
    if (!query || !query.trim()) return;
    setLiveSearching(true);
    try {
      const liveStory = await fetchLiveStoryByQuery(query.trim());
      if (liveStory && liveStory.id) {
        router.push(`/story/${liveStory.id}`);
        return;
      }
    } catch (e) {
      console.warn('Live search redirect failed:', e);
    } finally {
      setLiveSearching(false);
    }
  };

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      fetchStories(selectedCategory === 'All' ? undefined : selectedCategory, searchTerm)
        .then(setStories)
        .finally(() => setLoading(false));
    };

    loadData();

    if (typeof window !== 'undefined') {
      window.addEventListener('apiModeChanged', loadData);
      return () => window.removeEventListener('apiModeChanged', loadData);
    }
  }, [selectedCategory, searchTerm]);

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>{t('hero_badge')}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          {t('hero_title_line1')} <br />
          <span className="gradient-text">{t('hero_title_line2')}</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t('hero_subtitle')}
        </p>

        {/* Interactive Search Bar & Topic Chips */}
        <div className="pt-2 space-y-3 max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit(searchTerm);
            }}
            className="relative flex items-center shadow-xl shadow-blue-500/5 rounded-2xl"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 rounded-2xl pl-11 pr-28 py-3.5 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
            <button
              type="submit"
              disabled={liveSearching}
              className="absolute right-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-md"
            >
              {liveSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{liveSearching ? t('search_fetching') : t('search_button')}</span>
            </button>
          </form>

          {liveSearching && (
            <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-300 flex items-center justify-center space-x-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>{t('search_live_banner')} "{searchTerm}"...</span>
            </div>
          )}

          {/* Quick Topic Chips */}
          <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-medium text-slate-400">
            <span className="text-slate-500">{t('popular_topics')}</span>
            {['AI Policy', 'Election 2024', 'Climate Summit', 'Federal Reserve', 'Tech Stocks'].map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  setSearchTerm(topic);
                  handleSearchSubmit(topic);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              >
                #{topic}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Pill Highlights */}
        <div className="flex flex-wrap justify-center gap-3 pt-2 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <Scale className="w-4 h-4 text-blue-400" /> {t('feat_balanced')}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <Newspaper className="w-4 h-4 text-purple-400" /> {t('feat_comparison')}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <EyeOff className="w-4 h-4 text-amber-400" /> {t('feat_blindspots')}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <Clock className="w-4 h-4 text-emerald-400" /> {t('feat_timelines')}
          </span>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat === 'All' ? t('cat_all') : cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {t('showing_clusters')} <strong className="text-slate-200">{stories.length}</strong> {t('story_clusters')}
          </div>
        </div>

        {/* Story Cluster Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card h-64 rounded-2xl animate-pulse p-6 space-y-4">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-5/6" />
                <div className="h-16 bg-slate-800/50 rounded w-full" />
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl space-y-3">
            <Compass className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">{t('no_stories_found')}</h3>
            <p className="text-xs text-slate-500">{t('no_stories_sub')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4 group hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="space-y-3">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-800/40">
                      {story.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                      <Layers className="w-3 h-3 text-purple-400" />
                      {story.sources_count} {t('outlets_count')}
                    </span>
                  </div>

                  {/* Story Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                    {story.title}
                  </h3>

                  {/* Brief Overview Snippet */}
                  {story.analysis?.balanced_summary?.overview && (
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {story.analysis.balanced_summary.overview}
                    </p>
                  )}
                </div>

                {/* Footer Link */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-400 transition-colors">
                  <span className="font-semibold text-slate-300">{t('view_full_analysis')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="glass-card p-8 rounded-3xl border border-slate-800/80 space-y-6 mt-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white">{t('how_it_works_title')}</h2>
          <p className="text-xs text-slate-400">{t('how_it_works_sub')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="font-bold text-sm text-white">{t('step1_title')}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{t('step1_desc')}</p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="font-bold text-sm text-white">{t('step2_title')}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{t('step2_desc')}</p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="font-bold text-sm text-white">{t('step3_title')}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{t('step3_desc')}</p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h4 className="font-bold text-sm text-white">{t('step4_title')}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{t('step4_desc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="text-center py-16 text-slate-400 text-xs animate-pulse">
        Loading PrismNews AI Exploration Engine...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
