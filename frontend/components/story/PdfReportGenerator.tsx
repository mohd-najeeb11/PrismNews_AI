'use client';

import React, { useRef, useState } from 'react';
import { Story, StoryAnalysis } from '@/lib/types';
import { useLanguage } from '@/lib/LanguageContext';
import { FileText, Download, Loader2, CheckCircle2, Scale, Newspaper, ShieldAlert, Clock, Sparkles } from 'lucide-react';

interface Props {
  story: Story;
  analysis?: StoryAnalysis;
}

export default function PdfReportGenerator({ story, analysis }: Props) {
  const { t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);


  const balanced = analysis?.balanced_summary;
  const comparison = analysis?.comparison || [];
  const bias = analysis?.bias_analysis;
  const timeline = analysis?.timeline || [];

  const overview = balanced?.overview || 'Synthesized multi-outlet news reporting analysis.';
  const consensusPoints = balanced?.consensus_points || [];
  const disputedPoints = balanced?.disputed_points || [];
  const takeaway = balanced?.key_takeaway || 'Divergent editorial emphasis observed across publishers.';

  // Distribution chart data
  const biasDist = bias?.source_bias_distribution || { left: 1, lean_left: 2, center: 3, lean_right: 1, right: 0 };
  const totalOutlets = Object.values(biasDist).reduce((a, b) => a + b, 0) || 1;

  const handleGeneratePdf = async () => {
    if (generating) return;
    setGenerating(true);
    setDownloadSuccess(false);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = reportRef.current;
      if (!element) {
        throw new Error('Report template element not ready.');
      }

      // Briefly reveal template for rendering
      element.style.display = 'block';

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution canvas render
        useCORS: true,
        logging: false,
        backgroundColor: '#090d16',
      });

      element.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `AI_Transparency_Report_Export_${(story.title || 'Analysis').slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Transparency Report Export</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AI Transparency Report Export
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Generate a printable document including Synthesized Summary, Side-by-Side Outlet Comparison, Explainable Bias Spectrum, and Narrative Timeline.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleGeneratePdf}
              disabled={generating}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                  <span>Generating PDF Report...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Report Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-purple-200" />
                  <span>Export AI Transparency Report</span>
                </>
              )}
            </button>
          </div>
        </div>


        {/* Included Sections Preview */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
            <Scale className="w-4 h-4 text-blue-400 shrink-0" />
            <span>1. {t('tab_summary')}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
            <Newspaper className="w-4 h-4 text-purple-400 shrink-0" />
            <span>2. {t('tab_comparison')}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
            <ShieldAlert className="w-4 h-4 text-pink-400 shrink-0" />
            <span>3. {t('tab_bias')}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>4. {t('tab_timeline')}</span>
          </div>

        </div>
      </div>

      {/* Offscreen Print Template Element */}
      <div
        ref={reportRef}
        style={{ display: 'none', width: '800px' }}
        className="bg-[#090d16] text-slate-100 p-8 space-y-8 font-sans border border-slate-800"
      >
        {/* PDF Header */}
        <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-contain" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">PrismNews AI</h1>
              <p className="text-[10px] text-purple-400 font-mono">INTELLIGENCE BRIEFING & MEDIA LITERACY REPORT</p>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-400 font-mono space-y-0.5">
            <div>Generated: {new Date().toLocaleDateString()}</div>
            <div>Confidence Score: {analysis?.transparency_report?.confidence_score || 94}%</div>
            <div>Publishers Clustered: {story.sources_count || 5} Outlets</div>
          </div>
        </div>

        {/* Document Title */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800/40">
            {story.category || 'World News'}
          </span>
          <h2 className="text-2xl font-black text-white leading-snug">{story.title}</h2>
        </div>

        {/* Section 1: Balanced Summary */}
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Scale className="w-4 h-4" />
            <h3>SECTION 1: SYNTHESIZED BALANCED SUMMARY</h3>
          </div>
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
            <p>{overview}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-2">
              <h4 className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider">Points of Agreement</h4>
              <ul className="space-y-1.5 text-slate-300">
                {consensusPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-2">
              <h4 className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">Points of Disputed Framing</h4>
              <ul className="space-y-1.5 text-slate-300">
                {disputedPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-200">
            <strong className="block text-[10px] text-purple-400 uppercase mb-0.5">Key Takeaway</strong>
            <p>{takeaway}</p>
          </div>
        </div>

        {/* Section 2: Side by Side Comparison */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Newspaper className="w-4 h-4" />
            <h3>SECTION 2: SIDE-BY-SIDE OUTLET FRAMING COMPARISON</h3>
          </div>

          <div className="space-y-3">
            {comparison.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{item.outlet_name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    item.bias_rating.includes('left')
                      ? 'bg-blue-950 text-blue-300 border-blue-800'
                      : item.bias_rating.includes('right')
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}>
                    {item.bias_rating.replace('_', ' ')}
                  </span>
                </div>
                <div className="font-semibold text-slate-200">"{item.article_title}"</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{item.framing_summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Explainable Bias Analysis & Charts */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <h3>SECTION 3: EXPLAINABLE BIAS ANALYSIS & SPECTRUM CHART</h3>
          </div>

          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Dominant Editorial Framing:</span>
              <span className="font-semibold text-pink-300">{bias?.dominant_framing || 'Multi-perspective coverage'}</span>
            </div>

            {/* Bias Distribution Bar Chart */}
            <div className="space-y-1.5 pt-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Publisher Spectrum Distribution</div>
              <div className="h-6 w-full bg-slate-950 rounded-lg overflow-hidden flex border border-slate-800">
                <div style={{ width: `${(biasDist.left / totalOutlets) * 100}%` }} className="bg-blue-600 h-full flex items-center justify-center text-[9px] text-white font-bold" title="Left">Left</div>
                <div style={{ width: `${(biasDist.lean_left / totalOutlets) * 100}%` }} className="bg-sky-500 h-full flex items-center justify-center text-[9px] text-white font-bold" title="Lean Left">L.Left</div>
                <div style={{ width: `${(biasDist.center / totalOutlets) * 100}%` }} className="bg-emerald-500 h-full flex items-center justify-center text-[9px] text-white font-bold" title="Center">Center</div>
                <div style={{ width: `${(biasDist.lean_right / totalOutlets) * 100}%` }} className="bg-amber-500 h-full flex items-center justify-center text-[9px] text-white font-bold" title="Lean Right">L.Right</div>
                <div style={{ width: `${(biasDist.right / totalOutlets) * 100}%` }} className="bg-rose-600 h-full flex items-center justify-center text-[9px] text-white font-bold" title="Right">Right</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Narrative Timeline */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <h3>SECTION 4: CHRONOLOGICAL NARRATIVE TIMELINE</h3>
          </div>

          <div className="space-y-2.5">
            {timeline.slice(0, 5).map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs flex items-start gap-3">
                <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded shrink-0">
                  {item.timestamp || `Event #${idx + 1}`}
                </span>
                <div className="space-y-0.5">
                  <div className="font-bold text-white">{item.outlet}: <span className="font-normal text-slate-300">{item.headline}</span></div>
                  <p className="text-[11px] text-slate-400">{item.framing_shift}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800 text-center text-[10px] text-slate-400 font-mono">
          PrismNews AI Intelligence Report • News. Analyzed. Illuminated. • Page 1 of 1
        </div>
      </div>
    </div>
  );
}
