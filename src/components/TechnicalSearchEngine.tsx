import React, { useState } from 'react';
import {
  Search,
  Globe,
  ExternalLink,
  BookOpen,
  Cpu,
  Layers,
  Sparkles,
  Loader2,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AcademicTier, Discipline } from '../types';
import { MathRenderer } from '../utils/mathRenderer';

interface TechnicalSearchEngineProps {
  currentTier: AcademicTier;
  currentDiscipline: Discipline;
  onSendToSolver?: (text: string) => void;
}

const SEARCH_PROMPTS_BY_DISCIPLINE: Record<string, { query: string; category: string; desc: string }[]> = {
  'Computer Science & AI': [
    {
      query: 'Transformer attention mechanism computational complexity FlashAttention vs standard attention',
      category: 'research',
      desc: 'IO-awareness, SRAM tile caching, and O(N) vs O(N²) memory wall analysis',
    },
    {
      query: 'STM32H753 vs ESP32-S3 core specs, DMA controllers, and power dissipation benchmarks',
      category: 'datasheet',
      desc: 'Dual-core 480MHz Cortex-M7 vs Tensilica Xtensa dual-core embedded specs',
    },
    {
      query: 'Raft consensus algorithm leader election and log replication safety invariants',
      category: 'textbook',
      desc: 'Proof of election safety and leader completeness with state transitions',
    },
  ],
  'Electrical (EEE)': [
    {
      query: 'GaN HEMT vs SiC MOSFET switching losses and reverse recovery charge Qrr at 800V inverters',
      category: 'datasheet',
      desc: 'Wide-bandgap semiconductor comparison for high-efficiency EV traction inverters',
    },
    {
      query: 'IEEE 1547-2018 standard interconnection and interoperability of distributed energy resources',
      category: 'standards',
      desc: 'Grid code requirements, voltage ride-through, and frequency-droop regulation',
    },
    {
      query: 'Synchronous generator subtransient reactance Xd double-prime calculation and short circuit MVA',
      category: 'textbook',
      desc: 'Symmetrical 3-phase fault analysis with subtransient and transient decay curves',
    },
  ],
  'Mechanical & Aero': [
    {
      query: 'ASME Section VIII Div 1 allowable stress and joint efficiency for SA-516 Grade 70 steel',
      category: 'standards',
      desc: 'Pressure vessel design: shell thickness calculation under internal pressure',
    },
    {
      query: 'Prandtl-Meyer expansion fan angle calculation and Mach number variation proof',
      category: 'textbook',
      desc: 'Compressible supersonic aerodynamics governing differential equations',
    },
    {
      query: 'Inconel 718 vs Titanium Ti-6Al-4V yield strength at 600°C for gas turbine turbine blades',
      category: 'datasheet',
      desc: 'High-temperature creep resistance, thermal expansion coefficient, and tensile limits',
    },
  ],
  'Electronics & Comm (ECE)': [
    {
      query: 'Shannon channel capacity theorem AWGN proof and 4096-QAM spectral efficiency',
      category: 'research',
      desc: 'Information theory limit: C = B * log2(1 + S/N) with constellation shaping',
    },
    {
      query: 'IEEE 802.11be Wi-Fi 7 Multi-Link Operation (MLO) and 320 MHz channel allocation',
      category: 'standards',
      desc: 'Physical layer specifications, puncture preamble, and latency bounds',
    },
    {
      query: 'Smith chart impedance matching single stub shunt tuning step-by-step method',
      category: 'textbook',
      desc: 'Transmission line RF matching: finding stub length and distance from load',
    },
  ],
  'Civil & Structural': [
    {
      query: 'ACI 318-19 / IS 456:2000 balanced neutral axis depth factor xu,max/d for Fe 500 steel',
      category: 'standards',
      desc: 'Reinforced concrete limit state design: moment of resistance of singly reinforced beam',
    },
    {
      query: 'Terzaghi one-dimensional consolidation theory equation derivation and time factor Tv',
      category: 'textbook',
      desc: 'Soil mechanics: excess pore water pressure dissipation with Fourier series solution',
    },
  ],
};

