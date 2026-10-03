import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  FileText,
  Copy,
  Check,
  Loader2,
  Lightbulb,
  Cpu,
  Layers,
  Award
} from 'lucide-react';
import { AcademicTier, Discipline } from '../types';
import { MathRenderer } from '../utils/mathRenderer';

interface ResearchStudioProps {
  currentTier: AcademicTier;
  currentDiscipline: Discipline;
}

const RESEARCH_PROMPTS_BY_DISCIPLINE: Record<string, { topic: string; objective: string; methodology: string }[]> = {
  'Computer Science & AI': [
    {
      topic: 'Physics-Informed Neural Networks (PINNs) for High Reynolds Flow',
      objective: 'Eliminate divergence in PINN Navier-Stokes solutions near turbulent boundary layers with adaptive residual loss weighting',
      methodology: 'Hybrid Collocation PINN with dynamic Sobolev loss gradients',
    },
    {
      topic: 'Post-Quantum Lattice-Based Cryptography Acceleration on RISC-V',
      objective: 'Optimize Module-LWE polynomial multiplication for ML-KEM on resource-constrained microcontrollers',
      methodology: 'Hardware-Software co-design with custom Vector Extensions',
    },
  ],
  'Electrical (EEE)': [
    {
      topic: 'Model Predictive Control for Multi-Inverter Islanded Microgrids',
      objective: 'Guarantee frequency and voltage stabilization under 60% intermittent photovoltaic penetration',
      methodology: 'Distributed Finite-Control-Set MPC (FCS-MPC) with consensus protocol',
    },
    {
      topic: 'GaN/SiC Wide-Bandgap Power Converter Thermal Stress Mitigation',
      objective: 'Extend MTBF of 800V EV traction inverters by dynamically modulating switching frequency with junction temp feedback',
      methodology: 'Active thermal management via FPGA real-time electro-thermal observer',
    },
  ],
  'Mechanical & Aero': [
    {
      topic: 'Topology Optimization of Additively Manufactured Aerostructures',
      objective: 'Minimize compliance while maintaining safety factor > 2.5 under combined aeroelastic flutter and thermal loading',
      methodology: 'Level-set method coupled with thermomechanical FEA',
    },
    {
      topic: 'Combustion Instability Suppression in Hydrogen-Enriched Gas Turbines',
      objective: 'Predict and dampen thermoacoustic pressure oscillations in lean premixed combustors',
      methodology: 'Large Eddy Simulation (LES) coupled with Helmholtz resonator damping',
    },
  ],
  'Electronics & Comm (ECE)': [
    {
      topic: 'Sub-THz RIS (Reconfigurable Intelligent Surfaces) for 6G Channels',
      objective: 'Maximize sum-rate capacity under severe molecular absorption and beam squint in 140 GHz band',
      methodology: 'Phase-shift optimization via alternating direction method of multipliers (ADMM)',
    },
    {
      topic: 'Neuromorphic Spiking Neural Network (SNN) Processor for Edge Audio',
      objective: 'Sub-milliwatt keyword spotting using event-driven spike timing dependent plasticity (STDP)',
      methodology: 'Asynchronous digital CMOS neuromorphic core architecture',
    },
  ],
};

export const ResearchStudio: React.FC<ResearchStudioProps> = ({ currentTier, currentDiscipline }) => {
  const [topic, setTopic] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [methodologyType, setMethodologyType] = useState<string>('Analytical & Numerical Multi-Physics');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const sampleIdeas = RESEARCH_PROMPTS_BY_DISCIPLINE[currentDiscipline] || [
    {
      topic: 'Physics-Informed Deep Learning for Inverse Engineering Problems',
      objective: 'Accurate parameter estimation with sparse and noisy sensor measurements',
      methodology: 'Collocation-based neural differential solver',
    },
  ];

  const handleApplySample = (sample: { topic: string; objective: string; methodology: string }) => {
    setTopic(sample.topic);
    setObjective(sample.objective);
    setMethodologyType(sample.methodology);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/engineer/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          discipline: currentDiscipline,
          objective: objective.trim(),
          methodologyType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to synthesize research document');
      }

      setResult(data.result);
      setModelUsed(data.modelUsed || 'gemini-3.8-flash');
    } catch (err: any) {
      setError(err.message || 'Error formulating research');
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                M.Tech & PhD Research Studio (IEEE / ACM / Elsevier)
              </h2>
              <p className="text-xs text-slate-400">
                Formulate publication-grade research proposals, mathematical frameworks, gap analysis & BibTeX bibliographies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-md bg-purple-950 text-purple-300 border border-purple-800">
              Masters & Doctoral Track
            </span>
          </div>
        </div>

        {/* Quick Sample Inspiration */}
        <div>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            High-Impact Thesis & Capstone Inspirations ({currentDiscipline}):
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleIdeas.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleApplySample(s)}
                className="text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-600/50 transition-all group"
              >
                <div className="font-semibold text-xs text-purple-300 group-hover:text-purple-200">
                  {s.topic}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  <span className="text-slate-300">Aim:</span> {s.objective}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Research Topic / Thesis Title:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Robust State-Estimation in Microgrid Systems under Sensor Dropout"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Methodology Framework:</label>
            <select
              value={methodologyType}
              onChange={(e) => setMethodologyType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-400"
            >
              <option value="Analytical Derivation & Numerical Simulation">Analytical Derivation & Numerical Simulation</option>
              <option value="Hardware Prototype & Experimental Validation">Hardware Prototype & Experimental Validation</option>
              <option value="Machine Learning / Hybrid Physics-Informed ML">Machine Learning / Hybrid Physics-Informed ML</option>
              <option value="Finite Element & Computational Fluid Dynamics (FEA/CFD)">Finite Element & Computational Fluid Dynamics (FEA/CFD)</option>
              <option value="Optimal Control & Mathematical Optimization">Optimal Control & Mathematical Optimization</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Core Research Objective / Unresolved Gap:</label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={2}
              placeholder="What limitation of current literature do you want to solve? (e.g. Existing Kalman filters diverge under non-Gaussian noise; we want to formulate a robust H-infinity bounding observer)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Academic Framework...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Literature Synthesis & Methodology</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-amber-500/40 text-slate-200 text-sm shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300">Transient Service Notice: </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The upstream model server experienced a high-demand spike. Automatic model fallback is active. Click <strong>Retry Synthesis</strong> to re-run your research formulation.
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
                  <span>Retry Synthesis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-purple-300 text-sm font-semibold">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Publication Framework Synthesized</span>
              {modelUsed && (
                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  {modelUsed}
                </span>
              )}
            </div>

            <button
              onClick={copyResult}
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
                  <span>Copy Paper Proposal</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 bg-slate-950/70 rounded-xl border border-slate-800/80 shadow-inner overflow-x-auto">
            <MathRenderer content={result} />
          </div>
        </div>
      )}
    </div>
  );
};
