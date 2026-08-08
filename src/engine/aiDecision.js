/* ==========================================================================
   GRAVITY PULSE 2026 - LIGHTWEIGHT & SNAPPY HEURISTIC AI (<50ms)
   Zero minimax search trees. Instant casual decision resolution.
   ========================================================================== */

import { ENTITY_TYPES, TURN_ACTIONS, DIRECTIONS } from './types.js';
import { getChebyshevDistance, isBlackHole, getRegionCoords, getRegionCenter } from './boardGeometry.js';
import { previewTrajectory } from './movementResolver.js';
import { executeGravity, executePulse } from './gravityPulse.js';

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
export function getAITurnDecision(board, player, rules) {
  const playerId = player.id;
  const legalActions = rules.getLegalActions(player); // Only evaluate actions the AI actually has left this round
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
      // Score Gravity or Pulse by SIMULATING the result (Pre-Cognition)
      let score = 0;
      const others = board.filter(e => e.type === ENTITY_TYPES.CUBE && e.playerId !== playerId);
      if (others.length === 0) return;

      const isSimulation = true;
      const simResult = action.id === TURN_ACTIONS.GRAVITY 
        ? executeGravity(board, playerId, rules, isSimulation)
        : executePulse(board, playerId, rules, isSimulation);

      // Check if this action caused the AI to die (Suicide Prevention)
      const amIAlive = simResult.finalBoard.some(e => e.type === ENTITY_TYPES.CUBE && e.playerId === playerId);
      if (!amIAlive) {
        score -= 5000; // NEVER DO THIS
      } else {
        // Count actual opponents destroyed by this action
        const endingOthers = simResult.finalBoard.filter(e => e.type === ENTITY_TYPES.CUBE && e.playerId !== playerId).length;
        const kills = others.length - endingOthers;
        score += kills * 500;
        
        // Minor board control bonuses if no kills
        if (kills === 0) {
          if (action.id === TURN_ACTIONS.GRAVITY) score += 20;
          if (action.id === TURN_ACTIONS.PULSE) score += 15;
        }
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
        
        let dest = path[path.length - 1];
        
        // Find the ACTUAL destination by checking for hazards/collisions along the path
        for (let i = 0; i < path.length; i++) {
          const step = path[i];
          if (step.x < 0 || step.x >= size || step.y < 0 || step.y >= size) {
            dest = step; break;
          }
          if (isBlackHole(step.x, step.y, size)) {
            dest = step; break;
          }
          if (board.some(e => (e.type === ENTITY_TYPES.ASTEROID || (e.type === ENTITY_TYPES.CUBE && e.playerId !== playerId)) && e.x === step.x && e.y === step.y)) {
            dest = step; break;
          }
        }

        let score = 0;

        // Penalty if moving off board
        if (dest.x < 0 || dest.x >= size || dest.y < 0 || dest.y >= size) {
          score -= 1000;
        } else if (isBlackHole(dest.x, dest.y, size)) {
          // Penalty for entering black hole (destruction!)
          score -= 1000;
        } else {
          // 1. The Goldilocks Zone (Midpoint between Black Hole and Edge)
          const distToCenter = getChebyshevDistance(dest.x, dest.y, cx, cy);
          
          if (distToCenter <= 1) {
            // Event Horizon: Extremely dangerous!
            score -= 150;
          } else if (distToCenter === 2 || distToCenter === 3) {
            // Goldilocks Zone: Safe orbit, good board control
            score += 50;
          } else {
            // Edge of the board: Minor penalty to avoid falling off
            score -= 20;
          }

          // 2. Energy Field Tactics
          const destHasEnergy = board.some(e => e.type === ENTITY_TYPES.ENERGY && e.x === dest.x && e.y === dest.y);
          if (destHasEnergy) {
            if (myPiece.isSupercharged) {
              // Danger: Overload! Avoid picking up a second energy field.
              score -= 200;
            } else {
              // Excellent: Become Supercharged!
              score += 250;
            }
          }

          // 3. Asteroid Avoidance
          if (board.some(e => e.type === ENTITY_TYPES.ASTEROID && e.x === dest.x && e.y === dest.y)) {
            score -= 500;
          }

          // 4. Combat & Kamikaze Tactics
          const enemyTarget = board.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId !== playerId && e.x === dest.x && e.y === dest.y);
          if (enemyTarget) {
            if (myPiece.isSupercharged && !enemyTarget.isSupercharged) {
              // Supercharged AI values its life too much to suicide on a weak target
              score -= 300;
            } else {
              // Normal AI, or fighting a Supercharged enemy: Kamikaze is worth it! (+1 Point)
              score += 150;
            }
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
