import React, { useState } from 'react';
import {
  Sigma,
  Activity,
  Binary,
  GraduationCap,
  Terminal,
  Network,
  ArrowRightLeft,
  BookOpen,
  Sparkles,
  Layers,
  Cpu,
  Compass,
  CheckCircle2,
  HelpCircle,
  FileQuestion,
  Box,
  Sliders,
  Search,
  Flame,
  Zap
} from 'lucide-react';
import { AcademicTier, ActiveTab, Discipline } from './types';
import { Header } from './components/Header';
import { DeepSolver } from './components/DeepSolver';
import { TechnicalSearchEngine } from './components/TechnicalSearchEngine';
import { ExamProblemStudio } from './components/ExamProblemStudio';
import { CircuitLogicWorkbench } from './components/InteractiveSimulators/CircuitLogicWorkbench';
import { SignalPlotter } from './components/InteractiveSimulators/SignalPlotter';
import { BeamDeflectionSim } from './components/InteractiveSimulators/BeamDeflectionSim';
import { CircuitTransientSim } from './components/InteractiveSimulators/CircuitTransientSim';
import { ThermodynamicsLab } from './components/InteractiveSimulators/ThermodynamicsLab';
import { Surface3DPlotter } from './components/InteractiveSimulators/Surface3DPlotter';
import { ControlBodePlotter } from './components/InteractiveSimulators/ControlBodePlotter';
import { MatrixLab } from './components/InteractiveSimulators/MatrixLab';
import { ResearchStudio } from './components/ResearchStudio';
import { CodeGenLab } from './components/CodeGenLab';
import { SystemDesignStudio } from './components/SystemDesignStudio';
import { UnitConverter } from './components/UnitConverter';
import { ConstantsModal } from './components/ConstantsModal';
import { LabReportModal } from './components/LabReportModal';
import { EngineeringChatDrawer } from './components/EngineeringChatDrawer';

