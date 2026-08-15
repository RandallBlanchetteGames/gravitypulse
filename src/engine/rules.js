/* ==========================================================================
   GRAVITY PULSE 2026 - RULES CONFIGURATION & STRATEGY PROVIDER
   ========================================================================== */

import { MAP_SIZES, MOVEMENT_STYLES, GAME_LENGTHS, DIRECTIONS, TURN_ACTIONS, ENTITY_TYPES } from './types.js';

export class GameRules {
  constructor(config = {}) {
    this.mapSize = config.mapSize || MAP_SIZES.REGIONS_4X4;
    this.movementStyle = config.movementStyle || MOVEMENT_STYLES.REGIONAL_LOCKED;
    this.hazardsEnabled = config.hazardsEnabled !== undefined ? config.hazardsEnabled : true;
    this.gameLength = config.gameLength || GAME_LENGTHS.STANDARD_5;
    this.playerCount = config.playerCount || 4;
    this.aiCount = config.aiCount !== undefined ? config.aiCount : 3;
    this.aiDifficulty = config.aiDifficulty || 'Standard';
  }

  getBoardSize() {
    return this.mapSize.size;
  }

  getRegionCount() {
    return this.mapSize.regions;
  }

  /* Determine clockwise movement direction for a region coordinate (rx, ry) */
  getRegionalDirection(rx, ry) {
    const maxR = this.getRegionCount() - 1;
    const midLeft = Math.floor(maxR / 2);
    const midRight = Math.ceil(maxR / 2);

    // 1. Central four regions jettison outward
    if (rx === midLeft && ry === midLeft) return DIRECTIONS.UP;         // Top Left
    if (rx === midRight && ry === midLeft) return DIRECTIONS.RIGHT;     // Top Right
    if (rx === midLeft && ry === midRight) return DIRECTIONS.LEFT;      // Bottom Left
    if (rx === midRight && ry === midRight) return DIRECTIONS.DOWN;     // Bottom Right

    // 2. Clockwise concentric rings for all other regions
    const ring = Math.min(rx, ry, maxR - rx, maxR - ry);
    
    // Top edge of the current ring
    if (ry === ring && rx < maxR - ring) return DIRECTIONS.RIGHT;
    // Right edge of the current ring
    if (rx === maxR - ring && ry < maxR - ring) return DIRECTIONS.DOWN;
    // Bottom edge of the current ring
    if (ry === maxR - ring && rx > ring) return DIRECTIONS.LEFT;
    // Left edge of the current ring
    if (rx === ring && ry > ring) return DIRECTIONS.UP;

    return DIRECTIONS.UP;
  }

  /* Get available turn actions for active player */
  getLegalActions(player) {
    const actions = [];
    if (!player.usedActions[TURN_ACTIONS.MOVE_1]) actions.push({ id: TURN_ACTIONS.MOVE_1, label: 'Move 1 Space', steps: 1 });
    if (!player.usedActions[TURN_ACTIONS.MOVE_2]) actions.push({ id: TURN_ACTIONS.MOVE_2, label: 'Move 2 Spaces', steps: 2 });
    if (!player.usedActions[TURN_ACTIONS.MOVE_3]) actions.push({ id: TURN_ACTIONS.MOVE_3, label: 'Move 3 Spaces', steps: 3 });
    if (!player.usedActions[TURN_ACTIONS.GRAVITY]) actions.push({ id: TURN_ACTIONS.GRAVITY, label: 'Gravity Wave', special: true });
    if (!player.usedActions[TURN_ACTIONS.PULSE]) actions.push({ id: TURN_ACTIONS.PULSE, label: 'Pulse Wave', special: true });
    return actions;
  }

  /* Check if player must rest (all 5 actions used) */
  checkAndResetActions(player) {
    const usedCount = Object.values(player.usedActions).filter(Boolean).length;
    if (usedCount >= 5) {
      this.resetActions(player);
      return true; // Actions rested!
    }
    return false;
  }

  /* Reset all actions for a player at the beginning of a turn or round */
  resetActions(player) {
    if (!player) return;
    player.usedActions = {
      [TURN_ACTIONS.MOVE_1]: false,
      [TURN_ACTIONS.MOVE_2]: false,
      [TURN_ACTIONS.MOVE_3]: false,
      [TURN_ACTIONS.GRAVITY]: false,
      [TURN_ACTIONS.PULSE]: false
    };
  }

