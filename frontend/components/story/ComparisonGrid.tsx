'use client';

import React from 'react';
import { ComparisonItem, BiasRating } from '@/lib/types';
import { ExternalLink, Quote, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  comparison?: ComparisonItem[];
}

function getBiasBadgeClass(rating: BiasRating) {
  switch (rating) {
    case 'left':
      return 'bias-badge-left';
    case 'lean_left':
      return 'bias-badge-lean-left';
    case 'center':
      return 'bias-badge-center';
    case 'lean_right':
      return 'bias-badge-lean-right';
    case 'right':
      return 'bias-badge-right';
    default:
      return 'bias-badge-center';
  }
}

function getToneBadge(tone: string) {
  switch (tone) {
    case 'neutral':
      return 'bg-slate-800 text-slate-300 border-slate-700';
    case 'optimistic':
      return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
    case 'critical':
      return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
    case 'alarmist':
      return 'bg-rose-950/60 text-rose-300 border-rose-800/60';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

export default function ComparisonGrid({ comparison }: Props) {
  if (!comparison || comparison.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No comparative outlet articles recorded.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Side-by-Side Outlet Framing Grid
          <span className="text-xs font-normal text-slate-400">
            ({comparison.length} Outlets Tracked)
          </span>
        </h3>
        <p className="text-xs text-slate-400">
          Color-coded by source bias rating and tone of reporting
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comparison.map((item, idx) => {
          const outletName = item.outlet_name || (item as any).source || 'News Outlet';
          const biasRating: BiasRating = item.bias_rating || 'center';
          const articleTitle = item.article_title || (item as any).headline || 'Coverage Report';
          const framingSummary = item.framing_summary || (item as any).emphasis || 'Core reporting angle.';
          const articleUrl = item.article_url || (item as any).url || '#';
          const tone = item.tone || 'neutral';
          const quotes = item.key_quotes || [articleTitle];

          return (
            <div
              key={idx}
              className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all"
            >
              <div className="space-y-3">
                {/* Outlet Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">
                      {outletName}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getBiasBadgeClass(
                        biasRating
                      )}`}
                    >
                      {(biasRating || 'center').replace('_', ' ')}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${getToneBadge(
                      tone
                    )}`}
                  >
                    Tone: {tone}
                  </span>
                </div>

                {/* Headline */}
                <h4 className="font-semibold text-sm text-slate-100 line-clamp-2">
                  "{articleTitle}"
                </h4>

                {/* Framing Summary */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                  <span className="font-bold text-slate-400 block mb-1">
                    Core Framing Angle:
                  </span>
                  {framingSummary}
                </div>

                {/* Key Quotes */}
                {quotes && quotes.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Quote className="w-3 h-3 text-purple-400" />
                      Direct Article Excerpt
                    </span>
                    <div className="bg-purple-950/20 border-l-2 border-purple-500/80 pl-3 py-1.5 text-xs italic text-slate-300">
                      "{quotes[0]}"
                    </div>
                  </div>
                )}
              </div>

              {/* Link to Source */}
              <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                <a
                  href={articleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Read original article <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
