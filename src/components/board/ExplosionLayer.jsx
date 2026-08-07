/* ==========================================================================
   GRAVITY PULSE 2026 - MULTI-EFFECT VISUAL PARTICLE LAYER
   ========================================================================== */

import React from 'react';

export function ExplosionLayer({ explosions = [], boardSize }) {
  if (!explosions || explosions.length === 0) return null;

  return (
    <div className="entity-layer" style={{ zIndex: 40 }}>
      {explosions.map(exp => {
        const xPct = exp.x * 100;
        const yPct = exp.y * 100;

        let animClass = "effect-collision";
        let bg = "radial-gradient(circle, #ff007f 0%, #f59e0b 60%, transparent 100%)";
        let shadow = "0 0 30px #ff007f";

        if (exp.type === 'SUPERCHARGE') {
          animClass = "effect-supercharge";
          bg = "radial-gradient(circle, #00ff66 0%, #00f0ff 70%, transparent 100%)";
          shadow = "0 0 35px #00ff66";
        } else if (exp.type === 'OVERLOAD') {
          animClass = "effect-overload";
          bg = "radial-gradient(circle, #ffffff 0%, #f59e0b 50%, #ef4444 100%)";
          shadow = "0 0 45px #ffffff, 0 0 60px #ef4444";
        } else if (exp.type === 'IMPLOSION') {
          animClass = "effect-implosion";
          bg = "radial-gradient(circle, #000000 0%, #9d4edd 70%, transparent 100%)";
          shadow = "0 0 40px #9d4edd, inset 0 0 15px #000";
        } else if (exp.type === 'SPAWN') {
          animClass = "effect-spawn";
          bg = "radial-gradient(circle, #00f0ff 0%, #0055ff 70%, transparent 100%)";
          shadow = "0 0 35px #00f0ff";
        }

        return (
          <div
            key={exp.id || Math.random()}
            className="cell-wrapper"
            style={{
              transform: `translate3d(${xPct}%, ${yPct}%, 0)`,
              zIndex: 40
            }}
          >
            <div
              className={`game-piece ${animClass}`}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: bg,
                border: 'none',
                boxShadow: shadow,
                pointerEvents: 'none'
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
