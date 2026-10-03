import { AcademicTier, Discipline, EngineeringConstant, PresetProblem } from '../types';

export const DISCIPLINES: { id: Discipline; label: string; icon: string; description: string }[] = [
  { id: 'General & Math', label: 'Maths & Physics', icon: '∑', description: 'Calculus, ODE/PDE, Linear Algebra, Transforms & Vector Calc' },
  { id: 'Computer Science & AI', label: 'CSE & AI/ML', icon: '⚡', description: 'Algorithms, Neural Archs, Distributed Systems, Concurrency' },
  { id: 'Electronics & Comm (ECE)', label: 'ECE & Signals', icon: '📡', description: 'DSP, RF, VLSI, Microelectronics, Communications' },
  { id: 'Electrical (EEE)', label: 'EEE & Power', icon: '⚡', description: 'Power Systems, Control Theory, Machines, High Voltage' },
  { id: 'Mechanical & Aero', label: 'Mech & Aero', icon: '⚙', description: 'Thermodynamics, Fluid Dynamics, FEA, Mechanics of Materials' },
  { id: 'Civil & Structural', label: 'Civil & Struct', icon: '🏛', description: 'Structural Mechanics, RCC/Steel, Geotech, Hydraulics' },
  { id: 'Chemical & Materials', label: 'Chem & Materials', icon: '🧪', description: 'Transport Phenomena, Kinetics, Thermodynamics, Phase' },
  { id: 'Robotics & Control', label: 'Robotics & Mechatronics', icon: '🤖', description: 'Kinematics, State-Space, Kalman Filters, Embedded Control' },
];

export const ACADEMIC_TIERS: { id: AcademicTier; label: string; badge: string; desc: string }[] = [
  { id: 'Diploma / Basics', label: 'Diploma / 1st Year', badge: 'Tier 1', desc: 'Core fundamentals, foundational equations, unit analysis & intuition' },
  { id: 'B.Tech (Undergrad)', label: 'B.Tech (Sem 3-8)', badge: 'Tier 2', desc: 'Rigorous engineering derivations, component sizing, numerical proofs' },
  { id: 'M.Tech (Postgrad)', label: 'M.Tech (Masters)', badge: 'Tier 3', desc: 'Advanced state-space, optimization, nonlinear dynamics, multi-physics' },
  { id: 'PhD / Research', label: 'PhD / Research', badge: 'Tier 4', desc: 'Novel formulations, literature gap analysis, formal proofs, IEEE synthesis' },
];