export default function App() {
  const [currentTier, setCurrentTier] = useState<AcademicTier>('B.Tech (Undergrad)');
  const [currentDiscipline, setCurrentDiscipline] = useState<Discipline>('General & Math');
  const [activeTab, setActiveTab] = useState<ActiveTab>('solver');
  const [isConstantsOpen, setIsConstantsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Tab configuration
  const tabs = [
    {
      id: 'solver' as ActiveTab,
      label: 'Analytical Solver',
      icon: Sigma,
      badge: 'Core',
      desc: 'Step-by-step derivations & proofs',
    },
    {
      id: 'search' as ActiveTab,
      label: 'OmniSearch AI',
      icon: Search,
      badge: 'Grounded AI',
      desc: 'Datasheets, Papers & Standards',
    },
    {
      id: 'exam-studio' as ActiveTab,
      label: 'Exam & Problem Studio',
      icon: FileQuestion,
      badge: 'AI Exam/Grade',
      desc: 'Custom exams, tests & grading',
    },
    {
      id: 'circuit-logic' as ActiveTab,
      label: 'Digital Circuit Lab',
      icon: Zap,
      badge: 'Logic & MUX',
      desc: 'Gate synthesis & truth tables',
    },
    {
      id: 'simulators' as ActiveTab,
      label: 'Signals, Beams & RLC',
      icon: Activity,
      badge: 'Physics',
      desc: 'Oscilloscope, SFD/BMD & Circuits',
    },
    {
      id: 'thermo-lab' as ActiveTab,
      label: 'Thermodynamics Lab',
      icon: Flame,
      badge: 'Cycles & T-s',
      desc: 'Rankine, Brayton & Carnot',
    },
    {
      id: 'surface-3d' as ActiveTab,
      label: '3D Surface & Fields',
      icon: Box,
      badge: '3D Math',
      desc: 'Multivariable calculus & PDEs',
    },
    {
      id: 'control-bode' as ActiveTab,
      label: 'Bode & Stability',
      icon: Sliders,
      badge: 'Control',
      desc: 'Transfer functions & Margins',
    },
    {
      id: 'matrix' as ActiveTab,
      label: 'Matrix & Linear Alg',
      icon: Binary,
      badge: 'Algebra',
      desc: 'Eigenvalues & Inverses',
    },
    {
      id: 'research' as ActiveTab,
      label: 'Research Studio',
      icon: GraduationCap,
      badge: 'M.Tech / PhD',
      desc: 'Thesis gaps & IEEE papers',
    },
    {
      id: 'codegen' as ActiveTab,
      label: 'Scientific Code Lab',
      icon: Terminal,
      badge: 'Code',
      desc: 'Python, MATLAB, C++, TikZ',
    },
    {
      id: 'system-design' as ActiveTab,
      label: 'Systems Architecture',
      icon: Network,
      badge: 'Design',
      desc: 'ICD, FMEA & Trade-offs',
    },
    {
      id: 'units' as ActiveTab,
      label: 'Unit Engine',
      icon: ArrowRightLeft,
      badge: 'SI/Imp',
      desc: 'Dimensional analysis',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans engineering-grid selection:bg-cyan-500 selection:text-white">
      {/* Top Engineering Station Header */}
      <Header
        currentTier={currentTier}
        onTierChange={setCurrentTier}
        currentDiscipline={currentDiscipline}
        onDisciplineChange={setCurrentDiscipline}
        onOpenConstants={() => setIsConstantsOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-200' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span>{tab.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Render */}
        <div className="transition-all duration-300">
          {activeTab === 'solver' && (
            <DeepSolver currentTier={currentTier} currentDiscipline={currentDiscipline} />
          )}

          {activeTab === 'search' && (
            <TechnicalSearchEngine
              currentTier={currentTier}
              currentDiscipline={currentDiscipline}
            />
          )}

          {activeTab === 'exam-studio' && (
            <ExamProblemStudio currentTier={currentTier} currentDiscipline={currentDiscipline} />
          )}

          {activeTab === 'circuit-logic' && <CircuitLogicWorkbench />}

          {activeTab === 'simulators' && (
            <div className="space-y-6">
              {/* Interactive Signal & Oscilloscope */}
              <SignalPlotter />

              {/* Structural Beam Deflection */}
              <BeamDeflectionSim />

              {/* RLC Circuit Resonance */}
              <CircuitTransientSim />
            </div>
          )}

          {activeTab === 'thermo-lab' && <ThermodynamicsLab />}

          {activeTab === 'surface-3d' && <Surface3DPlotter />}

          {activeTab === 'control-bode' && <ControlBodePlotter />}

          {activeTab === 'matrix' && <MatrixLab />}

          {activeTab === 'research' && (
            <ResearchStudio currentTier={currentTier} currentDiscipline={currentDiscipline} />
          )}

          {activeTab === 'codegen' && <CodeGenLab />}

          {activeTab === 'system-design' && <SystemDesignStudio />}

          {activeTab === 'units' && <UnitConverter />}
        </div>
      </main>

      {/* Engineering Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-mono text-slate-400 font-bold">OmniEng Suite</span>
            <span>— Advanced Multi-Tier Engineering Computation & Research Engine</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Active Tier: <strong className="text-cyan-300">{currentTier}</strong></span>
            <span>Discipline: <strong className="text-sky-300">{currentDiscipline}</strong></span>
          </div>
        </div>
      </footer>

      {/* Universal Physical Constants Reference Modal */}
      <ConstantsModal
        isOpen={isConstantsOpen}
        onClose={() => setIsConstantsOpen(false)}
      />

      {/* Formal Lab Report / Thesis PDF Modal */}
      <LabReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        currentTier={currentTier}
        currentDiscipline={currentDiscipline}
      />

      {/* Quick AI Engineering Assistant Drawer */}
      <EngineeringChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentTier={currentTier}
        currentDiscipline={currentDiscipline}
      />
    </div>
  );
}
