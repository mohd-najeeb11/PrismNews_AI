'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Story } from '@/lib/types';
import { fetchStories } from '@/lib/api';
import { Sparkles, Layers, ArrowRight, Compass, Scale, Newspaper, EyeOff, Clock, Search } from 'lucide-react';


const CATEGORIES = ['All', 'Technology & Policy', 'Economy & Markets', 'Energy & Environment', 'World News'];

function HomeContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('query') || '';

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState(queryParam);

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

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
          <span>Explainable AI News Transparency Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          Unpack the News from <br />
          <span className="gradient-text">Every Angle & Framing</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          See how different news outlets cover the same story side-by-side. Uncover hidden bias, detect missing perspectives, and track how narrative framing shifts in real time.
        </p>

        {/* Interactive Search Bar & Topic Chips */}
        <div className="pt-2 space-y-3 max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="relative flex items-center shadow-xl shadow-blue-500/5 rounded-2xl"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search any news topic, event, or outlet (e.g. AI Regulation, Election)..."
              className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 rounded-2xl pl-11 pr-24 py-3.5 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1"
              >
                Clear
              </button>
            ) : null}
          </form>

          {/* Quick Topic Chips */}
          <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-medium text-slate-400">
            <span className="text-slate-500">Popular Topics:</span>
            {['AI Policy', 'Election 2024', 'Climate Summit', 'Federal Reserve', 'Tech Stocks'].map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setSearchTerm(topic)}
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
            <Scale className="w-4 h-4 text-blue-400" /> Balanced Summaries
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <Newspaper className="w-4 h-4 text-purple-400" /> Side-by-Side Comparison
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <EyeOff className="w-4 h-4 text-amber-400" /> Blindspot Detection
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <Clock className="w-4 h-4 text-emerald-400" /> Narrative Timelines
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
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-200">{stories.length}</strong> story clusters
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
            <h3 className="text-base font-bold text-slate-300">No Story Clusters Found</h3>
            <p className="text-xs text-slate-500">Try clearing your search query or selecting a different topic category.</p>
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
                      {story.sources_count} Outlets
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
                  <span className="font-semibold text-slate-300">View Full 5-Tab Analysis</span>
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
          <h2 className="text-2xl font-bold text-white">How PrismNews AI Works</h2>
          <p className="text-xs text-slate-400">
            An automated, transparent pipeline converting raw news feeds into unbiased media literacy metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="font-bold text-sm text-white">Multi-Spectrum Ingest</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingests RSS feeds and news APIs continuously across left, center, and right outlets.
            </p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="font-bold text-sm text-white">Vector Clustering</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Groups matching stories from different publishers using local sentence embeddings.
            </p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="font-bold text-sm text-white">Explainable Bias AI</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini 2.0 Flash extracts loaded language, evaluates tone, and highlights unsaid perspectives.
            </p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h4 className="font-bold text-sm text-white">Transparent Reading</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Readers view consensus facts, side-by-side outlet grid, and timeline narrative shifts.
            </p>
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
