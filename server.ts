import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Candidate models for automated high-availability fallback
// When Gemini servers experience momentary regional 503 high-demand spikes,
// the server automatically cascades to flash-lite or flash-latest.
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

async function generateWithFallback(params: {
  contents: any;
  config?: any;
}) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        if (response && response.text) {
          const candidate = response.candidates?.[0];
          return {
            text: response.text,
            modelUsed: model,
            groundingMetadata: (candidate as any)?.groundingMetadata || null,
          };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('fetch failed');

        console.warn(`[Gemini Cascade] Model ${model} attempt ${attempt + 1} encountered: ${errMsg}`);

        if (isTransient && attempt === 0) {
          // Jittered backoff before second attempt on same model
          await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 200));
          continue;
        }

        // If tools like googleSearch caused an issue on a fallback model, try without tools
        if (params.config?.tools && attempt === 0) {
          try {
            const strippedConfig = { ...params.config };
            delete strippedConfig.tools;
            const fallbackResp = await ai.models.generateContent({
              model,
              contents: params.contents,
              config: strippedConfig,
            });
            if (fallbackResp && fallbackResp.text) {
              return {
                text: fallbackResp.text,
                modelUsed: model,
                groundingMetadata: null,
              };
            }
          } catch {
            // continue cascade
          }
        }

        // If second attempt failed or non-recoverable on this model, try next candidate model
        break;
      }
    }
  }

  throw lastError || new Error('All candidate models are temporarily busy. Please retry in a few moments.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    candidateModels: CANDIDATE_MODELS,
    timestamp: new Date().toISOString(),
  });
});

// Engineering Problem Solver & Derivation Endpoint
app.post('/api/engineer/solve', async (req, res) => {
  try {
    const {
      prompt,
      discipline = 'General Engineering',
      academicLevel = 'B.Tech',
      includeCode = true,
      includeLatex = true,
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the environment. Please ensure it is present in Secrets.',
      });
    }

    const systemInstruction = `You are OmniEng Senior Engineering & Mathematics Solver, an expert professor and principal research engineer across all engineering disciplines (Mechanical, Electrical, Electronics & Comm, Computer Science, Civil, Chemical, Aerospace, Robotics, and Applied Physics/Maths).
Target Academic Tier: ${academicLevel} (up to Diploma, B.Tech, M.Tech, and PhD research levels).
Discipline: ${discipline}.

Provide an ultra-rigorous, publication-grade solution structured cleanly in Markdown:
1. **Problem Statement & Parameter Definition**: Explicit list of given values, boundary conditions, coordinate frames, and SI units.
2. **Governing Laws & First Principles**: The core governing equations (e.g. Navier-Stokes, Maxwell's, Euler-Lagrange, Kirchhoff's, Thermodynamic Laws, Big-O recurrences, Hooke's law, etc.). Use clean LaTeX notation inside $...$ for inline or $$...$$ for block math.
3. **Step-by-Step Analytical Derivation & Computation**: Show every intermediate step without jumping to conclusions. Calculate exact numerical solutions with units and significant figures.
4. **Physical & Engineering Interpretation**: What does the result mean practically? Discuss stability, safety factors, asymptotic bottlenecks, resonance, or thermal limits.
${includeCode ? '5. **Simulation & Verification Code**: Provide an idiomatic, runnable Python (NumPy/SciPy/Matplotlib) or MATLAB snippet validating the analytical result.' : ''}
${includeLatex ? '6. **Summary Equation Sheet**: Key formulas in a neat LaTeX block for research papers or exam cheat-sheets.' : ''}

Use accurate LaTeX formatting. Ensure all formulas render properly with standard KaTeX syntax.`;

    const resultData = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({
      result: resultData.text || 'No solution generated.',
      modelUsed: resultData.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/engineer/solve:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process engineering solution. The AI model is experiencing high demand.',
    });
  }
});

