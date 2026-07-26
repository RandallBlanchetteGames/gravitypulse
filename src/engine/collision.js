/* ==========================================================================
   GRAVITY PULSE 2026 - COLLISION, OVERLOAD & HAZARD VERIFICATION
   ========================================================================== */

import { isBlackHole } from './boardGeometry.js';
import { ENTITY_TYPES } from './types.js';
import { soundEngine } from '../audio/soundEngine.js';

/* Check and resolve collisions for all cell coordinates */
export function resolveCellCollisions(board, boardSize, logs = []) {
  let updatedBoard = [...board];
  const destroyedIds = new Set();
  const respawnQueue = [];
  const effects = [];

  // 1. Check Off-Board & Black Hole entry
  updatedBoard.forEach(entity => {
    // Off-board check
    if (entity.x < 0 || entity.x >= boardSize || entity.y < 0 || entity.y >= boardSize) {
      destroyedIds.add(entity.id);
      if (entity.type === ENTITY_TYPES.CUBE) {
        logs.push(`🚀 Player ${entity.playerId} drifted into deep void!`);
        respawnQueue.push(entity.playerId);
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
        effects.push({ id: Math.random() + entity.id, x: entity.x, y: entity.y, type: 'IMPLOSION' });
      }
      soundEngine.playExplosion();
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
        effects.push({ id: Math.random() + c.id, x: c.x, y: c.y, type: 'COLLISION' });
      });
      asteroids.forEach(a => destroyedIds.add(a.id));
      soundEngine.playExplosion();
    }

    // Cube vs Energy -> Supercharge or Overload Blow Up!
    if (cubes.length > 0 && energies.length > 0 && !cubes.some(c => destroyedIds.has(c.id))) {
      const luckyCube = cubes[0];
      if (luckyCube.isSupercharged) {
        // OVERLOAD BLOW UP!
        destroyedIds.add(luckyCube.id);
        energies.forEach(eng => destroyedIds.add(eng.id));
        logs.push(`💥 Player ${luckyCube.playerId} overloaded from excess energy and BLEW UP!`);
        respawnQueue.push(luckyCube.playerId);
        effects.push({ id: Math.random() + luckyCube.id, x: luckyCube.x, y: luckyCube.y, type: 'OVERLOAD' });
        soundEngine.playExplosion();
      } else {
        luckyCube.isSupercharged = true;
        energies.forEach(eng => destroyedIds.add(eng.id));
        logs.push(`⚡ Player ${luckyCube.playerId} absorbed Cosmic Energy (Supercharged)!`);
        effects.push({ id: Math.random() + luckyCube.id, x: luckyCube.x, y: luckyCube.y, type: 'SUPERCHARGE' });
        soundEngine.playSupercharge();
      }
    }

    // Cube vs Cube -> Both destroyed in gravitational crash!
    if (cubes.length > 1) {
      cubes.forEach(c => {
        if (!destroyedIds.has(c.id)) {
          destroyedIds.add(c.id);
          logs.push(`💥 Player ${c.playerId} destroyed in Cube Crash!`);
          respawnQueue.push(c.playerId);
          effects.push({ id: Math.random() + c.id, x: c.x, y: c.y, type: 'COLLISION' });
        }
      });
      soundEngine.playExplosion();
    }
  });

  const finalBoard = updatedBoard.filter(e => !destroyedIds.has(e.id));
  return { finalBoard, respawnQueue, logs, effects };
}
