import React, { useState } from 'react';
import { X, Search, Copy, Check, BookOpen } from 'lucide-react';
import { ENGINEERING_CONSTANTS } from '../utils/engineeringData';
import { EngineeringConstant } from '../types';
import { renderLatex } from '../utils/mathRenderer';

interface ConstantsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConstantsModal: React.FC<ConstantsModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Physics', 'Quantum', 'Electromagnetism', 'Thermodynamics', 'Mechanics'];

  const filtered = ENGINEERING_CONSTANTS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase()) ||
      c.unit.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const copyConstant = (c: EngineeringConstant) => {
    navigator.clipboard.writeText(`${c.symbol} = ${c.value} ${c.unit}`);
    setCopiedSymbol(c.symbol);
    setTimeout(() => setCopiedSymbol(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-base">
              Universal Engineering & Physical Constants
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, symbol (c, h, ε₀, R), or unit..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of constants */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filtered.map((c) => {
            const mathHtml = renderLatex(c.latex, false);
            return (
              <div
                key={c.symbol}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-sm">{c.symbol}</span>
                    <span className="text-xs font-semibold text-slate-200 truncate">{c.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {c.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs text-cyan-300 font-mono"
                      dangerouslySetInnerHTML={{ __html: mathHtml }}
                    />
                    <span className="text-xs text-slate-400 font-mono">[{c.unit}]</span>
                  </div>
                </div>

                <button
                  onClick={() => copyConstant(c)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                  title="Copy Constant"
                >
                  {copiedSymbol === c.symbol ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
