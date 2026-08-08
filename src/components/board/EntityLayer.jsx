/* ==========================================================================
   GRAVITY PULSE 2026 - GPU ENTITY LAYER (CELESTIAL ORBS, ASTEROIDS, ENERGY)
   ========================================================================== */

import React from 'react';
import { ENTITY_TYPES, PLAYER_COLORS } from '../../engine/types.js';
import { Zap, Disc, Waves } from 'lucide-react';

const hexToRgba = (hex, alpha = 0.8) => {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 255;
  const b = parseInt(hex.slice(5, 7), 16) || 102;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const EntityLayer = React.memo(function EntityLayer({ board, boardSize, activePlayerId, onEntityClick }) {
  // 1. Identify all entities that cast light (All Players and Energy Fields)
  const lightSources = board.filter(e => 
    e.type === ENTITY_TYPES.ENERGY || e.type === ENTITY_TYPES.CUBE
  );

  // Helper to render dynamic lighting overlays on entities
  const renderLighting = (entity) => {
    if (lightSources.length === 0) return null;
    
    return lightSources.map((source, i) => {
      // Don't cast light on yourself
      if (source.id === entity.id) return null;

      const dx = source.x - entity.x;
      const dy = source.y - entity.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const isSuper = source.type === ENTITY_TYPES.ENERGY || (source.type === ENTITY_TYPES.CUBE && source.isSupercharged);
      const MAX_LIGHT_DIST = isSuper ? 6 : 4; 
      
      if (dist > MAX_LIGHT_DIST || dist === 0) return null;
      
      const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      
      // Calculate intensity based on distance and source type (super = 100% base, normal = 60% base)
      const baseIntensity = isSuper ? 1.0 : 0.6;
      const intensity = Math.max(0, baseIntensity * (1 - (dist / MAX_LIGHT_DIST)));
      
      // Determine light color based on source type
      let lightColor = "rgba(0, 255, 102, 0.8)"; // Default energy field green
      if (source.type === ENTITY_TYPES.CUBE) {
        const colorObj = PLAYER_COLORS.find(c => c.id === source.playerId) || PLAYER_COLORS[0];
        lightColor = hexToRgba(colorObj.hex, 0.8);
      }
      
      return (
        <div 
          key={`light-${entity.id}-${i}`}
          className="lighting-overlay"
          style={{
            background: `radial-gradient(circle at 100% 50%, ${lightColor} 0%, transparent 60%)`,
            opacity: intensity,
            transform: `rotate(${angleDeg}deg)`,
            transformOrigin: '50% 50%'
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

        // Generate a pseudo-random animation delay based on entity ID so they don't all pulse/wobble in unison
        const idStr = String(entity.id);
        const charCode = idStr.charCodeAt(idStr.length - 1) || 5;
        const animDelay = `-${(charCode % 10) * 0.8}s`;

        // Render Quantum Singularity Player Pieces
        if (entity.type === ENTITY_TYPES.CUBE) {
          const colorObj = PLAYER_COLORS.find(c => c.id === entity.playerId) || PLAYER_COLORS[0];

          return (
            <div
              key={entity.id}
              className="cell-wrapper"
              style={{
                transform: `translate3d(${xPct}%, ${yPct}%, 0)`,
                zIndex,
                '--anim-delay': animDelay
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
          const cx = (boardSize - 1) / 2;
          const cy = (boardSize - 1) / 2;
          const dx = entity.x - cx;
          const dy = entity.y - cy;
          // Add 90 degrees because the Waves icon is horizontally drawn and we want it to point outward
          const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

          return (
            <div
              key={entity.id}
              className="cell-wrapper"
              style={{
                transform: `translate3d(${xPct}%, ${yPct}%, 0)`,
                zIndex,
                '--anim-delay': animDelay
              }}
            >
              <div
                onClick={() => onEntityClick && onEntityClick(entity)}
                className="energy-field"
                title="ENERGY FIELD: Move here to become Supercharged and double your wave power."
              >
                <div style={{ transform: `rotate(${angleDeg}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Waves size={22} color="#fff" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 8px #fff)' }} />
                </div>
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
                zIndex,
                '--anim-delay': animDelay
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
});