export const ENGINEERING_CONSTANTS: EngineeringConstant[] = [
  { symbol: 'c', name: 'Speed of Light in Vacuum', value: '299,792,458', unit: 'm / s', latex: 'c = 2.998 \\times 10^8 \\text{ m/s}', category: 'Physics' },
  { symbol: 'h', name: 'Planck Constant', value: '6.62607015 × 10⁻³⁴', unit: 'J · s', latex: 'h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}', category: 'Quantum' },
  { symbol: 'ℏ', name: 'Reduced Planck Constant', value: '1.054571817 × 10⁻³⁴', unit: 'J · s', latex: '\\hbar = \\frac{h}{2\\pi} = 1.055 \\times 10^{-34} \\text{ J}\\cdot\\text{s}', category: 'Quantum' },
  { symbol: 'G', name: 'Newtonian Gravitational Constant', value: '6.67430 × 10⁻¹¹', unit: 'm³ / (kg · s²)', latex: 'G = 6.674 \\times 10^{-11} \\text{ m}^3/(\\text{kg}\\cdot\\text{s}^2)', category: 'Physics' },
  { symbol: 'k_B', name: 'Boltzmann Constant', value: '1.380649 × 10⁻²³', unit: 'J / K', latex: 'k_B = 1.381 \\times 10^{-23} \\text{ J/K}', category: 'Thermodynamics' },
  { symbol: 'R', name: 'Universal Gas Constant', value: '8.314462618', unit: 'J / (mol · K)', latex: 'R = 8.314 \\text{ J}/(\\text{mol}\\cdot\\text{K})', category: 'Thermodynamics' },
  { symbol: 'N_A', name: 'Avogadro Constant', value: '6.02214076 × 10²³', unit: 'mol⁻¹', latex: 'N_A = 6.022 \\times 10^{23} \\text{ mol}^{-1}', category: 'Thermodynamics' },
  { symbol: 'ε₀', name: 'Vacuum Permittivity', value: '8.8541878128 × 10⁻¹²', unit: 'F / m', latex: '\\varepsilon_0 = 8.854 \\times 10^{-12} \\text{ F/m}', category: 'Electromagnetism' },
  { symbol: 'μ₀', name: 'Vacuum Permeability', value: '1.256637062 × 10⁻⁶', unit: 'N / A²', latex: '\\mu_0 = 4\\pi \\times 10^{-7} \\text{ H/m}', category: 'Electromagnetism' },
  { symbol: 'e', name: 'Elementary Charge', value: '1.602176634 × 10⁻¹⁹', unit: 'C', latex: 'e = 1.602 \\times 10^{-19} \\text{ C}', category: 'Electromagnetism' },
  { symbol: 'm_e', name: 'Electron Rest Mass', value: '9.1093837015 × 10⁻³¹', unit: 'kg', latex: 'm_e = 9.109 \\times 10^{-31} \\text{ kg}', category: 'Quantum' },
  { symbol: 'σ', name: 'Stefan-Boltzmann Constant', value: '5.670374419 × 10⁻⁸', unit: 'W / (m² · K⁴)', latex: '\\sigma = 5.670 \\times 10^{-8} \\text{ W}/(\\text{m}^2\\cdot\\text{K}^4)', category: 'Thermodynamics' },
  { symbol: 'g', name: 'Standard Acceleration of Gravity', value: '9.80665', unit: 'm / s²', latex: 'g = 9.807 \\text{ m/s}^2', category: 'Mechanics' },
  { symbol: 'ρ_air', name: 'Air Density at STP', value: '1.225', unit: 'kg / m³', latex: '\\rho_{\\text{air}} = 1.225 \\text{ kg/m}^3', category: 'Mechanics' },
  { symbol: 'Z_0', name: 'Characteristic Impedance of Vacuum', value: '376.730313668', unit: 'Ω', latex: 'Z_0 = \\sqrt{\\frac{\\mu_0}{\\varepsilon_0}} \\approx 377\\,\\Omega', category: 'Electromagnetism' },
];

