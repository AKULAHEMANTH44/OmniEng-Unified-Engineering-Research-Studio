import React, { useState } from 'react';
import { Network, Sparkles, Loader2, Copy, Check, ShieldAlert, Cpu, GitBranch } from 'lucide-react';
import { MathRenderer } from '../utils/mathRenderer';

const SYSTEM_ARCH_TEMPLATES = [
  {
    title: 'Autonomous Vehicle Drive-by-Wire & Sensor Fusion',
    domain: 'Robotics & Control',
    reqs: 'Triple-redundant CAN bus / Automotive Ethernet, LiDAR + Radar + Stereo Camera fusion with Kalman filtering, ISO 26262 ASIL-D functional safety, emergency fail-safe braking within 150ms.',
  },
  {
    title: 'High-Power Electric Vehicle Battery Management System (BMS)',
    domain: 'Electrical (EEE)',
    reqs: '800V architecture, 100 Hz individual cell voltage & temperature monitoring, active cell balancing, State-of-Charge (SoC) estimation via Extended Kalman Filter, high-voltage interlock loop (HVIL).',
  },
  {
    title: 'Distributed Real-Time IoT Telemetry & Analytics Pipeline',
    domain: 'Computer Science & AI',
    reqs: '1 million incoming telemetry events/sec, sub-second latency aggregation, Kafka ingestion, TimescaleDB / ClickHouse storage, dynamic anomaly detection worker pool.',
  },
  {
    title: 'Precision Satellite Reaction Wheel Attitude Control System (ADCS)',
    domain: 'Mechanical & Aero',
    reqs: '3-axis pointing accuracy within 0.01 degrees, reaction wheel momentum desaturation via magnetic torquers, star tracker & Sun sensor inputs, space radiation hardened microcontroller.',
  },
];

export const SystemDesignStudio: React.FC = () => {
  const [systemName, setSystemName] = useState<string>('');
  const [domain, setDomain] = useState<string>('Robotics & Control');
  const [requirements, setRequirements] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [designSpec, setDesignSpec] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!systemName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/engineer/system-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemName: systemName.trim(),
          domain,
          requirements: requirements.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate system design');
      }

      setDesignSpec(data.result);
      setModelUsed(data.modelUsed || 'gemini-3.8-flash');
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copySpec = () => {
    if (!designSpec) return;
    navigator.clipboard.writeText(designSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Systems Engineering & Architecture Studio
              </h2>
              <p className="text-xs text-slate-400">
                Interface Control Documents (ICD), FMEA safety matrices, latency budgets & subsystem sizing
              </p>
            </div>
          </div>
        </div>

        {/* Blueprint Inspirations */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            Mission-Critical System Templates:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SYSTEM_ARCH_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSystemName(tmpl.title);
                  setDomain(tmpl.domain);
                  setRequirements(tmpl.reqs);
                }}
                className="text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-700/50 transition-all group"
              >
                <div className="font-semibold text-xs text-sky-300 group-hover:text-sky-200">
                  {tmpl.title}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {tmpl.reqs}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">System Name / Mission:</label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="e.g. Quadcopter Autonomous Flight Controller with Optical Flow"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Engineering Domain:</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-400"
            >
              <option value="Robotics & Control">Robotics & Autonomous Systems</option>
              <option value="Electrical & Power Systems">Electrical & Power Systems</option>
              <option value="Computer Systems & Cloud Infrastructure">Computer Systems & Cloud Infrastructure</option>
              <option value="Aerospace & Propulsion">Aerospace & Propulsion</option>
              <option value="Mechanical & Mechatronics">Mechanical & Mechatronics</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Requirements, Constraints, Interfaces & Redundancy:
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              placeholder="Define power constraints, communication protocols (SPI, I2C, CAN, gRPC), failure tolerances, and target throughput..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !systemName.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Architecting System Specification...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Architecture & FMEA Matrix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-amber-500/40 text-slate-200 text-sm shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <Network className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300">Transient Service Notice: </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The upstream model server experienced a traffic peak. The automatic fallback pipeline is ready. Click <strong>Retry Architecture</strong> to rerun the specification.
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
                  <span>Retry Architecture</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {designSpec && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold">
              <GitBranch className="w-4 h-4" />
              <span>System Engineering Specification</span>
              {modelUsed && (
                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  {modelUsed}
                </span>
              )}
            </div>

            <button
              onClick={copySpec}
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
                  <span>Copy Specification</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 sm:p-6 bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
            <MathRenderer content={designSpec} />
          </div>
        </div>
      )}
    </div>
  );
};
