import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-200">
            <img src="/logo.png" alt="PrismNews AI" className="w-6 h-6 rounded-md object-contain" />
            <span>PrismNews AI — News. Analyzed. Illuminated.</span>
          </div>
          <p className="text-xs text-slate-400 max-w-md text-center md:text-left">
            Comparing framing across media outlets using explainable AI, missing perspective detection, and chronological bias tracking.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">PrismNews AI Engine</span>
          <span className="text-[11px] text-slate-400">© 2026 PrismNews AI. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