export const PRESET_PROBLEMS: PresetProblem[] = [
  {
    id: 'beam-deflection',
    title: 'Euler-Bernoulli Beam: Bending & Deflection',
    discipline: 'Mechanical & Aero',
    academicTier: 'B.Tech (Undergrad)',
    tags: ['Solid Mechanics', 'Calculus', 'Shear Force'],
    description: 'Derive the deflection curve v(x) and maximum bending moment for a simply supported beam with uniformly distributed load w and central point load P.',
    prompt: `Derive the analytical deflection equation v(x), maximum bending moment M_max, and maximum deflection v_max for a simply supported beam of length L, Young's modulus E, and second moment of area I, subjected to:
1. A uniformly distributed load w (N/m) across the full span.
2. A concentrated point load P (N) at the mid-span L/2.
Provide boundary conditions, integration constants, maximum stress \\sigma_{\\max} = \\frac{M y}{I}, and an executable Python code snippet using NumPy & Matplotlib to plot the Shear Force Diagram (SFD) and Bending Moment Diagram (BMD).`,
  },
  {
    id: 'rlc-resonance',
    title: 'RLC Second-Order Transient & Quality Factor',
    discipline: 'Electronics & Comm (ECE)',
    academicTier: 'B.Tech (Undergrad)',
    tags: ['Circuits', 'Laplace Transform', 'Resonance'],
    description: 'Analytical step-response of a series RLC circuit across overdamped, critically damped, and underdamped regimes.',
    prompt: `Analyze a Series RLC Circuit driven by a step voltage input V_s(t) = V_0 u(t).
1. Formulate the differential equation using Kirchhoff's Voltage Law (KVL) in terms of capacitor charge q(t) and voltage v_C(t).
2. Take the Laplace transform and derive the s-domain transfer function H(s) = \\frac{V_C(s)}{V_s(s)}.
3. Express natural frequency \\omega_0, damping ratio \\zeta, and quality factor Q in terms of R, L, C.
4. Solve for the time-domain response v_C(t) for all three regimes: Overdamped (\\zeta > 1), Critically Damped (\\zeta = 1), and Underdamped (\\zeta < 1).
5. Provide a Python script to simulate and plot all 3 curves on a single figure.`,
  },
  {
    id: 'navier-stokes',
    title: 'Prandtl Boundary Layer & Reynolds Number',
    discipline: 'Mechanical & Aero',
    academicTier: 'M.Tech (Postgrad)',
    tags: ['Fluid Dynamics', 'PDE', 'Aerodynamics'],
    description: 'Boundary layer thickness, skin-friction coefficient, and Blasius similarity solution over a flat plate.',
    prompt: `Perform an in-depth derivation of the 2D laminar boundary layer over a semi-infinite flat plate using the Prandtl boundary layer equations.
1. Start with the steady, incompressible 2D Navier-Stokes equations and state the boundary layer order-of-magnitude scaling assumptions.
2. Formulate the Blasius similarity transformation \\eta = y \\sqrt{\\frac{U_\\infty}{\\nu x}} and stream function \\psi(x,y) = \\sqrt{\\nu x U_\\infty} f(\\eta).
3. Derive the Blasius third-order nonlinear ordinary differential equation: 2 f''' + f f'' = 0 with boundary conditions f(0)=0, f'(0)=0, f'(\\infty)=1.
4. Discuss the analytical approximations for boundary layer thickness \\delta(x), displacement thickness \\delta^*(x), momentum thickness \\theta(x), and local skin friction coefficient C_{f,x}.`,
  },
  {
    id: 'kalman-filter',
    title: 'Discrete Kalman Filter: State-Space Estimation',
    discipline: 'Robotics & Control',
    academicTier: 'M.Tech (Postgrad)',
    tags: ['Optimal Estimation', 'Control Systems', 'State-Space'],
    description: 'Derive the optimal Kalman gain K_k minimizing trace of estimation error covariance under Gaussian white noise.',
    prompt: `Provide a complete, mathematically rigorous derivation of the Discrete-Time Linear Kalman Filter from first principles.
1. Define the linear discrete state-space model: x_k = A x_{k-1} + B u_{k-1} + w_{k-1}, and measurement model z_k = H x_k + v_k, with covariance matrices Q and R.
2. State the prior state estimate \\hat{x}_k^- and prior error covariance P_k^-.
3. Formulate the posterior state update \\hat{x}_k = \\hat{x}_k^- + K_k (z_k - H \\hat{x}_k^-).
4. Prove that minimizing the trace of the posterior error covariance matrix \\text{Tr}(P_k) yields the optimal Kalman Gain K_k = P_k^- H^T (H P_k^- H^T + R)^{-1}.
5. Write an optimized Python class implementation tracking a 1D kinematic object (position + velocity) with noisy sensor measurements.`,
  },
  {
    id: 'fourier-fft',
    title: 'Fast Fourier Transform (Cooley-Tukey Radix-2)',
    discipline: 'Computer Science & AI',
    academicTier: 'B.Tech (Undergrad)',
    tags: ['Algorithms', 'Complexity', 'Signal Processing'],
    description: 'Divide-and-conquer radix-2 Decimation-in-Time (DIT) derivation from O(N^2) to O(N log N).',
    prompt: `Explain and derive the Cooley-Tukey Radix-2 Decimation-in-Time (DIT) Fast Fourier Transform (FFT) algorithm.
1. Write the formal definition of the Discrete Fourier Transform (DFT) X[k] = \\sum_{n=0}^{N-1} x[n] W_N^{kn}, where W_N = e^{-j 2\\pi / N}.
2. Split the summation into even-indexed and odd-indexed samples and derive the butterfly recurrence equations.
3. Show mathematically why the complexity reduces from \\mathcal{O}(N^2) to \\mathcal{O}(N \\log_2 N) exploiting periodicity and symmetry properties of twiddle factors W_N^{k + N/2} = -W_N^k.
4. Provide a bit-reversal permutation algorithm and in-place iterative FFT implementation in Python or C++.`,
  },
  {
    id: 'rankine-cycle',
    title: 'Reheat Rankine Cycle with Regenerative Feedwater',
    discipline: 'Mechanical & Aero',
    academicTier: 'B.Tech (Undergrad)',
    tags: ['Thermodynamics', 'Power Plant', 'Entropy'],
    description: 'Thermodynamic analysis, T-s diagram state points, thermal efficiency, and heat rate calculation.',
    prompt: `Conduct a complete thermodynamic analysis of an Ideal Reheat-Regenerative Rankine Cycle with one open feedwater heater (OFWH).
Steam enters the high-pressure turbine at 15 MPa, 600°C. Reheating occurs at 4 MPa back to 600°C. Steam is bled at 1.2 MPa to the OFWH. Condenser pressure is 10 kPa.
1. Sketch and define all state points on a Temperature-Entropy (T-s) diagram.
2. Formulate the mass and energy balance equations for the open feedwater heater to find the bled fraction y.
3. Compute turbine work output W_t, pump work input W_p, total heat input Q_in, and the overall thermal efficiency \\eta_{th}.
4. Compare the thermal efficiency with a standard non-reheat cycle and explain the Second-Law thermodynamic improvement.`,
  },
  {
    id: 'transformer-losses',
    title: 'Transformer Core Losses: Hysteresis & Eddy Currents',
    discipline: 'Electrical (EEE)',
    academicTier: 'Diploma / Basics',
    tags: ['Electrical Machines', 'Magnetics', 'Efficiency'],
    description: 'Steinmetz empirical equation, eddy current lamination thickness scaling, and separation of losses test.',
    prompt: `Explain the mechanisms of core (iron) losses in electrical power transformers for diploma and early undergrad engineering students.
1. Differentiate between Hysteresis Loss P_h and Eddy Current Loss P_e with physical explanations.
2. State the Steinmetz empirical formula for hysteresis loss P_h = k_h f B_{max}^n and explain the physical significance of the Steinmetz exponent n \\approx 1.6.
3. Derive the eddy current loss equation P_e = \\frac{\\pi^2 f^2 B_{max}^2 t^2}{6 \\rho}, demonstrating why laminating the core of thickness t drastically reduces losses by t^2 factor.
4. Explain how the Open Circuit (No-Load) test is conducted to separate hysteresis and eddy current losses by varying frequency while keeping V/f constant.`,
  },
  {
    id: 'deep-learning-backprop',
    title: 'Matrix Calculus & Backpropagation Derivation',
    discipline: 'Computer Science & AI',
    academicTier: 'M.Tech (Postgrad)',
    tags: ['Deep Learning', 'Matrix Calculus', 'Gradient Descent'],
    description: 'Exact tensor Jacobian and chain rule derivation for multi-layer perceptron with cross-entropy loss.',
    prompt: `Provide a rigorous tensor/matrix calculus derivation of the Backpropagation algorithm for a deep neural network with L layers.
1. Define forward pass activations: z^{(l)} = W^{(l)} a^{(l-1)} + b^{(l)} and a^{(l)} = \\sigma(z^{(l)}).
2. Given cross-entropy loss \\mathcal{L}(y, \\hat{y}), define the error vector \\delta^{(l)} = \\frac{\\partial \\mathcal{L}}{\\partial z^{(l)}}.
3. Derive the backward recurrence relation \\delta^{(l)} = ((W^{(l+1)})^T \\delta^{(l+1)}) \\odot \\sigma'(z^{(l)}) using the vector chain rule.
4. Compute the exact gradients with respect to weights \\frac{\\partial \\mathcal{L}}{\\partial W^{(l)}} = \\delta^{(l)} (a^{(l-1)})^T and biases \\frac{\\partial \\mathcal{L}}{\\partial b^{(l)}} = \\delta^{(l)}.
5. Implement a clean, vectorized neural network layer in pure Python using NumPy without external deep learning frameworks.`,
  },
];
