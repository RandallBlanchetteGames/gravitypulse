/* ==========================================================================
   GRAVITY PULSE 2026 - GPU ENTITY LAYER (CUBES, ASTEROIDS, ENERGY)
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

        let bgStyle = { background: '#475569' }; // default asteroid
        let label = '☄️';
        let isSuper = false;

        if (entity.type === ENTITY_TYPES.CUBE) {
          const colorObj = PLAYER_COLORS.find(c => c.id === entity.playerId) || PLAYER_COLORS[0];
          bgStyle = {
            background: `radial-gradient(circle at 30% 30%, #fff 0%, ${colorObj.hex} 40%, #030508 100%)`,
            border: entity.playerId === activePlayerId ? '2px solid #fff' : '1px solid rgba(255,255,255,0.3)'
          };
          label = `P${entity.playerId}`;
          isSuper = entity.isSupercharged;
        } else if (entity.type === ENTITY_TYPES.ENERGY) {
          bgStyle = {
            background: 'radial-gradient(circle, #10b981 0%, #064e3b 100%)',
            border: '1px solid #00ff66',
            boxShadow: '0 0 15px #00ff66'
          };
          label = <Zap size={14} color="#fff" fill="#00ff66" />;
        } else if (entity.type === ENTITY_TYPES.ASTEROID) {
          bgStyle = {
            background: 'radial-gradient(circle at 40% 40%, #64748b 0%, #334155 60%, #0f172a 100%)',
            border: '1px solid #94a3b8',
            boxShadow: 'inset -2px -2px 6px #000'
          };
          label = <Disc size={16} color="#cbd5e1" />;
        }

        return (
          <div
            key={entity.id}
            onClick={() => onEntityClick && onEntityClick(entity)}
            className={`game-piece ${isSuper ? 'supercharged' : ''}`}
            style={{
              ...bgStyle,
              transform: `translate3d(${xPct}%, ${yPct}%, 0)`,
              zIndex: entity.type === ENTITY_TYPES.CUBE ? (entity.playerId === activePlayerId ? 30 : 25) : 20
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
