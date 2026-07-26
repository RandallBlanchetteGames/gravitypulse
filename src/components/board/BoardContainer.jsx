/* ==========================================================================
   GRAVITY PULSE 2026 - BOARD CONTAINER COMPONENT
   ========================================================================== */

import React from 'react';

export function BoardContainer({ size, children }) {
  return (
    <div className="board-container" style={{
      gridTemplateColumns: `repeat(${size}, 1fr)`,
      gridTemplateRows: `repeat(${size}, 1fr)`,
      '--grid-cols': size,
      '--grid-rows': size
    }}>
      {children}
    </div>
  );
}
