'use client';

import React, { useState } from 'react';
import { BiasAnalysis, BiasRating } from '@/lib/types';
import { HelpCircle, Info, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  biasAnalysis?: BiasAnalysis;
}

export default function BiasChart({ biasAnalysis }: Props) {
  const [activePhraseIndex, setActivePhraseIndex] = useState<number | null>(0);

  if (!biasAnalysis) {
    return (
      <div className="p-8 text-center text-slate-400">
        No explainable bias analysis generated.
      </div>
    );
  }

  // Calculate spectrum percentage (score ranges from -1.0 to +1.0)
  const score = Math.max(-1.0, Math.min(1.0, biasAnalysis.spectrum_score || 0));
  const pointerPercent = ((score + 1) / 2) * 100;

  return (
    <div className="space-y-8">
      {/* Spectrum Bar */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Aggregate Media Bias Spectrum
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              Score: {score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
            </span>
          </h3>
          <span className="text-xs text-slate-400">
            Overall Cluster Framing: <strong className="text-purple-300">{biasAnalysis.dominant_framing}</strong>
          </span>
        </div>

        {/* Visual Bar */}
        <div className="space-y-2 pt-2">
          <div className="relative h-6 w-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500 p-0.5 shadow-inner">
            <div className="h-full w-full bg-slate-950/40 rounded-full relative overflow-visible">
              {/* Center Line Marker */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40 z-10" />

              {/* Score Marker Pin */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -ml-3 z-20 transition-all duration-500"
                style={{ left: `${pointerPercent}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-white border-2 border-purple-600 shadow-lg shadow-purple-500/50 flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            <span className="text-blue-400">Left (-1.0)</span>
            <span className="text-blue-300">Lean Left</span>
            <span className="text-purple-400">Center (0.0)</span>
            <span className="text-rose-300">Lean Right</span>
            <span className="text-rose-400">Right (+1.0)</span>
          </div>
        </div>
      </div>

      {/* Quote-Level Loaded Language Breakdown */}
      <div className="glass-card p-6 rounded-2xl space-y-5 border-l-4 border-l-purple-500">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Explainable Loaded Phrase Detector
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                NLP Rationale Tooltips
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Hover or click on highlighted phrases to view the NLP rationale and neutral re-framing alternative.
            </p>
          </div>
        </div>

        {/* Phrases List & Rationale Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          {/* List of Phrases */}
          <div className="md:col-span-6 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Detected Loaded Phrases ({biasAnalysis.loaded_phrases.length})
            </span>
            {biasAnalysis.loaded_phrases.map((phraseObj, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhraseIndex(idx)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 ${
                  activePhraseIndex === idx
                    ? 'bg-purple-900/30 border-purple-500 text-white shadow-md shadow-purple-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-yellow-300 bg-yellow-950/40 px-2 py-0.5 rounded inline-block">
                    "{phraseObj.phrase}"
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Source: <span className="font-medium text-slate-300">{phraseObj.outlet}</span> ({phraseObj.bias})
                  </div>
                </div>
                <Info className={`w-4 h-4 mt-1 shrink-0 ${activePhraseIndex === idx ? 'text-purple-400' : 'text-slate-500'}`} />
              </button>
            ))}
          </div>

          {/* Rationale Inspector Panel */}
          <div className="md:col-span-6">
            {activePhraseIndex !== null && biasAnalysis.loaded_phrases[activePhraseIndex] ? (
              <div className="bg-slate-900/90 border border-purple-500/40 p-5 rounded-xl space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  NLP Bias Rationale Inspector
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-semibold block">Target Phrase:</span>
                  <p className="text-sm font-semibold text-yellow-300 bg-yellow-950/30 p-2.5 rounded-lg border border-yellow-800/30">
                    "{biasAnalysis.loaded_phrases[activePhraseIndex].phrase}"
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-semibold block">Why It's Flagged:</span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {biasAnalysis.loaded_phrases[activePhraseIndex].reason}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-emerald-400" />
                    Recommended Neutral Alternative:
                  </span>
                  <p className="text-xs font-medium text-emerald-200 bg-emerald-950/30 p-3 rounded-lg border border-emerald-800/40 break-words leading-relaxed">
                    "{biasAnalysis.loaded_phrases[activePhraseIndex].neutral_alternative}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[220px] flex items-center justify-center p-6 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                Select a loaded phrase to inspect its bias rationale.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
