'use client';

import React from 'react';
import { MissingPerspective } from '@/lib/types';
import { CheckCircle, AlertOctagon, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  perspectives?: MissingPerspective[];
}

export default function PerspectivesList({ perspectives }: Props) {
  if (!perspectives || perspectives.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No missing perspective blindspots detected.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Uncovered Angles & Blindspots Analysis
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
              {perspectives.length} Missing Perspectives
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify key viewpoints, economic impacts, or demographic angles absent from main outlet headlines.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {perspectives.map((item, idx) => (
          <div
            key={idx}
            className="glass-card p-6 rounded-2xl border-l-4 border-l-amber-500 space-y-4 hover:border-amber-500/60 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 mt-0.5">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-100">
                    {item.angle}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80 text-xs">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Why This Angle Matters
                </span>
                <p className="text-slate-300 text-xs leading-normal">
                  {item.why_it_matters}
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                  Outlets Omitting This Perspective
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.missing_from_outlets.map((outlet, oIdx) => (
                    <span
                      key={oIdx}
                      className="px-2 py-0.5 rounded-md bg-rose-950/40 border border-rose-800/40 text-rose-300 font-medium text-[11px]"
                    >
                      {outlet}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
