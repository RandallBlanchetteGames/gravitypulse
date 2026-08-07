/* ==========================================================================
   GRAVITY PULSE 2026 - GPU ENTITY LAYER (CELESTIAL ORBS, ASTEROIDS, ENERGY)
   ========================================================================== */

import React from 'react';
import { ENTITY_TYPES, PLAYER_COLORS } from '../../engine/types.js';
import { Zap, Disc } from 'lucide-react';

export function EntityLayer({ board, boardSize, activePlayerId, onEntityClick }) {
  // 1. Identify all Energy Fields on the board to cast light
  const energyFields = board.filter(e => e.type === ENTITY_TYPES.ENERGY);

  // Helper to render dynamic lighting overlays on entities
  const renderLighting = (entity) => {
    if (energyFields.length === 0) return null;
    
    return energyFields.map((ef, i) => {
      const dx = ef.x - entity.x;
      const dy = ef.y - entity.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const MAX_LIGHT_DIST = 5; // Light falls off after 5 spaces
      if (dist > MAX_LIGHT_DIST || dist === 0) return null;
      
      const angle = Math.atan2(dy, dx);
      const intensity = Math.max(0, 1 - (dist / MAX_LIGHT_DIST));
      
      // Position the radial gradient highlight on the edge facing the energy field
      const xPos = 50 + Math.cos(angle) * 50;
      const yPos = 50 + Math.sin(angle) * 50;
      
      return (
        <div 
          key={`light-${entity.id}-${i}`}
          className="lighting-overlay"
          style={{
            background: `radial-gradient(circle at ${xPos}% ${yPos}%, rgba(0, 255, 102, 0.8) 0%, transparent 60%)`,
            opacity: intensity
          }}
        />
      );
    });
  };

  return (
    <div className="entity-layer">
      {board.map(entity => {
        const xPct = entity.x * 100;
        const yPct = entity.y * 100;
        const zIndex = entity.type === ENTITY_TYPES.CUBE ? (entity.playerId === activePlayerId ? 30 : 25) : 20;

        // Render Quantum Singularity Player Pieces
        if (entity.type === ENTITY_TYPES.CUBE) {
          const colorObj = PLAYER_COLORS.find(c => c.id === entity.playerId) || PLAYER_COLORS[0];

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
                <div className="supercharge-halo" title="SUPERCHARGED HALO: Double wave power active!" />
              )}
              <div
                onClick={() => onEntityClick && onEntityClick(entity)}
                className={`quantum-singularity ${entity.isSupercharged ? 'supercharged' : ''}`}
                style={{ '--player-color': colorObj.hex }}
                title={`Player ${entity.playerId} Singularity (${entity.isSupercharged ? 'Supercharged' : 'Standard'})`}
              >
                {/* The hollow ring */}
                <div className="quantum-ring" />
                {/* The bright singularity core */}
                <div className="quantum-core" />
                
                {/* Player ID label floating slightly above */}
                <div className="quantum-text">P{entity.playerId}</div>

                {/* Dynamic Lighting Overlay */}
                {renderLighting(entity)}
              </div>
            </div>
          );
        }

        // Render Cosmic Energy Fields
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
                className="energy-field"
                title="ENERGY FIELD: Move here to become Supercharged and double your wave power."
              >
                <div className="energy-field-ring" />
                <Zap size={16} color="#fff" fill="#00ff66" style={{ zIndex: 2 }} />
              </div>
            </div>
          );
        }

        // Render Metallic Obsidian Asteroid Hazards
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
                title="ASTEROID HAZARD: Destroys any piece that collides with it!"
              >
                {/* No icon needed for this rugged version, it's just a rock */}
                
                {/* Dynamic Lighting Overlay */}
                {renderLighting(entity)}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
