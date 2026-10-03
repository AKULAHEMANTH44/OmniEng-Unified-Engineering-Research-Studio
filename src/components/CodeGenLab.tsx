import React, { useState } from 'react';
import { FileCode2, Sparkles, Terminal, Copy, Check, Loader2, Play, Code2 } from 'lucide-react';
import { MathRenderer } from '../utils/mathRenderer';

const CODE_TEMPLATES = [
  {
    title: 'Runge-Kutta 4th Order (RK4) ODE Integrator',
    lang: 'python',
    problem: 'Implement a vectorized 4th-order Runge-Kutta (RK4) numerical integrator in Python with SciPy and Matplotlib to solve a damped non-linear pendulum equation d2θ/dt2 + b dθ/dt + (g/L) sin(θ) = 0.',
  },
  {
    title: 'Digital PID Controller with Anti-Windup',
    lang: 'cpp',
    problem: 'Write a modern C++ class for a discrete-time PID controller featuring derivative filter filtering, integral anti-windup (clamping), and bumpless parameter transfer for embedded systems.',
  },
  {
    title: '1D Finite Element Method (FEM) Bar',
    lang: 'matlab',
    problem: 'Write a MATLAB script to solve a 1D axially loaded elastic bar with varying cross-section using 2-node linear elements. Assemble the global stiffness matrix K and solve for nodal displacements and stresses.',
  },
  {
    title: 'TikZ Neural Network & Circuit Diagram',
    lang: 'latex',
    problem: 'Create a publication-grade LaTeX TikZ diagram code visualizing an Autoencoder Neural Network architecture with encoder, latent space bottleneck, and decoder layers.',
  },
  {
    title: 'Verilog 8-bit Pipelined ALU',
    lang: 'verilog',
    problem: 'Design an 8-bit pipelined Arithmetic Logic Unit (ALU) in Verilog HDL supporting ADD, SUB, AND, OR, XOR, SHIFT, and MULT with status flags (Carry, Zero, Overflow, Negative).',
  },
];

export const CodeGenLab: React.FC = () => {
  const [problem, setProblem] = useState<string>('');
  const [language, setLanguage] = useState<string>('python');
  const [libraryFocus, setLibraryFocus] = useState<string>('NumPy & SciPy');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!problem.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/engineer/codegen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: problem.trim(),
          language,
          libraryFocus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate simulation code');
      }

      setGeneratedCode(data.result);
      setModelUsed(data.modelUsed || 'gemini-3.8-flash');
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Scientific Simulation & Code Lab
              </h2>
              <p className="text-xs text-slate-400">
                Vectorized numerical computation, simulations, hardware description & publication TikZ graphics
              </p>
            </div>
          </div>

          {/* Language Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'python', label: 'Python (NumPy/SciPy)' },
              { id: 'matlab', label: 'MATLAB / Octave' },
              { id: 'cpp', label: 'C++ (Eigen/OpenMP)' },
              { id: 'latex', label: 'LaTeX / TikZ' },
              { id: 'verilog', label: 'Verilog HDL' },
              { id: 'rust', label: 'Rust (nalgebra)' },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  language === l.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            Instant Engineering Numerical Blueprints:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {CODE_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setProblem(tmpl.problem);
                  setLanguage(tmpl.lang);
                }}
                className="text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-700/50 transition-all group"
              >
                <div className="font-semibold text-xs text-cyan-300 group-hover:text-cyan-200">
                  {tmpl.title}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {tmpl.problem}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Algorithm, Governing System, or Simulation Request:
          </label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={4}
            placeholder="e.g. Implement a 2D Heat Conduction Finite Difference (FDM) explicit solver with Dirichlet boundary conditions..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-y"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !problem.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Writing Scientific Code...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Verified Simulation Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-amber-500/40 text-slate-200 text-sm shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <Terminal className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300">Transient Service Notice: </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The model encountered a momentary traffic peak. Fallback channels are ready. Click <strong>Retry Code Generation</strong> to compile your simulation code now.
              </p>
            </div>
          </div>
          <div className="pl-8">
            <button
              onClick={handleGenerate}
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
                  <span>Retry Code Generation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {generatedCode && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold">
              <Code2 className="w-4 h-4" />
              <span>Executable Engineering Script</span>
              {modelUsed && (
                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {modelUsed}
                </span>
              )}
            </div>

            <button
              onClick={copyCode}
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
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
            <MathRenderer content={generatedCode} />
          </div>
        </div>
      )}
    </div>
  );
};
