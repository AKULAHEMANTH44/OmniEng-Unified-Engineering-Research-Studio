import React, { useState, useRef, useEffect } from 'react';
import { Flame, Wind, Snowflake, Activity, Sliders, Info, Zap } from 'lucide-react';

type ThermoCycle = 'rankine' | 'brayton' | 'refrigeration' | 'carnot';

export const ThermodynamicsLab: React.FC = () => {
  const [cycle, setCycle] = useState<ThermoCycle>('rankine');

  // Rankine parameters
  const [pBoilerMpa, setPBoilerMpa] = useState<number>(10); // MPa
  const [pCondenserKpa, setPCondenserKpa] = useState<number>(10); // kPa
  const [turbineTempC, setTurbineTempC] = useState<number>(550); // C

  // Brayton parameters
  const [pressureRatio, setPressureRatio] = useState<number>(8);
  const [tCompressorInletK, setTCompressorInletK] = useState<number>(300); // K (27 C)
  const [tTurbineInletK, setTTurbineInletK] = useState<number>(1300); // K (1027 C)

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute Cycle Thermodynamics
  let thermalEfficiency = 0;
  let workNet = 0;
  let heatIn = 0;
  let extraMetricLabel = '';
  let extraMetricValue = '';

  if (cycle === 'rankine') {
    // Rankine analytical approximations
    // State 1: Turbine inlet (superheated steam at P_high, T_in)
    const h1 = 3450 + (turbineTempC - 500) * 2.2 - (pBoilerMpa - 8) * 12; // kJ/kg
    const s1 = 6.7 + (turbineTempC - 500) * 0.003 - (pBoilerMpa - 8) * 0.02; // kJ/(kg K)

    // State 2: Turbine outlet (condenser pressure P_low, saturated mixture)
    const hf2 = 191.8; // at 10 kPa
    const hfg2 = 2392.8;
    const sf2 = 0.6493;
    const sfg2 = 7.5009;
    const x2 = Math.min(1.0, Math.max(0.75, (s1 - sf2) / sfg2));
    const h2 = hf2 + x2 * hfg2;

    // State 3: Condenser outlet (saturated liquid at P_low)
    const h3 = hf2;

    // State 4: Boiler inlet (compressed liquid after feed pump)
    const pumpWork = 0.00101 * (pBoilerMpa * 1000 - pCondenserKpa); // v * deltaP kJ/kg
    const h4 = h3 + pumpWork;

    const wTurbine = h1 - h2;
    workNet = wTurbine - pumpWork;
    heatIn = h1 - h4;
    thermalEfficiency = (workNet / (heatIn || 1)) * 100;
    extraMetricLabel = 'Steam Quality (x₂)';
    extraMetricValue = `${(x2 * 100).toFixed(1)} %`;
  } else if (cycle === 'brayton') {
    // Air standard Brayton cycle (gamma = 1.4, cp = 1.005 kJ/kg K)
    const gamma = 1.4;
    const cp = 1.005;
    const rpExp = (gamma - 1) / gamma; // ~0.286
    const t2 = tCompressorInletK * Math.pow(pressureRatio, rpExp);
    const t4 = tTurbineInletK / Math.pow(pressureRatio, rpExp);

    const wComp = cp * (t2 - tCompressorInletK);
    const wTurb = cp * (tTurbineInletK - t4);
    workNet = wTurb - wComp;
    heatIn = cp * (tTurbineInletK - t2);
    thermalEfficiency = (1 - 1 / Math.pow(pressureRatio, rpExp)) * 100;

    const bwr = (wComp / (wTurb || 1)) * 100;
    extraMetricLabel = 'Back Work Ratio (BWR)';
    extraMetricValue = `${bwr.toFixed(1)} %`;
  } else if (cycle === 'refrigeration') {
    // Vapor-Compression Refrigeration
    const tEvapK = 260; // -13 C
    const tCondK = 310; // +37 C
    const copCarnot = tEvapK / (tCondK - tEvapK);
    const copReal = copCarnot * 0.58; // realistic isentropic factor

    thermalEfficiency = copReal;
    workNet = 3.5 / copReal; // kW per ton of refrigeration
    heatIn = 3.5; // 1 TR ~ 3.517 kW
    extraMetricLabel = 'Refrigeration COP';
    extraMetricValue = `${copReal.toFixed(2)}`;
  } else {
    // Carnot Cycle
    const tHot = turbineTempC + 273.15;
    const tCold = 300; // ambient 27 C
    thermalEfficiency = (1 - tCold / tHot) * 100;
    workNet = 850;
    heatIn = workNet / (thermalEfficiency / 100);
    extraMetricLabel = 'Carnot Ceiling';
    extraMetricValue = `${thermalEfficiency.toFixed(1)} %`;
  }

  // Draw T-s Diagram on Canvas
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

    const padLeft = 45;
    const padBottom = 30;
    const plotW = W - padLeft - 20;
    const plotH = H - padBottom - 25;

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

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, 10);
    ctx.lineTo(padLeft, H - padBottom);
    ctx.lineTo(padLeft + plotW, H - padBottom);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('Temperature (T) ->', padLeft + 10, 20);
    ctx.fillText('Entropy (s) ->', padLeft + plotW - 80, H - 10);

    // Draw Steam Vapor Dome if Rankine / Refrigeration
    if (cycle === 'rankine' || cycle === 'refrigeration') {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();

      const domePeakX = padLeft + plotW * 0.45;
      const domePeakY = 35;
      const domeBottomY = H - padBottom;

      ctx.moveTo(padLeft + plotW * 0.15, domeBottomY);
      ctx.quadraticCurveTo(padLeft + plotW * 0.2, domePeakY + 30, domePeakX, domePeakY);
      ctx.quadraticCurveTo(padLeft + plotW * 0.7, domePeakY + 30, padLeft + plotW * 0.85, domeBottomY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#64748b';
      ctx.fillText('Vapor Dome', domePeakX - 25, domePeakY - 8);
    }

    // Draw Cycle State Points Path
    ctx.strokeStyle = cycle === 'rankine' ? '#38bdf8' : cycle === 'brayton' ? '#fb923c' : '#a855f7';
    ctx.fillStyle = cycle === 'rankine' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(251, 146, 60, 0.12)';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    if (cycle === 'rankine') {
      // 1: Superheated steam inlet
      const p1 = { x: padLeft + plotW * 0.75, y: 45 };
      // 2: Turbine isentropic expansion outlet (inside vapor dome)
      const p2 = { x: padLeft + plotW * 0.75, y: H - padBottom - 45 };
      // 3: Saturated liquid condensate
      const p3 = { x: padLeft + plotW * 0.22, y: H - padBottom - 45 };
      // 4: Compressed liquid after feed pump
      const p4 = { x: padLeft + plotW * 0.23, y: H - padBottom - 52 };

      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      // Heating curve across vapor dome to state 1
      ctx.quadraticCurveTo(padLeft + plotW * 0.45, 45, p1.x, p1.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // State point labels
      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px JetBrains Mono font-bold';
      ctx.fillText('1 (Turbine Inlet)', p1.x - 30, p1.y - 10);
      ctx.fillText('2 (Condenser In)', p2.x + 5, p2.y);
      ctx.fillText('3 (Pump In)', p3.x - 40, p3.y + 15);
      ctx.fillText('4 (Boiler In)', p4.x - 40, p4.y - 8);
    } else if (cycle === 'brayton') {
      // Brayton cycle (2 isentropics, 2 isobars)
      const p1 = { x: padLeft + plotW * 0.25, y: H - padBottom - 40 };
      const p2 = { x: padLeft + plotW * 0.25, y: H - padBottom - 110 };
      const p3 = { x: padLeft + plotW * 0.7, y: 35 };
      const p4 = { x: padLeft + plotW * 0.7, y: H - padBottom - 70 };

      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fb923c';
      ctx.font = '11px JetBrains Mono font-bold';
      ctx.fillText('1 (Compressor In)', p1.x - 35, p1.y + 15);
      ctx.fillText('2 (Combustor In)', p2.x - 35, p2.y - 8);
      ctx.fillText('3 (Turbine In)', p3.x + 5, p3.y);
      ctx.fillText('4 (Exhaust)', p4.x + 5, p4.y + 15);
    } else {
      // Carnot rectangle
      const p1 = { x: padLeft + plotW * 0.7, y: 40 };
      const p2 = { x: padLeft + plotW * 0.7, y: H - padBottom - 50 };
      const p3 = { x: padLeft + plotW * 0.3, y: H - padBottom - 50 };
      const p4 = { x: padLeft + plotW * 0.3, y: 40 };

      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#a855f7';
      ctx.font = '11px JetBrains Mono font-bold';
      ctx.fillText('Th (Isothermal Heat In)', p4.x + 20, p4.y - 10);
      ctx.fillText('Tc (Isothermal Rejection)', p3.x + 20, p3.y + 18);
    }
  }, [cycle, pBoilerMpa, pCondenserKpa, turbineTempC, pressureRatio, tCompressorInletK, tTurbineInletK]);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Thermodynamic Cycles & State-Point Studio
          </h3>
          <p className="text-xs text-slate-400">
            Interactive Rankine, Brayton & Carnot cycles with real-time Temperature-Entropy (T-s) diagram & thermal efficiency
          </p>
        </div>

        {/* Cycle selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'rankine', label: 'Steam Rankine' },
            { id: 'brayton', label: 'Gas Brayton' },
            { id: 'refrigeration', label: 'VCR Refrigeration' },
            { id: 'carnot', label: 'Carnot Limit' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCycle(c.id as ThermoCycle)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                cycle === c.id
                  ? 'bg-orange-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* T-s Canvas Screen */}
      <div className="rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
        <canvas ref={canvasRef} className="w-full h-72 block" />

        {/* KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-900/90 border-t border-slate-800 text-xs font-mono">
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">THERMAL EFFICIENCY (η_th)</span>
            <span className="text-orange-400 font-bold text-sm">
              {cycle === 'refrigeration' ? `${thermalEfficiency.toFixed(2)} (COP)` : `${thermalEfficiency.toFixed(1)} %`}
            </span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">NET WORK OUTPUT (W_net)</span>
            <span className="text-cyan-400 font-bold text-sm">{workNet.toFixed(1)} kJ/kg</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">TOTAL HEAT INPUT (Q_in)</span>
            <span className="text-purple-400 font-bold text-sm">{heatIn.toFixed(1)} kJ/kg</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">{extraMetricLabel}</span>
            <span className="text-emerald-400 font-bold text-sm">{extraMetricValue}</span>
          </div>
        </div>
      </div>

      {/* Sliders for active cycle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        {cycle === 'rankine' && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span>Boiler Pressure (P_high)</span>
                <span className="text-orange-400">{pBoilerMpa} MPa</span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="0.5"
                value={pBoilerMpa}
                onChange={(e) => setPBoilerMpa(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span>Turbine Inlet Temp (T₁)</span>
                <span className="text-cyan-400">{turbineTempC} °C</span>
              </div>
              <input
                type="range"
                min="400"
                max="650"
                step="10"
                value={turbineTempC}
                onChange={(e) => setTurbineTempC(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span>Condenser Pressure (P_low)</span>
                <span className="text-purple-400">{pCondenserKpa} kPa</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="2"
                value={pCondenserKpa}
                onChange={(e) => setPCondenserKpa(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          </>
        )}

        {cycle === 'brayton' && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span>Pressure Ratio (r_p)</span>
                <span className="text-orange-400">{pressureRatio}</span>
              </div>
              <input
                type="range"
                min="4"
                max="25"
                step="1"
                value={pressureRatio}
                onChange={(e) => setPressureRatio(parseInt(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span>Turbine Inlet Temp (T₃)</span>
                <span className="text-cyan-400">{tTurbineInletK} K</span>
              </div>
              <input
                type="range"
                min="900"
                max="1600"
                step="25"
                value={tTurbineInletK}
                onChange={(e) => setTTurbineInletK(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span>Compressor Inlet Temp (T₁)</span>
                <span className="text-purple-400">{tCompressorInletK} K</span>
              </div>
              <input
                type="range"
                min="270"
                max="340"
                step="5"
                value={tCompressorInletK}
                onChange={(e) => setTCompressorInletK(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          </>
        )}

        {(cycle === 'carnot' || cycle === 'refrigeration') && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span>Source High Temp</span>
                <span className="text-orange-400">{turbineTempC} °C</span>
              </div>
              <input
                type="range"
                min="200"
                max="700"
                step="10"
                value={turbineTempC}
                onChange={(e) => setTurbineTempC(parseInt(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span>Ambient Sink Temp</span>
                <span className="text-cyan-400">27 °C (300 K)</span>
              </div>
              <span className="text-[11px] text-slate-500 block pt-1">Standard environmental heat sink baseline</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
