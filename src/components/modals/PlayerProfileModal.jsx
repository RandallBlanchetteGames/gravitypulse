import React, { useState, useEffect } from 'react';
import { X, User, Activity, Target, ShieldAlert, Crosshair, Zap } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine.js';
import { api } from '../../api/client.js';
import { calculateAverages, formatPercent, formatDecimalOne, formatDecimal } from '../../utils/statCalculators.js';

export function PlayerProfileModal({ isOpen, onClose, user, onUpdateUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  const handleSaveName = () => {
    if (!editNameValue.trim()) return;
    api.updateName(editNameValue)
      .then(res => {
        setProfile(prev => ({ ...prev, display_name: res.displayName }));
        setIsEditingName(false);
        if (onUpdateUser) onUpdateUser({ displayName: res.displayName });
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
          if (data.display_name && data.display_name !== user.displayName) {
            if (onUpdateUser) onUpdateUser({ displayName: data.display_name });
          }
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
  const roundsPlayedRaw = getStat('total_rounds_played');
  const roundsSurvived = Math.max(0, roundsPlayedRaw - deaths);
  const kills = getStat('players_destroyed');

  const { pdRatio, winRate, pointsPerRound, killsPerGame, superchargesPerGame } = calculateAverages(profile);

  const kdRatioStr = deaths > 0 ? formatDecimal(pdRatio) : (points > 0 ? 'Perfect' : '0.00');
  const winPercentStr = formatPercent(winRate);
  const pointsPerRoundStr = formatDecimalOne(pointsPerRound);
  const killsPerGameStr = formatDecimalOne(killsPerGame);
  const superchargesPerGameStr = formatDecimalOne(superchargesPerGame);

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
          {isEditingName ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={editNameValue} 
                onChange={e => setEditNameValue(e.target.value)} 
                maxLength={24}
                autoFocus
                style={{
                  background: 'rgba(0,0,0,0.5)', border: '1px solid var(--accent-cyan)', borderRadius: '6px', 
                  color: '#fff', padding: '8px 12px', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase'
                }}
              />
              <button onClick={() => { soundEngine.playClick(); handleSaveName(); }} className="neon-btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Save</button>
              <button onClick={() => { soundEngine.playClick(); setIsEditingName(false); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <h2 style={{ 
                fontSize: '1.8rem', 
                fontWeight: 800, 
                color: '#fff', 
                margin: 0, 
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {profile?.display_name || user?.email?.split('@')[0]}
                {user?.id && <span style={{ color: 'var(--text-muted)', fontSize: '1rem', marginLeft: '6px' }}>#{user.id.substring(0,4).toUpperCase()}</span>}
              </h2>
              <button onClick={() => { soundEngine.playClick(); setIsEditingName(true); setEditNameValue(profile?.display_name || ''); }} style={{ flexShrink: 0, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--accent-cyan)', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                Edit Name
              </button>
            </div>
          )}
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {user?.email}
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
                <StatCard label="Win Rate" value={winPercentStr} />
                <StatCard label="Points / Death" value={kdRatioStr} />
                <StatCard label="Points / Round" value={pointsPerRoundStr} />
                <StatCard label="Kills / Game" value={killsPerGameStr} />
                <StatCard label="Supercharges / Game" value={superchargesPerGameStr} />
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
                  <StatRow label="Rounds Survived" value={roundsSurvived} />
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
                <StatRow label="Head-on Collision" value={getStat('times_cube_crashed')} />
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
