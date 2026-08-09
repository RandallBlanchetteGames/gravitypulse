/* ==========================================================================
   GRAVITY PULSE 2026 - NAVBAR COMPONENT
   ========================================================================== */

import React, { useState } from 'react';
import { Volume2, VolumeX, Settings, BookOpen, RotateCcw, Orbit, Home } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine.js';

export function Navbar({ rulesConfig, onOpenSetup, onOpenRules, canUndo, onUndoMove }) {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    soundEngine.playClick();
  };

  return (
    <header className="top-navbar">
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
          <Orbit color="#030508" size={24} style={{ transform: 'scaleX(-1)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            GRAVITY <span style={{ color: 'var(--accent-cyan)' }}>PULSE</span>
          </h1>
        </div>
      </div>

      <div className="nav-buttons">
        <button
          onClick={() => {
            soundEngine.playClick();
            window.location.href = 'https://blanchettegames.com';
          }}
          className="neon-btn"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          title="Back to Blanchette Games Hub"
        >
          <Home size={16} /> <span className="nav-btn-text">Hub</span>
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
          <BookOpen size={16} /> <span className="nav-btn-text">Rules</span>
        </button>

        <button
          onClick={() => { soundEngine.playClick(); onOpenSetup(); }}
          className="neon-btn"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <Settings size={16} /> <span className="nav-btn-text">Setup</span>
        </button>

        <button
          onClick={() => { 
            if (canUndo) {
              soundEngine.playClick(); 
              onUndoMove();
            }
          }}
          className={`neon-btn btn-danger ${!canUndo ? 'disabled' : ''}`}
          style={{ 
            padding: '8px 14px', 
            fontSize: '0.85rem',
            opacity: canUndo ? 1 : 0.4,
            cursor: canUndo ? 'pointer' : 'not-allowed'
          }}
          title={canUndo ? "Undo Last Move" : "No moves to undo"}
          disabled={!canUndo}
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
}
