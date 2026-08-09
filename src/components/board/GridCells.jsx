/* ==========================================================================
   GRAVITY PULSE 2026 - GRID CELLS, GRAVITY ZONES & REGIONAL HITBOXES
   ========================================================================== */

import React from 'react';
import { isBlackHole } from '../../engine/boardGeometry.js';
import { PHASES } from '../../engine/types.js';
import { soundEngine } from '../../audio/soundEngine.js';

const SingleCell = React.memo(({ x, y, boardSize, phase, isTraj, stepNum, onClick, isValidSpawn }) => {
  const isPlacementPhase = phase === PHASES.SETUP || phase === PHASES.RESPAWN;
  const cx = (boardSize - 1) / 2;
  const cy = (boardSize - 1) / 2;
  const isBH = isBlackHole(x, y, boardSize);

  // Calculate distance from Singularity center for concentric gravity zones
  const dist = Math.max(Math.abs(x - cx) - 0.5, Math.abs(y - cy) - 0.5);
  let tooltip = "OUTER SECTOR (Zone 3): Outer space. On Turn 4, pieces here are pulled 1 space inward towards the Black Hole.";
  
  if (!isBH) {
    if (dist <= 1) {
      tooltip = "EVENT HORIZON: Pieces here are pulled into the Black Hole on Turn 4.";
    } else if (dist <= 2) {
      tooltip = "ACCRETION FIELD: Pieces here are pulled 1 space inward on Turn 4.";
    }
  } else {
    tooltip = "BLACK HOLE SINGULARITY: Absolute void. Entering destroys the piece immediately.";
  }

  // Subtle regional grid boundary borders (thick line every 3 cells)
  const isRightNeon = (x + 1) % 3 === 0 && x < boardSize - 1;
  const isBottomNeon = (y + 1) % 3 === 0 && y < boardSize - 1;
  let neonClass = '';
  if (isRightNeon && isBottomNeon) neonClass = 'border-right-bottom-neon';
  else if (isRightNeon) neonClass = 'border-right-neon';
  else if (isBottomNeon) neonClass = 'border-bottom-neon';

  const interactiveClass = (isPlacementPhase && !isBH) ? 'cell-interactive' : '';

  let spawnHighlightClass = '';
  if (isPlacementPhase) {
    if (isValidSpawn) {
      spawnHighlightClass = 'cell-spawn-valid';
    } else {
      spawnHighlightClass = 'cell-spawn-invalid';
    }
  }

  // Round only the 4 outer corners of the board itself
  let borderTopLeftRadius = 0;
  let borderTopRightRadius = 0;
  let borderBottomLeftRadius = 0;
  let borderBottomRightRadius = 0;

  if (x === 0 && y === 0) borderTopLeftRadius = '18px';
  if (x === boardSize - 1 && y === 0) borderTopRightRadius = '18px';
  if (x === 0 && y === boardSize - 1) borderBottomLeftRadius = '18px';
  if (x === boardSize - 1 && y === boardSize - 1) borderBottomRightRadius = '18px';

  const handleClick = () => {
    if (isBH) return;
    soundEngine.playClick();
    onClick(x, y);
  };

  return (
    <div
      onClick={handleClick}
      title={tooltip}
      className={`grid-cell ${isTraj ? 'cell-highlight' : ''} ${neonClass} ${interactiveClass} ${spawnHighlightClass}`.trim()}
      style={{
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomLeftRadius,
        borderBottomRightRadius,
        overflow: (borderTopLeftRadius || borderTopRightRadius || borderBottomLeftRadius || borderBottomRightRadius) ? 'hidden' : 'visible',
        cursor: (isPlacementPhase && isValidSpawn && !isBH) ? 'pointer' : 'default',
        background: isTraj ? 'rgba(0, 255, 102, 0.18)' : (isPlacementPhase && !isBH && !spawnHighlightClass ? 'rgba(0, 240, 255, 0.02)' : '')
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
});

export const GridCells = React.memo(function GridCells({ boardSize, phase, onCellClick, previewTrajectory = [], validSpawnCells = new Set() }) {
  const cells = [];

  // Build lookup map for trajectory preview highlights
  const trajMap = new Map();
  previewTrajectory.forEach((pt, idx) => {
    trajMap.set(`${pt.x},${pt.y}`, idx + 1);
  });

  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const isTraj = trajMap.has(`${x},${y}`);
      const stepNum = trajMap.get(`${x},${y}`);

      cells.push(
        <SingleCell 
          key={`${x}-${y}`}
          x={x}
          y={y}
          boardSize={boardSize}
          phase={phase}
          isTraj={isTraj}
          stepNum={stepNum}
          onClick={onCellClick}
          isValidSpawn={validSpawnCells.has(`${x},${y}`)}
        />
      );
    }
  }

  return <>{cells}</>;
});
