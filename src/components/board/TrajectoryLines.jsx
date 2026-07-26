/* ==========================================================================
   GRAVITY PULSE 2026 - SVG TRAJECTORY & OPTION A WAVE DISPLACEMENT OVERLAY
   ========================================================================== */

import React from 'react';

export function TrajectoryLines({ boardSize, startPos, trajectory = [], waveDisplacements = [] }) {
  const hasTraj = startPos && trajectory.length > 0;
  const hasWave = waveDisplacements && waveDisplacements.length > 0;
  if (!hasTraj && !hasWave) return null;

  // Calculate center coordinate in 0..1000 SVG viewBox space
  const getCoord = (val) => ((val + 0.5) / boardSize) * 1000;

  const points = hasTraj ? [startPos, ...trajectory].map(p => `${getCoord(p.x)},${getCoord(p.y)}`).join(' ') : '';

  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 30
      }}
    >
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
          strokeWidth="6"
          strokeDasharray="12 8"
          points={points}
          style={{
            filter: 'drop-shadow(0 0 10px var(--accent-cyan))'
          }}
        />
      )}

      {/* Option A: Wave Displacement Arrows for all affected pieces & asteroids */}
      {hasWave && waveDisplacements.map((d, idx) => {
        const isAsteroid = d.entityType === 'ASTEROID';
        const x1 = getCoord(d.from.x);
        const y1 = getCoord(d.from.y);

        if (d.unaffected) {
          return (
            <g key={`wave-${d.entityId}-${idx}`} style={{ opacity: 0.85, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}>
              <circle
                cx={x1}
                cy={y1}
                r={isAsteroid ? 32 : 38}
                fill="none"
                stroke={isAsteroid ? "#f59e0b" : "#00f0ff"}
                strokeWidth="4"
                strokeDasharray="8 6"
              />
              <text
                x={x1}
                y={y1}
                dy="-48"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="16px"
                fontWeight="900"
                style={{ letterSpacing: '0.05em', textShadow: '0 0 6px #000, 0 0 12px #000, 0 0 18px #000, 0 0 24px #000' }}
              >
                {d.reason === 'OUT_OF_RANGE' ? 'OUT OF RANGE' : 'BLOCKED'}
              </text>
            </g>
          );
        }

        const x2 = getCoord(d.to.x);
        const y2 = getCoord(d.to.y);
        const strokeColor = d.danger ? "#ef4444" : (isAsteroid ? "#ffaa00" : "#00f0ff");
        const shadowColor = d.danger ? "#ef4444" : (isAsteroid ? "#f59e0b" : "#00f0ff");
        const rad = 22; // Radius for asteroid diamond marker

        return (
          <g key={`wave-${d.entityId}-${idx}`} style={{ filter: `drop-shadow(0 0 12px ${shadowColor})` }}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth={isAsteroid ? "5" : "6"}
              strokeDasharray={isAsteroid ? "8 6" : "12 8"}
            />
            {isAsteroid ? (
              <polygon
                points={`${x2},${y2 - rad} ${x2 + rad},${y2} ${x2},${y2 + rad} ${x2 - rad},${y2}`}
                fill={d.danger ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 170, 0, 0.4)"}
                stroke={d.danger ? "#ef4444" : "#ffaa00"}
                strokeWidth="5"
              />
            ) : (
              <circle
                cx={x2}
                cy={y2}
                r="20"
                fill={d.danger ? "rgba(239, 68, 68, 0.4)" : "rgba(0, 255, 102, 0.4)"}
                stroke={d.danger ? "#ef4444" : "#00ff66"}
                strokeWidth="5"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