// Research Paper, Thesis & Literature Synthesizer (M.Tech / PhD level)
app.post('/api/engineer/research', async (req, res) => {
  try {
    const { topic, discipline, objective, methodologyType } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Research topic is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the environment.',
      });
    }

    const systemInstruction = `You are the OmniEng Research Fellowship Director & IEEE/Elsevier peer-review editor.
Generate an exhaustive M.Tech/PhD level Research Formulation & Literature Synthesis document in clean Markdown:

Structure:
# [Research Paper Title Proposal: Precise, Academic & High-Impact]

### 1. Abstract
Structured IEEE/ACM style abstract (Background, Research Gap, Proposed Method, Key Contributions, Quantitative Metrics).

### 2. Research Problem & Theoretical Formulation
- Problem background and real-world failure mode or performance ceiling.
- Mathematical formulation of the objective function, constraints, and optimization targets (use LaTeX $$...$$).

### 3. State-of-the-Art Taxonomy & Research Gaps
- Categorized comparison matrix of existing literature paradigms (Benchmark approaches vs Weaknesses).
- Clear statement of the unaddressed "Research Gap" your study bridges.

### 4. Proposed Novel Architecture / Mathematical Methodology
- Step-by-step pipeline or algorithmic pseudocode.
- Block diagram explanation (Mermaid text diagram or ASCII flow).
- Theoretical guarantees (convergence, stability margins, or computational complexity).

### 5. Experimental Validation & Evaluation Protocol
- Benchmarking datasets or experimental testbed setup.
- Quantitative evaluation metrics (e.g. MSE, BLEU, FLOPs, Von Mises Stress, SNR, COP, efficiency %).
- Ablation study design.

### 6. BibTeX Citation Skeleton
Provide 4-5 representative, realistic BibTeX entries for foundational papers in this subfield.`;

    const prompt = `Research Topic: ${topic}\nDiscipline: ${discipline || 'Interdisciplinary Engineering'}\nResearch Objective: ${objective || 'Develop high-performance novel methodology'}\nMethodology Preference: ${methodologyType || 'Hybrid Analytical & Numerical Simulation'}`;

    const resultData = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({
      result: resultData.text || 'No research synthesis generated.',
      modelUsed: resultData.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/engineer/research:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate research synthesis',
    });
  }
});

// Scientific Code & Simulation Generator
app.post('/api/engineer/codegen', async (req, res) => {
  try {
    const { problem, language = 'python', libraryFocus = 'scipy' } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'Problem description is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the environment.',
      });
    }

    const systemInstruction = `You are a Principal Scientific Computing & Simulation Engineer.
Write high-performance, production-grade simulation code for the requested problem.
Target Language: ${language}
Ecosystem: ${libraryFocus}

Requirements:
- Production quality: Vectorized operations, error handling, parameter docstrings.
- Include data generation, numerical integration/solving, and visual plotting commands (e.g. Matplotlib / MATLAB figure).
- Provide a brief markdown explanation of the algorithm, convergence criteria, and runtime complexity.
- Wrap all code in proper markdown code blocks (\`\`\`${language} ... \`\`\`).`;

    const resultData = await generateWithFallback({
      contents: `Simulate and compute: ${problem}`,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({
      result: resultData.text || 'No code generated.',
      modelUsed: resultData.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/engineer/codegen:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate simulation code',
    });
  }
});

// System Design & Architecture Endpoint
app.post('/api/engineer/system-design', async (req, res) => {
  try {
    const { systemName, requirements, domain } = req.body;

    if (!systemName) {
      return res.status(400).json({ error: 'System name is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the environment.',
      });
    }

    const systemInstruction = `You are a Chief Systems Architect & Reliability Engineer for Mission-Critical Engineering Systems.
Domain: ${domain || 'Multi-Discipline Engineering'}.

Produce a comprehensive, rigorous System Engineering Specification:
1. **Functional & Non-Functional Specifications** (Throughput, Latency, MTBF, Safety Factors, Thermal envelope).
2. **Subsystem Architecture & Interface Control Document (ICD)**.
3. **Data Flow & Signal / Force Flow Diagram** (Include a Mermaid markdown diagram \`\`\`mermaid ... \`\`\`).
4. **FMEA (Failure Mode and Effects Analysis)**: Component, Failure Mode, Cause, Effect, Severity (1-10), Mitigation.
5. **Trade-off Analysis & Mathematical Sizing Calculations**.`;

    const prompt = `System Name: ${systemName}\nRequirements & Constraints: ${requirements || 'Standard high reliability, scalable production specs'}`;

    const resultData = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.25,
      },
    });

    res.json({
      result: resultData.text || 'No architecture generated.',
      modelUsed: resultData.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/engineer/system-design:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate system design',
    });
  }
});

// Interactive Engineering Assistant (Multi-turn or general technical queries)
app.post('/api/engineer/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the environment.',
      });
    }

    const systemInstruction = `You are OmniEng AI, an omniscient engineering peer assistant for students and researchers from 1st-year Diploma up to M.Tech and PhD.
You explain concepts with intuitive physical analogies, rigorous mathematics (LaTeX), step-by-step formulas, and practical design intuition.
Current Workbench Context: ${context || 'General Engineering Workbench'}.
Always be encouraging, mathematically precise, and format formulas neatly using KaTeX syntax ($...$ and $$...$$).`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const resultData = await generateWithFallback({
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      reply: resultData.text || '',
      modelUsed: resultData.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/engineer/chat:', error);
    res.status(500).json({
      error: error?.message || 'Failed to complete assistant request',
    });
  }
});

