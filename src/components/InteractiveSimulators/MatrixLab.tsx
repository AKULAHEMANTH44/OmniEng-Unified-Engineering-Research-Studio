import React, { useState } from 'react';
import { Binary, Calculator, Check, Copy, RefreshCw, Sparkles } from 'lucide-react';
import { MathRenderer } from '../../utils/mathRenderer';

export const MatrixLab: React.FC = () => {
  const [size, setSize] = useState<2 | 3>(2);

  // 2x2 matrix state
  const [m2, setM2] = useState<number[][]>([
    [4, 1],
    [2, 3],
  ]);

  // 3x3 matrix state
  const [m3, setM3] = useState<number[][]>([
    [2, -1, 0],
    [-1, 2, -1],
    [0, -1, 2],
  ]);

  const [copied, setCopied] = useState(false);

  // Handlers for cell update
  const handleM2Change = (r: number, c: number, val: string) => {
    const num = parseFloat(val) || 0;
    const next = m2.map((row, ri) => row.map((col, ci) => (ri === r && ci === c ? num : col)));
    setM2(next);
  };

  const handleM3Change = (r: number, c: number, val: string) => {
    const num = parseFloat(val) || 0;
    const next = m3.map((row, ri) => row.map((col, ci) => (ri === r && ci === c ? num : col)));
    setM3(next);
  };

  // Preset matrices
  const loadPreset = (type: 'identity' | 'symmetric' | 'rotation' | 'singular') => {
    if (size === 2) {
      switch (type) {
        case 'identity':
          setM2([[1, 0], [0, 1]]);
          break;
        case 'symmetric':
          setM2([[5, 2], [2, 3]]);
          break;
        case 'rotation':
          setM2([[0, -1], [1, 0]]); // 90 deg rotation
          break;
        case 'singular':
          setM2([[2, 4], [1, 2]]);
          break;
      }
    } else {
      switch (type) {
        case 'identity':
          setM3([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
          break;
        case 'symmetric':
          setM3([[2, -1, 0], [-1, 2, -1], [0, -1, 2]]);
          break;
        case 'rotation':
          setM3([[0, -1, 0], [1, 0, 0], [0, 0, 1]]);
          break;
        case 'singular':
          setM3([[1, 2, 3], [2, 4, 6], [1, 1, 1]]);
          break;
      }
    }
  };

  // Calculations for 2x2
  const a = m2[0][0], b = m2[0][1];
  const c = m2[1][0], d = m2[1][1];
  const det2 = a * d - b * c;
  const trace2 = a + d;

  // Characteristic equation: lambda^2 - trace*lambda + det = 0
  const disc2 = trace2 * trace2 - 4 * det2;
  let eig2_1 = '';
  let eig2_2 = '';
  let vec2_1 = '';
  let vec2_2 = '';

  if (disc2 >= 0) {
    const l1 = (trace2 + Math.sqrt(disc2)) / 2;
    const l2 = (trace2 - Math.sqrt(disc2)) / 2;
    eig2_1 = l1.toFixed(3);
    eig2_2 = l2.toFixed(3);
    // Eigenvector approximation: (A - lambda I) v = 0 -> (a - l) x + b y = 0
    if (Math.abs(b) > 1e-5) {
      vec2_1 = `\\begin{pmatrix} ${b.toFixed(2)} \\\\ ${(l1 - a).toFixed(2)} \\end{pmatrix}`;
      vec2_2 = `\\begin{pmatrix} ${b.toFixed(2)} \\\\ ${(l2 - a).toFixed(2)} \\end{pmatrix}`;
    } else if (Math.abs(c) > 1e-5) {
      vec2_1 = `\\begin{pmatrix} ${(l1 - d).toFixed(2)} \\\\ ${c.toFixed(2)} \\end{pmatrix}`;
      vec2_2 = `\\begin{pmatrix} ${(l2 - d).toFixed(2)} \\\\ ${c.toFixed(2)} \\end{pmatrix}`;
    } else {
      vec2_1 = `\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}`;
      vec2_2 = `\\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}`;
    }
  } else {
    const realPart = (trace2 / 2).toFixed(2);
    const imagPart = (Math.sqrt(-disc2) / 2).toFixed(2);
    eig2_1 = `${realPart} + ${imagPart}i`;
    eig2_2 = `${realPart} - ${imagPart}i`;
    vec2_1 = `\\text{Complex Conjugate Pair}`;
    vec2_2 = `\\text{Complex Conjugate Pair}`;
  }

  // Inverse 2x2
  let invLatex = '';
  if (Math.abs(det2) > 1e-7) {
    invLatex = `\\frac{1}{${det2.toFixed(2)}} \\begin{pmatrix} ${d} & ${-b} \\\\ ${-c} & ${a} \\end{pmatrix} = \\begin{pmatrix} ${(d / det2).toFixed(3)} & ${(-b / det2).toFixed(3)} \\\\ ${(-c / det2).toFixed(3)} & ${(a / det2).toFixed(3)} \\end{pmatrix}`;
  } else {
    invLatex = `\\text{Singular Matrix (}\\det = 0\\text{) — Non-invertible}`;
  }

  // 3x3 determinant:
  const [r1, r2, r3] = m3;
  const det3 =
    r1[0] * (r2[1] * r3[2] - r2[2] * r3[1]) -
    r1[1] * (r2[0] * r3[2] - r2[2] * r3[0]) +
    r1[2] * (r2[0] * r3[1] - r2[1] * r3[0]);
  const trace3 = r1[0] + r2[1] + r3[2];

  // Mathematical Markdown report
  const derivationMarkdown =
    size === 2
      ? `### Mathematical Analysis of Matrix $A \\in \\mathbb{R}^{2 \\times 2}$

**Input Matrix:**
$$A = \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}$$

1. **Determinant $\\det(A)$:**
$$\\det(A) = ad - bc = (${a})(${d}) - (${b})(${c}) = ${det2.toFixed(3)}$$

2. **Trace $\\text{Tr}(A)$:**
$$\\text{Tr}(A) = a + d = ${a} + ${d} = ${trace2.toFixed(3)}$$

3. **Characteristic Polynomial & Eigenvalues:**
$$p(\\lambda) = \\det(A - \\lambda I) = \\lambda^2 - \\text{Tr}(A)\\lambda + \\det(A) = \\lambda^2 - (${trace2})\\lambda + (${det2.toFixed(2)}) = 0$$

$$\\lambda_{1} = ${eig2_1}, \\quad \\lambda_{2} = ${eig2_2}$$

4. **Eigenvectors $v_i$:**
$$v_1 = ${vec2_1}, \\quad v_2 = ${vec2_2}$$

5. **Matrix Inverse $A^{-1}$:**
$$A^{-1} = ${invLatex}$$`
      : `### Mathematical Analysis of Matrix $A \\in \\mathbb{R}^{3 \\times 3}$

**Input Matrix:**
$$A = \\begin{pmatrix} ${r1[0]} & ${r1[1]} & ${r1[2]} \\\\ ${r2[0]} & ${r2[1]} & ${r2[2]} \\\\ ${r3[0]} & ${r3[1]} & ${r3[2]} \\end{pmatrix}$$

1. **Determinant $\\det(A)$:**
$$\\det(A) = ${r1[0]}((${r2[1]})(${r3[2]}) - (${r2[2]})(${r3[1]})) - (${r1[1]})((${r2[0]})(${r3[2]}) - (${r2[2]})(${r3[0]})) + (${r1[2]})((${r2[0]})(${r3[1]}) - (${r2[1]})(${r3[0]})) = ${det3.toFixed(3)}$$

2. **Trace $\\text{Tr}(A)$:**
$$\\text{Tr}(A) = A_{11} + A_{22} + A_{33} = ${r1[0]} + ${r2[1]} + ${r3[2]} = ${trace3.toFixed(3)}$$

3. **Invertibility Status:**
${Math.abs(det3) > 1e-6 ? `$$\\det(A) \\neq 0 \\implies \\text{Matrix is Non-Singular (Full Rank = 3, Invertible)}$$` : `$$\\det(A) = 0 \\implies \\text{Matrix is Singular (Rank } < 3\\text{, Non-Invertible)}$$`}`;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Binary className="w-5 h-5 text-cyan-400" />
            Linear Algebra & Matrix Lab
          </h3>
          <p className="text-xs text-slate-400">
            Real-time determinant, trace, inverse, eigenvalues, and characteristic polynomial derivation
          </p>
        </div>

        {/* Matrix Dimensions & Presets */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSize(2)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                size === 2 ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2 × 2
            </button>
            <button
              onClick={() => setSize(3)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                size === 3 ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3 × 3
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs text-slate-400">
            <button onClick={() => loadPreset('identity')} className="px-2 py-1 hover:text-white rounded">Identity</button>
            <button onClick={() => loadPreset('symmetric')} className="px-2 py-1 hover:text-white rounded">Symmetric</button>
            <button onClick={() => loadPreset('rotation')} className="px-2 py-1 hover:text-white rounded">Rotation</button>
            <button onClick={() => loadPreset('singular')} className="px-2 py-1 hover:text-white rounded">Singular</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Matrix Input Grid */}
        <div className="lg:col-span-4 bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Matrix Elements:</span>
            <span className="text-cyan-400 font-mono">Size: {size}×{size}</span>
          </div>

          {size === 2 ? (
            <div className="grid grid-cols-2 gap-3 max-w-[240px] mx-auto p-3 bg-slate-900/60 rounded-xl border border-cyan-900/30">
              {m2.map((row, r) =>
                row.map((val, c) => (
                  <input
                    key={`m2-${r}-${c}`}
                    type="number"
                    value={val}
                    onChange={(e) => handleM2Change(r, c, e.target.value)}
                    className="w-full text-center bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-cyan-300 font-bold focus:border-cyan-400 focus:outline-none text-base"
                  />
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/60 rounded-xl border border-cyan-900/30">
              {m3.map((row, r) =>
                row.map((val, c) => (
                  <input
                    key={`m3-${r}-${c}`}
                    type="number"
                    value={val}
                    onChange={(e) => handleM3Change(r, c, e.target.value)}
                    className="w-full text-center bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-cyan-300 font-bold focus:border-cyan-400 focus:outline-none text-sm"
                  />
                ))
              )}
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DETERMINANT</span>
              <span className="text-cyan-400 font-bold text-base">
                {size === 2 ? det2.toFixed(2) : det3.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TRACE</span>
              <span className="text-purple-400 font-bold text-base">
                {size === 2 ? trace2.toFixed(2) : trace3.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time LaTeX derivation */}
        <div className="lg:col-span-8 bg-slate-950/80 p-5 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
          <MathRenderer content={derivationMarkdown} />
        </div>
      </div>
    </div>
  );
};
