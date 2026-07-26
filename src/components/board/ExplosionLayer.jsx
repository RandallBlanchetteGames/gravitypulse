/* ==========================================================================
   GRAVITY PULSE 2026 - EXPLOSION & PARTICLE EFFECT LAYER
   ========================================================================== */

import React from 'react';

export function ExplosionLayer({ explosions = [], boardSize }) {
  if (explosions.length === 0) return null;

  return (
    <div className="entity-layer" style={{ zIndex: 40 }}>
      {explosions.map(exp => {
        const xPct = exp.x * 100;
        const yPct = exp.y * 100;

        return (
          <div
            key={exp.id}
            className="game-piece anim-pop"
            style={{
              transform: `translate3d(${xPct}%, ${yPct}%, 0)`,
              background: 'radial-gradient(circle, #ff007f 0%, #f59e0b 60%, transparent 100%)',
              border: 'none',
              boxShadow: '0 0 30px #ff007f',
              pointerEvents: 'none'
            }}
          >
            💥
          </div>
        );
      })}
    </div>
  );
}
