'use client';

import React from 'react';
import { BalancedSummary } from '@/lib/types';
import { CheckCircle2, AlertTriangle, Lightbulb, Scale } from 'lucide-react';

interface Props {
  summary?: BalancedSummary;
}

export default function SummaryTab({ summary }: Props) {
  if (!summary) {
    return (
      <div className="p-8 text-center text-slate-400">
        No balanced summary available for this story yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Hero Box */}
      <div className="glass-card p-6 rounded-2xl border-l-4 border-l-blue-500 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 mt-1">
            <Scale className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Synthesized Multi-Outlet Overview
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-normal">
                AI Consensus Engine
              </span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {summary.overview}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Points of Agreement */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border-t-2 border-t-emerald-500/60">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <h4>Points of Consensus across Outlets</h4>
          </div>
          <ul className="space-y-3">
            {summary.consensus_points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Points of Disagreement */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border-t-2 border-t-amber-500/60">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
            <AlertTriangle className="w-5 h-5" />
            <h4>Points of Framing Disputed & Conflict</h4>
          </div>
          <ul className="space-y-3">
            {summary.disputed_points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key Takeaway */}
      <div className="glass-card p-5 rounded-xl bg-purple-950/20 border-purple-500/30 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-1">
            Critical Media Literacy Takeaway
          </span>
          <p className="text-sm text-slate-200 font-medium">
            {summary.key_takeaway}
          </p>
        </div>
      </div>
    </div>
  );
}
