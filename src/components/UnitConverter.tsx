import React, { useState } from 'react';
import { ArrowRightLeft, Copy, Check, Sparkles } from 'lucide-react';

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

interface UnitCategory {
  name: string;
  baseUnit: string;
  units: UnitDef[];
}

const UNIT_CATEGORIES: Record<string, UnitCategory> = {
  pressure: {
    name: 'Pressure & Stress',
    baseUnit: 'Pa',
    units: [
      { id: 'pa', name: 'Pascal', symbol: 'Pa', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kpa', name: 'Kilopascal', symbol: 'kPa', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
      { id: 'mpa', name: 'Megapascal (N/mm²)', symbol: 'MPa', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'bar', name: 'Bar', symbol: 'bar', toBase: (v) => v * 1e5, fromBase: (v) => v / 1e5 },
      { id: 'psi', name: 'Pounds per sq inch', symbol: 'psi', toBase: (v) => v * 6894.757, fromBase: (v) => v / 6894.757 },
      { id: 'atm', name: 'Standard Atmosphere', symbol: 'atm', toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
      { id: 'torr', name: 'Torr / mmHg', symbol: 'mmHg', toBase: (v) => v * 133.322, fromBase: (v) => v / 133.322 },
    ],
  },
  energy: {
    name: 'Energy & Work',
    baseUnit: 'J',
    units: [
      { id: 'j', name: 'Joule', symbol: 'J', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kj', name: 'Kilojoule', symbol: 'kJ', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
      { id: 'kwh', name: 'Kilowatt-Hour', symbol: 'kWh', toBase: (v) => v * 3.6e6, fromBase: (v) => v / 3.6e6 },
      { id: 'ev', name: 'Electron-Volt', symbol: 'eV', toBase: (v) => v * 1.602176634e-19, fromBase: (v) => v / 1.602176634e-19 },
      { id: 'btu', name: 'British Thermal Unit', symbol: 'BTU', toBase: (v) => v * 1055.06, fromBase: (v) => v / 1055.06 },
      { id: 'cal', name: 'Calorie (Thermochemical)', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
    ],
  },
  power: {
    name: 'Power',
    baseUnit: 'W',
    units: [
      { id: 'w', name: 'Watt', symbol: 'W', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kw', name: 'Kilowatt', symbol: 'kW', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
      { id: 'mw', name: 'Megawatt', symbol: 'MW', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'hp', name: 'Mechanical Horsepower', symbol: 'hp', toBase: (v) => v * 745.6998, fromBase: (v) => v / 745.6998 },
      { id: 'btuh', name: 'BTU per hour', symbol: 'BTU/h', toBase: (v) => v * 0.293071, fromBase: (v) => v / 0.293071 },
    ],
  },
  force: {
    name: 'Force',
    baseUnit: 'N',
    units: [
      { id: 'n', name: 'Newton', symbol: 'N', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kn', name: 'Kilonewton', symbol: 'kN', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
      { id: 'lbf', name: 'Pound-Force', symbol: 'lbf', toBase: (v) => v * 4.448222, fromBase: (v) => v / 4.448222 },
      { id: 'kgf', name: 'Kilogram-Force', symbol: 'kgf', toBase: (v) => v * 9.80665, fromBase: (v) => v / 9.80665 },
      { id: 'dyne', name: 'Dyne', symbol: 'dyn', toBase: (v) => v * 1e-5, fromBase: (v) => v / 1e-5 },
    ],
  },
  viscosity: {
    name: 'Dynamic Viscosity',
    baseUnit: 'Pa·s',
    units: [
      { id: 'pas', name: 'Pascal-Second', symbol: 'Pa·s', toBase: (v) => v, fromBase: (v) => v },
      { id: 'cp', name: 'Centipoise', symbol: 'cP', toBase: (v) => v * 1e-3, fromBase: (v) => v / 1e-3 },
      { id: 'poise', name: 'Poise', symbol: 'P', toBase: (v) => v * 0.1, fromBase: (v) => v / 0.1 },
      { id: 'lbfs', name: 'lbf·s / ft²', symbol: 'lbf·s/ft²', toBase: (v) => v * 47.88026, fromBase: (v) => v / 47.88026 },
    ],
  },
};

export const UnitConverter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('pressure');
  const [inputValue, setInputValue] = useState<number>(100);
  const [fromUnitId, setFromUnitId] = useState<string>('mpa');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const category = UNIT_CATEGORIES[activeCategory] || UNIT_CATEGORIES.pressure;
  const fromUnit = category.units.find((u) => u.id === fromUnitId) || category.units[0];

  // Convert input value to base unit
  const baseVal = fromUnit.toBase(inputValue);

  const copyVal = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
            Engineering Dimensional Analysis & Unit Engine
          </h3>
          <p className="text-xs text-slate-400">
            High-precision conversion across SI, Imperial, and CGS engineering units
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {Object.entries(UNIT_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => {
                setActiveCategory(key);
                setFromUnitId(cat.units[0].id);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeCategory === key
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input row */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-xs font-semibold text-slate-400">Input Value:</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 font-mono text-cyan-300 font-bold text-lg focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="w-full sm:w-64 space-y-1">
          <label className="text-xs font-semibold text-slate-400">Source Unit:</label>
          <select
            value={fromUnitId}
            onChange={(e) => setFromUnitId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-200 text-sm focus:outline-none focus:border-cyan-400"
          >
            {category.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Converted values grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {category.units.map((u) => {
          const converted = u.fromBase(baseVal);
          // format nicely
          const formatted =
            Math.abs(converted) >= 1e6 || (Math.abs(converted) < 1e-3 && converted !== 0)
              ? converted.toExponential(5)
              : converted.toLocaleString('en-US', { maximumFractionDigits: 5 });

          const isCurrent = u.id === fromUnitId;

          return (
            <div
              key={u.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isCurrent
                  ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-950'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] text-slate-400 block truncate">{u.name}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-base font-bold text-white tracking-tight truncate">
                    {formatted}
                  </span>
                  <span className="font-mono text-xs text-cyan-400">{u.symbol}</span>
                </div>
              </div>

              <button
                onClick={() => copyVal(formatted, u.id)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                title="Copy Value"
              >
                {copiedId === u.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
