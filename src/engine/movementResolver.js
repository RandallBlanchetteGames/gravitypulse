/* ==========================================================================
   GRAVITY PULSE 2026 - STEP-BY-STEP MOVEMENT RESOLVER & PREVIEW
   ========================================================================== */

import { TURN_ACTIONS, MOVEMENT_STYLES, ENTITY_TYPES } from './types.js';
import { resolveCellCollisions } from './collision.js';
import { getRegionCoords } from './boardGeometry.js';
import { soundEngine } from '../audio/soundEngine.js';

/* Execute movement action step-by-step emitting snappy sequence frames */
export function executeMove(board, playerId, actionId, chosenDirection, rules) {
  let currentBoard = board.map(e => ({ ...e }));
  const playerPiece = currentBoard.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === playerId);
  
  if (!playerPiece) {
    return { sequence: [currentBoard], finalBoard: currentBoard, respawnQueue: [], logs: [`Player ${playerId} has no active piece on board!`] };
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

    sequence.push(currentBoard.map(e => ({ ...e })));

    // If player piece was destroyed during this step, break early!
    if (!currentBoard.some(e => e.id === playerPiece.id)) {
      break;
    }
  }

  return { sequence, finalBoard: currentBoard, respawnQueue: allRespawns, logs };
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
