'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PrismIcon } from './PrismIcon';
import QuotaBadge from './QuotaBadge';
import { Search, Bookmark, LogIn, User, Sparkles, LogOut, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

import LanguageSelector from './LanguageSelector';

export default function NavBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('prism_user') || localStorage.getItem('prism_demo_user');
        if (stored) {
          try {
            setUser(JSON.parse(stored));
            return;
          } catch (e) {}
        }
      }

      try {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data }) => {
          if (data.session?.user) {
            setUser({
              email: data.session.user.email || '',
              name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0],
            });
          }
        });
      } catch (e) {}
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prism_user');
      localStorage.removeItem('prism_demo_user');
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const cleanUnquote = (val: string): string => {
    if (!val) return '';
    try {
      let res = val;
      for (let i = 0; i < 3; i++) {
        if (res.includes('%')) {
          const next = decodeURIComponent(res);
          if (next === res) break;
          res = next;
        } else break;
      }
      return res;
    } catch (e) {
      return val;
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawQ = cleanUnquote(searchQuery.trim());
    if (!rawQ) return;

    setIsAnalyzing(true);
    try {
      const { fetchLiveStoryByQuery } = await import('@/lib/api');
      const liveStory = await fetchLiveStoryByQuery(rawQ);
      if (liveStory && liveStory.id) {
        router.push(`/story/${liveStory.id}`);
        return;
      }
    } catch (err) {
      console.warn('Live search from NavBar failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
    router.push(`/?query=${encodeURIComponent(rawQ)}`);
  };


  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="PrismNews AI Logo"
            className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white">
              Prism<span className="gradient-text font-black ml-1">News AI</span>
            </span>

            <span className="text-[10px] text-slate-400 font-medium tracking-wide -mt-1">
              News. Analyzed. Illuminated.
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
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin absolute left-3.5 top-2.5" />
          ) : (
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          )}
        </form>

        {/* Navigation & Quota */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <QuotaBadge />
          </div>

          <LanguageSelector />

          <Link
            href="/saved"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 rounded-lg border border-slate-800/80 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-purple-400" />
            <span>Saved Stories</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 rounded-lg shadow-sm">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span className="max-w-[110px] truncate">{user.name || user.email.split('@')[0]}</span>
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
