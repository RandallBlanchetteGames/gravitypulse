/* ==========================================================================
   GRAVITY PULSE 2026 - GPU ENTITY LAYER (CELESTIAL ORBS, ASTEROIDS, ENERGY)
   ========================================================================== */

import React from 'react';
import { ENTITY_TYPES, PLAYER_COLORS } from '../../engine/types.js';
import { Zap, Disc } from 'lucide-react';

export function EntityLayer({ board, boardSize, activePlayerId, onEntityClick }) {
  return (
    <div className="entity-layer">
      {board.map(entity => {
        const xPct = entity.x * 100;
        const yPct = entity.y * 100;
        const zIndex = entity.type === ENTITY_TYPES.CUBE ? (entity.playerId === activePlayerId ? 30 : 25) : 20;

        // Render Celestial Player Orbs
        if (entity.type === ENTITY_TYPES.CUBE) {
          const colorObj = PLAYER_COLORS.find(c => c.id === entity.playerId) || PLAYER_COLORS[0];
          const bgStyle = {
            background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${colorObj.hex} 38%, #020408 100%)`,
            border: entity.playerId === activePlayerId ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.35)'
          };

          return (
            <div
              key={entity.id}
              className="cell-wrapper"
              style={{
                transform: `translate3d(${xPct}%, ${yPct}%, 0)`,
                zIndex
              }}
            >
              {entity.isSupercharged && (
                <div className="supercharge-halo" title="⚡ SUPERCHARGED HALO: Double wave power active!" />
              )}
              <div
                onClick={() => onEntityClick && onEntityClick(entity)}
                className={`celestial-orb ${entity.isSupercharged ? 'supercharged' : ''}`}
                style={bgStyle}
                title={`Player ${entity.playerId} Orb (${entity.isSupercharged ? '⚡ Supercharged' : 'Standard'})`}
              >
                P{entity.playerId}
              </div>
            </div>
          );
        }

        // Render Energy Crystal Power-ups
        if (entity.type === ENTITY_TYPES.ENERGY) {
          return (
            <div
              key={entity.id}
              className="cell-wrapper"
              style={{
                transform: `translate3d(${xPct}%, ${yPct}%, 0)`,
                zIndex
              }}
            >
              <div
                onClick={() => onEntityClick && onEntityClick(entity)}
                className="energy-crystal"
                title="⚡ ENERGY CRYSTAL: Collect to become Supercharged & double wave power!"
              >
                <Zap size={15} color="#fff" fill="#00ff66" />
              </div>
            </div>
          );
        }

        // Render Asteroid Hazards
        if (entity.type === ENTITY_TYPES.ASTEROID) {
          return (
            <div
              key={entity.id}
              className="cell-wrapper"
              style={{
                transform: `translate3d(${xPct}%, ${yPct}%, 0)`,
                zIndex
              }}
            >
              <div
                onClick={() => onEntityClick && onEntityClick(entity)}
                className="asteroid-hazard"
                title="⚠️ ASTEROID HAZARD: Destroys any piece that collides with it!"
              >
                <Disc size={18} color="#cbd5e1" />
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
