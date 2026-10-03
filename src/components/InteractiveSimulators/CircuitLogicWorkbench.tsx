import React, { useState } from 'react';
import { Cpu, Zap, Check, RotateCcw, Activity, HelpCircle, Layers, ToggleLeft, ToggleRight } from 'lucide-react';

type CircuitPreset = 'half-adder' | 'full-adder' | 'mux' | 'sr-latch' | 'd-flipflop' | 'universal-nand';

export const CircuitLogicWorkbench: React.FC = () => {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitPreset>('half-adder');

  // Input states for various circuits
  const [inA, setInA] = useState<boolean>(true);
  const [inB, setInB] = useState<boolean>(false);
  const [inCin, setInCin] = useState<boolean>(false);
  const [inSel, setInSel] = useState<boolean>(false);
  const [inClk, setInClk] = useState<boolean>(false);
  const [latchQ, setLatchQ] = useState<boolean>(false);

  // Compute outputs based on active circuit
  let outSum = false;
  let outCarry = false;
  let outMux = false;
  let outQ = false;
  let outQBar = true;
  let booleanExpression = '';
  let truthTableHeaders: string[] = [];
  let truthTableRows: { inputs: boolean[]; outputs: boolean[]; isActive: boolean }[] = [];

  switch (selectedCircuit) {
    case 'half-adder': {
      outSum = (inA && !inB) || (!inA && inB); // XOR
      outCarry = inA && inB; // AND
      booleanExpression = 'S = A \\oplus B, \\quad C = A \\cdot B';
      truthTableHeaders = ['A', 'B', 'Sum (S)', 'Carry (C)'];
      const combos = [
        [false, false],
        [false, true],
        [true, false],
        [true, true],
      ];
      truthTableRows = combos.map(([a, b]) => ({
        inputs: [a, b],
        outputs: [(a && !b) || (!a && b), a && b],
        isActive: inA === a && inB === b,
      }));
      break;
    }

    case 'full-adder': {
      const xor1 = (inA && !inB) || (!inA && inB);
      outSum = (xor1 && !inCin) || (!xor1 && inCin);
      outCarry = (inA && inB) || (inCin && xor1);
      booleanExpression = 'S = A \\oplus B \\oplus C_{in}, \\quad C_{out} = (A \\cdot B) + (C_{in} \\cdot (A \\oplus B))';
      truthTableHeaders = ['A', 'B', 'Cin', 'Sum (S)', 'Cout'];
      const combos = [
        [false, false, false],
        [false, false, true],
        [false, true, false],
        [false, true, true],
        [true, false, false],
        [true, false, true],
        [true, true, false],
        [true, true, true],
      ];
      truthTableRows = combos.map(([a, b, cin]) => {
        const x = (a && !b) || (!a && b);
        const s = (x && !cin) || (!x && cin);
        const c = (a && b) || (cin && x);
        return {
          inputs: [a, b, cin],
          outputs: [s, c],
          isActive: inA === a && inB === b && inCin === cin,
        };
      });
      break;
    }

    case 'mux': {
      outMux = inSel ? inB : inA;
      booleanExpression = 'Y = (\\bar{S} \\cdot D_0) + (S \\cdot D_1)';
      truthTableHeaders = ['D0', 'D1', 'Select (S)', 'Output (Y)'];
      const combos = [
        [false, false, false],
        [false, true, false],
        [true, false, false],
        [true, true, false],
        [false, false, true],
        [false, true, true],
        [true, false, true],
        [true, true, true],
      ];
      truthTableRows = combos.map(([d0, d1, s]) => ({
        inputs: [d0, d1, s],
        outputs: [s ? d1 : d0],
        isActive: inA === d0 && inB === d1 && inSel === s,
      }));
      break;
    }

    case 'sr-latch': {
      // S = inA, R = inB
      if (inA && !inB) {
        outQ = true;
        outQBar = false;
      } else if (!inA && inB) {
        outQ = false;
        outQBar = true;
      } else if (!inA && !inB) {
        outQ = latchQ;
        outQBar = !latchQ;
      } else {
        // Invalid condition S=1, R=1
        outQ = false;
        outQBar = false;
      }
      booleanExpression = 'Q_{next} = S + \\bar{R} \\cdot Q \\quad (\\text{Condition } S \\cdot R = 0)';
      truthTableHeaders = ['Set (S)', 'Reset (R)', 'Q(t+1)', 'State'];
      break;
    }

    case 'd-flipflop': {
      // D = inA, CLK = inClk
      outQ = inClk ? inA : latchQ;
      outQBar = !outQ;
      booleanExpression = 'Q_{next} = D \\quad (\\text{Sampled on Clock Pulse})';
      truthTableHeaders = ['Data (D)', 'Clock (CLK)', 'Q(t+1)', 'State'];
      break;
    }

    case 'universal-nand': {
      // XOR using 4 NAND gates: A XOR B = NAND(NAND(A, NAND(A, B)), NAND(B, NAND(A, B)))
      const nand1 = !(inA && inB);
      const nand2 = !(inA && nand1);
      const nand3 = !(inB && nand1);
      outSum = !(nand2 && nand3);
      booleanExpression = 'A \\oplus B = \\overline{\\overline{A \\cdot \\overline{AB}} \\cdot \\overline{B \\cdot \\overline{AB}}}';
      truthTableHeaders = ['A', 'B', 'NAND 1', 'NAND 2', 'NAND 3', 'Output (XOR)'];
      break;
    }
  }

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Digital Logic & Circuit Workbench
          </h3>
          <p className="text-xs text-slate-400">
            Interactive gate-level logic synthesis, live wire tracing & real-time truth table verification
          </p>
        </div>

        {/* Circuit Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'half-adder', label: 'Half Adder' },
            { id: 'full-adder', label: 'Full Adder' },
            { id: 'mux', label: '2:1 MUX' },
            { id: 'sr-latch', label: 'SR Latch' },
            { id: 'd-flipflop', label: 'D Flip-Flop' },
            { id: 'universal-nand', label: '4-NAND XOR' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCircuit(c.id as CircuitPreset)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedCircuit === c.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Circuit Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Schematic & Input Controls */}
        <div className="lg:col-span-7 bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-5 shadow-inner">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Logic Input Switchboard:
            </span>
            <span className="font-mono text-cyan-400 text-[11px]">
              Vcc: 5.0V · TTL Standard
            </span>
          </div>

          {/* Input switches */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Input A / D0 */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-mono">
                  {selectedCircuit === 'mux' ? 'DATA D0' : selectedCircuit === 'sr-latch' ? 'SET (S)' : selectedCircuit === 'd-flipflop' ? 'DATA (D)' : 'INPUT A'}
                </span>
                <span className={`font-mono font-bold text-base ${inA ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {inA ? '1 (HIGH)' : '0 (LOW)'}
                </span>
              </div>
              <button
                onClick={() => setInA(!inA)}
                className={`p-1.5 rounded-lg border transition-all ${
                  inA
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm shadow-emerald-950'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {inA ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>

            {/* Input B / D1 */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-mono">
                  {selectedCircuit === 'mux' ? 'DATA D1' : selectedCircuit === 'sr-latch' ? 'RESET (R)' : selectedCircuit === 'd-flipflop' ? 'CLOCK' : 'INPUT B'}
                </span>
                <span className={`font-mono font-bold text-base ${inB ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {inB ? '1 (HIGH)' : '0 (LOW)'}
                </span>
              </div>
              <button
                onClick={() => setInB(!inB)}
                className={`p-1.5 rounded-lg border transition-all ${
                  inB
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm shadow-emerald-950'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {inB ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>

            {/* Optional 3rd input: Cin or Select or Clock */}
            {selectedCircuit === 'full-adder' && (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-mono">CARRY IN (Cin)</span>
                  <span className={`font-mono font-bold text-base ${inCin ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {inCin ? '1 (HIGH)' : '0 (LOW)'}
                  </span>
                </div>
                <button
                  onClick={() => setInCin(!inCin)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    inCin
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {inCin ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            )}

            {selectedCircuit === 'mux' && (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-mono">SELECT (S)</span>
                  <span className={`font-mono font-bold text-base ${inSel ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {inSel ? '1 (D1)' : '0 (D0)'}
                  </span>
                </div>
                <button
                  onClick={() => setInSel(!inSel)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    inSel
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {inSel ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            )}

            {selectedCircuit === 'd-flipflop' && (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-mono">CLOCK PULSE</span>
                  <span className={`font-mono font-bold text-base ${inClk ? 'text-amber-400' : 'text-slate-500'}`}>
                    {inClk ? 'EDGE' : 'IDLE'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setInClk(true);
                    setLatchQ(inA);
                    setTimeout(() => setInClk(false), 300);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Trigger CLK
                </button>
              </div>
            )}
          </div>

          {/* Visual Schematic Diagram Box */}
          <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-800 relative min-h-[160px] flex flex-col justify-center items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono self-start uppercase tracking-wider">
              Active Gate Diagram & Signal Routing
            </span>

            {/* Schematic visual blocks */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-2">
              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className={`px-2.5 py-1 rounded-md border ${inA ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                  Input A = {inA ? '1' : '0'}
                </div>
                <div className={`px-2.5 py-1 rounded-md border ${inB ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                  Input B = {inB ? '1' : '0'}
                </div>
              </div>

              <div className="text-slate-600 font-mono text-lg">──▶</div>

              {/* Central Gate Logic Badge */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-xl text-center space-y-1">
                <span className="text-xs font-mono font-bold text-cyan-400 block uppercase">
                  {selectedCircuit.replace('-', ' ')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">
                  {booleanExpression}
                </span>
              </div>

              <div className="text-slate-600 font-mono text-lg">──▶</div>

              {/* Output LEDs */}
              <div className="flex flex-col gap-2 font-mono text-xs">
                {selectedCircuit === 'mux' ? (
                  <div className={`px-3 py-1.5 rounded-md border flex items-center gap-2 ${outMux ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-950' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${outMux ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
                    <span>Y = {outMux ? '1' : '0'}</span>
                  </div>
                ) : selectedCircuit === 'sr-latch' || selectedCircuit === 'd-flipflop' ? (
                  <>
                    <div className={`px-3 py-1 rounded-md border flex items-center gap-2 ${outQ ? 'bg-cyan-950 text-cyan-300 border-cyan-500' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                      <span className={`w-2 h-2 rounded-full ${outQ ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                      <span>Q = {outQ ? '1' : '0'}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-md border flex items-center gap-2 ${outQBar ? 'bg-purple-950 text-purple-300 border-purple-500' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                      <span className={`w-2 h-2 rounded-full ${outQBar ? 'bg-purple-400' : 'bg-slate-700'}`} />
                      <span>Q̄ = {outQBar ? '1' : '0'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`px-3 py-1 rounded-md border flex items-center gap-2 ${outSum ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${outSum ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
                      <span>SUM = {outSum ? '1' : '0'}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-md border flex items-center gap-2 ${outCarry ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-sm' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${outCarry ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'}`} />
                      <span>CARRY = {outCarry ? '1' : '0'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Truth Table Verification Panel */}
        <div className="lg:col-span-5 bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Dynamic Truth Table Verification:
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              Live State Highlight
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  {truthTableHeaders.map((h, i) => (
                    <th key={i} className="p-2 text-center font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {truthTableRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={`border-b border-slate-900 transition-colors ${
                      row.isActive
                        ? 'bg-cyan-950/60 text-cyan-300 font-bold border-l-2 border-l-cyan-400'
                        : 'text-slate-400 hover:bg-slate-900/40'
                    }`}
                  >
                    {row.inputs.map((val, ci) => (
                      <td key={`in-${ci}`} className="p-2 text-center">
                        {val ? '1' : '0'}
                      </td>
                    ))}
                    {row.outputs.map((val, co) => (
                      <td
                        key={`out-${co}`}
                        className={`p-2 text-center font-bold ${
                          val ? (row.isActive ? 'text-emerald-400' : 'text-slate-200') : 'text-slate-500'
                        }`}
                      >
                        {val ? '1' : '0'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Timing & Propagation characteristics */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Propagation Delay (t_pd):</span>
              <span className="text-cyan-300">~ 7.2 ns (74HC Series)</span>
            </div>
            <div className="flex justify-between">
              <span>Static Power Dissipation:</span>
              <span className="text-cyan-300">~ 20 µW</span>
            </div>
            <div className="flex justify-between">
              <span>Fan-Out Capability:</span>
              <span className="text-cyan-300">10 LSTTL Loads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
