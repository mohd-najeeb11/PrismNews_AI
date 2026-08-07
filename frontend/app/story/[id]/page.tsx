'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Story, StoryAnalysis } from '@/lib/types';
import { fetchStoryById, triggerReanalysis, fetchStoryTranslation } from '@/lib/api';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/lib/LanguageContext';
import SaveButton from '@/components/story/SaveButton';
import SummaryTab from '@/components/story/SummaryTab';
import ComparisonGrid from '@/components/story/ComparisonGrid';
import BiasChart from '@/components/story/BiasChart';
import PerspectivesList from '@/components/story/PerspectivesList';
import TimelineView from '@/components/story/TimelineView';
import PdfReportGenerator from '@/components/story/PdfReportGenerator';
import { TransparencyReportCard } from '@/components/story/TransparencyReportCard';
import {
  Scale,
  Newspaper,
  ShieldAlert,
  EyeOff,
  Clock,
  FileText,
  ArrowLeft,
  RefreshCw,
  Layers,
  Sparkles,
  Globe,
  Languages,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

type TabType = 'summary' | 'compare' | 'bias' | 'perspectives' | 'timeline' | 'pdf';


export default function StoryDashboardPage() {
  const params = useParams();
  const storyId = (params.id as string) || 'story-ai-act-2026';
  const { language, t } = useLanguage();

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  // Translation state
  const [isTranslatedView, setIsTranslatedView] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatedAnalysis, setTranslatedAnalysis] = useState<StoryAnalysis | null>(null);
  const [translationStatusMsg, setTranslationStatusMsg] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<string | null>(null);

  // Re-analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchStoryById(storyId)
      .then(setStory)
      .finally(() => setLoading(false));
  }, [storyId]);

  // Load translation when language changes or translated mode is toggled
  useEffect(() => {
    if (language === 'en') {
      setIsTranslatedView(false);
      setTranslatedAnalysis(null);
      setTranslationStatusMsg(null);
      return;
    }

    // Auto-fetch translation if non-English language selected
    setIsTranslatedView(true);
    handleFetchTranslation(language);
  }, [language, storyId]);

  const handleFetchTranslation = async (targetLang: string) => {
    setTranslating(true);
    setTranslationStatusMsg(null);
    try {
      const res = await fetchStoryTranslation(storyId, targetLang);
      if (res.success && res.content) {
        setTranslatedAnalysis(res.content);
        setCacheStatus(res.cache_status || 'Fresh');
      } else {
        setTranslationStatusMsg(t('translation_unavailable'));
        setIsTranslatedView(false);
      }
    } catch (err) {
      setTranslationStatusMsg(t('translation_unavailable'));
      setIsTranslatedView(false);
    } finally {
      setTranslating(false);
    }
  };

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

    if (language !== 'en') {
      handleFetchTranslation(language);
    }
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

  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const activeAnalysis = (isTranslatedView && translatedAnalysis) ? translatedAnalysis : story.analysis;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('story_detail_back')}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {/* Multilingual Translation Toggle Button */}
          {language !== 'en' && (
            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 shadow-sm text-xs font-medium">
              <button
                onClick={() => setIsTranslatedView(false)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  !isTranslatedView
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('original_english')}
              </button>
              <button
                onClick={() => {
                  setIsTranslatedView(true);
                  if (!translatedAnalysis) handleFetchTranslation(language);
                }}
                disabled={translating}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  isTranslatedView
                    ? 'bg-purple-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>{activeLangObj.flag}</span>}
                <span>{activeLangObj.nativeName}</span>
              </button>
            </div>
          )}

          {/* Manual Re-analysis button */}
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

      {/* Translation Progress or Status Notification Banner */}
      {translating && (
        <div className="p-4 bg-purple-950/40 border border-purple-800/40 rounded-2xl text-xs text-purple-300 flex items-center space-x-3 animate-pulse">
          <Loader2 className="w-4.5 h-4.5 animate-spin text-purple-400 shrink-0" />
          <span>{t('translating_content')} <strong>{activeLangObj.nativeName} ({activeLangObj.name})</strong>...</span>
        </div>
      )}

      {translationStatusMsg && !translating && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/40 rounded-2xl text-xs text-amber-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{translationStatusMsg}</span>
        </div>
      )}

      {/* Story Hero Info Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-3 py-1 rounded-lg border border-blue-800/40">
            {story.category}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800 font-medium">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            {story.sources_count || 5} {t('outlets_count')} Clustered
          </span>
          {isTranslatedView && cacheStatus && (
            <span className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {activeLangObj.nativeName} ({cacheStatus})
            </span>
          )}
          <span className="text-xs text-slate-400 font-mono">
            Analyzed: {activeAnalysis?.analyzed_at ? new Date(activeAnalysis.analyzed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
          {story.title}
        </h1>
      </div>

      {/* AI Transparency Report Card */}
      <TransparencyReportCard report={activeAnalysis?.transparency_report} isLoading={loading} />

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
            <span>1. {t('tab_summary')}</span>
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
            <span>2. {t('tab_comparison')}</span>
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
            <span>3. {t('tab_bias')}</span>
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
            <span>4. {t('tab_blindspots')}</span>
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
            <span>5. {t('tab_timeline')}</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'pdf'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>6. PDF Report</span>
          </button>
        </nav>
      </div>

      {/* Tab Panel Content Display */}
      <div className="pt-2">
        {activeTab === 'summary' && <SummaryTab summary={activeAnalysis?.balanced_summary} />}
        {activeTab === 'compare' && <ComparisonGrid comparison={activeAnalysis?.comparison} />}
        {activeTab === 'bias' && <BiasChart biasAnalysis={activeAnalysis?.bias_analysis} />}
        {activeTab === 'perspectives' && <PerspectivesList perspectives={activeAnalysis?.missing_perspectives} />}
        {activeTab === 'timeline' && <TimelineView timeline={activeAnalysis?.timeline} narrativeShifts={activeAnalysis?.narrative_shifts} />}
        {activeTab === 'pdf' && <PdfReportGenerator story={story} analysis={activeAnalysis || undefined} />}
      </div>

      {/* Always render PDF Report Section after Narrative Timeline for quick access */}
      {activeTab !== 'pdf' && (
        <div className="pt-8 border-t border-slate-800/80">
          <PdfReportGenerator story={story} analysis={activeAnalysis || undefined} />
        </div>
      )}
    </div>
  );
}

