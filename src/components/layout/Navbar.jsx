/* ==========================================================================
   GRAVITY PULSE 2026 - NAVBAR COMPONENT
   ========================================================================== */

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Settings, BookOpen, RotateCcw, Orbit, Home, Menu, User, Trophy, LogOut, LogIn, UserPlus } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine.js';

export function Navbar({ 
  rulesConfig, 
  onOpenSetup, 
  onOpenRules, 
  canUndo, 
  onUndoMove,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenLeaderboard,
  onLogout
}) {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    soundEngine.playClick();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => setMenuOpen(false);

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
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => {
              soundEngine.playClick();
              setMenuOpen(!menuOpen);
            }}
            className="neon-btn"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Menu size={16} /> <span className="nav-btn-text">{user ? (user.displayName || user.email.split('@')[0]) : 'Menu'}</span>
          </button>
          
          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'rgba(13, 16, 29, 0.95)',
              border: '1px solid var(--border-neon)',
              borderRadius: '8px',
              padding: '8px 0',
              minWidth: '200px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 0 10px rgba(0, 240, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {user ? (
                <>
                  <div style={{ padding: '4px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    LOGGED IN AS
                  </div>
                  <div style={{ 
                    padding: '4px 16px 8px', 
                    fontSize: '1rem', 
                    color: 'var(--accent-cyan)', 
                    fontWeight: 800, 
                    borderBottom: '1px solid rgba(255,255,255,0.1)', 
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.displayName || user.email.split('@')[0]}
                    {user?.id && <span style={{ color: 'var(--text-muted)', fontSize: '0.85em', marginLeft: '4px' }}>#{user.id.substring(0,4).toUpperCase()}</span>}
                  </div>
                  <button onClick={() => { soundEngine.playClick(); closeMenu(); onOpenProfile(); }} className="menu-dropdown-btn">
                    <User size={16} /> My Profile
                  </button>
                </>
              ) : (
                <button onClick={() => { soundEngine.playClick(); closeMenu(); onOpenAuth('login'); }} className="menu-dropdown-btn">
                  <LogIn size={16} /> Login / Register
                </button>
              )}
              
              <button onClick={() => { soundEngine.playClick(); closeMenu(); onOpenLeaderboard(); }} className="menu-dropdown-btn">
                <Trophy size={16} /> Global Leaderboard
              </button>
              
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
              
              <button
                onClick={() => {
                  soundEngine.playClick();
                  window.location.href = 'https://blanchettegames.com';
                }}
                className="menu-dropdown-btn"
              >
                <Home size={16} /> Back to Hub
              </button>
              
              {user && (
                <>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                  <button onClick={() => { soundEngine.playClick(); closeMenu(); onLogout(); }} className="menu-dropdown-btn" style={{ color: '#ef4444' }}>
                    <LogOut size={16} color="#ef4444" /> Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>

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
