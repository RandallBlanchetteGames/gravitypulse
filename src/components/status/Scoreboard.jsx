/* ==========================================================================
   GRAVITY PULSE 2026 - SCOREBOARD & LEADERBOARD COMPONENT
   ========================================================================== */

import React from 'react';
import { Trophy, Shield, Zap } from 'lucide-react';

export function Scoreboard({ players, activePlayerId }) {
  // Sort players by survival score descending, then deaths ascending
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.deaths - b.deaths;
  });

  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <Trophy size={18} color="var(--accent-gold)" />
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
          SURVIVAL SCOREBOARD
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
        {sorted.map(p => {
          const isActive = p.id === activePlayerId;
          const isSuper = p.isSupercharged;

          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: isActive ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                border: isActive ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '10px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  background: p.color.hex,
                  boxShadow: `0 0 8px ${p.color.hex}`
                }} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                  Player {p.id}
                </span>
                {isSuper && <Zap size={14} color="#00ff66" fill="#00ff66" title="Supercharged!" />}
                {p.isHuman === false && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: '4px' }}>
                    AI
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {p.score || 0} pts
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {p.deaths || 0} deaths
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
