# Gravity Pulse 2026 🌌⚡

**Gravity Pulse 2026** is a casual, fluid, and tactical space board game designed for fast-paced entertainment and relaxing gameplay. Unlike heavy strategic simulations, Gravity Pulse focuses on intuitive wave mechanics, satisfying micro-animations, and instant casual decision-making.

---

## 🎮 Core Gameplay & Features

- **🌊 Gravity & Pulse Waves**: Manipulate gravitational fields to pull opponents 1 space toward you (Gravity Wave) or push them 1 space away (Pulse Wave).
- **🕳️ Singularity Accretion Core**: Navigate directly into the center 2x2 Black Hole Singularity to score survival points and absorb **Supercharged** status (doubling wave power + emerald glow!).
- **⚡ Casual Mistake Protection**: Includes an instant **Undo Last Move** button so you can safely rewind tactical miscalculations without penalty.
- **📱 Touch-Optimized Regional Hitboxes**: In setup and respawn phases, tapping anywhere within a 3x3 region deploys your piece directly to that region's center—preventing mobile touch errors.
- **🎵 Pure Web Audio API Synth Engine**: Sub-millisecond audio synthesis with zero external audio files. Features a relaxing deep-space ambient chord drone, responsive UI clicks, gravity frequency sweeps, and supercharged chimes.
- **🕹️ Blitz & Extended Modes**: Choose between 3-round Blitz mode, 5-round Quick Play, or 10-round Extended matches with up to 12 player neon palettes and snappy (<50ms) heuristic AI opponents.

---

## 🏗️ Zero-God-File Modular Architecture

To guarantee code maintainability and prevent code creep, the project is structured into focused, single-responsibility modules:

```text
src/
├── audio/
│   └── soundEngine.js           # Native Web Audio API synthesis engine
├── engine/                      # Core game logic (Zero God Files)
│   ├── types.js                 # Constants, actions, phases, and 12-player palettes
│   ├── rules.js                 # Setup configuration and legal action rules
│   ├── boardGeometry.js         # Coordinate math, Chebyshev distances, and tie-breaking
│   ├── collision.js             # Asteroid hazards, energy absorption, and singularity scoring
│   ├── movementResolver.js      # Step-by-step resolution and trajectory previews
│   ├── gravityPulse.js          # Clockwise Gravity, Pulse, and Turn 4 Black Hole suction
│   ├── aiDecision.js            # Instantaneous heuristic AI (<50ms)
│   └── storage.js               # localStorage auto-saving and session resume
├── components/                  # Modular React UI components
│   ├── layout/                  # Navbar and ResponsiveShell (3-col desktop / mobile stack)
│   ├── board/                   # Aspect-ratio BoardContainer, GridCells, GPU EntityLayer
│   ├── controls/                # ActionDashboard, ActionCard, and PhaseBanner
│   ├── status/                  # Scoreboard and GameLog event feed
│   └── modals/                  # GameSetupModal, RulesModal, and GameOverModal
├── App.jsx                      # Main state orchestrator
├── index.css                    # Deep Space Gravitational design system & GPU keyframes
└── main.jsx                     # Application entry point
```

---

## 🚀 Getting Started & Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start Development Server:**
   ```bash
   npm run dev
   ```
3. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🌐 Deployment & Vercel Readiness

This repository is optimized for Vercel deployment. To deploy directly using Vercel CLI:
```bash
npx vercel
```
Or link via the Vercel dashboard by importing your GitHub repository (`gravitypulse`).

---

*© 2026 Randall Blanchette Games. Designed for pure casual enjoyment in deep space.*
