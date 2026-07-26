/* ==========================================================================
   GRAVITY PULSE 2026 - SVG TRAJECTORY PREVIEW OVERLAY
   ========================================================================== */

import React from 'react';

export function TrajectoryLines({ boardSize, startPos, trajectory = [] }) {
  if (!startPos || trajectory.length === 0) return null;

  // Calculate center percentages for SVG line rendering
  const getPercent = (val) => ((val + 0.5) / boardSize) * 100;

  const points = [startPos, ...trajectory].map(p => `${getPercent(p.x)},${getPercent(p.y)}`).join(' ');

  return (
    <svg style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 15
    }}>
      <defs>
        <linearGradient id="trajGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--accent-supercharge)" stopOpacity="1" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="url(#trajGrad)"
        strokeWidth="3"
        strokeDasharray="6 4"
        points={points}
        style={{
          filter: 'drop-shadow(0 0 6px var(--accent-cyan))'
        }}
      />
    </svg>
  );
}
