/* ==========================================================================
   GRAVITY PULSE 2026 - ORBITAL MOVEMENT ENGINE (ENERGY FIELDS)
   ========================================================================== */

import { ENTITY_TYPES } from './types.js';
import { resolveCellCollisions } from './collision.js';

/**
 * Executes orbital movement for all massless Cosmic Energy Fields on the board.
 * Each Energy Field rotates 1 space clockwise along its current square orbit ring (Chebyshev distance).
 *
 * @param {Array} board - Current board state
 * @param {number} boardSize - Size of the grid (e.g., 12 or 18)
 * @param {Array} logs - Array to push battle logs to
 * @returns {Object} { finalBoard, respawnQueue, logs, effects }
 */
export function executeOrbitalMovement(board, boardSize, logs = []) {
  let currentBoard = board.map(e => ({ ...e }));
  const cx = (boardSize - 1) / 2;
  const cy = (boardSize - 1) / 2;

  const energyFields = currentBoard.filter(e => e.type === ENTITY_TYPES.ENERGY);
  if (energyFields.length === 0) {
    return { finalBoard: currentBoard, respawnQueue: [], logs, effects: [] };
  }

  let moved = false;
  energyFields.forEach(field => {
    // Calculate Chebyshev distance (orbit ring radius around center)
    const r = Math.max(Math.abs(field.x - cx), Math.abs(field.y - cy));
    if (r === 0) return;

    const minX = cx - r;
    const maxX = cx + r;
    const minY = cy - r;
    const maxY = cy + r;

    // Step 1 space clockwise along perimeter of the current square orbit ring
    if (field.y === minY && field.x < maxX) {
      field.x += 1;
      moved = true;
    } else if (field.x === maxX && field.y < maxY) {
      field.y += 1;
      moved = true;
    } else if (field.y === maxY && field.x > minX) {
      field.x -= 1;
      moved = true;
    } else if (field.x === minX && field.y > minY) {
      field.y -= 1;
      moved = true;
    }
  });

  let allRespawns = [];
  let allEffects = [];
  let allStatsEvents = [];

  if (moved) {
    logs.push(`Cosmic Energy Fields rotate 1 cell clockwise along their orbital rings.`);
    const res = resolveCellCollisions(currentBoard, boardSize, logs);
    currentBoard = res.finalBoard;
    if (res.respawnQueue && res.respawnQueue.length > 0) {
      allRespawns.push(...res.respawnQueue);
    }
    if (res.effects && res.effects.length > 0) {
      allEffects.push(...res.effects);
    }
    if (res.statsEvents && res.statsEvents.length > 0) {
      allStatsEvents.push(...res.statsEvents);
    }
  }

  return { finalBoard: currentBoard, respawnQueue: allRespawns, logs, effects: allEffects, statsEvents: allStatsEvents };
}
