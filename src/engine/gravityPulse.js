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
  const logs = [`🌊 Player ${playerId} triggers Gravity Wave (Power ${power})!`];
  let allRespawns = [];
  let allEffects = [];

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

    const res = resolveCellCollisions(currentBoard, rules.getBoardSize(), logs);
    currentBoard = res.finalBoard;
    if (res.respawnQueue.length > 0) allRespawns.push(...res.respawnQueue);
    if (res.effects && res.effects.length > 0) allEffects.push(...res.effects);
    sequence.push(currentBoard.map(e => ({ ...e })));
  }

  return { sequence, finalBoard: currentBoard, respawnQueue: allRespawns, logs, effects: allEffects };
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
  const logs = [`⚡ Player ${playerId} triggers Pulse Wave (Power ${power})!`];
  let allRespawns = [];
  let allEffects = [];

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

    const res = resolveCellCollisions(currentBoard, rules.getBoardSize(), logs);
    currentBoard = res.finalBoard;
    if (res.respawnQueue.length > 0) allRespawns.push(...res.respawnQueue);
    if (res.effects && res.effects.length > 0) allEffects.push(...res.effects);
    sequence.push(currentBoard.map(e => ({ ...e })));
  }

  return { sequence, finalBoard: currentBoard, respawnQueue: allRespawns, logs, effects: allEffects };
}

/* Execute Localized Gravity Phase: regions pull toward region leader */
export function executeLocalizedGravity(board, rules) {
  let currentBoard = board.map(e => ({ ...e }));
  const logs = [`💫 Localized Gravity checks regions...`];
  let allRespawns = [];
  let allEffects = [];

  const regionMap = new Map();
  currentBoard.filter(e => e.type === ENTITY_TYPES.CUBE).forEach(c => {
    const { rx, ry } = getRegionCoords(c.x, c.y);
    const key = `${rx},${ry}`;
    if (!regionMap.has(key)) regionMap.set(key, []);
    regionMap.get(key).push(c);
  });

  let movedAny = false;
  regionMap.forEach((cubes, rKey) => {
    if (cubes.length <= 1) return;
    const counts = {};
    cubes.forEach(c => counts[c.playerId] = (counts[c.playerId] || 0) + 1);
    let maxCount = 0;
    let leaderId = null;
    let tie = false;
    Object.entries(counts).forEach(([pid, count]) => {
      if (count > maxCount) {
        maxCount = count;
        leaderId = Number(pid);
        tie = false;
      } else if (count === maxCount) {
        tie = true;
      }
    });

    if (!tie && leaderId !== null) {
      const leaderCube = cubes.find(c => c.playerId === leaderId);
      cubes.filter(c => c.playerId !== leaderId).forEach(target => {
        const vec = getStepVector(target.x, target.y, leaderCube.x, leaderCube.y);
        target.x += vec.x;
        target.y += vec.y;
        movedAny = true;
      });
    }
  });

  if (movedAny) {
    const res = resolveCellCollisions(currentBoard, rules.getBoardSize(), logs);
    currentBoard = res.finalBoard;
    if (res.respawnQueue.length > 0) allRespawns.push(...res.respawnQueue);
    if (res.effects && res.effects.length > 0) allEffects.push(...res.effects);
  }

  return { finalBoard: currentBoard, respawnQueue: allRespawns, logs, effects: allEffects };
}

/* Execute Black Hole Suction Phase: pull all players, asteroids, and energy fields on the map inward 1 space */
export function executeBlackHoleSuction(board, rules) {
  let currentBoard = board.map(e => ({ ...e }));
  const size = rules.getBoardSize();
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;

  const logs = [`🕳️ Black Hole Singularity pulls mass inward and radiates energy outward!`];
  let allRespawns = [];
  let allEffects = [];

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
    const res = resolveCellCollisions(currentBoard, size, logs);
    currentBoard = res.finalBoard;
    if (res.respawnQueue.length > 0) allRespawns.push(...res.respawnQueue);
    if (res.effects && res.effects.length > 0) allEffects.push(...res.effects);
  }

  return { finalBoard: currentBoard, respawnQueue: allRespawns, logs, effects: allEffects };
}
