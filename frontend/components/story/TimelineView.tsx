'use client';

import React, { useState } from 'react';
import { NarrativeShiftStage, TimelineEvent } from '@/lib/types';
import {
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
  Building2,
  Zap,
  ShieldAlert,
  Flame,
  Landmark,
  HeartHandshake,
  DollarSign,
  Scale,
  Atom,
  Globe2,
} from 'lucide-react';

interface Props {
  timeline?: TimelineEvent[];
  narrativeShifts?: NarrativeShiftStage[];
}

export default function TimelineView({ timeline = [], narrativeShifts = [] }: Props) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ 'shift-1': true });

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'Breaking News':
        return { icon: Flame, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'Government Response':
        return { icon: Landmark, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'Humanitarian Impact':
        return { icon: HeartHandshake, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      case 'Economic Impact':
        return { icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'Political Debate':
        return { icon: TrendingUp, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 'Scientific Findings':
        return { icon: Atom, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
      case 'International Reaction':
        return { icon: Globe2, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
      case 'Legal Developments':
        return { icon: Scale, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
      default:
        return { icon: Zap, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
    }
  };

  const getStagePill = (type: string) => {
    if (type === 'Initial Narrative') {
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    }
    if (type === 'Current Dominant Narrative') {
      return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    }
    return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            AI Narrative Shift Detector
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium">
              Semantic Evolution Tracking
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Uses AI semantic analysis to detect genuine pivots in media coverage, dominant thematic focus, and introduced stakeholders over time.
          </p>
        </div>
      </div>

      {/* Interactive Vertical Timeline */}
      <div className="relative pl-6 sm:pl-10 border-l-2 border-slate-800 space-y-8 my-6">
        {narrativeShifts.map((stage, idx) => {
          const nodeId = stage.id || `shift-${idx + 1}`;
          const isExpanded = !!expandedNodes[nodeId];
          const catConfig = getCategoryConfig(stage.category);
          const CategoryIcon = catConfig.icon;

          return (
            <div key={nodeId} className="relative group">
              {/* Timeline Node Icon Circle */}
              <div
                className={`absolute -left-[37px] sm:-left-[53px] top-2 w-8 h-8 rounded-full bg-slate-950 border-2 ${
                  idx === 0
                    ? 'border-amber-400 text-amber-400'
                    : idx === narrativeShifts.length - 1
                    ? 'border-purple-400 text-purple-400'
                    : 'border-indigo-400 text-indigo-400'
                } flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}
              >
                <CategoryIcon className="w-4 h-4" />
              </div>

              {/* Node Card */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition-all shadow-md">
                {/* Top Row: Timestamp, Stage Pill, Category Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/60 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {stage.timestamp}
                    </span>

                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStagePill(stage.stage_type)}`}>
                      {stage.stage_type}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${catConfig.color}`}>
                    <CategoryIcon className="w-3.5 h-3.5" />
                    {stage.category}
                  </span>
                </div>

                {/* Narrative Title */}
                <h4 className="text-base font-bold text-slate-100 mb-2">{stage.narrative_title}</h4>

                {/* Short AI Overview */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{stage.short_explanation}</p>

                {/* Expand / Collapse Button */}
                <button
                  onClick={() => toggleNode(nodeId)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors focus:outline-none"
                >
                  <span>{isExpanded ? 'Collapse Shift Details' : 'Expand Shift Rationale & Supporting Articles'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Expanded Details View */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-fadeIn">
                    {/* Shift Rationale Box */}
                    <div className="bg-indigo-950/20 border-l-2 border-indigo-500/60 p-3.5 rounded-r-lg text-xs text-indigo-200">
                      <span className="font-bold text-indigo-300 block text-[10px] uppercase tracking-wider mb-1">
                        Why the Narrative Shifted:
                      </span>
                      {stage.full_shift_rationale}
                    </div>

                    {/* Main Stakeholders Introduced */}
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                        <Users className="w-3.5 h-3.5 text-indigo-400" /> Main Stakeholders Introduced
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {stage.main_stakeholders.map((sh, sIdx) => (
                          <span key={sIdx} className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700/60">
                            {sh}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Supporting Publishers & Articles */}
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Supporting Publishers & Articles
                      </span>

                      <div className="space-y-2">
                        {stage.supporting_articles?.map((art, aIdx) => (
                          <a
                            key={aIdx}
                            href={art.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between bg-slate-950/60 hover:bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 hover:border-indigo-500/40 transition-colors text-xs"
                          >
                            <div className="flex items-center space-x-2 overflow-hidden">
                              <span className="text-slate-300 font-semibold px-2 py-0.5 bg-slate-800 rounded text-[11px] shrink-0">
                                {art.publisher}
                              </span>
                              <span className="text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                                {art.title}
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
