/* ==========================================================================
   GRAVITY PULSE 2026 - BLACK HOLE SINGULARITY ACCRETION OVERLAY
   ========================================================================== */

import React from 'react';
import { PHASES } from '../../engine/types.js';
import { Play } from 'lucide-react';

export function BlackHoleOverlay({ boardSize, phase, onStartNewGame }) {
  const is18 = boardSize === 18;
  const showButton = phase === PHASES.SETUP || phase === PHASES.GAME_OVER;

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
        borderRadius: '50%',
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
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 3
      }} />

      {/* Center Singularity Core (2x2 area in center) */}
      <div className={`black-hole-core ${is18 ? 'size-18' : ''}`} style={{ pointerEvents: showButton ? 'auto' : 'none' }}>
        <div className="bh-accretion-disk-2" />
        <div className="bh-accretion-disk-1" />
        <div className="bh-event-horizon" />
        
        <div style={{ zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {showButton && (
            <button 
              onClick={onStartNewGame}
              className="neon-btn" 
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              <Play size={14} /> Start Game
            </button>
          )}
          <span className="bh-text" style={{ fontSize: is18 ? '0.55rem' : '0.68rem' }}>
            BLACK<br />HOLE
          </span>
        </div>
      </div>
    </>
  );
}
