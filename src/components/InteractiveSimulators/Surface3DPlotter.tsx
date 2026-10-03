import React, { useState, useRef, useEffect } from 'react';
import { Box, RotateCcw, Sliders, Sparkles, Eye, Compass } from 'lucide-react';

type SurfaceFunction = 'sinc' | 'saddle' | 'gaussian' | 'membrane' | 'paraboloid';

export const Surface3DPlotter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [funcType, setFuncType] = useState<SurfaceFunction>('sinc');
  const [amplitude, setAmplitude] = useState<number>(1.2);
  const [gridSize, setGridSize] = useState<number>(28);
  const [yaw, setYaw] = useState<number>(45); // degrees
  const [pitch, setPitch] = useState<number>(30); // degrees
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [colorTheme, setColorTheme] = useState<'cyan-indigo' | 'solar' | 'emerald'>('cyan-indigo');

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);

  // Surface formula evaluator: z = f(x, y)
  const evaluateZ = (x: number, y: number, t: number): number => {
    switch (funcType) {
      case 'sinc': {
        const r = Math.sqrt(x * x + y * y);
        return r === 0 ? amplitude : (amplitude * Math.sin(r * 2.5 - t * 1.5)) / (r * 2.5);
      }
      case 'saddle':
        return amplitude * 0.25 * (x * x - y * y);
      case 'gaussian': {
        const r2 = x * x + y * y;
        return -amplitude * Math.exp(-r2 * 0.8) + amplitude * 0.5;
      }
      case 'membrane':
        return amplitude * 0.7 * Math.sin(x * 1.8) * Math.cos(y * 1.8 + t * 1.2);
      case 'paraboloid':
        return amplitude * 0.2 * (x * x + y * y) - amplitude * 0.6;
      default:
        return 0;
    }
  };

  // Color helper based on normalized Z
  const getColor = (normZ: number): string => {
    const clamped = Math.max(0, Math.min(1, normZ));
    if (colorTheme === 'cyan-indigo') {
      // 0 = Indigo (129, 140, 248), 1 = Cyan (56, 189, 248)
      const r = Math.round(79 + clamped * (34 - 79));
      const g = Math.round(70 + clamped * (211 - 70));
      const b = Math.round(229 + clamped * (238 - 229));
      return `rgb(${r}, ${g}, ${b})`;
    } else if (colorTheme === 'solar') {
      // 0 = Dark Orange, 1 = Yellow
      const r = 245;
      const g = Math.round(100 + clamped * 130);
      const b = Math.round(30 + clamped * 40);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Emerald
      const r = Math.round(16 + clamped * 36);
      const g = Math.round(185 + clamped * 50);
      const b = Math.round(129 + clamped * 50);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // 3D Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let localYaw = yaw;

    const render = () => {
      if (isRotating && !isDraggingRef.current) {
        time += 0.02;
        localYaw = (localYaw + 0.3) % 360;
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const W = rect.width;
      const H = rect.height;

      // Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, W, H);

      // Grid domain [-2.5, 2.5]
      const range = 2.5;
      const step = (range * 2) / gridSize;
      const radYaw = (localYaw * Math.PI) / 180;
      const radPitch = (pitch * Math.PI) / 180;

      const cosY = Math.cos(radYaw);
      const sinY = Math.sin(radYaw);
      const cosP = Math.cos(radPitch);
      const sinP = Math.sin(radPitch);

      const centerX = W / 2;
      const centerY = H / 2 + 10;
      const scale = Math.min(W, H) / 7.5;

      // 3D projection function
      const project = (x: number, y: number, z: number) => {
        // Rotation around Z (Yaw)
        const rx = x * cosY - y * sinY;
        const ry = x * sinY + y * cosY;
        // Rotation around X (Pitch)
        const rz = z * cosP - ry * sinP;
        const depth = z * sinP + ry * cosP;

        const px = centerX + rx * scale;
        const py = centerY - rz * scale;
        return { px, py, depth, z };
      };

      // Generate points
      const points: { px: number; py: number; depth: number; z: number }[][] = [];
      let minZ = Infinity;
      let maxZ = -Infinity;

      for (let i = 0; i <= gridSize; i++) {
        points[i] = [];
        const x = -range + i * step;
        for (let j = 0; j <= gridSize; j++) {
          const y = -range + j * step;
          const z = evaluateZ(x, y, time);
          if (z < minZ) minZ = z;
          if (z > maxZ) maxZ = z;
          points[i][j] = project(x, y, z);
        }
      }

      const zRange = Math.max(maxZ - minZ, 0.001);

      // Draw wireframe quads sorted by depth
      const quads: {
        p0: { px: number; py: number; depth: number; z: number };
        p1: { px: number; py: number; depth: number; z: number };
        p2: { px: number; py: number; depth: number; z: number };
        p3: { px: number; py: number; depth: number; z: number };
        avgDepth: number;
        avgZ: number;
      }[] = [];

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const p0 = points[i][j];
          const p1 = points[i + 1][j];
          const p2 = points[i + 1][j + 1];
          const p3 = points[i][j + 1];
          const avgDepth = (p0.depth + p1.depth + p2.depth + p3.depth) / 4;
          const avgZ = (p0.z + p1.z + p2.z + p3.z) / 4;
          quads.push({ p0, p1, p2, p3, avgDepth, avgZ });
        }
      }

      // Sort painters algorithm: furthest first
      quads.sort((a, b) => b.avgDepth - a.avgDepth);

      for (const q of quads) {
        const normZ = (q.avgZ - minZ) / zRange;
        ctx.fillStyle = getColor(normZ);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.8;

        ctx.beginPath();
        ctx.moveTo(q.p0.px, q.p0.py);
        ctx.lineTo(q.p1.px, q.p1.py);
        ctx.lineTo(q.p2.px, q.p2.py);
        ctx.lineTo(q.p3.px, q.p3.py);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 3D Coordinate Axis indicators at corner
      const origin = project(0, 0, 0);
      const xAxis = project(2.2, 0, 0);
      const yAxis = project(0, 2.2, 0);
      const zAxis = project(0, 0, 1.8);

      ctx.lineWidth = 1.5;
      // X axis (Red)
      ctx.strokeStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(origin.px, origin.py);
      ctx.lineTo(xAxis.px, xAxis.py);
      ctx.stroke();

      // Y axis (Green)
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(origin.px, origin.py);
      ctx.lineTo(yAxis.px, yAxis.py);
      ctx.stroke();

      // Z axis (Blue)
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(origin.px, origin.py);
      ctx.lineTo(zAxis.px, zAxis.py);
      ctx.stroke();

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [funcType, amplitude, gridSize, yaw, pitch, isRotating, colorTheme]);

  // Mouse drag handlers for manual 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setYaw((prev) => (prev + dx * 0.6) % 360);
    setPitch((prev) => Math.max(-60, Math.min(80, prev - dy * 0.6)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Box className="w-5 h-5 text-indigo-400" />
            3D Multi-Variable Surface & Vector Field Visualizer
          </h3>
          <p className="text-xs text-slate-400">
            Interactive isometric projection for multivariable calculus, wave equations, potential fields & PDEs
          </p>
        </div>

        {/* Function Switchers */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'sinc', label: 'Bessel / Sinc Wave' },
            { id: 'saddle', label: 'Saddle Point (x²-y²)' },
            { id: 'gaussian', label: 'Gaussian Well' },
            { id: 'membrane', label: 'Vibrating Membrane' },
            { id: 'paraboloid', label: 'Elliptic Paraboloid' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFuncType(f.id as SurfaceFunction)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                funcType === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas Screen */}
      <div
        className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} className="w-full h-80 sm:h-96 block" />

        {/* HUD Info */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/60 font-mono text-[11px] text-cyan-300 space-y-0.5 pointer-events-none">
          <div className="flex gap-3">
            <span>Yaw: {yaw.toFixed(0)}°</span>
            <span>Pitch: {pitch.toFixed(0)}°</span>
            <span>Grid: {gridSize}×{gridSize}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Drag with mouse to rotate in 3D space
          </div>
        </div>

        {/* Quick controls overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/60 text-xs">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2 py-1 rounded font-semibold transition-colors ${
              isRotating ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isRotating ? 'Auto-Rotate ON' : 'Auto-Rotate OFF'}
          </button>
          <button
            onClick={() => {
              setYaw(45);
              setPitch(30);
            }}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400"
            title="Reset Viewpoint"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Amplitude (A)</span>
            <span className="text-indigo-400">{amplitude.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="2.5"
            step="0.1"
            value={amplitude}
            onChange={(e) => setAmplitude(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Mesh Density</span>
            <span className="text-cyan-400">{gridSize}×{gridSize}</span>
          </div>
          <input
            type="range"
            min="16"
            max="36"
            step="2"
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Elevation Angle</span>
            <span className="text-sky-400">{pitch}°</span>
          </div>
          <input
            type="range"
            min="-45"
            max="75"
            step="5"
            value={pitch}
            onChange={(e) => setPitch(parseInt(e.target.value))}
            className="w-full accent-sky-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between font-mono">
            <span>Colormap</span>
            <span className="text-purple-400">{colorTheme}</span>
          </div>
          <select
            value={colorTheme}
            onChange={(e) => setColorTheme(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="cyan-indigo">Cyan-Indigo Gradient</option>
            <option value="solar">Solar Energy (Orange-Yellow)</option>
            <option value="emerald">Emerald Field (Green)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
