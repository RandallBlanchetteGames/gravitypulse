/* ==========================================================================
   GRAVITY PULSE 2026 - GRAVITY, PULSE, AND DISTANCE-BASED BLACK HOLE RESOLVERS
   ========================================================================== */

import { ENTITY_TYPES } from './types.js';
import { resolveCellCollisions } from './collision.js';
import { sortEntitiesByTieBreaker, getRegionCoords, getChebyshevDistance } from './boardGeometry.js';
import { soundEngine } from '../audio/soundEngine.js';

/* Helper to get normalized step vector (-1, 0, or 1) from (fromX, fromY) to (toX, toY) */
export function getStepVector(fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  return {
    x: dx === 0 ? 0 : (dx > 0 ? 1 : -1),
    y: dy === 0 ? 0 : (dy > 0 ? 1 : -1)
  };
}

/* Execute Gravity Wave: pull opponents toward active player with distance attenuation */
export function executeGravity(board, playerId, rules, isSimulation = false) {
  let currentBoard = board.map(e => ({ ...e }));
  const activeCube = currentBoard.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === playerId);
  
  if (!activeCube) {
    return { sequence: [currentBoard], finalBoard: currentBoard, respawnQueue: [], logs: [`Player ${playerId} cannot activate Gravity without a piece!`], effects: [] };
  }

  if (!isSimulation) {
    soundEngine.playGravityHum(false);
  }
  const power = activeCube.isSupercharged ? 2 : 1;
  const sequence = [];
  const powerText = activeCube.isSupercharged ? " (Supercharged)" : "";
  const logs = [`Player ${playerId} triggers Gravity Wave${powerText}!`];
  let allRespawns = [];
  let allEffects = [];
  let allStatsEvents = [];

  // Pre-calculate initial distance and max steps so wave attenuation is locked to start positions
  const initialMaxSteps = new Map();
  currentBoard.forEach(e => {
    if ((e.type === ENTITY_TYPES.CUBE || e.type === ENTITY_TYPES.ASTEROID) && e.id !== activeCube.id) {
      const d = getChebyshevDistance(e.x, e.y, activeCube.x, activeCube.y);
      const maxSteps = d <= 2 ? power : (d <= 4 ? 1 : 0);
      initialMaxSteps.set(e.id, maxSteps);
    }
  });

  for (let s = 1; s <= power; s++) {
    const targets = sortEntitiesByTieBreaker(
      currentBoard.filter(e => (e.type === ENTITY_TYPES.CUBE || e.type === ENTITY_TYPES.ASTEROID) && e.id !== activeCube.id),
      rules.getBoardSize()
    );

    targets.forEach(target => {
      const maxSteps = initialMaxSteps.get(target.id) || 0;
      if (s <= maxSteps) {
        const vec = getStepVector(target.x, target.y, activeCube.x, activeCube.y);
        target.x += vec.x;
        target.y += vec.y;
      }
    });

    const res = resolveCellCollisions(currentBoard, rules.getBoardSize(), logs, playerId);
    currentBoard = res.finalBoard;
    if (res.respawnQueue.length > 0) allRespawns.push(...res.respawnQueue);
    if (res.effects && res.effects.length > 0) allEffects.push(...res.effects);
    if (res.statsEvents && res.statsEvents.length > 0) allStatsEvents.push(...res.statsEvents);
    sequence.push(currentBoard.map(e => ({ ...e })));
  }

  return { sequence, finalBoard: currentBoard, respawnQueue: allRespawns, logs, effects: allEffects, statsEvents: allStatsEvents };
}

