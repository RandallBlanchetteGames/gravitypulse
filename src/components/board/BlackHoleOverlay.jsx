/* ==========================================================================
   GRAVITY PULSE 2026 - BLACK HOLE SINGULARITY ACCRETION OVERLAY
   ========================================================================== */

import React from 'react';

export function BlackHoleOverlay({ boardSize }) {
  const is18 = boardSize === 18;

  return (
    <>
      {/* Zone 2: Accretion Field (Moderate Gravity, 6x6 area in center) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${(6 / boardSize) * 100}%`,
        height: `${(6 / boardSize) * 100}%`,
        background: 'rgba(157, 78, 221, 0.05)',
        boxShadow: 'inset 0 0 25px rgba(157, 78, 221, 0.22), 0 0 15px rgba(157, 78, 221, 0.1)',
        border: '1px solid rgba(157, 78, 221, 0.35)',
        borderRadius: is18 ? '22px' : '28px',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* Zone 1: Event Horizon (Extreme Gravity, 4x4 area in center) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${(4 / boardSize) * 100}%`,
        height: `${(4 / boardSize) * 100}%`,
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, rgba(239, 68, 68, 0.08) 100%)',
        boxShadow: 'inset 0 0 20px rgba(239, 68, 68, 0.35)',
        border: '1px solid rgba(239, 68, 68, 0.45)',
        borderRadius: is18 ? '16px' : '22px',
        pointerEvents: 'none',
        zIndex: 3
      }} />

      {/* Center Singularity Core (2x2 area in center) */}
      <div className={`black-hole-core ${is18 ? 'size-18' : ''}`}>
        <div className="accretion-ring" />
        <div className="accretion-ring-outer" />
        <div style={{
          position: 'absolute',
          width: '55%',
          height: '55%',
          background: 'radial-gradient(circle, #000 30%, rgba(139, 92, 246, 0.8) 70%, transparent 100%)',
          borderRadius: '50%',
          boxShadow: 'inset 0 0 20px #000, 0 0 15px var(--accent-gold)'
        }} />
        <span style={{
          fontSize: is18 ? '0.55rem' : '0.68rem',
          fontWeight: 900,
          color: 'var(--accent-gold)',
          letterSpacing: '0.05em',
          textShadow: '0 0 10px #000, 0 0 20px var(--accent-plasma)',
          zIndex: 5,
          textAlign: 'center',
          lineHeight: 1.1
        }}>
          BLACK<br />HOLE
        </span>
      </div>
    </>
  );
}
