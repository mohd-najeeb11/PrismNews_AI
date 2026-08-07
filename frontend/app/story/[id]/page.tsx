'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Story } from '@/lib/types';
import { fetchStoryById, triggerReanalysis } from '@/lib/api';
import SaveButton from '@/components/story/SaveButton';
import SummaryTab from '@/components/story/SummaryTab';
import ComparisonGrid from '@/components/story/ComparisonGrid';
import BiasChart from '@/components/story/BiasChart';
import PerspectivesList from '@/components/story/PerspectivesList';
import TimelineView from '@/components/story/TimelineView';
import {
  Scale,
  Newspaper,
  ShieldAlert,
  EyeOff,
  Clock,
  ArrowLeft,
  RefreshCw,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

type TabType = 'summary' | 'compare' | 'bias' | 'perspectives' | 'timeline';

export default function StoryDashboardPage() {
  const params = useParams();
  const storyId = (params.id as string) || 'story-ai-act-2026';

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  // Re-analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchStoryById(storyId)
      .then(setStory)
      .finally(() => setLoading(false));
  }, [storyId]);

  const handleReanalyze = async () => {
    setAnalyzing(true);
    setAnalysisStep('Ingesting latest RSS articles...');
    await new Promise((r) => setTimeout(r, 600));
    setAnalysisStep('Clustering article vector embeddings...');
    await new Promise((r) => setTimeout(r, 600));
    setAnalysisStep('Running Gemini 2.0 Flash combined analysis...');
    await new Promise((r) => setTimeout(r, 800));

    await triggerReanalysis(storyId);
    setAnalysisStep('Analysis complete! Refreshing dashboard...');
    await new Promise((r) => setTimeout(r, 400));

    // Reload story data
    const updated = await fetchStoryById(storyId);
    setStory(updated);
    setAnalyzing(false);
    setAnalysisStep('');
  };

  if (loading) {
    return (
      <div className="space-y-6 py-8">
        <div className="h-6 bg-slate-800 rounded w-1/4 animate-pulse" />
        <div className="h-10 bg-slate-800 rounded w-3/4 animate-pulse" />
        <div className="glass-card h-96 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-white">Story Not Found</h2>
        <p className="text-xs text-slate-400">The requested story cluster could not be loaded.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  const analysis = story.analysis;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Story Clusters</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Manual Re-analysis button with progress simulation */}
          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 hover:text-white font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? analysisStep || 'Re-analyzing...' : 'Re-analyze Story'}</span>
          </button>

          <SaveButton storyId={story.id} story={story} />

        </div>
      </div>

      {/* Story Hero Info Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-3 py-1 rounded-lg border border-blue-800/40">
            {story.category}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800 font-medium">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            {story.sources_count || 5} Media Outlets Clustered
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Analyzed: {analysis?.analyzed_at ? new Date(analysis.analyzed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
          {story.title}
        </h1>
      </div>

      {/* AI Transparency Report Card */}
      <TransparencyReportCard report={analysis?.transparency_report} isLoading={loading} />

      {/* 5 Analytical Dashboard Navigation Tabs */}
      <div className="border-b border-slate-800">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'summary'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>1. Balanced Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'compare'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>2. Side-by-Side Compare</span>
          </button>

          <button
            onClick={() => setActiveTab('bias')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'bias'
                ? 'border-pink-500 text-pink-400 bg-pink-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>3. Explainable Bias</span>
          </button>

          <button
            onClick={() => setActiveTab('perspectives')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'perspectives'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            <span>4. Missing Perspectives</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'timeline'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>5. Narrative Shift Detector</span>
          </button>
        </nav>
      </div>

      {/* Tab Panel Content Display */}
      <div className="pt-2">
        {activeTab === 'summary' && <SummaryTab summary={analysis?.balanced_summary} />}
        {activeTab === 'compare' && <ComparisonGrid comparison={analysis?.comparison} />}
        {activeTab === 'bias' && <BiasChart biasAnalysis={analysis?.bias_analysis} />}
        {activeTab === 'perspectives' && <PerspectivesList perspectives={analysis?.missing_perspectives} />}
        {activeTab === 'timeline' && <TimelineView timeline={analysis?.timeline} narrativeShifts={analysis?.narrative_shifts} />}
      </div>
    </div>
  );
}
