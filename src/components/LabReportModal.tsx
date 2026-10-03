import React, { useState } from 'react';
import { X, Printer, Download, FileText, Check, ShieldCheck, GraduationCap } from 'lucide-react';
import { AcademicTier, Discipline } from '../types';
import { MathRenderer } from '../utils/mathRenderer';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: AcademicTier;
  currentDiscipline: Discipline;
}

export const LabReportModal: React.FC<LabReportModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  currentDiscipline,
}) => {
  const [reportTitle, setReportTitle] = useState('Comprehensive Technical Investigation & Proof');
  const [courseCode, setCourseCode] = useState('ENG-402 / Advanced Engineering Lab');
  const [studentName, setStudentName] = useState('Engineering Scholar');
  const [rollNumber, setRollNumber] = useState('2026-ENG-0842');
  const [department, setDepartment] = useState('Department of Engineering & Applied Sciences');
  const [reportNotes, setReportNotes] = useState(
    'This laboratory investigation validates analytical governing equations against numerical simulations, documenting boundary conditions, intermediate state variables, and verification code.'
  );

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const reportMarkdown = `# ${reportTitle}
**Course / Module:** ${courseCode}  
**Candidate Name:** ${studentName} | **Roll No:** ${rollNumber}  
**Department:** ${department}  
**Academic Tier:** ${currentTier} | **Discipline:** ${currentDiscipline}  
**Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---

### 1. Executive Summary & Objective
${reportNotes}

### 2. Governing Equations & Theoretical Foundations
$$\\nabla \\cdot \\vec{u} = 0, \\quad \\rho \\left( \\frac{\\partial \\vec{u}}{\\partial t} + (\\vec{u} \\cdot \\nabla)\\vec{u} \\right) = -\\nabla p + \\mu \\nabla^2 \\vec{u} + \\vec{f}$$

$$\\eta_{th} = \\frac{W_{\\text{net}}}{Q_{\\text{in}}} = 1 - \\frac{T_{\\text{sink}}}{T_{\\text{source}}}$$

### 3. Experimental / Simulation Verification
- **Apparatus / Solver:** OmniEng Scientific Computing Engine v3.8
- **Convergence Tolerance:** $\\varepsilon < 10^{-6}$
- **Safety Factor:** $SF = 2.45$

### 4. Faculty Sign-Off & Evaluator Rubric
| Evaluation Metric | Max Score | Awarded Score | Comments |
| :--- | :--- | :--- | :--- |
| First Principles Derivation | 40 | 38 | Rigorous steps |
| Numerical Accuracy & Units | 30 | 29 | SI units consistent |
| Physical Interpretation | 30 | 28 | Valid engineering heuristics |
| **Total** | **100** | **95 / 100** | **Passed with Distinction** |

---
**Faculty Advisor Signature:** ___________________________  
**Date of Assessment:** ${new Date().toLocaleDateString()}`;

  const copyMarkdown = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-base">
              Engineering Lab Report & Thesis Document Exporter
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Details */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Report Title:</label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Course Code:</label>
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Candidate Name & Roll:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/80">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl shadow-inner">
            <MathRenderer content={reportMarkdown} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Print layout formatted for IEEE & ABET university standards
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={copyMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Markdown</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
