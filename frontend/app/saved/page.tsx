'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SavedStory } from '@/lib/types';
import { getSavedStories } from '@/lib/api';
import { Bookmark, Layers, ArrowRight, Trash2, ShieldCheck, Sparkles } from 'lucide-react';

export default function SavedStoriesPage() {
  const [savedList, setSavedList] = useState<SavedStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedStories()
      .then(setSavedList)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (storyId: string) => {
    if (typeof window !== 'undefined') {
      const current: string[] = JSON.parse(localStorage.getItem('prism_saved_stories') || '[]');
      const updated = current.filter((id) => id !== storyId);
      localStorage.setItem('prism_saved_stories', JSON.stringify(updated));
    }
    setSavedList((prev) => prev.filter((item) => item.story_id !== storyId));
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Personal Media Reading Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Saved Story Clusters
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bookmarked topics saved for deep-dive comparative media analysis
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Total Bookmarks: <strong className="text-white font-mono">{savedList.length}</strong>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="glass-card h-48 rounded-2xl animate-pulse p-6" />
          ))}
        </div>
      ) : savedList.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl space-y-4 max-w-lg mx-auto my-8">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Saved Stories Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Browse trending story clusters on the home page and click "Save Story" to bookmark them in your library.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            <span>Explore News Clusters</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedList.map((item) => {
            const story = item.story;
            if (!story) return null;
            return (
              <div
                key={item.id}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4 border border-slate-800 hover:border-purple-500/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-800/40">
                      {story.category}
                    </span>
                    <button
                      onClick={() => handleRemove(story.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-2">
                    {story.title}
                  </h3>

                  {story.analysis?.balanced_summary?.overview && (
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {story.analysis.balanced_summary.overview}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Saved: {new Date(item.saved_at).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/story/${story.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300"
                  >
                    Open Story Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
