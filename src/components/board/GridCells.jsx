/* ==========================================================================
   GRAVITY PULSE 2026 - GRID CELLS & REGIONAL TOUCH HITBOXES
   ========================================================================== */

import React from 'react';
import { getRegionCoords, getRegionCenter, isBlackHole } from '../../engine/boardGeometry.js';
import { PHASES } from '../../engine/types.js';
import { soundEngine } from '../../audio/soundEngine.js';

export function GridCells({ boardSize, phase, onCellClick, previewTrajectory = [] }) {
  const cells = [];
  const isPlacementPhase = phase === PHASES.SETUP || phase === PHASES.RESPAWN;

  // Build lookup map for trajectory preview highlights
  const trajMap = new Map();
  previewTrajectory.forEach((pt, idx) => {
    trajMap.set(`${pt.x},${pt.y}`, idx + 1);
  });

  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const isBH = isBlackHole(x, y, boardSize);
      const isTraj = trajMap.has(`${x},${y}`);
      const stepNum = trajMap.get(`${x},${y}`);

      // Subtle regional grid boundary borders (thick line every 3 cells)
      const borderRight = (x + 1) % 3 === 0 && x < boardSize - 1 ? '2px solid rgba(0, 240, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.04)';
      const borderBottom = (y + 1) % 3 === 0 && y < boardSize - 1 ? '2px solid rgba(0, 240, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.04)';

      const handleClick = () => {
        if (isBH) return;
        soundEngine.playClick();
        if (isPlacementPhase) {
          // In casual setup/respawn, tap anywhere in region to select region center!
          const { rx, ry } = getRegionCoords(x, y);
          const center = getRegionCenter(rx, ry);
          if (!isBlackHole(center.x, center.y, boardSize)) {
            onCellClick(center.x, center.y);
          } else {
            onCellClick(x, y); // fallback if center is BH
          }
        } else {
          onCellClick(x, y);
        }
      };

      cells.push(
        <div
          key={`${x}-${y}`}
          onClick={handleClick}
          className={`grid-cell ${isTraj ? 'cell-highlight' : ''}`}
          style={{
            borderRight,
            borderBottom,
            cursor: isPlacementPhase && !isBH ? 'pointer' : 'default',
            background: isTraj ? 'rgba(0, 255, 102, 0.18)' : (isPlacementPhase && !isBH ? 'rgba(0, 240, 255, 0.02)' : 'transparent')
          }}
        >
          {isTraj && (
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'var(--accent-supercharge)',
              background: 'rgba(0,0,0,0.6)',
              padding: '2px 5px',
              borderRadius: '4px',
              border: '1px solid var(--accent-supercharge)'
            }}>
              {stepNum}
            </span>
          )}
        </div>
      );
    }
  }

  return <>{cells}</>;
}
