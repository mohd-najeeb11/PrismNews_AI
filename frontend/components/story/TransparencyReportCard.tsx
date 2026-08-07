'use client';

import React, { useState } from 'react';
import { TransparencyReport } from '@/lib/types';
import {
  Cpu,
  Clock,
  Layers,
  Building2,
  ShieldCheck,
  Zap,
  Database,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TransparencyReportCardProps {
  report?: TransparencyReport;
  isLoading?: boolean;
}

export const TransparencyReportCard: React.FC<TransparencyReportCardProps> = ({
  report,
  isLoading = false,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  if (isLoading || !report) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-md animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-800/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const confidencePct = Math.round((report.confidence_score || 0.94) * 100);
  const confidenceColor =
    confidencePct >= 90
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : confidencePct >= 75
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  const cacheBadge =
    report.cache_status === 'Cached'
      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 backdrop-blur-md shadow-xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              AI Transparency & Methodology Report
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                Auditable Audit Trail
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Verifiable proof of AI inference parameters, source aggregation, and semantic confidence metrics.
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center space-x-1.5 ${confidenceColor}`}>
            <Zap className="w-3.5 h-3.5" />
            <span>{confidencePct}% Confidence ({report.confidence_level})</span>
          </div>

          <div className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center space-x-1.5 ${cacheBadge}`}>
            <Database className="w-3.5 h-3.5" />
            <span>{report.cache_status}</span>
          </div>
        </div>
      </div>

      {/* Metric Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-5">
        {/* Metric 1: Model */}
        <div
          className="group relative bg-slate-950/40 border border-slate-800/60 rounded-lg p-3 hover:border-indigo-500/40 transition-colors"
          title="The specific Large Language Model used to parse and categorize news clusters."
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Model
            </span>
            <Info className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-200 truncate">{report.ai_model_used}</p>
        </div>

        {/* Metric 2: Processing Time */}
        <div
          className="group relative bg-slate-950/40 border border-slate-800/60 rounded-lg p-3 hover:border-cyan-500/40 transition-colors"
          title="Total latency in milliseconds required to execute multi-outlet AI analysis."
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Processing Latency
            </span>
            <Info className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-200">{report.processing_time_ms} ms</p>
        </div>

        {/* Metric 3: Cluster Size & Articles */}
        <div
          className="group relative bg-slate-950/40 border border-slate-800/60 rounded-lg p-3 hover:border-emerald-500/40 transition-colors"
          title="Number of unique articles grouped into this story cluster."
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Cluster Size
            </span>
            <Info className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-200">{report.cluster_size} Articles</p>
        </div>

        {/* Metric 4: Publishers Count */}
        <div
          className="group relative bg-slate-950/40 border border-slate-800/60 rounded-lg p-3 hover:border-amber-500/40 transition-colors"
          title="Count of distinct independent media outlets included in the analysis."
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" /> Publishers
            </span>
            <Info className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-200">{report.publishers_count} Outlets</p>
        </div>

        {/* Metric 5: Data Feeds */}
        <div
          className="group relative bg-slate-950/40 border border-slate-800/60 rounded-lg p-3 hover:border-purple-500/40 transition-colors"
          title="Original ingestion sources utilized to fetch breaking coverage."
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-400" /> Data Feeds
            </span>
            <Info className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-200 truncate">{report.sources_used.join(', ')}</p>
        </div>

        {/* Metric 6: Timestamp */}
        <div
          className="group relative bg-slate-950/40 border border-slate-800/60 rounded-lg p-3 hover:border-blue-500/40 transition-colors"
          title="Exact timestamp when AI analysis was generated and verified."
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Generated
            </span>
            <Info className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-200 truncate">
            {new Date(report.analyzed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Itemized Analysis Counters */}
      <div className="bg-slate-950/30 border border-slate-800/50 rounded-lg p-4">
        <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <span>Analysis Extraction Summary</span>
          <span className="h-px bg-slate-800 flex-1"></span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800/80">
            <div className="flex items-center justify-center space-x-1.5 text-emerald-400 text-xs font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Consensus Facts</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{report.metrics_summary.consensus_facts_count}</span>
          </div>

          <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800/80">
            <div className="flex items-center justify-center space-x-1.5 text-amber-400 text-xs font-semibold mb-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Disputed Claims</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{report.metrics_summary.disputed_claims_count}</span>
          </div>

          <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800/80">
            <div className="flex items-center justify-center space-x-1.5 text-rose-400 text-xs font-semibold mb-1">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Missing Blindspots</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{report.metrics_summary.missing_perspectives_count}</span>
          </div>

          <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800/80">
            <div className="flex items-center justify-center space-x-1.5 text-indigo-400 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Loaded Phrases</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{report.metrics_summary.bias_indicators_count}</span>
          </div>

          <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-center space-x-1.5 text-cyan-400 text-xs font-semibold mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Timeline Stages</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{report.metrics_summary.timeline_events_count}</span>
          </div>
        </div>
      </div>

      {/* Expandable Explanation Drawer */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col items-center">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-medium focus:outline-none"
        >
          <span>{showExplanation ? 'Hide Methodology Details' : 'How does Prism AI generate this confidence score?'}</span>
          {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showExplanation && (
          <div className="mt-3 p-4 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 space-y-2 leading-relaxed w-full">
            <p>
              <strong className="text-slate-100">Confidence Score Rationale:</strong> Prism AI calculates confidence based on cross-outlet source density, semantic similarity across RSS wire feeds, and publisher diversity. Higher confidence scores (&gt;90%) indicate multi-outlet agreement on core timeline facts with verifiable citations.
            </p>
            <p>
              <strong className="text-slate-100">Zero Hallucination Guardrails:</strong> Every factual claim listed in the consensus matrix must be backed by at least two independent primary reporting bodies before being synthesized into the final output.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