export const TechnicalSearchEngine: React.FC<TechnicalSearchEngineProps> = ({
  currentTier,
  currentDiscipline,
  onSendToSolver,
}) => {
  const [query, setQuery] = useState<string>('');
  const [category, setCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [groundingData, setGroundingData] = useState<any | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All Technical Knowledge' },
    { id: 'research', label: 'Research Papers & Literature' },
    { id: 'datasheet', label: 'Component Datasheets & Specs' },
    { id: 'standards', label: 'Standards & Codes (ISO/ASME/IEEE)' },
    { id: 'textbook', label: 'GATE / University Theorems & Formulas' },
  ];

  const presets = SEARCH_PROMPTS_BY_DISCIPLINE[currentDiscipline] || [
    {
      query: 'Navier-Stokes existence and smoothness problem Millennium Prize formulation',
      category: 'research',
      desc: 'Mathematical statement of 3D incompressible Navier-Stokes global regularity',
    },
    {
      query: 'Nyquist-Shannon sampling theorem proof with frequency domain Dirac comb',
      category: 'textbook',
      desc: 'Sampling and perfect signal reconstruction via sinc interpolation',
    },
  ];

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    if (searchQuery) {
      setQuery(searchQuery);
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/engineer/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          category,
          discipline: currentDiscipline,
          academicTier: currentTier,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete technical search');
      }

      setSearchResult(data.answer);
      setGroundingData(data.grounding);
      setModelUsed(data.modelUsed || 'gemini-3.8-flash');
    } catch (err: any) {
      setError(err.message || 'Error occurred searching technical knowledge');
    } finally {
      setIsLoading(false);
    }
  };

  const copyAnswer = () => {
    if (!searchResult) return;
    navigator.clipboard.writeText(searchResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract grounding search queries and sources if present
  const webQueries: string[] = groundingData?.webSearchQueries || [];
  const groundingChunks = groundingData?.groundingChunks || [];

  return (
    <div className="space-y-6">
      {/* Search Header Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                OmniSearch: AI Technical & Literature Search Engine
              </h2>
              <p className="text-xs text-slate-400">
                Grounded search across IEEE/arXiv papers, engineering standards (ASME, ISO, IEEE), manufacturer datasheets & verified formulas
              </p>
            </div>
          </div>

          {/* Discipline and Tier badges */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800">
              {currentDiscipline}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
              Google Grounded
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                category === c.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search any engineering question, datasheet spec, equation proof, or regulatory standard (e.g. Inconel 718 yield strength at 600°C or ASME Section VIII allowable stress)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-28 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner font-mono"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Search</span>
          </button>
        </div>

        {/* Recommended Technical Queries */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            Trending Engineering Queries & Research Topics ({currentDiscipline}):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(p.query)}
                className="text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-700/50 transition-all group"
              >
                <div className="font-semibold text-xs text-cyan-300 group-hover:text-cyan-200 line-clamp-1">
                  {p.query}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error alert with instant retry */}
      {error && (
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-amber-500/40 text-slate-200 text-sm shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300">Transient Service Notice: </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The search query encountered high demand. Click <strong>Retry Search</strong> to execute immediately.
              </p>
            </div>
          </div>
          <div className="pl-8">
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Retry Search</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Results Display */}
      {searchResult && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Grounded Engineering Knowledge Answer</span>
              {modelUsed && (
                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {modelUsed}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAnswer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Web Search Queries & Grounded Citations (if present) */}
          {(webQueries.length > 0 || groundingChunks.length > 0) && (
            <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800/80 space-y-2.5 text-xs">
              {webQueries.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-mono text-[11px]">Grounded via:</span>
                  {webQueries.map((wq, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700 text-[11px]"
                    >
                      "{wq}"
                    </span>
                  ))}
                </div>
              )}

              {groundingChunks.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400 font-mono text-[11px]">Primary Sources:</span>
                  {groundingChunks.slice(0, 6).map((chunk: any, i: number) => {
                    const title = chunk?.web?.title || 'Technical Source';
                    const uri = chunk?.web?.uri;
                    return (
                      <a
                        key={i}
                        href={uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:text-cyan-300 transition-colors text-[11px] truncate max-w-xs"
                      >
                        <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{title}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Markdown & KaTeX Answer Body */}
          <div className="p-4 sm:p-6 bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
            <MathRenderer content={searchResult} />
          </div>
        </div>
      )}
    </div>
  );
};
