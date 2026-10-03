export type AcademicTier = 'Diploma / Basics' | 'B.Tech (Undergrad)' | 'M.Tech (Postgrad)' | 'PhD / Research';

export type Discipline =
  | 'General & Math'
  | 'Computer Science & AI'
  | 'Electronics & Comm (ECE)'
  | 'Electrical (EEE)'
  | 'Mechanical & Aero'
  | 'Civil & Structural'
  | 'Chemical & Materials'
  | 'Robotics & Control';

export interface EngineeringConstant {
  symbol: string;
  name: string;
  value: string;
  unit: string;
  latex: string;
  category: 'Physics' | 'Thermodynamics' | 'Electromagnetism' | 'Quantum' | 'Mechanics';
}

export interface PresetProblem {
  id: string;
  title: string;
  discipline: Discipline;
  academicTier: AcademicTier;
  prompt: string;
  description: string;
  tags: string[];
}

export type ActiveTab =
  | 'solver'
  | 'search'
  | 'exam-studio'
  | 'circuit-logic'
  | 'simulators'
  | 'thermo-lab'
  | 'surface-3d'
  | 'control-bode'
  | 'matrix'
  | 'research'
  | 'codegen'
  | 'system-design'
  | 'units';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
