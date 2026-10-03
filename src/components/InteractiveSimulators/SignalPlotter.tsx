import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Sliders, Waves, Activity, Sparkles } from 'lucide-react';

type WaveformType = 'sine' | 'square' | 'triangle' | 'damped' | 'fourier' | 'chirp';

export const SignalPlotter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveType, setWaveType] = useState<WaveformType>('sine');
  const [frequency, setFrequency] = useState<number>(2.5); // Hz
  const [amplitude, setAmplitude] = useState<number>(1.5); // V
  const [phase, setPhase] = useState<number>(0); // radians
  const [damping, setDamping] = useState<number>(0.4); // gamma
  const [harmonics, setHarmonics] = useState<number>(5); // for Fourier
  const [noise, setNoise] = useState<number>(0); // Noise level
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeOffset, setTimeOffset] = useState<number>(0);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localOffset = timeOffset;

    const animate = (currentTime: number) => {
      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      if (isPlaying) {
        localOffset += dt * 1.5;
      }

      // Resize canvas to match display size
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const width = rect.width;
      const height = rect.height;

      // Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Grid drawing (Oscilloscope style)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSpacing = 40;

      // Vertical grid lines
      for (let x = 0; x <= width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 0; y <= height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center Axes (Cyan accented)
      const centerY = height / 2;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Plot signal
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const timeSpan = 3.0; // seconds visible on screen
      const scaleY = (height / 2 - 25) / 3; // pixels per volt

      for (let px = 0; px <= width; px += 2) {
        const t = (px / width) * timeSpan + localOffset;
        let yVal = 0;

        switch (waveType) {
          case 'sine':
            yVal = amplitude * Math.sin(2 * Math.PI * frequency * t + phase);
            break;

          case 'square': {
            const rawSine = Math.sin(2 * Math.PI * frequency * t + phase);
            yVal = amplitude * (rawSine >= 0 ? 1 : -1);
            break;
          }

          case 'triangle': {
            const period = 1 / frequency;
            const modT = ((t + phase / (2 * Math.PI * frequency)) % period + period) % period;
            yVal = amplitude * (4 * Math.abs(modT / period - 0.5) - 1);
            break;
          }

          case 'damped': {
            const decay = Math.exp(-damping * (t % 4));
            yVal = amplitude * decay * Math.sin(2 * Math.PI * frequency * t + phase);
            break;
          }

          case 'fourier': {
            // Square wave Fourier series synthesis: sum odd harmonics (1/(2k+1))*sin((2k+1)*w*t)
            let sum = 0;
            for (let k = 0; k < harmonics; k++) {
              const n = 2 * k + 1;
              sum += (1 / n) * Math.sin(n * 2 * Math.PI * frequency * t + phase);
            }
            yVal = amplitude * (4 / Math.PI) * sum;
            break;
          }

          case 'chirp': {
            // Frequency modulation chirp: f(t) = f0 + k*t
            const instFreq = frequency + 1.2 * (t % 3);
            yVal = amplitude * Math.sin(2 * Math.PI * instFreq * t + phase);
            break;
          }
        }

        // Add optional thermal/electronic white noise
        if (noise > 0) {
          yVal += (Math.random() - 0.5) * noise * 0.4;
        }

        const py = centerY - yVal * scaleY;
        if (px === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.stroke();
      ctx.restore();

      requestRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [waveType, frequency, amplitude, phase, damping, harmonics, noise, isPlaying]);

  // Derived metrics
  const vPeak = amplitude;
  const vRms = waveType === 'sine' ? amplitude / Math.SQRT2 : waveType === 'square' ? amplitude : amplitude / Math.sqrt(3);
  const periodMs = (1000 / frequency).toFixed(1);
  const angularOmega = (2 * Math.PI * frequency).toFixed(2);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Interactive Oscilloscope & Signal Generator
          </h3>
          <p className="text-xs text-slate-400">
            Real-time continuous waveform generation, Fourier synthesis & transient analysis
          </p>
        </div>

        {/* Wave Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(
            [
              { id: 'sine', label: 'Sine' },
              { id: 'fourier', label: 'Fourier Series' },
              { id: 'square', label: 'Square' },
              { id: 'triangle', label: 'Triangle' },
              { id: 'damped', label: 'Damped Osc' },
              { id: 'chirp', label: 'Chirp / FM' },
            ] as const
          ).map((w) => (
            <button
              key={w.id}
              onClick={() => setWaveType(w.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                waveType === w.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Oscilloscope Screen */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <canvas ref={canvasRef} className="w-full h-64 sm:h-72 block cursor-crosshair" />

        {/* HUD Overlay Stats */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/60 font-mono text-[11px] text-cyan-300 space-y-0.5 pointer-events-none shadow-lg">
          <div className="flex gap-3">
            <span>Vp: {vPeak.toFixed(2)} V</span>
            <span>Vrms: {vRms.toFixed(2)} V</span>
          </div>
          <div className="flex gap-3 text-slate-300">
            <span>f: {frequency.toFixed(2)} Hz</span>
            <span>T: {periodMs} ms</span>
            <span>ω: {angularOmega} rad/s</span>
          </div>
        </div>

        {/* Play / Pause Floating Control */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/60">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-colors"
            title={isPlaying ? 'Pause Wave' : 'Resume Wave'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setTimeOffset(0);
              setFrequency(2.5);
              setAmplitude(1.5);
              setPhase(0);
            }}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 transition-colors"
            title="Reset Parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        {/* Frequency */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-mono">
            <span>Frequency (f)</span>
            <span className="text-cyan-400">{frequency.toFixed(2)} Hz</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        {/* Amplitude */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-mono">
            <span>Peak Amplitude (A)</span>
            <span className="text-cyan-400">{amplitude.toFixed(2)} V</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.05"
            value={amplitude}
            onChange={(e) => setAmplitude(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        {/* Phase / Damping / Harmonics depending on mode */}
        {waveType === 'fourier' ? (
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span>Harmonics (N)</span>
              <span className="text-cyan-400">{harmonics} terms</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={harmonics}
              onChange={(e) => setHarmonics(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        ) : waveType === 'damped' ? (
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span>Damping Factor (γ)</span>
              <span className="text-cyan-400">{damping.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="2.0"
              step="0.05"
              value={damping}
              onChange={(e) => setDamping(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span>Phase Shift (φ)</span>
              <span className="text-cyan-400">{((phase / Math.PI) * 180).toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.1"
              value={phase}
              onChange={(e) => setPhase(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        )}

        {/* Gaussian Noise injection */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-mono">
            <span>Thermal Noise (SNR)</span>
            <span className="text-cyan-400">{noise > 0 ? `${(noise * 100).toFixed(0)}%` : 'Pure (0%)'}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={noise}
            onChange={(e) => setNoise(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>
      </div>
    </div>
  );
};
