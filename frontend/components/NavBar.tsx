'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PrismIcon } from './PrismIcon';
import QuotaBadge from './QuotaBadge';
import { Search, Bookmark, LogIn, User, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function NavBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-purple-500/30 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              Prism<span className="gradient-text font-black">News</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono font-semibold">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide -mt-1">
              Bias & Transparency Engine
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news topics, outlets, or framing..."
            className="w-full bg-slate-900/90 text-sm text-slate-200 placeholder-slate-500 rounded-full pl-10 pr-4 py-2 border border-slate-800 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </form>

        {/* Navigation & Quota */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <QuotaBadge />
          </div>

          <Link
            href="/saved"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 rounded-lg border border-slate-800/80 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-purple-400" />
            <span>Saved Stories</span>
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
