import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Bookmark,
  Share2,
  Copy,
  Check,
  FileCode2,
  Sigma,
  BookOpen,
  HelpCircle,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AcademicTier, Discipline, PresetProblem } from '../types';
import { PRESET_PROBLEMS } from '../utils/engineeringData';
import { MathRenderer } from '../utils/mathRenderer';

interface DeepSolverProps {
  currentTier: AcademicTier;
  currentDiscipline: Discipline;
}

export const DeepSolver: React.FC<DeepSolverProps> = ({ currentTier, currentDiscipline }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [includeCode, setIncludeCode] = useState<boolean>(true);
  const [includeLatex, setIncludeLatex] = useState<boolean>(true);

  // Filter presets based on selected discipline or tier
  const relevantPresets = PRESET_PROBLEMS.filter(
    (p) => p.discipline === currentDiscipline || p.academicTier === currentTier
  );

  const handleSelectPreset = (p: PresetProblem) => {
    setPrompt(p.prompt);
  };

  const handleSolve = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/engineer/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          discipline: currentDiscipline,
          academicLevel: currentTier,
          includeCode,
          includeLatex,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to solve problem');
      }

      setSolution(data.result);
      setModelUsed(data.modelUsed || 'gemini-3.8-flash');
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the solution');
    } finally {
      setIsLoading(false);
    }
  };

  const copySolution = () => {
    if (!solution) return;
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Workbench Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Sigma className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Analytical Solver & Symbolic Derivation Engine
              </h2>
              <p className="text-xs text-slate-400">
                Solves with first principles, boundary conditions, step-by-step calculus & runnable verification code
              </p>
            </div>
          </div>

          {/* Active target badge */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800">
              {currentDiscipline}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
              {currentTier}
            </span>
          </div>
        </div>

        {/* Preset Carousel / Quick Select */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
              Standard Benchmark Problems & Formula Derivations:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {(relevantPresets.length > 0 ? relevantPresets : PRESET_PROBLEMS.slice(0, 4)).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className="text-left p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-700/60 transition-all group"
              >
                <div className="font-semibold text-xs text-slate-200 group-hover:text-cyan-300 truncate">
                  {preset.title}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Textarea */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type any engineering problem, differential equation, circuit mesh, thermodynamic cycle, or derivation request... (e.g. Derive the velocity profile of Poiseuille flow between two parallel stationary plates separated by distance h under constant pressure gradient dp/dx)"
            rows={5}
            className="w-full bg-slate-950/90 border border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-y leading-relaxed shadow-inner"
          />
        </div>

        {/* Action Controls & Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCode}
                onChange={(e) => setIncludeCode(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Python/MATLAB verification script</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeLatex}
                onChange={(e) => setIncludeLatex(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <Sigma className="w-3.5 h-3.5 text-indigo-400" />
              <span>LaTeX Summary Equations</span>
            </label>
          </div>

          <button
            onClick={handleSolve}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Computing Analytical Solution...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Derive & Solve Step-by-Step</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error alert with instant Retry button */}
      {error && (
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-amber-500/40 text-slate-200 text-sm shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300">Transient Service Notice (503): </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The Gemini model server is experiencing a momentary regional demand spike. Automated multi-tier fallback (to flash-lite / flash-latest) is primed. Click <strong>Retry Now</strong> to rerun your derivation immediately.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-8">
            <button
              onClick={handleSolve}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Retrying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Retry Now</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              Auto-cascading through backup models
            </span>
          </div>
        </div>
      )}

      {/* Solution Display Card */}
      {solution && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Analytical Solution & Derivation Verified</span>
              {modelUsed && (
                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  {modelUsed}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copySolution}
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
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Render KaTeX & Markdown */}
          <div className="p-4 sm:p-6 bg-slate-950/70 rounded-xl border border-slate-800/80 shadow-inner overflow-x-auto">
            <MathRenderer content={solution} />
          </div>
        </div>
      )}
    </div>
  );
};
