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
    if (ry === 0 && rx < maxR) return DIRECTIONS.RIGHT;
    if (rx === maxR && ry < maxR) return DIRECTIONS.DOWN;
    if (ry === maxR && rx > 0) return DIRECTIONS.LEFT;
    if (rx === 0 && ry > 0) return DIRECTIONS.UP;
    // Inner loop fallback for 6x6 center rings
    if (ry <= rx && rx + ry <= maxR) return DIRECTIONS.RIGHT;
    if (rx > ry && rx + ry > maxR) return DIRECTIONS.DOWN;
    if (ry >= rx && rx + ry >= maxR) return DIRECTIONS.LEFT;
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
    const emptyCells = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!board.some(e => e.x === x && e.y === y)) {
          // Keep away from center 2x2 Black Hole
          const mid = size / 2;
          if (Math.abs(x - mid) > 1 || Math.abs(y - mid) > 1) {
            emptyCells.push({ x, y });
          }
        }
      }
    }
    if (emptyCells.length === 0) return [];

    // Spawn 1 Asteroid and 1 Cosmic Energy Field
    const randIdx1 = Math.floor(Math.random() * emptyCells.length);
    const cell1 = emptyCells.splice(randIdx1, 1)[0];
    newEntities.push({
      id: `ast_${Date.now()}_1`,
      type: ENTITY_TYPES.ASTEROID,
      x: cell1.x,
      y: cell1.y
    });

    if (emptyCells.length > 0 && Math.random() < 0.7) {
      const randIdx2 = Math.floor(Math.random() * emptyCells.length);
      const cell2 = emptyCells.splice(randIdx2, 1)[0];
      newEntities.push({
        id: `eng_${Date.now()}_2`,
        type: ENTITY_TYPES.ENERGY,
        x: cell2.x,
        y: cell2.y
      });
    }

    return newEntities;
  }

  /* Spawn initial random asteroids in vacant spaces after setup */
  spawnInitialAsteroids(board, size, count = 2) {
    const newEntities = [];
    const emptyCells = [];
    const mid = size / 2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!board.some(e => e.x === x && e.y === y)) {
          // Keep away from center 2x2 Black Hole
          if (Math.abs(x - mid) > 1 || Math.abs(y - mid) > 1) {
            emptyCells.push({ x, y });
          }
        }
      }
    }

    for (let i = 0; i < count; i++) {
      if (emptyCells.length === 0) break;
      const randIdx = Math.floor(Math.random() * emptyCells.length);
      const cell = emptyCells.splice(randIdx, 1)[0];
      newEntities.push({
        id: `ast_init_${Date.now()}_${i}`,
        type: ENTITY_TYPES.ASTEROID,
        x: cell.x,
        y: cell.y
      });
    }
    return newEntities;
  }
}
