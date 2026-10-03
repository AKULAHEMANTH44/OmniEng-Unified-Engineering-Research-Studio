import React, { useState, useRef, useEffect } from 'react';
import { Zap, Activity, Info, Gauge } from 'lucide-react';

export const CircuitTransientSim: React.FC = () => {
  const [resistance, setResistance] = useState<number>(50); // Ohms
  const [inductanceMh, setInductanceMh] = useState<number>(10); // mH
  const [capacitanceUf, setCapacitanceUf] = useState<number>(4.7); // uF
  const [stepVoltage, setStepVoltage] = useState<number>(10); // Volts

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Electrical parameter calculations
  const R = resistance;
  const L = inductanceMh * 1e-3; // Henry
  const C = capacitanceUf * 1e-6; // Farad
  const V0 = stepVoltage;

  const omega0 = 1 / Math.sqrt(L * C); // rad/s
  const alpha = R / (2 * L); // rad/s
  const zeta = alpha / omega0; // damping ratio
  const Q = omega0 / (2 * alpha);
  const f0 = omega0 / (2 * Math.PI);

  let regime: 'Underdamped (Oscillatory)' | 'Critically Damped (Fastest Non-Overshoot)' | 'Overdamped (Sluggish)';
  let regimeColor = 'text-cyan-400';
  let badgeBg = 'bg-cyan-500/20 border-cyan-500/40';

  if (Math.abs(zeta - 1) < 0.05) {
    regime = 'Critically Damped (Fastest Non-Overshoot)';
    regimeColor = 'text-emerald-400';
    badgeBg = 'bg-emerald-500/20 border-emerald-500/40';
  } else if (zeta < 1) {
    regime = 'Underdamped (Oscillatory)';
    regimeColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/20 border-amber-500/40';
  } else {
    regime = 'Overdamped (Sluggish)';
    regimeColor = 'text-indigo-400';
    badgeBg = 'bg-indigo-500/20 border-indigo-500/40';
  }

  // Draw transient waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    const padLeft = 45;
    const padBottom = 30;
    const plotW = W - padLeft - 20;
    const plotH = H - padBottom - 20;

    // Time window calculation: roughly 5 time-constants
    const tau = 1 / (alpha || 1);
    const maxTime = Math.max(5 * tau, 0.002); // at least 2ms

    // Target voltage reference line V0
    const targetY = H - padBottom - (V0 / (V0 * 1.8)) * plotH;
    ctx.strokeStyle = '#475569';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, targetY);
    ctx.lineTo(padLeft + plotW, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText(`Target: ${V0}V`, padLeft + 10, targetY - 6);

    // Plot v_C(t)
    ctx.strokeStyle = zeta < 1 ? '#38bdf8' : zeta > 1.05 ? '#818cf8' : '#34d399';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let px = 0; px <= plotW; px += 2) {
      const t = (px / plotW) * maxTime;
      let vc = 0;

      if (zeta < 1) {
        // Underdamped
        const wd = omega0 * Math.sqrt(1 - zeta * zeta);
        const phi = Math.atan(wd / alpha);
        vc = V0 * (1 - (Math.exp(-alpha * t) / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t + phi));
      } else if (Math.abs(zeta - 1) < 0.05) {
        // Critically damped
        vc = V0 * (1 - (1 + omega0 * t) * Math.exp(-omega0 * t));
      } else {
        // Overdamped
        const s1 = -alpha + Math.sqrt(alpha * alpha - omega0 * omega0);
        const s2 = -alpha - Math.sqrt(alpha * alpha - omega0 * omega0);
        vc = V0 * (1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1));
      }

      const py = H - padBottom - (vc / (V0 * 1.8)) * plotH;
      if (px === 0) {
        ctx.moveTo(padLeft + px, py);
      } else {
        ctx.lineTo(padLeft + px, py);
      }
    }

    ctx.stroke();

    // Baseline axis
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, H - padBottom);
    ctx.lineTo(padLeft + plotW, H - padBottom);
    ctx.stroke();
    ctx.fillText('0 V', 15, H - padBottom + 4);
    ctx.fillText('Time (t) ->', padLeft + plotW - 60, H - 10);
  }, [R, L, C, V0, omega0, alpha, zeta]);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            RLC Transient Response & Resonance Lab
          </h3>
          <p className="text-xs text-slate-400">
            Second-order system step response: Natural frequency, damping ratio ($\zeta$), and quality factor
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${badgeBg} ${regimeColor}`}>
          <Gauge className="w-3.5 h-3.5" />
          <span>{regime}</span>
        </div>
      </div>

      {/* Screen */}
      <div className="rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
        <canvas ref={canvasRef} className="w-full h-64 block" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-900/90 border-t border-slate-800 text-xs font-mono">
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">DAMPING RATIO (ζ)</span>
            <span className={`font-bold text-sm ${regimeColor}`}>{zeta.toFixed(3)}</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">NATURAL FREQ (ω₀)</span>
            <span className="text-cyan-400 font-bold text-sm">{(omega0 / 1000).toFixed(2)} krad/s</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">RESONANT FREQ (f₀)</span>
            <span className="text-sky-400 font-bold text-sm">{f0 > 1000 ? `${(f0 / 1000).toFixed(2)} kHz` : `${f0.toFixed(1)} Hz`}</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">QUALITY FACTOR (Q)</span>
            <span className="text-emerald-400 font-bold text-sm">{Q.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Resistance (R)</span>
            <span className="text-amber-400">{resistance} Ω</span>
          </div>
          <input
            type="range"
            min="2"
            max="300"
            step="2"
            value={resistance}
            onChange={(e) => setResistance(parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Inductance (L)</span>
            <span className="text-cyan-400">{inductanceMh} mH</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={inductanceMh}
            onChange={(e) => setInductanceMh(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Capacitance (C)</span>
            <span className="text-purple-400">{capacitanceUf} µF</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="50"
            step="0.5"
            value={capacitanceUf}
            onChange={(e) => setCapacitanceUf(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Step Voltage (V₀)</span>
            <span className="text-emerald-400">{stepVoltage} V</span>
          </div>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={stepVoltage}
            onChange={(e) => setStepVoltage(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
