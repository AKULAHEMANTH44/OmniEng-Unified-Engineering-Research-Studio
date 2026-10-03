# OmniEng Suite: Advanced Engineering Computation & Research Engine

> **All-in-one computational workbench for engineers, students, and researchers — from Diploma & Undergrad (B.Tech) up to Postgrad (M.Tech) and PhD.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/AI_Engine-Gemini_3.8_Flash-purple.svg)](https://ai.google.dev/)
[![KaTeX](https://img.shields.io/badge/Math-KaTeX_LaTeX-green.svg)](https://katex.org/)

---

## 🌟 Overview

**OmniEng Suite** is a high-performance, multi-disciplinary engineering workstation designed to bridge the gap between academic theory, competitive exams (GATE/IES), and professional systems design. 

Powered by **Google Gemini** with automated multi-model fallback (`gemini-3.8-flash` $\to$ `gemini-3.1-flash-lite` $\to$ `gemini-flash-latest`), OmniEng provides mathematically rigorous step-by-step derivations, live interactive physics simulators, digital circuit design, web-grounded technical literature search, and automatic exam grading.

---

## 🚀 Key Features

### 1. 📐 Deep Analytical Solver & Proof Engine
- First-principles derivations across **8 Engineering Disciplines**:
  - Mechanical & Aerospace, Electrical (EEE), Electronics & Communication (ECE), Computer Science & AI, Civil & Structural, Chemical & Materials, Robotics & Control, and General Applied Mathematics.
  - Multi-tier depth scaling: **Diploma**, **B.Tech**, **M.Tech**, and **PhD**.
  - LaTeX formulas rendered via KaTeX, boundary condition audits, and Python verification code.

### 2. 🌐 OmniSearch AI (Grounded Technical Search)
- Live web-grounded technical retrieval powered by Google Search.
- Find verified parameters from **IEEE/arXiv papers**, **engineering standards** (ASME Section VIII, ISO 26262, IEEE 1547, ACI 318, IS 456), and **manufacturer datasheets** (STM32, GaN vs SiC, Inconel 718, Ti-6Al-4V).
- Includes clickable source links and grounding query tags.

### 3. 📝 OmniExam & Problem Studio
- **Custom Exam Paper Generator**: Create tailored exams across 5 formats (University Semester Exam, GATE/IES, PhD Qualifying & Viva Voce, Diploma, Technical Job Interview).
- **Grade My Attempt (AI Professor Mode)**: Submit your handwritten or typed solution to receive a score out of 100, step-by-step feedback, pinpointed algebraic/numerical errors, and optimal derivation tips.

### 4. ⚡ Digital Circuit & Logic Workbench
- Live gate synthesis and signal tracing for **Half Adders**, **Full Adders**, **2:1 Multiplexers**, **SR Latches**, **D Flip-Flops**, and **Universal 4-NAND XORs**.
- Clickable input switchboard with active TTL 5V/0V glow and output LEDs.
- Synchronized dynamic truth table highlighting the active state row in real time.

### 5. 🔥 Thermodynamics & State-Point Studio
- Interactive **Steam Rankine**, **Gas Brayton**, **Vapor-Compression Refrigeration (VCR)**, and **Carnot** cycles.
- Real-time Temperature-Entropy ($T-s$) diagram with steam vapor dome.
- Real-time calculation of thermal efficiency ($\eta_{th}$), net work output ($W_{net}$), total heat input ($Q_{in}$), and steam quality ($x_2$).

### 6. 🎛️ Interactive Physics & Mathematical Simulators
- **Signal & Oscilloscope Plotter**: Fourier series harmonics and harmonic distortion.
- **Structural Beam Deflection**: Simply-supported and cantilever Shear Force (SFD) & Bending Moment Diagrams (BMD).
- **RLC Circuit Transient Lab**: Underdamped, critically damped, and overdamped second-order step responses.
- **3D Surface & Vector Field Visualizer**: Mouse-rotatable isometric 3D projection for multivariable calculus, saddle points ($x^2 - y^2$), and wave equations.
- **Control Systems Bode Plotter**: Gain Margin (GM), Phase Margin (PM), crossover frequencies, and Nyquist stability criteria.
- **Matrix & Linear Algebra Laboratory**: Eigenvalues, eigenvectors, determinants, and matrix inverses.

### 7. 📄 Formal Lab Report & Thesis PDF Exporter
- One-click export formatted to **IEEE & ABET university standards**.
- Incorporates institutional headers, candidate details, governing equations, verification data, and faculty evaluator grading rubrics.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, KaTeX LaTeX renderer.
- **Backend**: Node.js, Express, tsx.
- **AI & Grounding**: `@google/genai` TypeScript SDK (Gemini 3.8 Flash & 3.1 Flash-Lite) with Google Search grounding and exponential backoff retry.
- **Build Tool**: Vite.

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/omni-eng-suite.git
   cd omni-eng-suite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=3000
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 📜 License

MIT License. Open-source for students, researchers, and engineers worldwide.
