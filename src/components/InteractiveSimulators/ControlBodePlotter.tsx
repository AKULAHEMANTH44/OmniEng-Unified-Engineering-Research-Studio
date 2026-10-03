import React, { useState, useRef, useEffect } from 'react';
import { Gauge, CheckCircle2, AlertTriangle, XCircle, Sliders, Activity } from 'lucide-react';

export const ControlBodePlotter: React.FC = () => {
  const [gainK, setGainK] = useState<number>(20);
  const [zeroZ1, setZeroZ1] = useState<number>(5);
  const [poleP1, setPoleP1] = useState<number>(2);
  const [poleP2, setPoleP2] = useState<number>(20);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Transfer function: G(s) = K * (s + z1) / ( s * (s + p1) * (s + p2) )
  const calcMagnitudeAndPhase = (w: number) => {
    // Numerator: K * (jw + z1)
    const numReal = gainK * zeroZ1;
    const numImag = gainK * w;
    const numMag = Math.sqrt(numReal * numReal + numImag * numImag);
    const numPhase = Math.atan2(numImag, numReal);

    // Denominator: jw * (jw + p1) * (jw + p2)
    // jw: mag = w, phase = pi/2
    const den1Mag = w;
    const den1Phase = Math.PI / 2;

    const den2Mag = Math.sqrt(p1Sq(p1Sq(0) + poleP1 * poleP1) + w * w);
    const den2Phase = Math.atan2(w, poleP1);

    const den3Mag = Math.sqrt(poleP2 * poleP2 + w * w);
    const den3Phase = Math.atan2(w, poleP2);

    const denMag = den1Mag * den2Mag * den3Mag;
    const denPhase = den1Phase + den2Phase + den3Phase;

    const magRatio = numMag / (denMag || 1e-9);
    const magDb = 20 * Math.log10(Math.max(magRatio, 1e-6));
    let phaseDeg = ((numPhase - denPhase) * 180) / Math.PI;

    // Wrap to [-360, 0] range typical for control
    while (phaseDeg > 0) phaseDeg -= 360;
    while (phaseDeg < -360) phaseDeg += 360;

    return { magDb, phaseDeg };
  };

  function p1Sq(n: number) {
    return n;
  }

  // Scan frequencies from 10^-1 to 10^3 rad/s to find PM and GM
  let wGc = 0; // gain crossover (mag = 0 dB)
  let wPc = 0; // phase crossover (phase = -180 deg)
  let foundGc = false;
  let foundPc = false;
  let phaseAtGc = -180;
  let magAtPc = 0;

  for (let logW = -1; logW <= 3; logW += 0.02) {
    const w = Math.pow(10, logW);
    const { magDb, phaseDeg } = calcMagnitudeAndPhase(w);

    if (!foundGc && magDb <= 0) {
      wGc = w;
      phaseAtGc = phaseDeg;
      foundGc = true;
    }

    if (!foundPc && phaseDeg <= -180) {
      wPc = w;
      magAtPc = magDb;
      foundPc = true;
    }
  }

  const phaseMargin = 180 + phaseAtGc;
  const gainMargin = -magAtPc;

  const isStable = phaseMargin > 0 && gainMargin > 0;
  const isMarginal = Math.abs(phaseMargin) < 5 || Math.abs(gainMargin) < 2;

  // Draw Bode Plot (Upper: Magnitude dB, Lower: Phase deg)
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

    const padLeft = 55;
    const padRight = 20;
    const plotW = W - padLeft - padRight;
    const halfH = H / 2 - 15;

    // Log frequency grid: 10^-1 to 10^3 (4 decades)
    const minLog = -1;
    const maxLog = 3;
    const decades = maxLog - minLog;

    // Grid lines for decades
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let d = minLog; d <= maxLog; d++) {
      const px = padLeft + ((d - minLog) / decades) * plotW;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, H);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`10^${d}`, px - 12, H - 5);
    }

    // MAGNITUDE PLOT (Top half: -60 dB to +60 dB)
    const magTop = 15;
    const magZeroY = magTop + halfH / 2;

    // 0 dB Line
    ctx.strokeStyle = '#475569';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, magZeroY);
    ctx.lineTo(padLeft + plotW, magZeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('0 dB', 15, magZeroY + 4);
    ctx.fillText('+40', 15, magZeroY - (40 / 60) * (halfH / 2));
    ctx.fillText('-40', 15, magZeroY + (40 / 60) * (halfH / 2));

    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px JetBrains Mono font-bold';
    ctx.fillText('Magnitude |G(jω)| (dB)', padLeft, magTop + 12);

    // Trace Magnitude
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let px = 0; px <= plotW; px += 2) {
      const logW = minLog + (px / plotW) * decades;
      const w = Math.pow(10, logW);
      const { magDb } = calcMagnitudeAndPhase(w);

      const py = magZeroY - (magDb / 60) * (halfH / 2);
      if (px === 0) {
        ctx.moveTo(padLeft + px, py);
      } else {
        ctx.lineTo(padLeft + px, py);
      }
    }
    ctx.stroke();

    // PHASE PLOT (Bottom half: -270 deg to 0 deg)
    const phaseTop = halfH + 25;
    const phase180Y = phaseTop + (halfH * 180) / 270;

    // -180 deg Line (Critical Stability Limit)
    ctx.strokeStyle = '#f43f5e';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, phase180Y);
    ctx.lineTo(padLeft + plotW, phase180Y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f43f5e';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('-180°', 10, phase180Y + 4);

    ctx.fillStyle = '#a855f7';
    ctx.font = '11px JetBrains Mono font-bold';
    ctx.fillText('Phase ∠G(jω) (degrees)', padLeft, phaseTop + 14);

    // Trace Phase
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let px = 0; px <= plotW; px += 2) {
      const logW = minLog + (px / plotW) * decades;
      const w = Math.pow(10, logW);
      const { phaseDeg } = calcMagnitudeAndPhase(w);

      const normP = Math.abs(phaseDeg) / 270;
      const py = phaseTop + normP * halfH;

      if (px === 0) {
        ctx.moveTo(padLeft + px, py);
      } else {
        ctx.lineTo(padLeft + px, py);
      }
    }
    ctx.stroke();
  }, [gainK, zeroZ1, poleP1, poleP2]);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Control Systems Bode Plot & Stability Analyzer
          </h3>
          <p className="text-xs text-slate-400">
            Transfer function frequency response: Phase Margin (PM), Gain Margin (GM), and Nyquist stability criteria
          </p>
        </div>

        {/* Stability Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
            isMarginal
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : isStable
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}
        >
          {isMarginal ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : isStable ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>
            {isMarginal
              ? 'Marginally Stable System'
              : isStable
              ? 'Closed-Loop System STABLE'
              : 'Closed-Loop System UNSTABLE'}
          </span>
        </div>
      </div>

      {/* Transfer Function Display */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center font-mono text-sm text-cyan-300">
        G(s) = \frac{'{' + gainK + '(s + ' + zeroZ1 + ')}'}{'{s (s + ' + poleP1 + ')(s + ' + poleP2 + ')}'}
      </div>

      {/* Bode Dual Canvas Screen */}
      <div className="rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
        <canvas ref={canvasRef} className="w-full h-80 block" />

        {/* Live Stability Metrics KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-900/90 border-t border-slate-800 text-xs font-mono">
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">PHASE MARGIN (PM)</span>
            <span
              className={`font-bold text-sm ${
                phaseMargin > 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {phaseMargin.toFixed(1)}°
            </span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">GAIN MARGIN (GM)</span>
            <span
              className={`font-bold text-sm ${
                gainMargin > 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {gainMargin.toFixed(1)} dB
            </span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">GAIN CROSSOVER (ω_gc)</span>
            <span className="text-cyan-400 font-bold text-sm">{wGc.toFixed(2)} rad/s</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">PHASE CROSSOVER (ω_pc)</span>
            <span className="text-purple-400 font-bold text-sm">{wPc.toFixed(2)} rad/s</span>
          </div>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>DC Gain (K)</span>
            <span className="text-cyan-400">{gainK}</span>
          </div>
          <input
            type="range"
            min="2"
            max="100"
            step="2"
            value={gainK}
            onChange={(e) => setGainK(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Zero (z₁)</span>
            <span className="text-emerald-400">{zeroZ1} rad/s</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={zeroZ1}
            onChange={(e) => setZeroZ1(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Pole 1 (p₁)</span>
            <span className="text-amber-400">{poleP1} rad/s</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="20"
            step="0.5"
            value={poleP1}
            onChange={(e) => setPoleP1(parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Pole 2 (p₂)</span>
            <span className="text-purple-400">{poleP2} rad/s</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="2"
            value={poleP2}
            onChange={(e) => setPoleP2(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>
      </div>
    </div>
  );
};
