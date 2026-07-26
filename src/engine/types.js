/* ==========================================================================
   GRAVITY PULSE 2026 - ENGINE TYPES & CONFIGURATION CONSTANTS
   ========================================================================== */

export const PHASES = {
  SETUP: 'SETUP',
  PLAYING: 'PLAYING',
  RESPAWN: 'RESPAWN',
  GAME_OVER: 'GAME_OVER'
};

export const TURN_ACTIONS = {
  MOVE_1: 'MOVE_1',
  MOVE_2: 'MOVE_2',
  MOVE_3: 'MOVE_3',
  GRAVITY: 'GRAVITY',
  PULSE: 'PULSE'
};

export const DIRECTIONS = {
  UP: { x: 0, y: -1, label: 'Up' },
  DOWN: { x: 0, y: 1, label: 'Down' },
  LEFT: { x: -1, y: 0, label: 'Left' },
  RIGHT: { x: 1, y: 0, label: 'Right' }
};

export const REGIONAL_VECTORS = {
  0: DIRECTIONS.RIGHT,
  1: DIRECTIONS.DOWN,
  2: DIRECTIONS.LEFT,
  3: DIRECTIONS.UP
};

export const MAP_SIZES = {
  REGIONS_4X4: { id: 'REGIONS_4X4', label: '4x4 Regions (12x12 Grid)', regions: 4, size: 12 },
  REGIONS_6X6: { id: 'REGIONS_6X6', label: '6x6 Regions (18x18 Grid)', regions: 6, size: 18 }
};

export const MOVEMENT_STYLES = {
  REGIONAL_LOCKED: { id: 'REGIONAL_LOCKED', label: 'Regional Direction Locked' },
  FREE_DIRECTIONAL: { id: 'FREE_DIRECTIONAL', label: 'Free Directional (Up/Down/Left/Right)' }
};

export const GAME_LENGTHS = {
  BLITZ_3: { id: 'BLITZ_3', label: '3 Rounds (Blitz Mode)', rounds: 3 },
  STANDARD_5: { id: 'STANDARD_5', label: '5 Rounds (Quick Play)', rounds: 5 },
  EXTENDED_10: { id: 'EXTENDED_10', label: '10 Rounds (Extended)', rounds: 10 }
};

export const PLAYER_COLORS = [
  { id: 1, name: 'Electric Cyan', hex: '#00f0ff', bgClass: 'var(--player-1)' },
  { id: 2, name: 'Neon Pink', hex: '#ff007f', bgClass: 'var(--player-2)' },
  { id: 3, name: 'Solar Gold', hex: '#f59e0b', bgClass: 'var(--player-3)' },
  { id: 4, name: 'Plasma Violet', hex: '#8b5cf6', bgClass: 'var(--player-4)' },
  { id: 5, name: 'Cyber Green', hex: '#10b981', bgClass: 'var(--player-5)' },
  { id: 6, name: 'Laser Red', hex: '#ef4444', bgClass: 'var(--player-6)' },
  { id: 7, name: 'Cosmic Indigo', hex: '#6366f1', bgClass: 'var(--player-7)' },
  { id: 8, name: 'Supernova Orange', hex: '#f97316', bgClass: 'var(--player-8)' },
  { id: 9, name: 'Quantum Teal', hex: '#06b6d4', bgClass: 'var(--player-9)' },
  { id: 10, name: 'Starlight Yellow', hex: '#eab308', bgClass: 'var(--player-10)' },
  { id: 11, name: 'Nebula Magenta', hex: '#d946ef', bgClass: 'var(--player-11)' },
  { id: 12, name: 'Void Blue', hex: '#3b82f6', bgClass: 'var(--player-12)' }
];

export const ENTITY_TYPES = {
  CUBE: 'CUBE',
  ASTEROID: 'ASTEROID',
  ENERGY: 'ENERGY'
};
