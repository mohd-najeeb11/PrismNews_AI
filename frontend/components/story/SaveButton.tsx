'use client';

import React, { useState, useEffect } from 'react';
import { saveStoryToSavedList } from '@/lib/api';
import { Story } from '@/lib/types';
import { Bookmark, Check, LogIn } from 'lucide-react';
import Link from 'next/link';

interface Props {
  storyId: string;
  story?: Story;
}

export default function SaveButton({ storyId, story }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedIds: string[] = JSON.parse(localStorage.getItem('prism_saved_stories') || '[]');
      if (savedIds.includes(storyId)) {
        setSaved(true);
      }
    }
  }, [storyId]);

  const handleSave = async () => {
    setLoading(true);
    const success = await saveStoryToSavedList(storyId, undefined, story);
    if (success) {
      setSaved(true);
    } else {
      setShowAuthModal(true);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={handleSave}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-md ${
          saved
            ? 'bg-emerald-600 text-white shadow-emerald-500/20'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600'
        }`}
      >
        {saved ? (
          <>
            <Check className="w-4 h-4 text-emerald-200" />
            <span>Story Saved to Library</span>
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4 text-purple-400" />
            <span>{loading ? 'Saving...' : 'Save Story'}</span>
          </>
        )}
      </button>

      {/* Inline Auth Prompt Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-purple-400" />
              Sign in to Save Stories
            </h3>
            <p className="text-xs text-slate-400">
              Create a free account or sign in to bookmark story clusters and view your reading history.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <Link
                href="/login"
                className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl text-center flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
