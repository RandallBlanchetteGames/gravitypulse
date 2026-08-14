import React, { useState, useEffect } from 'react';
import { X, User, Activity, Target, ShieldAlert, Crosshair, Zap } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine.js';
import { api } from '../../api/client.js';

export function PlayerProfileModal({ isOpen, onClose, user, onUpdateUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editNicknameValue, setEditNicknameValue] = useState('');

  const handleSaveNickname = () => {
    if (!editNicknameValue.trim()) return;
    api.updateNickname(editNicknameValue)
      .then(res => {
        setProfile(prev => ({ ...prev, nickname: res.nickname }));
        setIsEditingNickname(false);
        if (onUpdateUser) onUpdateUser({ nickname: res.nickname });
      })
      .catch(err => alert(err.message));
  };

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      api.getProfile(user.id)
        .then(data => {
          setProfile(data);
          setError(null);
        })
        .catch(err => {
          setError(err.message || 'Failed to load profile');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const getStat = (key) => profile ? (profile[key] || 0) : 0;

  // Calculated Averages
  const gamesPlayed = getStat('total_games_played');
  const points = getStat('total_cumulative_points');
  const deaths = getStat('total_cumulative_deaths');
  const wins = getStat('total_wins');
  const roundsPlayed = getStat('total_rounds_played');
  const kills = getStat('players_destroyed');

  const kdRatio = deaths > 0 ? (points / deaths).toFixed(2) : (points > 0 ? 'Perfect' : '0.00');
  const winPercent = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) + '%' : '0.0%';
  const pointsPerRound = roundsPlayed > 0 ? (points / roundsPlayed).toFixed(1) : '0.0';
  const killsPerGame = gamesPlayed > 0 ? (kills / gamesPlayed).toFixed(1) : '0.0';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="glass-card anim-pop" style={{
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        margin: '16px',
        position: 'relative'
      }}>
        <button 
          onClick={() => { soundEngine.playClick(); onClose(); }}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
          {isEditingNickname ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={editNicknameValue} 
                onChange={e => setEditNicknameValue(e.target.value)} 
                maxLength={24}
                autoFocus
                style={{
                  background: 'rgba(0,0,0,0.5)', border: '1px solid var(--accent-cyan)', borderRadius: '6px', 
                  color: '#fff', padding: '8px 12px', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase'
                }}
              />
              <button onClick={() => { soundEngine.playClick(); handleSaveNickname(); }} className="neon-btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Save</button>
              <button onClick={() => { soundEngine.playClick(); setIsEditingNickname(false); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0, textTransform: 'uppercase' }}>
                {profile?.nickname || user?.username?.split('@')[0]}
              </h2>
              <button onClick={() => { soundEngine.playClick(); setIsEditingNickname(true); setEditNicknameValue(profile?.nickname || ''); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--accent-cyan)', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                Edit Name
              </button>
            </div>
          )}
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {user?.username}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent-cyan)' }}>Loading telemetry...</div>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>{error}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Highlight Averages */}
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--accent-cyan)" /> COMBAT AVERAGES
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <StatCard label="Win Rate" value={winPercent} />
                <StatCard label="Points / Death" value={kdRatio} highlight />
                <StatCard label="Points / Round" value={pointsPerRound} />
                <StatCard label="Kills / Game" value={killsPerGame} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              
              {/* Overall Match Stats */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={18} color="#f59e0b" /> LIFETIME RECORD
                </h3>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <StatRow label="Games Played (1vAI)" value={gamesPlayed} />
                  <StatRow label="Matches Won" value={wins} color="#00ff66" />
                  <StatRow label="Rounds Survived" value={roundsPlayed} />
                  <StatRow label="Total Score" value={points} color="var(--accent-cyan)" />
                  <StatRow label="Total Deaths" value={deaths} color="#ef4444" />
                </div>
              </div>

              {/* Combat & Eliminations */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Crosshair size={18} color="#ff007f" /> ELIMINATIONS
                </h3>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <StatRow label="Opponents Destroyed" value={kills} color="#ff007f" />
                  <StatRow label="Kamikaze Attacks" value={getStat('kamikazes')} />
                  <StatRow label="Asteroids Crushed" value={getStat('asteroids_destroyed')} />
                  <StatRow label="Times Supercharged" value={getStat('times_supercharged')} color="#00ff66" />
                </div>
              </div>

            </div>

            {/* Hazard Deaths */}
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="#ef4444" /> HAZARD ANALYSIS (CAUSE OF DEATH)
              </h3>
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <StatRow label="Cube Crash" value={getStat('times_cube_crashed')} />
                <StatRow label="Asteroid Impact" value={getStat('times_crushed_by_asteroid')} />
                <StatRow label="Void Drift" value={getStat('times_drifted_into_void')} />
                <StatRow label="Black Hole" value={getStat('times_sucked_into_black_hole')} />
                <StatRow label="Energy Overload" value={getStat('times_overloaded')} />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div style={{
      background: highlight ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255,255,255,0.03)',
      border: highlight ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.6rem', color: highlight ? 'var(--accent-cyan)' : '#fff', fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function StatRow({ label, value, color = '#fff' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '1rem', fontWeight: 800, color }}>{value}</span>
    </div>
  );
}
