import React, { useState } from 'react';
import {
  HelpCircle,
  FileQuestion,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Award,
  BookOpen,
  GraduationCap,
  PenTool,
  Send,
  RotateCcw
} from 'lucide-react';
import { AcademicTier, Discipline } from '../types';
import { MathRenderer } from '../utils/mathRenderer';

interface ExamProblemStudioProps {
  currentTier: AcademicTier;
  currentDiscipline: Discipline;
}

const EXAM_PRESETS: { title: string; topic: string; type: string }[] = [
  {
    title: 'Navier-Stokes Couette & Poiseuille Flow',
    topic: 'Laminar viscous fluid flow between parallel plates with pressure gradient and moving upper boundary',
    type: 'University Semester Exam',
  },
  {
    title: 'GATE: State-Space Controllability & Observer Design',
    topic: 'Full state feedback gain K placement and observability matrix rank condition for inverted pendulum',
    type: 'GATE / IES Competitive Exam',
  },
  {
    title: 'MOSFET High-Frequency Small-Signal Miller Effect',
    topic: 'Miller capacitance, unity-gain frequency f_T, and voltage gain of common-source amplifier with parasitic C_gd',
    type: 'University Semester Exam',
  },
  {
    title: 'Rankine Reheat-Regenerative Cycle Efficiency',
    topic: 'Steam turbine expansion, bleed fraction to open feedwater heater, and second-law exergy destruction',
    type: 'University Semester Exam',
  },
  {
    title: 'PhD Viva: Non-Linear Lyapunov Stability Proof',
    topic: 'Constructing candidate Lyapunov function V(x) and LaSalle invariance principle for autonomous chaotic system',
    type: 'PhD Qualifying & Viva Voce',
  },
  {
    title: 'Transformer Core Loss Separation & Equivalent Circuit',
    topic: 'Separating hysteresis and eddy current losses at variable frequency with open-circuit and short-circuit test data',
    type: 'Diploma / 1st Year Exam',
  },
];