// Exam, Test & Numerical Problem Generator Endpoint
app.post('/api/engineer/generate-exam', async (req, res) => {
  try {
    const {
      topic,
      discipline = 'General Engineering',
      academicTier = 'B.Tech',
      examType = 'University Semester Exam',
      count = 3,
    } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic or syllabus area is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the environment.',
      });
    }

    const systemInstruction = `You are the Chief Examination Board Controller & Senior Academic Professor for Premier Engineering Institutions.
Academic Tier: ${academicTier} (Diploma, B.Tech, M.Tech, PhD).
Discipline: ${discipline}.
Exam Format: ${examType}.

Generate a rigorous, authentic set of ${count} engineering examination problems in clean Markdown:
Each problem must include:
1. **Problem Statement**: Real-world engineering context, exact numerical parameters, SI units, and boundary conditions.
2. **Standard Difficulty / Marks**: (e.g. [10 Marks], [GATE 2-Mark Question], [Viva Voce Technical Challenge]).
3. **Step-by-Step Marking Scheme & Answer Key**:
   - Governing equations (LaTeX $$...$$).
   - Step-by-step substitution and algebraic simplification.
   - Final numerical answer with unit and standard tolerance range.
4. **Common Pitfalls & Examiner Advice**: Where do 70% of students make sign errors, unit mistakes, or invalid assumptions?

Format all equations cleanly with KaTeX syntax ($...$ and $$...$$).`;

    const prompt = `Generate a ${examType} paper for Topic: "${topic}" in ${discipline} for academic level: ${academicTier}. Number of problems: ${count}.`;

    const resultData = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({
      result: resultData.text || '',
      modelUsed: resultData.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/engineer/generate-exam:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate examination problems',
    });
  }
});

// Interactive Student Solution Grader & Peer Reviewer
app.post('/api/engineer/grade-solution', async (req, res) => {
  try {
    const { problemStatement, studentSolution, discipline, academicTier } = req.body;

    if (!problemStatement || !studentSolution) {
      return res.status(400).json({ error: 'Both problem statement and student solution are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the environment.',
      });
    }

    const systemInstruction = `You are a Fair, Thorough Engineering Professor and Peer Reviewer.
Grade the student's solution to the given engineering problem:
1. **Overall Grade**: Score out of 100 with qualitative rating (Exceptional, Proficient, Needs Work, Critical Conceptual Error).
2. **Correct Steps Verified**: List where the student applied governing laws and math accurately.
3. **Identified Errors & Flaws**: Pinpoint exact algebraic mistakes, missing units, coordinate frame mismatches, or invalid boundary condition assumptions.
4. **Correct Benchmark Solution**: Show the correct, streamlined mathematical derivation with KaTeX formulas ($$...$$).
5. **Professor's Constructive Mentorship**: One practical tip to ace this type of problem in exams and technical interviews.`;

    const prompt = `Problem:\n${problemStatement}\n\nStudent's Attempted Solution:\n${studentSolution}\n\nDiscipline: ${discipline || 'Engineering'}, Tier: ${academicTier || 'B.Tech'}`;

    const resultData = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({
      result: resultData.text || '',
      modelUsed: resultData.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/engineer/grade-solution:', error);
    res.status(500).json({
      error: error?.message || 'Failed to evaluate student solution',
    });
  }
});

// AI Technical & Literature Search Engine Endpoint (Google Search Grounded)
app.post('/api/engineer/search', async (req, res) => {
  try {
    const { query, category = 'all', discipline = 'General Engineering', academicTier = 'B.Tech' } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the environment.',
      });
    }

    const systemInstruction = `You are OmniSearch: the Premier Technical Research, Engineering Datasheet & Scientific Knowledge Engine.
Discipline Context: ${discipline}. Target Level: ${academicTier}. Search Category: ${category}.

Provide a deeply informative, factually grounded engineering answer:
1. **Direct Answer & Technical Summary**: Clear, authoritative answer with key conclusions upfront.
2. **Governing Formulas & Theoretical Foundations**: Provide all relevant mathematical equations in clean KaTeX LaTeX syntax ($...$ or $$...$$).
3. **Engineering Specifications, Standards & Datasheet Parameters**: Cite exact component part numbers, materials (e.g. AISI 4140, FR-4, GaN vs SiC, 6061-T6), or regulatory standards (e.g. IEEE, ASME Section VIII, ISO, ASTM, AISC) where applicable.
4. **State-of-the-Art Benchmarks & Literature Context**: Mention foundational papers, trade-offs, industrial applications, and recent breakthroughs.
5. **Practical Recommendation / Rule of Thumb**: Practical engineering design heuristics for real-world application.

Format formulas in KaTeX ($...$ and $$...$$).`;

    const resultData = await generateWithFallback({
      contents: `Search, verify and analyze this technical engineering query: "${query}"`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    res.json({
      answer: resultData.text || 'No information found.',
      modelUsed: resultData.modelUsed,
      grounding: resultData.groundingMetadata,
    });
  } catch (error: any) {
    console.error('Error in /api/engineer/search:', error);
    res.status(500).json({
      error: error?.message || 'Failed to execute technical search query',
    });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`[OmniEng] Server running at http://localhost:${port}`);
  });
}

startServer();
