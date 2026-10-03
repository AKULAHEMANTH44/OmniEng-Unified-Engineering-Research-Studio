import React, { useEffect, useState } from 'react';
import {
  Compass,
  Cpu,
  GraduationCap,
  Sparkles,
  BookOpen,
  MessageSquareCode,
  Activity,
  Layers,
  HelpCircle,
  Binary,
  FileText
} from 'lucide-react';
import { AcademicTier, Discipline } from '../types';
import { ACADEMIC_TIERS, DISCIPLINES } from '../utils/engineeringData';

interface HeaderProps {
  currentTier: AcademicTier;
  onTierChange: (tier: AcademicTier) => void;
  currentDiscipline: Discipline;
  onDisciplineChange: (discipline: Discipline) => void;
  onOpenConstants: () => void;
  onOpenReport?: () => void;
  onOpenChat: () => void;
  isChatOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTier,
  onTierChange,
  currentDiscipline,
  onDisciplineChange,
  onOpenConstants,
  onOpenReport,
  onOpenChat,
  isChatOpen,
}) => {
  const [backendHealth, setBackendHealth] = useState<{ online: boolean; hasKey: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setBackendHealth({ online: data.status === 'ok', hasKey: data.hasApiKey });
      })
      .catch(() => {
        setBackendHealth({ online: false, hasKey: false });
      });
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
                OmniEng
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                v3.8 Research Suite
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Unified Engineering & Research Engine for Diploma, B.Tech & M.Tech
            </p>
          </div>
        </div>

        {/* Academic Tier Selectors */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex items-center gap-1 text-xs">
            {ACADEMIC_TIERS.map((tier) => {
              const active = currentTier === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => onTierChange(tier.id)}
                  title={tier.desc}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-md shadow-cyan-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{tier.label}</span>
                  <span className="md:hidden">{tier.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Tools & Status */}
        <div className="flex items-center gap-2">
          {/* Engineering Constants Button */}
          <button
            onClick={onOpenConstants}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors shadow-sm"
            title="Open Universal Engineering Constants & Formulas"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Physical Constants</span>
          </button>

          {/* Formal Lab Report / Thesis PDF Export Button */}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors shadow-sm"
              title="Generate Formal Lab Report / Thesis Document"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Export Report</span>
            </button>
          )}

          {/* AI Engineering Assistant Toggle */}
          <button
            onClick={onOpenChat}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isChatOpen
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Backend Status indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400"
            title={backendHealth?.hasKey ? 'Gemini Engine Active' : 'Waiting for API backend'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealth?.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden xl:inline">
              {backendHealth?.online ? 'Gemini 3.8 Online' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Discipline Navigation Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider pl-1 mr-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            Field:
          </span>
          {DISCIPLINES.map((d) => {
            const isSelected = currentDiscipline === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onDisciplineChange(d.id)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{d.icon}</span>
                <span>{d.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