/* Execute Pulse Wave: push opponents away from active player with distance attenuation */
export function executePulse(board, playerId, rules, isSimulation = false) {
  let currentBoard = board.map(e => ({ ...e }));
  const activeCube = currentBoard.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === playerId);
  
  if (!activeCube) {
    return { sequence: [currentBoard], finalBoard: currentBoard, respawnQueue: [], logs: [`Player ${playerId} cannot activate Pulse without a piece!`], effects: [] };
  }

  if (!isSimulation) {
    soundEngine.playGravityHum(true);
  }
  const power = activeCube.isSupercharged ? 2 : 1;
  const sequence = [];
  const powerText = activeCube.isSupercharged ? " (Supercharged)" : "";
  const logs = [`Player ${playerId} triggers Pulse Wave${powerText}!`];
  let allRespawns = [];
  let allEffects = [];
  let allStatsEvents = [];

  // Pre-calculate initial distance and max steps so wave attenuation is locked to start positions
  const initialMaxSteps = new Map();
  currentBoard.forEach(e => {
    if ((e.type === ENTITY_TYPES.CUBE || e.type === ENTITY_TYPES.ASTEROID) && e.id !== activeCube.id) {
      const d = getChebyshevDistance(activeCube.x, activeCube.y, e.x, e.y);
      const maxSteps = d <= 2 ? power : (d <= 4 ? 1 : 0);
      initialMaxSteps.set(e.id, maxSteps);
    }
  });

  for (let s = 1; s <= power; s++) {
    const targets = sortEntitiesByTieBreaker(
      currentBoard.filter(e => (e.type === ENTITY_TYPES.CUBE || e.type === ENTITY_TYPES.ASTEROID) && e.id !== activeCube.id),
      rules.getBoardSize()
    );

    targets.forEach(target => {
      const maxSteps = initialMaxSteps.get(target.id) || 0;
      if (s <= maxSteps) {
        const vec = getStepVector(activeCube.x, activeCube.y, target.x, target.y);
        if (vec.x === 0 && vec.y === 0) {
          target.x += 1;
          target.y += 1;
        } else {
          target.x += vec.x;
          target.y += vec.y;
        }
      }
    });

    const res = resolveCellCollisions(currentBoard, rules.getBoardSize(), logs, playerId);
    currentBoard = res.finalBoard;
    if (res.respawnQueue.length > 0) allRespawns.push(...res.respawnQueue);
    if (res.effects && res.effects.length > 0) allEffects.push(...res.effects);
    if (res.statsEvents && res.statsEvents.length > 0) allStatsEvents.push(...res.statsEvents);
    sequence.push(currentBoard.map(e => ({ ...e })));
  }

  return { sequence, finalBoard: currentBoard, respawnQueue: allRespawns, logs, effects: allEffects, statsEvents: allStatsEvents };
}



/* Execute Black Hole Suction Phase: pull all players, asteroids, and energy fields on the map inward 1 space */
export function executeBlackHoleSuction(board, rules) {
  let currentBoard = board.map(e => ({ ...e }));
  const size = rules.getBoardSize();
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;

  const logs = [`Black Hole pulls mass inward and radiates energy outward.`];
  let allRespawns = [];
  let allEffects = [];
  let allStatsEvents = [];

  soundEngine.playGravityHum(true);

  const targets = sortEntitiesByTieBreaker(
    currentBoard.filter(e => e.type === ENTITY_TYPES.CUBE || e.type === ENTITY_TYPES.ASTEROID || e.type === ENTITY_TYPES.ENERGY),
    size
  );

  let moved = false;
  targets.forEach(entity => {
    const vec = getStepVector(entity.x, entity.y, cx, cy);
    if (vec.x !== 0 || vec.y !== 0) {
      if (entity.type === ENTITY_TYPES.ENERGY) {
        // Energy fields flow OUTWARD
        entity.x -= vec.x;
        entity.y -= vec.y;
      } else {
        // Mass (Players & Asteroids) is pulled INWARD
        entity.x += vec.x;
        entity.y += vec.y;
      }
      moved = true;
    }
  });

  if (moved) {
    const res = resolveCellCollisions(currentBoard, size, logs, null); // passing null since it's environmental
    currentBoard = res.finalBoard;
    if (res.respawnQueue.length > 0) allRespawns.push(...res.respawnQueue);
    if (res.effects && res.effects.length > 0) allEffects.push(...res.effects);
    if (res.statsEvents && res.statsEvents.length > 0) allStatsEvents.push(...res.statsEvents);
  }

  return { finalBoard: currentBoard, respawnQueue: allRespawns, logs, effects: allEffects, statsEvents: allStatsEvents };
}
