'use client';

import React from 'react';
import { TimelineEvent } from '@/lib/types';
import { Clock, TrendingUp, Newspaper, ChevronRight } from 'lucide-react';

interface Props {
  timeline?: TimelineEvent[];
}

export default function TimelineView({ timeline }: Props) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No narrative timeline events recorded for this story yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Chronological Framing Shift Timeline
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
            {timeline.length} Key Events
          </span>
        </h3>
        <p className="text-xs text-slate-400">
          Tracking how narrative focus evolved from break to current coverage
        </p>
      </div>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-8 my-4">
        {timeline.map((event, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Node Icon */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:border-purple-400 transition-all">
              <Clock className="w-3 h-3 text-blue-400" />
            </div>

            {/* Content Card */}
            <div className="glass-card p-5 rounded-2xl space-y-2 hover:border-blue-500/30 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-blue-400 font-semibold bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
                  {event.timestamp}
                </span>
                <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-md">
                  {event.outlet}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">
                "{event.headline}"
              </h4>

              <div className="bg-purple-950/20 border-l-2 border-purple-500/60 pl-3 py-1.5 text-xs text-purple-200 mt-2">
                <span className="font-bold text-purple-300 block text-[10px] uppercase tracking-wider">
                  Narrative Framing Shift:
                </span>
                {event.framing_shift}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
