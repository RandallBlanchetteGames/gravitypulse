/* ==========================================================================
   GRAVITY PULSE 2026 - LIGHTWEIGHT & SNAPPY HEURISTIC AI (<50ms)
   Zero minimax search trees. Instant casual decision resolution.
   ========================================================================== */

import { ENTITY_TYPES, TURN_ACTIONS, DIRECTIONS, AI_DIFFICULTY } from './types.js';
import { getChebyshevDistance, isBlackHole, getRegionCoords, getRegionCenter } from './boardGeometry.js';
import { previewTrajectory } from './movementResolver.js';
import { executeGravity, executePulse, executeBlackHoleSuction } from './gravityPulse.js';
import { executeOrbitalMovement } from './orbitalMovement.js';

/* Get AI Setup or Respawn Placement (pick a safe region center or edge cell) */
export function getAIPlacement(board, playerId, rules) {
  const size = rules.getBoardSize();
  const validCells = [];
  
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const validation = rules.validateSpawnLocation(x, y, board);
      if (validation.valid) {
        const centerDist = getChebyshevDistance(x, y, size / 2, size / 2);
        
        // Prefer goldilocks zone (distance 3 to 4 from center), avoid edges, avoid event horizon
        let score = 10;
        if (centerDist < 2) score -= 100; // In Black Hole!
        else if (centerDist === 2) score -= 5; // On Event Horizon
        else if (centerDist >= 3 && centerDist <= 4) score += 20; // Goldilocks
        if (x === 0 || x === size - 1 || y === 0 || y === size - 1) score -= 10; // Avoid literal edges
        
        validCells.push({ x, y, score });
      }
    }
  }

  if (validCells.length === 0) return { x: 0, y: 0 };
  
  // Sort by highest score
  validCells.sort((a, b) => b.score - a.score);
  
  // Pick one of the top 3 spots randomly to avoid predictable spawns
  const topN = Math.min(3, validCells.length);
  return validCells[Math.floor(Math.random() * topN)];
}

/* Get snappy AI action choice (<50ms evaluation) */
export function getAITurnDecision(board, player, rules, players = [], turnInRound = 1) {
  const playerId = player.id;
  const legalActions = rules.getLegalActions(player); // Only evaluate actions the AI actually has left this round
  const myPiece = board.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === playerId);
  
  if (!myPiece || legalActions.length === 0) {
    return { actionId: TURN_ACTIONS.MOVE_1, direction: DIRECTIONS.UP };
  }

  const size = rules.getBoardSize();
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const difficulty = rules.aiDifficulty || AI_DIFFICULTY.STANDARD.id;
  const isHardMode = difficulty === AI_DIFFICULTY.HARD.id;

  // Evaluate each legal action and pick the highest heuristic score
  let bestScore = -99999;
  let bestDecision = { actionId: legalActions[0].id, direction: DIRECTIONS.RIGHT };

  const possibleDirs = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];

  // Helper to find opponent remaining actions
  const getOpponent = (id) => players.find(p => p.id === id);

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
        let collidedEntity = null;
        
        // Find the ACTUAL destination by checking for hazards/collisions along the path
        for (let i = 0; i < path.length; i++) {
          const step = path[i];
          if (step.x < 0 || step.x >= size || step.y < 0 || step.y >= size) {
            dest = step; break;
          }
          if (isBlackHole(step.x, step.y, size)) {
            dest = step; break;
          }
          const collider = board.find(e => (e.type === ENTITY_TYPES.ASTEROID || (e.type === ENTITY_TYPES.CUBE && e.playerId !== playerId)) && e.x === step.x && e.y === step.y);
          if (collider) {
            dest = step; 
            collidedEntity = collider;
            break;
          }
        }

        let score = 0;

        // Base checks
        if (dest.x < 0 || dest.x >= size || dest.y < 0 || dest.y >= size) {
          score -= 1000;
        } else if (isBlackHole(dest.x, dest.y, size)) {
          score -= 1000;
        } else {
          // 1. The Goldilocks Zone (Midpoint between Black Hole and Edge)
          const distToCenter = getChebyshevDistance(dest.x, dest.y, cx, cy);
          if (distToCenter <= 1) score -= 150;
          else if (distToCenter === 2 || distToCenter === 3) score += 50;
          else score -= 20;

          // 2. Combat & Kamikaze Tactics (immediate collisions)
          if (collidedEntity && collidedEntity.type === ENTITY_TYPES.ASTEROID) {
            score -= 500;
          } else if (collidedEntity && collidedEntity.type === ENTITY_TYPES.CUBE) {
            if (myPiece.isSupercharged && !collidedEntity.isSupercharged) {
              score -= 300;
            } else {
              score += 150;
            }
          }

          // HARD MODE PREDICTIONS
          if (isHardMode && score > -500) { // Don't bother predicting if it's already a terrible move
            // Simulate destination board
            let futureBoard = board.map(e => {
              if (e.id === myPiece.id) return { ...e, x: dest.x, y: dest.y };
              return { ...e };
            });

            // Simulate Orbital Energy
            futureBoard = executeOrbitalMovement(futureBoard, size).finalBoard;
            
            // Simulate Black Hole if end of round
            if (turnInRound === 4) {
              futureBoard = executeBlackHoleSuction(futureBoard, rules).finalBoard;
            }

            // Verify survival
            const futureMe = futureBoard.find(e => e.id === myPiece.id);
            if (!futureMe) {
              // I got sucked into the black hole or crushed by an asteroid at the end of the turn!
              score -= 2000; 
            } else {
              // Check future energy pickup
              const futureEnergy = futureBoard.some(e => e.type === ENTITY_TYPES.ENERGY && e.x === futureMe.x && e.y === futureMe.y);
              if (futureEnergy) {
                if (myPiece.isSupercharged) score -= 200;
                else score += 250;
              }

              // Check opponent capabilities
              const opponents = futureBoard.filter(e => e.type === ENTITY_TYPES.CUBE && e.playerId !== playerId);
              opponents.forEach(oppPiece => {
                const oppState = getOpponent(oppPiece.playerId);
                if (oppState) {
                  const dist = getChebyshevDistance(futureMe.x, futureMe.y, oppPiece.x, oppPiece.y);
                  if (dist <= 2) {
                    if (!oppState.usedActions[TURN_ACTIONS.GRAVITY]) {
                      // High danger: can pull us
                      score -= 300;
                    }
                    if (!oppState.usedActions[TURN_ACTIONS.PULSE]) {
                      // Med danger: can push us
                      score -= 100;
                    }
                  }
                }
              });
            }
          } else if (!isHardMode && score > -500) {
            // Standard Mode Energy Field check (immediate, no prediction)
            const destHasEnergy = board.some(e => e.type === ENTITY_TYPES.ENERGY && e.x === dest.x && e.y === dest.y);
            if (destHasEnergy) {
              if (myPiece.isSupercharged) score -= 200;
              else score += 250;
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

  // KAMIKAZE FALLBACK
  // If the best move is terrible (e.g. going to die anyway), and we are in Hard mode,
  // we could try to just take someone down with us if we didn't already pick a Kamikaze action.
  // Actually, our loop naturally favors kamikaze (+150) over dying (-1000). 
  // So if death is inevitable (-2000), a kamikaze move that ALSO results in death would score 
  // -2000 + 150 = -1850, which is > -2000. So the AI will already naturally prioritize Kamikaze!

  return bestDecision;
}
