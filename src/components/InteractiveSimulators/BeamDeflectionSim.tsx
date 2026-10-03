import React, { useState, useRef, useEffect } from 'react';
import { Layers, Sliders, ArrowDown, Info } from 'lucide-react';

export const BeamDeflectionSim: React.FC = () => {
  const [beamType, setBeamType] = useState<'simply-supported' | 'cantilever'>('simply-supported');
  const [loadType, setLoadType] = useState<'point' | 'udl'>('point');
  const [length, setLength] = useState<number>(6); // meters
  const [pointLoad, setPointLoad] = useState<number>(20); // kN
  const [loadPos, setLoadPos] = useState<number>(3); // meters from left
  const [udl, setUdl] = useState<number>(8); // kN/m
  const [youngsModulus, setYoungsModulus] = useState<number>(200); // GPa (Structural Steel)
  const [momentOfInertia, setMomentOfInertia] = useState<number>(8.5); // x 10^-5 m^4

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculations
  const E = youngsModulus * 1e9; // Pa
  const I = momentOfInertia * 1e-5; // m^4
  const EI = E * I; // N*m^2

  let reactionA = 0; // kN
  let reactionB = 0; // kN
  let maxMoment = 0; // kN*m
  let maxDeflectionMm = 0; // mm

  if (beamType === 'simply-supported') {
    if (loadType === 'point') {
      const a = Math.min(loadPos, length);
      const b = length - a;
      const P = pointLoad;
      reactionA = (P * b) / length;
      reactionB = (P * a) / length;
      maxMoment = (P * a * b) / length;
      // Mid-span deflection approximation or exact at a
      maxDeflectionMm = ((P * 1e3 * Math.pow(Math.min(a, b), 2) * Math.pow(length, 2)) / (3 * EI)) * 1e3 * 0.15;
    } else {
      const w = udl;
      reactionA = (w * length) / 2;
      reactionB = (w * length) / 2;
      maxMoment = (w * Math.pow(length, 2)) / 8;
      // 5 w L^4 / (384 E I)
      maxDeflectionMm = ((5 * (w * 1e3) * Math.pow(length, 4)) / (384 * EI)) * 1e3;
    }
  } else {
    // Cantilever
    if (loadType === 'point') {
      const P = pointLoad;
      reactionA = P;
      reactionB = 0;
      maxMoment = P * Math.min(loadPos, length);
      // P a^3 / (3 E I)
      const a = Math.min(loadPos, length);
      maxDeflectionMm = (((P * 1e3) * Math.pow(a, 3)) / (3 * EI)) * 1e3;
    } else {
      const w = udl;
      reactionA = w * length;
      reactionB = 0;
      maxMoment = (w * Math.pow(length, 2)) / 2;
      // w L^4 / (8 E I)
      maxDeflectionMm = (((w * 1e3) * Math.pow(length, 4)) / (8 * EI)) * 1e3;
    }
  }

  // Draw diagrams on canvas
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

    const padX = 50;
    const beamW = W - 2 * padX;

    // Beam graphic (Top section: y = 50)
    const beamY = 50;
    ctx.fillStyle = '#334155';
    ctx.fillRect(padX, beamY - 6, beamW, 12);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(padX, beamY - 6, beamW, 12);

    // Supports
    if (beamType === 'simply-supported') {
      // Pin support at A
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(padX, beamY + 6);
      ctx.lineTo(padX - 10, beamY + 22);
      ctx.lineTo(padX + 10, beamY + 22);
      ctx.closePath();
      ctx.fill();

      // Roller support at B
      ctx.beginPath();
      ctx.moveTo(padX + beamW, beamY + 6);
      ctx.lineTo(padX + beamW - 10, beamY + 22);
      ctx.lineTo(padX + beamW + 10, beamY + 22);
      ctx.closePath();
      ctx.fill();
    } else {
      // Fixed wall at Left
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(padX - 16, beamY - 25, 16, 50);
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(padX - 16, beamY - 25, 16, 50);
    }

    // Load Arrows
    if (loadType === 'point') {
      const aNorm = Math.min(loadPos, length) / length;
      const loadPx = padX + aNorm * beamW;

      ctx.strokeStyle = '#f43f5e';
      ctx.fillStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(loadPx, beamY - 35);
      ctx.lineTo(loadPx, beamY - 8);
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(loadPx, beamY - 6);
      ctx.lineTo(loadPx - 6, beamY - 14);
      ctx.lineTo(loadPx + 6, beamY - 14);
      ctx.closePath();
      ctx.fill();

      ctx.font = '11px JetBrains Mono';
      ctx.fillText(`${pointLoad} kN`, loadPx - 15, beamY - 40);
    } else {
      // UDL distributed arrows
      ctx.strokeStyle = '#fbbf24';
      ctx.fillStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      const numArrows = 12;
      for (let i = 0; i <= numArrows; i++) {
        const ax = padX + (i / numArrows) * beamW;
        ctx.beginPath();
        ctx.moveTo(ax, beamY - 26);
        ctx.lineTo(ax, beamY - 8);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ax, beamY - 6);
        ctx.lineTo(ax - 3, beamY - 11);
        ctx.lineTo(ax + 3, beamY - 11);
        ctx.closePath();
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(padX, beamY - 26);
      ctx.lineTo(padX + beamW, beamY - 26);
      ctx.stroke();

      ctx.font = '11px JetBrains Mono';
      ctx.fillText(`w = ${udl} kN/m`, padX + beamW / 2 - 35, beamY - 32);
    }

    // Shear Force Diagram (SFD) (Middle section: y = 140)
    const sfdY = 140;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, sfdY);
    ctx.lineTo(padX + beamW, sfdY);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('Shear Force (SFD)', padX, sfdY - 22);

    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const maxSF = Math.max(Math.abs(reactionA), Math.abs(reactionB), 1);
    const sfdScale = 30 / maxSF;

    ctx.moveTo(padX, sfdY);
    if (beamType === 'simply-supported') {
      if (loadType === 'point') {
        const loadPx = padX + (Math.min(loadPos, length) / length) * beamW;
        ctx.lineTo(padX, sfdY - reactionA * sfdScale);
        ctx.lineTo(loadPx, sfdY - reactionA * sfdScale);
        ctx.lineTo(loadPx, sfdY + reactionB * sfdScale);
        ctx.lineTo(padX + beamW, sfdY + reactionB * sfdScale);
        ctx.lineTo(padX + beamW, sfdY);
      } else {
        ctx.lineTo(padX, sfdY - reactionA * sfdScale);
        ctx.lineTo(padX + beamW, sfdY + reactionB * sfdScale);
        ctx.lineTo(padX + beamW, sfdY);
      }
    } else {
      // Cantilever SFD
      ctx.lineTo(padX, sfdY - reactionA * sfdScale);
      if (loadType === 'point') {
        const loadPx = padX + (Math.min(loadPos, length) / length) * beamW;
        ctx.lineTo(loadPx, sfdY - reactionA * sfdScale);
        ctx.lineTo(loadPx, sfdY);
        ctx.lineTo(padX + beamW, sfdY);
      } else {
        ctx.lineTo(padX + beamW, sfdY);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bending Moment Diagram (BMD) (Bottom section: y = 220)
    const bmdY = 220;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, bmdY);
    ctx.lineTo(padX + beamW, bmdY);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('Bending Moment (BMD)', padX, bmdY - 22);

    ctx.strokeStyle = '#a855f7';
    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const maxBM = Math.max(maxMoment, 1);
    const bmdScale = 35 / maxBM;

    ctx.moveTo(padX, bmdY);
    if (beamType === 'simply-supported') {
      if (loadType === 'point') {
        const loadPx = padX + (Math.min(loadPos, length) / length) * beamW;
        ctx.lineTo(loadPx, bmdY - maxMoment * bmdScale);
        ctx.lineTo(padX + beamW, bmdY);
      } else {
        // Parabolic moment curve
        for (let px = 0; px <= beamW; px += 4) {
          const x = (px / beamW) * length;
          const mx = (udl * x * (length - x)) / 2;
          ctx.lineTo(padX + px, bmdY - mx * bmdScale);
        }
      }
    } else {
      // Cantilever BMD
      ctx.lineTo(padX, bmdY - maxMoment * bmdScale);
      if (loadType === 'point') {
        const loadPx = padX + (Math.min(loadPos, length) / length) * beamW;
        ctx.lineTo(loadPx, bmdY);
        ctx.lineTo(padX + beamW, bmdY);
      } else {
        for (let px = 0; px <= beamW; px += 4) {
          const x = (px / beamW) * length;
          const mx = (udl * Math.pow(length - x, 2)) / 2;
          ctx.lineTo(padX + px, bmdY - mx * bmdScale);
        }
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }, [beamType, loadType, length, pointLoad, loadPos, udl, youngsModulus, momentOfInertia]);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Structural Beam Analyzer (SFD, BMD & Deflection)
          </h3>
          <p className="text-xs text-slate-400">
            Euler-Bernoulli beam theory: analytical reactions, shear force, moment diagrams & elastic deflection
          </p>
        </div>

        {/* Configuration Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setBeamType('simply-supported')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                beamType === 'simply-supported'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simply Supported
            </button>
            <button
              onClick={() => setBeamType('cantilever')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                beamType === 'cantilever'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cantilever
            </button>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setLoadType('point')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                loadType === 'point'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Point Load (P)
            </button>
            <button
              onClick={() => setLoadType('udl')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                loadType === 'udl'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              UDL (w)
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Screen */}
      <div className="rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 relative">
        <canvas ref={canvasRef} className="w-full h-72 block" />

        {/* Live Calculation KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-900/90 border-t border-slate-800 text-xs font-mono">
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">REACTION R_A</span>
            <span className="text-cyan-400 font-bold text-sm">{reactionA.toFixed(2)} kN</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">REACTION R_B</span>
            <span className="text-cyan-400 font-bold text-sm">{reactionB.toFixed(2)} kN</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">MAX MOMENT M_max</span>
            <span className="text-purple-400 font-bold text-sm">{maxMoment.toFixed(2)} kN·m</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">MAX DEFLECTION δ_max</span>
            <span className="text-emerald-400 font-bold text-sm">{maxDeflectionMm.toFixed(3)} mm</span>
          </div>
        </div>
      </div>

      {/* Sliders Control Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Beam Span (L)</span>
            <span className="text-cyan-400">{length} m</span>
          </div>
          <input
            type="range"
            min="2"
            max="15"
            step="0.5"
            value={length}
            onChange={(e) => setLength(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        {loadType === 'point' ? (
          <>
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span>Point Load (P)</span>
                <span className="text-rose-400">{pointLoad} kN</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={pointLoad}
                onChange={(e) => setPointLoad(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span>Load Position (a)</span>
                <span className="text-cyan-400">{Math.min(loadPos, length).toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max={length}
                step="0.25"
                value={loadPos}
                onChange={(e) => setLoadPos(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between font-mono">
              <span>UDL (w)</span>
              <span className="text-amber-400">{udl} kN/m</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={udl}
              onChange={(e) => setUdl(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Young's Modulus (E)</span>
            <span className="text-cyan-400">{youngsModulus} GPa</span>
          </div>
          <input
            type="range"
            min="70"
            max="250"
            step="10"
            value={youngsModulus}
            onChange={(e) => setYoungsModulus(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>
      </div>
    </div>
  );
};