export const ExamProblemStudio: React.FC<ExamProblemStudioProps> = ({ currentTier, currentDiscipline }) => {
  const [activeMode, setActiveMode] = useState<'generate' | 'grade'>('generate');

  // Generator State
  const [topic, setTopic] = useState<string>('');
  const [examType, setExamType] = useState<string>('University Semester Exam');
  const [count, setCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedExam, setGeneratedExam] = useState<string | null>(null);
  const [examError, setExamError] = useState<string | null>(null);
  const [copiedExam, setCopiedExam] = useState<boolean>(false);
  const [genModelUsed, setGenModelUsed] = useState<string | null>(null);

  // Grader State
  const [problemStatement, setProblemStatement] = useState<string>('');
  const [studentSolution, setStudentSolution] = useState<string>('');
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingResult, setGradingResult] = useState<string | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [copiedGrade, setCopiedGrade] = useState<boolean>(false);
  const [gradeModelUsed, setGradeModelUsed] = useState<string | null>(null);

  // Handle Exam Generation
  const handleGenerateExam = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setExamError(null);

    try {
      const response = await fetch('/api/engineer/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          discipline: currentDiscipline,
          academicTier: currentTier,
          examType,
          count,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate examination paper');
      }

      setGeneratedExam(data.result);
      setGenModelUsed(data.modelUsed || 'gemini-3.8-flash');
    } catch (err: any) {
      setExamError(err.message || 'Error occurred generating exam');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Solution Grading
  const handleGradeSolution = async () => {
    if (!problemStatement.trim() || !studentSolution.trim()) return;

    setIsGrading(true);
    setGradeError(null);

    try {
      const response = await fetch('/api/engineer/grade-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemStatement: problemStatement.trim(),
          studentSolution: studentSolution.trim(),
          discipline: currentDiscipline,
          academicTier: currentTier,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate solution');
      }

      setGradingResult(data.result);
      setGradeModelUsed(data.modelUsed || 'gemini-3.8-flash');
    } catch (err: any) {
      setGradeError(err.message || 'Error evaluating solution');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <FileQuestion className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                OmniExam & Problem Studio
              </h2>
              <p className="text-xs text-slate-400">
                Generate custom examination papers, test cases & get your solutions graded with expert professor feedback
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveMode('generate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeMode === 'generate'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileQuestion className="w-3.5 h-3.5" />
              <span>Exam / Problem Generator</span>
            </button>
            <button
              onClick={() => setActiveMode('grade')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeMode === 'grade'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Grade My Attempt (AI Professor)</span>
            </button>
          </div>
        </div>

        {/* MODE 1: EXAM GENERATOR */}
        {activeMode === 'generate' && (
          <div className="space-y-4">
            {/* Quick Syllabus Presets */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                Quick Syllabus Benchmark Topics ({currentDiscipline}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {EXAM_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTopic(p.topic);
                      setExamType(p.type);
                    }}
                    className="text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 transition-all group"
                  >
                    <div className="font-semibold text-xs text-amber-300 group-hover:text-amber-200 truncate">
                      {p.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-1">{p.topic}</div>
                    <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {p.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Topic, Chapter or Syllabus Subject:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Fourier Transform properties, Beam Deflection under UDL, Rankine cycle, or Kalman Filter"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Exam Level / Format:</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="University Semester Exam">University Semester Exam (Derivations + Numericals)</option>
                  <option value="GATE / IES Competitive Exam">GATE / IES Competitive Exam (Tricky & Rigorous)</option>
                  <option value="PhD Qualifying & Viva Voce">PhD Qualifying & Viva Voce (Proofs & Edge Cases)</option>
                  <option value="Diploma / 1st Year Exam">Diploma / 1st Year Fundamental Exam</option>
                  <option value="Technical Job Interview Test">High-Tier Engineering Interview Challenge</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>Number of Problems:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCount(num)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        count === num ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateExam}
                disabled={isGenerating || !topic.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25 disabled:opacity-50 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compiling Examination Paper...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Custom Exam & Solutions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: SOLUTION GRADER */}
        {activeMode === 'grade' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Problem Statement (The question you solved):
              </label>
              <textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                rows={2}
                placeholder="Paste the problem statement (e.g. Find the deflection at mid-span of a simply supported beam with L=5m, P=10kN at center, E=200GPa, I=5e-5 m^4)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Your Attempted Solution & Derivation Steps:
              </label>
              <textarea
                value={studentSolution}
                onChange={(e) => setStudentSolution(e.target.value)}
                rows={5}
                placeholder="Type your intermediate calculations, formulas used, algebraic steps, and final numerical answer (e.g. v_max = P*L^3 / (48*E*I) = 10000 * 125 / (48 * 2e11 * 5e-5) = 2.6 mm)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono resize-y"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleGradeSolution}
                disabled={isGrading || !problemStatement.trim() || !studentSolution.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all"
              >
                {isGrading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grading Derivation & Checking Math...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Grade My Solution & Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Notices with Retry */}
      {(examError || gradeError) && (
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-amber-500/40 text-slate-200 text-sm shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300">Transient Service Notice: </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The model encountered a momentary traffic peak. Fallback channels are ready. Click below to retry.
              </p>
            </div>
          </div>
          <div className="pl-8">
            <button
              onClick={activeMode === 'generate' ? handleGenerateExam : handleGradeSolution}
              disabled={isGenerating || isGrading}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Retry Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Generated Exam Results */}
      {activeMode === 'generate' && generatedExam && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Examination Paper & Detailed Marking Scheme</span>
              {genModelUsed && (
                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  {genModelUsed}
                </span>
              )}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedExam);
                setCopiedExam(true);
                setTimeout(() => setCopiedExam(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copiedExam ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Exam Paper</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 sm:p-6 bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
            <MathRenderer content={generatedExam} />
          </div>
        </div>
      )}

      {/* Grader Feedback Results */}
      {activeMode === 'grade' && gradingResult && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold">
              <Award className="w-4 h-4" />
              <span>Professor Grading & Rubric Review</span>
              {gradeModelUsed && (
                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {gradeModelUsed}
                </span>
              )}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(gradingResult);
                setCopiedGrade(true);
                setTimeout(() => setCopiedGrade(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copiedGrade ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 sm:p-6 bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
            <MathRenderer content={gradingResult} />
          </div>
        </div>
      )}
    </div>
  );
};
