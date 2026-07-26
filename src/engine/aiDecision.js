/* ==========================================================================
   GRAVITY PULSE 2026 - LIGHTWEIGHT & SNAPPY HEURISTIC AI (<50ms)
   Zero minimax search trees. Instant casual decision resolution.
   ========================================================================== */

import { ENTITY_TYPES, TURN_ACTIONS, DIRECTIONS } from './types.js';
import { getChebyshevDistance, isBlackHole, getRegionCoords, getRegionCenter } from './boardGeometry.js';
import { previewTrajectory } from './movementResolver.js';

/* Get AI Setup or Respawn Placement (pick a safe region center or edge cell) */
export function getAIPlacement(board, playerId, rules) {
  const size = rules.getBoardSize();
  const regionCount = rules.getRegionCount();

  // Try to pick a region center that is unoccupied
  const safeRegions = [];
  for (let ry = 0; ry < regionCount; ry++) {
    for (let rx = 0; rx < regionCount; rx++) {
      const center = getRegionCenter(rx, ry);
      if (!isBlackHole(center.x, center.y, size) && !board.some(e => e.x === center.x && e.y === center.y)) {
        safeRegions.push(center);
      }
    }
  }

  if (safeRegions.length > 0) {
    const randIdx = Math.floor(Math.random() * safeRegions.length);
    return safeRegions[randIdx];
  }

  // Fallback: pick any safe unoccupied cell
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (!isBlackHole(x, y, size) && !board.some(e => e.x === x && e.y === y)) {
        return { x, y };
      }
    }
  }

  return { x: 0, y: 0 };
}

/* Get snappy AI action choice (<50ms evaluation) */
export function getAITurnDecision(board, playerId, rules) {
  const legalActions = rules.getLegalActions({ usedActions: {} }); // We will pass actual player object in App
  const myPiece = board.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === playerId);
  
  if (!myPiece || legalActions.length === 0) {
    return { actionId: TURN_ACTIONS.MOVE_1, direction: DIRECTIONS.UP };
  }

  const size = rules.getBoardSize();
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;

  // Evaluate each legal action and pick the highest heuristic score
  let bestScore = -9999;
  let bestDecision = { actionId: legalActions[0].id, direction: DIRECTIONS.RIGHT };

  const possibleDirs = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];

  legalActions.forEach(action => {
    if (action.special) {
      // Score Gravity or Pulse
      let score = 0;
      const others = board.filter(e => e.type === ENTITY_TYPES.CUBE && e.playerId !== playerId);
      if (others.length === 0) return;

      if (action.id === TURN_ACTIONS.GRAVITY) {
        // Good if others are near edges or asteroids
        score += others.length * 10;
        if (myPiece.isSupercharged) score += 25;
      } else if (action.id === TURN_ACTIONS.PULSE) {
        // Good if others are crowded near us
        const closeCount = others.filter(o => getChebyshevDistance(myPiece.x, myPiece.y, o.x, o.y) <= 2).length;
        score += closeCount * 30;
        if (myPiece.isSupercharged) score += 25;
      }

      if (score > bestScore) {
        bestScore = score;
        bestDecision = { actionId: action.id, direction: null };
      }
    } else {
      // Evaluate directional moves
      possibleDirs.forEach(dir => {
        const path = previewTrajectory(board, playerId, action.id, dir, rules);
        if (path.length === 0) return;
        
        const dest = path[path.length - 1];
        let score = 0;

        // Penalty if moving off board
        if (dest.x < 0 || dest.x >= size || dest.y < 0 || dest.y >= size) {
          score -= 1000;
        } else if (isBlackHole(dest.x, dest.y, size)) {
          // Bonus if entering black hole for supercharge!
          score += myPiece.isSupercharged ? 50 : 150;
        } else {
          // Score proximity to center (stay safe from edges)
          const distToCenter = getChebyshevDistance(dest.x, dest.y, cx, cy);
          score -= distToCenter * 5;

          // Bonus if landing on energy token
          if (board.some(e => e.type === ENTITY_TYPES.ENERGY && e.x === dest.x && e.y === dest.y)) {
            score += 100;
          }

          // Penalty if landing on asteroid
          if (board.some(e => e.type === ENTITY_TYPES.ASTEROID && e.x === dest.x && e.y === dest.y)) {
            score -= 500;
          }
        }

        // Add small random fuzz for casual variety
        score += Math.random() * 8;

        if (score > bestScore) {
          bestScore = score;
          bestDecision = { actionId: action.id, direction: dir };
        }
      });
    }
  });

  return bestDecision;
}
