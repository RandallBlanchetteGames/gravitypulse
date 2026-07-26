/* ==========================================================================
   GRAVITY PULSE 2026 - STEP-BY-STEP MOVEMENT RESOLVER & WAVE PREVIEW
   ========================================================================== */

import { TURN_ACTIONS, MOVEMENT_STYLES, ENTITY_TYPES } from './types.js';
import { resolveCellCollisions } from './collision.js';
import { getRegionCoords, getChebyshevDistance, isBlackHole } from './boardGeometry.js';
import { getStepVector } from './gravityPulse.js';
import { soundEngine } from '../audio/soundEngine.js';

/* Execute movement action step-by-step emitting snappy sequence frames */
export function executeMove(board, playerId, actionId, chosenDirection, rules) {
  let currentBoard = board.map(e => ({ ...e }));
  const playerPiece = currentBoard.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === playerId);
  
  if (!playerPiece) {
    return { sequence: [currentBoard], finalBoard: currentBoard, respawnQueue: [], logs: [`Player ${playerId} has no active piece on board!`], effects: [] };
  }

  const steps = actionId === TURN_ACTIONS.MOVE_3 ? 3 : (actionId === TURN_ACTIONS.MOVE_2 ? 2 : 1);
  let moveDir = chosenDirection;

  // If Regional Direction Locked, override direction with region vector
  if (rules.movementStyle.id === MOVEMENT_STYLES.REGIONAL_LOCKED.id) {
    const { rx, ry } = getRegionCoords(playerPiece.x, playerPiece.y);
    moveDir = rules.getRegionalDirection(rx, ry);
  }

  const sequence = [];
  const logs = [`Player ${playerId} moves ${steps} step(s) ${moveDir.label || ''}.`];
  let allRespawns = [];
  let allEffects = [];

  soundEngine.playMove();

  for (let s = 1; s <= steps; s++) {
    // Step forward 1 space
    playerPiece.x += moveDir.x;
    playerPiece.y += moveDir.y;

    // Resolve collisions at this intermediate step
    const result = resolveCellCollisions(currentBoard, rules.getBoardSize(), logs);
    currentBoard = result.finalBoard;
    if (result.respawnQueue.length > 0) {
      allRespawns.push(...result.respawnQueue);
    }
    if (result.effects && result.effects.length > 0) {
      allEffects.push(...result.effects);
    }

    sequence.push(currentBoard.map(e => ({ ...e })));

    // If player piece was destroyed during this step, break early!
    if (!currentBoard.some(e => e.id === playerPiece.id)) {
      break;
    }
  }

  return { sequence, finalBoard: currentBoard, respawnQueue: allRespawns, logs, effects: allEffects };
}

/* Calculate hover trajectory points for SVG UI rendering */
export function previewTrajectory(board, playerId, actionId, chosenDirection, rules) {
  const playerPiece = board.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === playerId);
  if (!playerPiece) return [];

  const steps = actionId === TURN_ACTIONS.MOVE_3 ? 3 : (actionId === TURN_ACTIONS.MOVE_2 ? 2 : 1);
  let moveDir = chosenDirection;

  if (rules.movementStyle.id === MOVEMENT_STYLES.REGIONAL_LOCKED.id) {
    const { rx, ry } = getRegionCoords(playerPiece.x, playerPiece.y);
    moveDir = rules.getRegionalDirection(rx, ry);
  }

  if (!moveDir) return [];

  const path = [];
  let currX = playerPiece.x;
  let currY = playerPiece.y;
  for (let s = 1; s <= steps; s++) {
    currX += moveDir.x;
    currY += moveDir.y;
    path.push({ x: currX, y: currY, step: s });
  }
  return path;
}

/* Calculate Option A Wave Displacement Vectors for all affected opponents */
export function previewWaveDisplacements(board, playerId, actionId, rules) {
  if (actionId !== TURN_ACTIONS.GRAVITY && actionId !== TURN_ACTIONS.PULSE) return [];
  const activeCube = board.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === playerId);
  if (!activeCube) return [];

  const power = activeCube.isSupercharged ? 2 : 1;
  const size = rules.getBoardSize();
  const displacements = [];

  const otherCubes = board.filter(e => e.type === ENTITY_TYPES.CUBE && e.id !== activeCube.id);

  otherCubes.forEach(target => {
    const d = getChebyshevDistance(target.x, target.y, activeCube.x, activeCube.y);
    const maxSteps = d <= 2 ? power : (d <= 4 ? 1 : 0);
    if (maxSteps === 0) return; // Unaffected at distance >= 5

    let destX = target.x;
    let destY = target.y;

    for (let s = 1; s <= maxSteps; s++) {
      if (actionId === TURN_ACTIONS.GRAVITY) {
        const vec = getStepVector(destX, destY, activeCube.x, activeCube.y);
        destX += vec.x;
        destY += vec.y;
      } else {
        const vec = getStepVector(activeCube.x, activeCube.y, destX, destY);
        if (vec.x === 0 && vec.y === 0) {
          destX += 1;
          destY += 1;
        } else {
          destX += vec.x;
          destY += vec.y;
        }
      }
    }

    const isOff = destX < 0 || destX >= size || destY < 0 || destY >= size;
    const isBH = !isOff && isBlackHole(destX, destY, size);
    const isAsteroid = !isOff && board.some(e => e.type === ENTITY_TYPES.ASTEROID && e.x === destX && e.y === destY);
    const danger = isOff || isBH || isAsteroid;

    displacements.push({
      entityId: target.id,
      playerId: target.playerId,
      from: { x: target.x, y: target.y },
      to: { x: destX, y: destY },
      type: actionId === TURN_ACTIONS.GRAVITY ? 'PULL' : 'PUSH',
      danger
    });
  });

  return displacements;
}
