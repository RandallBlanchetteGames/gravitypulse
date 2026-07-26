/* ==========================================================================
   GRAVITY PULSE 2026 - GPU-ACCELERATED RADIAL WAVE AURA LAYER
   ========================================================================== */

import React from 'react';

export function WaveAuraLayer({ boardSize, activePos, waveType }) {
  if (!activePos || !waveType) return null;

  const left = `${((activePos.x + 0.5) / boardSize) * 100}%`;
  const top = `${((activePos.y + 0.5) / boardSize) * 100}%`;

  const isPulse = waveType === 'PUSH';

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 18,
      overflow: 'visible'
    }}>
      <div
        key={`${waveType}-${Date.now()}`}
        className={isPulse ? 'wave-aura-pulse' : 'wave-aura-gravity'}
        style={{
          position: 'absolute',
          left,
          top,
          width: '35%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
