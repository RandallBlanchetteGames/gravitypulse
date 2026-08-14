/* ==========================================================================
   GRAVITY PULSE 2026 - COLLISION, OVERLOAD & HAZARD VERIFICATION
   ========================================================================== */

import { isBlackHole } from './boardGeometry.js';
import { ENTITY_TYPES } from './types.js';
import { soundEngine } from '../audio/soundEngine.js';

/* Check and resolve collisions for all cell coordinates */
export function resolveCellCollisions(board, boardSize, logs = [], initiatorId = null) {
  let updatedBoard = [...board];
  const destroyedIds = new Set();
  const respawnQueue = [];
  const effects = [];
  const statsEvents = []; // Track stats

  // 1. Check Off-Board & Black Hole entry
  updatedBoard.forEach(entity => {
    // Off-board check
    if (entity.x < 0 || entity.x >= boardSize || entity.y < 0 || entity.y >= boardSize) {
      destroyedIds.add(entity.id);
      if (entity.type === ENTITY_TYPES.CUBE) {
        logs.push(`🚀 Player ${entity.playerId} drifted into deep void!`);
        respawnQueue.push(entity.playerId);
        statsEvents.push({ type: 'DEATH_VOID', victimId: entity.playerId, initiatorId });
        effects.push({ id: Math.random() + entity.id, x: Math.max(0, Math.min(boardSize - 1, entity.x)), y: Math.max(0, Math.min(boardSize - 1, entity.y)), type: 'COLLISION' });
      } else if (entity.type === ENTITY_TYPES.ASTEROID) {
        logs.push(`☄️ Asteroid drifted off into deep void!`);
        statsEvents.push({ type: 'ASTEROID_DESTROYED', initiatorId });
        effects.push({ id: Math.random() + entity.id, x: Math.max(0, Math.min(boardSize - 1, entity.x)), y: Math.max(0, Math.min(boardSize - 1, entity.y)), type: 'COLLISION' });
      }
      soundEngine.playExplosion();
      return;
    }

    // Black Hole check
    if (isBlackHole(entity.x, entity.y, boardSize)) {
      destroyedIds.add(entity.id);
      if (entity.type === ENTITY_TYPES.CUBE) {
        logs.push(`🕳️ Player ${entity.playerId} sucked into the Singularity (Destroyed)!`);
        respawnQueue.push(entity.playerId);
        statsEvents.push({ type: 'DEATH_BLACKHOLE', victimId: entity.playerId, initiatorId });
        effects.push({ id: Math.random() + entity.id, x: entity.x, y: entity.y, type: 'IMPLOSION' });
      } else if (entity.type === ENTITY_TYPES.ASTEROID) {
        logs.push(`☄️ Asteroid sucked into the Singularity!`);
        statsEvents.push({ type: 'ASTEROID_DESTROYED', initiatorId });
        effects.push({ id: Math.random() + entity.id, x: entity.x, y: entity.y, type: 'IMPLOSION' });
      }
      soundEngine.playBlackHole();
    }
  });

  // Filter out already destroyed items
  updatedBoard = updatedBoard.filter(e => !destroyedIds.has(e.id));

  // 2. Check Entity vs Entity Collisions on the same cell (x, y)
  const cellMap = new Map();
  updatedBoard.forEach(entity => {
    const key = `${entity.x},${entity.y}`;
    if (!cellMap.has(key)) cellMap.set(key, []);
    cellMap.get(key).push(entity);
  });

  cellMap.forEach((entitiesAtCell, key) => {
    if (entitiesAtCell.length <= 1) return; // No collision

    const cubes = entitiesAtCell.filter(e => e.type === ENTITY_TYPES.CUBE);
    const asteroids = entitiesAtCell.filter(e => e.type === ENTITY_TYPES.ASTEROID);
    const energies = entitiesAtCell.filter(e => e.type === ENTITY_TYPES.ENERGY);

    // Cube vs Asteroid -> Cube crushed, Asteroid destroyed
    if (cubes.length > 0 && asteroids.length > 0) {
      cubes.forEach(c => {
        destroyedIds.add(c.id);
        logs.push(`☄️ Player ${c.playerId} crushed by Asteroid!`);
        respawnQueue.push(c.playerId);
        statsEvents.push({ type: 'DEATH_ASTEROID', victimId: c.playerId, initiatorId });
        effects.push({ id: Math.random() + c.id, x: c.x, y: c.y, type: 'COLLISION' });
      });
      asteroids.forEach(a => {
        destroyedIds.add(a.id);
        statsEvents.push({ type: 'ASTEROID_DESTROYED', initiatorId });
      });
      soundEngine.playExplosion();
    }

    // Cube vs Energy Field -> Supercharge or Overload Blow Up!
    if (cubes.length > 0 && energies.length > 0 && !cubes.some(c => destroyedIds.has(c.id))) {
      const luckyCube = cubes[0];
      if (luckyCube.isSupercharged) {
        // OVERLOAD BLOW UP!
        destroyedIds.add(luckyCube.id);
        energies.forEach(eng => destroyedIds.add(eng.id));
        logs.push(`💥 Player ${luckyCube.playerId} overloaded from excess energy and BLEW UP!`);
        respawnQueue.push(luckyCube.playerId);
        statsEvents.push({ type: 'DEATH_OVERLOAD', victimId: luckyCube.playerId, initiatorId });
        effects.push({ id: Math.random() + luckyCube.id, x: luckyCube.x, y: luckyCube.y, type: 'OVERLOAD' });
        soundEngine.playOverload();
      } else {
        luckyCube.isSupercharged = true;
        energies.forEach(eng => destroyedIds.add(eng.id));
        logs.push(`⚡ Player ${luckyCube.playerId} entered a Cosmic Energy Field (Supercharged)!`);
        statsEvents.push({ type: 'SUPERCHARGE', victimId: luckyCube.playerId });
        effects.push({ id: Math.random() + luckyCube.id, x: luckyCube.x, y: luckyCube.y, type: 'SUPERCHARGE' });
        soundEngine.playSupercharge();
      }
    }

    // Cube vs Cube -> Both destroyed in gravitational crash!
    if (cubes.length > 1) {
      cubes.forEach(c => {
        if (!destroyedIds.has(c.id)) {
          destroyedIds.add(c.id);
          logs.push(`💥 Player ${c.playerId} destroyed in a Head-on Collision!`);
          respawnQueue.push(c.playerId);
          statsEvents.push({ type: 'DEATH_CUBE_CRASH', victimId: c.playerId, initiatorId });
          effects.push({ id: Math.random() + c.id, x: c.x, y: c.y, type: 'COLLISION' });
        }
      });
      soundEngine.playExplosion();
    }

    // Asteroid vs Asteroid -> Both shatter!
    if (asteroids.length > 1) {
      asteroids.forEach(a => {
        if (!destroyedIds.has(a.id)) {
          destroyedIds.add(a.id);
        }
      });
      logs.push(`☄️ Two Asteroids collided and shattered in deep space!`);
      effects.push({ id: Math.random() + asteroids[0].id, x: asteroids[0].x, y: asteroids[0].y, type: 'COLLISION' });
      soundEngine.playExplosion();
    }

    // Asteroid vs Energy Field -> Asteroid dissipates the field!
    if (asteroids.length > 0 && energies.length > 0) {
      energies.forEach(eng => {
        if (!destroyedIds.has(eng.id)) {
          destroyedIds.add(eng.id);
          logs.push(`☄️ Asteroid dissipated a Cosmic Energy Field!`);
          effects.push({ id: Math.random() + eng.id, x: eng.x, y: eng.y, type: 'COLLISION' });
        }
      });
    }
  });

  const finalBoard = updatedBoard.filter(e => !destroyedIds.has(e.id));
  return { finalBoard, respawnQueue, logs, effects, statsEvents };
}
