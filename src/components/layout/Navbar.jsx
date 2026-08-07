/* ==========================================================================
   GRAVITY PULSE 2026 - NAVBAR COMPONENT
   ========================================================================== */

import React, { useState } from 'react';
import { Volume2, VolumeX, Settings, BookOpen, RotateCcw, Orbit, Home } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine.js';

export function Navbar({ rulesConfig, onOpenSetup, onOpenRules, onResetGame }) {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    soundEngine.playClick();
  };

  return (
    <header className="top-navbar" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'rgba(3, 5, 8, 0.9)',
      borderBottom: '1px solid var(--border-neon)',
      backdropFilter: 'blur(16px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'radial-gradient(circle, var(--accent-cyan) 0%, #030508 80%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
        }}>
          <Orbit color="#030508" size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            GRAVITY <span style={{ color: 'var(--accent-cyan)' }}>PULSE</span>
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            2026 • Casual Tactical Edition
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Setup Badge Indicator */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid var(--border-light)',
          fontSize: '0.8rem',
          color: 'var(--text-main)'
        }}>
          <span style={{ color: 'var(--accent-cyan)' }}>{rulesConfig.mapSize.label.split(' ')[0]}</span>
          <span>•</span>
          <span>{rulesConfig.gameLength.label.split(' ')[0]} Rnds</span>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            window.location.href = 'https://blanchettegames.com';
          }}
          className="neon-btn"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          title="Back to Blanchette Games Hub"
        >
          <Home size={16} /> Hub
        </button>

        <button
          onClick={handleToggleMute}
          className="neon-btn"
          style={{ padding: '8px 12px', minWidth: '42px' }}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="var(--accent-cyan)" />}
        </button>

        <button
          onClick={() => { soundEngine.playClick(); onOpenRules(); }}
          className="neon-btn"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <BookOpen size={16} /> Rules
        </button>

        <button
          onClick={() => { soundEngine.playClick(); onOpenSetup(); }}
          className="neon-btn"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <Settings size={16} /> Setup
        </button>

        <button
          onClick={() => { soundEngine.playClick(); onResetGame(); }}
          className="neon-btn btn-danger"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          title="Start New Match"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
}