  /* Spawn space hazards at start of round if enabled */
  spawnHazards(board, size) {
    if (!this.hazardsEnabled) return [];
    const newEntities = [];
    
    // 1. ASTEROID SPAWNING (Borders, Symmetrical)
    const borderCells = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
          if (!board.some(e => e.x === x && e.y === y)) {
            borderCells.push({ x, y });
          }
        }
      }
    }
    
    // Find valid symmetrical pairs
    const validPairs = [];
    borderCells.forEach(cell => {
      const oppX = size - 1 - cell.x;
      const oppY = size - 1 - cell.y;
      // Ensure the opposite is also in borderCells and not the exact same cell
      if ((oppX !== cell.x || oppY !== cell.y) && borderCells.some(c => c.x === oppX && c.y === oppY)) {
        // Prevent duplicate pairs by ensuring x1 < x2 or y1 < y2
        if (cell.x < oppX || (cell.x === oppX && cell.y < oppY)) {
          validPairs.push([cell, { x: oppX, y: oppY }]);
        }
      }
    });

    if (validPairs.length > 0) {
      const randPair = validPairs[Math.floor(Math.random() * validPairs.length)];
      newEntities.push({
        id: `ast_${Date.now()}_1`,
        type: ENTITY_TYPES.ASTEROID,
        x: randPair[0].x,
        y: randPair[0].y
      });
      newEntities.push({
        id: `ast_${Date.now()}_2`,
        type: ENTITY_TYPES.ASTEROID,
        x: randPair[1].x,
        y: randPair[1].y
      });
    } else if (borderCells.length > 0) {
      // Fallback: spawn 1 asteroid randomly on border if no pairs available
      const randCell = borderCells[Math.floor(Math.random() * borderCells.length)];
      newEntities.push({
        id: `ast_${Date.now()}_1`,
        type: ENTITY_TYPES.ASTEROID,
        x: randCell.x,
        y: randCell.y
      });
    }

    // 2. ENERGY FIELD SPAWNING (Event Horizon, 100% chance)
    const cx = (size - 1) / 2;
    const cy = (size - 1) / 2;
    const eventHorizonCells = [];
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // The event horizon perfectly rings the 2x2 core.
        // For an even grid, these are cells where Chebyshev distance from center is exactly 1.5
        const chebyshev = Math.max(Math.abs(x - cx), Math.abs(y - cy));
        if (chebyshev === 1.5) {
          // Verify it doesn't collide with existing entities OR newly spawned asteroids
          if (!board.some(e => e.x === x && e.y === y) && !newEntities.some(e => e.x === x && e.y === y)) {
            eventHorizonCells.push({ x, y });
          }
        }
      }
    }

    if (eventHorizonCells.length > 0) {
      const randEvent = eventHorizonCells[Math.floor(Math.random() * eventHorizonCells.length)];
      newEntities.push({
        id: `eng_${Date.now()}_3`,
        type: ENTITY_TYPES.ENERGY,
        x: randEvent.x,
        y: randEvent.y
      });
    }

    return newEntities;
  }

  /* Spawn initial random asteroids in vacant spaces on the borders after setup */
  spawnInitialAsteroids(board, size, count = 2) {
    const newEntities = [];
    const borderCells = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
          if (!board.some(e => e.x === x && e.y === y)) {
            borderCells.push({ x, y });
          }
        }
      }
    }

    for (let i = 0; i < count; i++) {
      if (borderCells.length === 0) break;
      const randIdx = Math.floor(Math.random() * borderCells.length);
      const cell = borderCells.splice(randIdx, 1)[0];
      newEntities.push({
        id: `ast_init_${Date.now()}_${i}`,
        type: ENTITY_TYPES.ASTEROID,
        x: cell.x,
        y: cell.y
      });
    }
    return newEntities;
  }

  /* Validates if a spawn location meets the 5x5 box and 4-space orthogonal constraints, with failsafes */
  validateSpawnLocation(spawnX, spawnY, board) {
    if (board.some(e => e.x === spawnX && e.y === spawnY)) return { valid: false, reason: 'Occupied' };

    const playerCubes = board.filter(e => e.type === ENTITY_TYPES.CUBE);
    if (playerCubes.length === 0) return { valid: true };

    // Failsafe check: does ANY valid spawn exist?
    const checkConstraints = (x, y, cubes, requiredChebyshev, requiredOrthogonal) => {
      for (const cube of cubes) {
        const dx = Math.abs(cube.x - x);
        const dy = Math.abs(cube.y - y);
        const chebyshev = Math.max(dx, dy);
        if (chebyshev < requiredChebyshev) return false;
        if ((dx === 0 || dy === 0) && chebyshev < requiredOrthogonal) return false;
      }
      return true;
    };

    const hasValidSpawnAt = (reqCheby, reqOrtho) => {
      for (let i = 0; i < this.getBoardSize(); i++) {
        for (let j = 0; j < this.getBoardSize(); j++) {
          if (!board.some(e => e.x === i && e.y === j)) {
            if (checkConstraints(i, j, playerCubes, reqCheby, reqOrtho)) return true;
          }
        }
      }
      return false;
    };

    // Determine the active constraints based on board crowding
    let reqCheby = 3; // 5x5 box (Chebyshev distance > 2, meaning >= 3)
    let reqOrtho = 4; // 4-space orthogonal
    if (!hasValidSpawnAt(reqCheby, reqOrtho)) {
      reqCheby = 2; // fallback to 3x3 box
      reqOrtho = 2;
      if (!hasValidSpawnAt(reqCheby, reqOrtho)) {
        reqCheby = 0; // fallback to any empty cell
        reqOrtho = 0;
      }
    }

    // Now validate the requested spawn against the active constraints
    for (const cube of playerCubes) {
      const dx = Math.abs(cube.x - spawnX);
      const dy = Math.abs(cube.y - spawnY);
      const chebyshev = Math.max(dx, dy);

      if (chebyshev < reqCheby) {
        return { valid: false, reason: `Must be outside a ${reqCheby * 2 - 1}x${reqCheby * 2 - 1} box of any player.` };
      }
      if ((dx === 0 || dy === 0) && chebyshev < reqOrtho) {
        return { valid: false, reason: `Must be at least ${reqOrtho} spaces away orthogonally.` };
      }
    }

    return { valid: true };
  }
}
