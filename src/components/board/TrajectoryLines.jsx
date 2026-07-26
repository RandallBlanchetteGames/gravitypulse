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
      zIndex: 30
    }}>
      <defs>
        <linearGradient id="trajGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--accent-supercharge)" stopOpacity="1" />
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

        if (d.unaffected) {
          return (
            <g key={`wave-${d.entityId}-${idx}`} style={{ opacity: 0.75, filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' }}>
              <circle
                cx={x1}
                cy={y1}
                r={isAsteroid ? "14" : "17"}
                fill="none"
                stroke={isAsteroid ? "#f59e0b" : "#00f0ff"}
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <text
                x={x1}
                y={y1}
                dy="-24"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="7.5px"
                fontWeight="900"
                style={{ letterSpacing: '0.05em', textShadow: '0 0 4px #000, 0 0 8px #000, 0 0 12px #000, 0 0 16px #000' }}
              >
                {d.reason === 'OUT_OF_RANGE' ? 'OUT OF RANGE' : 'BLOCKED'}
              </text>
            </g>
          );
        }

        const x2 = `${getPercent(d.to.x)}%`;
        const y2 = `${getPercent(d.to.y)}%`;
        const strokeColor = d.danger ? "#ef4444" : (isAsteroid ? "#ffaa00" : "#00f0ff");
        const shadowColor = d.danger ? "#ef4444" : (isAsteroid ? "#f59e0b" : "#00f0ff");

        return (
          <g key={`wave-${d.entityId}-${idx}`} style={{ filter: `drop-shadow(0 0 8px ${shadowColor})` }}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth={isAsteroid ? "2.5" : "3"}
              strokeDasharray={isAsteroid ? "4 3" : "6 4"}
            />
            {isAsteroid ? (
              <polygon
                points={`${getPercent(d.to.x)},${getPercent(d.to.y) - 2.5} ${getPercent(d.to.x) + 2.5},${getPercent(d.to.y)} ${getPercent(d.to.x)},${getPercent(d.to.y) + 2.5} ${getPercent(d.to.x) - 2.5},${getPercent(d.to.y)}`}
                fill={d.danger ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 170, 0, 0.4)"}
                stroke={d.danger ? "#ef4444" : "#ffaa00"}
                strokeWidth="2.5"
              />
            ) : (
              <circle
                cx={x2}
                cy={y2}
                r="8"
                fill={d.danger ? "rgba(239, 68, 68, 0.4)" : "rgba(0, 255, 102, 0.4)"}
                stroke={d.danger ? "#ef4444" : "#00ff66"}
                strokeWidth="2.5"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
