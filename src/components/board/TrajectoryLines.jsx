/* ==========================================================================
   GRAVITY PULSE 2026 - SVG TRAJECTORY & OPTION A WAVE DISPLACEMENT OVERLAY
   ========================================================================== */

import React from 'react';

export function TrajectoryLines({ boardSize, startPos, trajectory = [], waveDisplacements = [] }) {
  const hasTraj = startPos && trajectory.length > 0;
  const hasWave = waveDisplacements && waveDisplacements.length > 0;
  if (!hasTraj && !hasWave) return null;

  // Calculate center percentages for SVG line rendering
  const getPercent = (val) => ((val + 0.5) / boardSize) * 100;

  const points = hasTraj ? [startPos, ...trajectory].map(p => `${getPercent(p.x)},${getPercent(p.y)}`).join(' ') : '';

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
        <linearGradient id="waveSafe" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#9d4edd" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="waveDanger" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Standard step-by-step directional movement trajectory */}
      {hasTraj && (
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
      )}

      {/* Option A: Wave Displacement Arrows for all affected pieces & asteroids */}
      {hasWave && waveDisplacements.map((d, idx) => {
        const isAsteroid = d.entityType === 'ASTEROID';
        const x1 = `${getPercent(d.from.x)}%`;
        const y1 = `${getPercent(d.from.y)}%`;
        const x2 = `${getPercent(d.to.x)}%`;
        const y2 = `${getPercent(d.to.y)}%`;
        const strokeUrl = d.danger ? "url(#waveDanger)" : "url(#waveSafe)";
        const shadowColor = d.danger ? "#ef4444" : (isAsteroid ? "#f59e0b" : "#00f0ff");

        return (
          <g key={`wave-${d.entityId}-${idx}`} style={{ filter: `drop-shadow(0 0 8px ${shadowColor})` }}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeUrl}
              strokeWidth={isAsteroid ? "2" : "2.5"}
              strokeDasharray={isAsteroid ? "2 3" : "4 3"}
            />
            {isAsteroid ? (
              <polygon
                points={`${getPercent(d.to.x)},${getPercent(d.to.y) - 1.5} ${getPercent(d.to.x) + 1.5},${getPercent(d.to.y)} ${getPercent(d.to.x)},${getPercent(d.to.y) + 1.5} ${getPercent(d.to.x) - 1.5},${getPercent(d.to.y)}`}
                fill="none"
                stroke={d.danger ? "#ef4444" : "#f59e0b"}
                strokeWidth="2"
              />
            ) : (
              <circle
                cx={x2}
                cy={y2}
                r="7"
                fill="none"
                stroke={d.danger ? "#ef4444" : "#00ff66"}
                strokeWidth="2"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
