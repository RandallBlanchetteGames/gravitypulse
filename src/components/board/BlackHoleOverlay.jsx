/* ==========================================================================
   GRAVITY PULSE 2026 - BLACK HOLE SINGULARITY ACCRETION OVERLAY
   ========================================================================== */

import React from 'react';

export function BlackHoleOverlay({ boardSize }) {
  const is18 = boardSize === 18;

  return (
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
        fontSize: is18 ? '0.6rem' : '0.75rem',
        fontWeight: 900,
        color: 'var(--accent-gold)',
        letterSpacing: '0.1em',
        textShadow: '0 0 10px #000, 0 0 20px var(--accent-plasma)',
        zIndex: 5
      }}>
        CORE
      </span>
    </div>
  );
}
