'use client';

import React, { useEffect, useState } from 'react';
import { QuotaStatus } from '@/lib/types';
import { fetchQuotaStatus } from '@/lib/api';
import { Database, Cpu, Zap, Activity } from 'lucide-react';

export default function QuotaBadge() {
  const [quota, setQuota] = useState<QuotaStatus | null>(null);

  useEffect(() => {
    fetchQuotaStatus().then(setQuota);
  }, []);

  if (!quota) return null;

  return (
    <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-medium text-slate-300 shadow-inner">
      <div className="flex items-center gap-1.5 text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="uppercase tracking-wider font-semibold text-[10px] text-emerald-400">
          API Mode: {quota.api_mode}
        </span>
      </div>

      <div className="h-3 w-px bg-slate-700" />

      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-slate-400">
          <Database className="w-3 h-3 text-sky-400" />
          NewsAPI: <strong className="text-slate-200">{quota.newsapi_used}/{quota.newsapi_limit}</strong>
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1 text-slate-400">
          <Cpu className="w-3 h-3 text-purple-400" />
          Gemini: <strong className="text-slate-200">{quota.gemini_used}/{quota.gemini_limit}</strong>
        </span>
      </div>
    </div>
  );
}
