'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-all shadow-sm"
        title="Select Interface Language"
      >
        <Globe className="w-3.5 h-3.5 text-blue-400" />
        <span>{currentLangObj.flag}</span>
        <span className="hidden sm:inline font-medium">{currentLangObj.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl py-1.5 z-50 animate-fadeIn space-y-0.5">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800/80 mb-1">
            Choose Language / भाषा चुनें
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as LanguageCode);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                language === lang.code
                  ? 'bg-blue-600/20 text-blue-300 font-semibold border-l-2 border-l-blue-500'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-100">{lang.nativeName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{lang.name}</span>
                </div>
              </div>
              {language === lang.code && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
