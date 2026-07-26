/* ==========================================================================
   GRAVITY PULSE 2026 - GAME SETUP & CUSTOMIZATION MODAL
   ========================================================================== */

import React, { useState } from 'react';
import { MAP_SIZES, MOVEMENT_STYLES, GAME_LENGTHS } from '../../engine/types.js';
import { Settings, Orbit, Sparkles, Check, X } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine.js';

export function GameSetupModal({ isOpen, initialConfig, onClose, onApplySetup }) {
  if (!isOpen) return null;

  const [mapSize, setMapSize] = useState(initialConfig.mapSize);
  const [movementStyle, setMovementStyle] = useState(initialConfig.movementStyle);
  const [hazardsEnabled, setHazardsEnabled] = useState(initialConfig.hazardsEnabled);
  const [gameLength, setGameLength] = useState(initialConfig.gameLength);
  const [playerCount, setPlayerCount] = useState(initialConfig.playerCount);
  const [aiCount, setAiCount] = useState(initialConfig.aiCount);

  const handleApply = () => {
    soundEngine.playClick();
    onApplySetup({
      mapSize,
      movementStyle,
      hazardsEnabled,
      gameLength,
      playerCount,
      aiCount
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 5, 8, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        border: '1px solid var(--accent-cyan)',
        boxShadow: '0 0 50px rgba(0, 240, 255, 0.2)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings color="var(--accent-cyan)" size={24} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>MATCH CUSTOMIZATION</h2>
          </div>
          <button onClick={onClose} className="neon-btn" style={{ padding: '6px 10px', minWidth: 'auto' }}>
            <X size={18} />
          </button>
        </div>

        {/* 1. Map Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>MAP SIZE & REGIONS</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {Object.values(MAP_SIZES).map(size => (
              <button
                key={size.id}
                onClick={() => { soundEngine.playClick(); setMapSize(size); }}
                className="neon-btn"
                style={{
                  padding: '12px',
                  fontSize: '0.85rem',
                  background: mapSize.id === size.id ? 'var(--accent-cyan)' : undefined,
                  color: mapSize.id === size.id ? '#030508' : undefined
                }}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Movement Style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>MOVEMENT RULES</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.values(MOVEMENT_STYLES).map(style => (
              <button
                key={style.id}
                onClick={() => { soundEngine.playClick(); setMovementStyle(style); }}
                className="neon-btn"
                style={{
                  padding: '12px',
                  fontSize: '0.85rem',
                  justifyContent: 'flex-start',
                  background: movementStyle.id === style.id ? 'var(--accent-cyan)' : undefined,
                  color: movementStyle.id === style.id ? '#030508' : undefined
                }}
              >
                <Orbit size={16} /> {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Space Hazards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>SPACE HAZARDS</label>
          <button
            onClick={() => { soundEngine.playClick(); setHazardsEnabled(!hazardsEnabled); }}
            className={`neon-btn ${hazardsEnabled ? 'btn-violet' : ''}`}
            style={{
              padding: '12px',
              background: hazardsEnabled ? 'var(--accent-violet)' : undefined,
              color: hazardsEnabled ? '#fff' : undefined,
              justifyContent: 'center'
            }}
          >
            <Sparkles size={18} />
            {hazardsEnabled ? 'Enabled (Asteroids & Energy Fields Spawn Each Round)' : 'Disabled (Pure Tactical Gravity Mode)'}
          </button>
        </div>

        {/* 4. Game Length (With Blitz Mode!) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>GAME LENGTH</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {Object.values(GAME_LENGTHS).map(len => (
              <button
                key={len.id}
                onClick={() => { soundEngine.playClick(); setGameLength(len); }}
                className="neon-btn"
                style={{
                  padding: '12px 6px',
                  fontSize: '0.8rem',
                  background: gameLength.id === len.id ? 'var(--accent-cyan)' : undefined,
                  color: gameLength.id === len.id ? '#030508' : undefined
                }}
              >
                {len.label.split(' ')[0]} {len.label.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Player & AI Count */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>TOTAL PLAYERS (UP TO 12)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', color: '#fff' }}>Total Players: {playerCount}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[2, 4, 6, 8, 12].map(c => (
                <button
                  key={c}
                  onClick={() => {
                    soundEngine.playClick();
                    setPlayerCount(c);
                    if (aiCount >= c) setAiCount(c - 1);
                  }}
                  className="neon-btn"
                  style={{
                    padding: '8px 12px',
                    minWidth: '40px',
                    background: playerCount === c ? 'var(--accent-cyan)' : undefined,
                    color: playerCount === c ? '#030508' : undefined
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>AI Opponents: {aiCount}</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Array.from({ length: playerCount }, (_, i) => i).map(c => (
                <button
                  key={c}
                  onClick={() => { soundEngine.playClick(); setAiCount(c); }}
                  className="neon-btn"
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    background: aiCount === c ? 'var(--accent-violet)' : undefined,
                    color: aiCount === c ? '#fff' : undefined
                  }}
                >
                  {c} AI
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="neon-btn btn-violet"
          style={{
            padding: '16px',
            fontSize: '1.05rem',
            marginTop: '10px',
            boxShadow: '0 0 25px rgba(157, 78, 221, 0.5)'
          }}
        >
          <Check size={20} /> START CUSTOMIZED MATCH 🚀
        </button>
      </div>
    </div>
  );
}
