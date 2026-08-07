'use client';

import React, { useEffect, useState } from 'react';
import { QuotaStatus } from '@/lib/types';
import { fetchQuotaStatus, updateApiMode } from '@/lib/api';
import { Database, Cpu, ChevronDown, Loader2 } from 'lucide-react';

export default function QuotaBadge() {
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchQuotaStatus().then(setQuota);
  }, []);

  const handleModeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value;
    setUpdating(true);
    try {
      const updatedQuota = await updateApiMode(newMode);
      setQuota(updatedQuota);
      // Refresh window page to trigger new mode data fetch
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('apiModeChanged'));
      }
    } catch (err) {
      console.error('Failed to change API mode:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (!quota) return null;

  const modeColors: Record<string, { bg: string; dot: string; text: string }> = {
    live: { bg: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400', text: 'text-emerald-300' },
    rss: { bg: 'bg-amber-500/10 border-amber-500/30', dot: 'bg-amber-400', text: 'text-amber-300' },
    seed: { bg: 'bg-blue-500/10 border-blue-500/30', dot: 'bg-blue-400', text: 'text-blue-300' },
  };

  const currentStyle = modeColors[quota.api_mode] || modeColors.live;

  return (
    <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-300 shadow-lg">
      {/* Interactive Mode Dropdown */}
      <div className={`relative flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${currentStyle.bg} transition-all`}>
        {updating ? (
          <Loader2 className="w-3 h-3 animate-spin text-slate-300" />
        ) : (
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentStyle.dot} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${currentStyle.dot}`}></span>
          </span>
        )}

        <label htmlFor="api-mode-select" className="sr-only">Select API Mode</label>
        <select
          id="api-mode-select"
          value={quota.api_mode}
          onChange={handleModeChange}
          disabled={updating}
          className={`bg-transparent ${currentStyle.text} text-[11px] font-bold uppercase tracking-wider focus:outline-none cursor-pointer pr-4 appearance-none font-mono`}
        >
          <option value="live" className="bg-slate-900 text-emerald-400 font-semibold">API Mode: LIVE (LLM + NewsAPI)</option>
          <option value="rss" className="bg-slate-900 text-amber-400 font-semibold">API Mode: RSS (Feeds + Vectors)</option>
          <option value="seed" className="bg-slate-900 text-blue-400 font-semibold">API Mode: SEED (Demo Dataset)</option>
        </select>
        <ChevronDown className={`w-3 h-3 ${currentStyle.text} absolute right-1 pointer-events-none`} />
      </div>

      <div className="h-3 w-px bg-slate-700/80" />

      {/* Quota Counters */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-slate-400 text-[11px]">
          <Database className="w-3 h-3 text-sky-400" />
          NewsAPI: <strong className="text-slate-200">{quota.newsapi_used}/{quota.newsapi_limit}</strong>
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1 text-slate-400 text-[11px]">
          <Cpu className="w-3 h-3 text-purple-400" />
          Gemini: <strong className="text-slate-200">{quota.gemini_used}/{quota.gemini_limit}</strong>
        </span>
      </div>
    </div>
  );
}

