import React, { useState, useEffect } from 'react';
import { X, Trophy, Skull, Crosshair, Star, Zap, Activity } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine.js';
import { api } from '../../api/client.js';

export function LeaderboardModal({ isOpen, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getLeaderboard()
        .then(data => {
          setLeaderboard(data);
          setError(null);
        })
        .catch(err => {
          setError(err.message || 'Failed to load leaderboard');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Process data for highlights
  const getTopPlayer = (sortFn) => {
    if (!leaderboard || leaderboard.length === 0) return null;
    const sorted = [...leaderboard].sort(sortFn);
    return sorted[0];
  };

  const topWins = getTopPlayer((a, b) => (b.total_wins || 0) - (a.total_wins || 0));
  const topPoints = getTopPlayer((a, b) => (b.total_cumulative_points || 0) - (a.total_cumulative_points || 0));
  const topKills = getTopPlayer((a, b) => (b.players_destroyed || 0) - (a.players_destroyed || 0));
  const topKamikazes = getTopPlayer((a, b) => (b.kamikazes || 0) - (a.kamikazes || 0));
  const topAsteroids = getTopPlayer((a, b) => (b.asteroids_destroyed || 0) - (a.asteroids_destroyed || 0));
  const topSupercharged = getTopPlayer((a, b) => (b.times_supercharged || 0) - (a.times_supercharged || 0));
  
  const getKdRatio = (p) => {
    const kills = p.players_destroyed || 0;
    const dts = p.total_cumulative_deaths || 0;
    if (dts === 0) return kills;
    return kills / dts;
  };

  const getPdRatio = (p) => {
    const pts = p.total_cumulative_points || 0;
    const dts = p.total_cumulative_deaths || 0;
    if (dts === 0) return pts;
    return pts / dts;
  };
  
  const topKd = getTopPlayer((a, b) => getKdRatio(b) - getKdRatio(a));
  const topPd = getTopPlayer((a, b) => getPdRatio(b) - getPdRatio(a));

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
        maxWidth: '800px',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '8px' }}>
          <Trophy color="var(--accent-gold)" size={32} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            GLOBAL LEADERBOARD
          </h2>
        </div>



        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent-cyan)' }}>Loading global data...</div>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>{error}</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No ranked players yet. Be the first!</div>
        ) : (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <HighlightCard 
                title="Most Wins" 
                player={topWins} 
                value={topWins?.total_wins} 
                icon={<Trophy size={24} color="var(--accent-gold)" />} 
                color="var(--accent-gold)" 
              />
              <HighlightCard 
                title="Highest P/D Ratio" 
                player={topPd} 
                value={topPd ? getPdRatio(topPd).toFixed(2) : 0} 
                icon={<Activity size={24} color="var(--accent-cyan)" />} 
                color="var(--accent-cyan)" 
              />
              <HighlightCard 
                title="Highest Total Points" 
                player={topPoints} 
                value={topPoints?.total_cumulative_points} 
                icon={<Star size={24} color="#00ff66" />} 
                color="#00ff66" 
              />
              <HighlightCard 
                title="Highest K/D Ratio" 
                player={topKd} 
                value={topKd ? getKdRatio(topKd).toFixed(2) : 0} 
                icon={<Crosshair size={24} color="#ff007f" />} 
                color="#ff007f" 
              />
              <HighlightCard 
                title="Most Kills" 
                player={topKills} 
                value={topKills?.players_destroyed} 
                icon={<Crosshair size={24} color="#ff007f" />} 
                color="#ff007f" 
              />
              <HighlightCard 
                title="Most Kamikazes" 
                player={topKamikazes} 
                value={topKamikazes?.kamikazes} 
                icon={<Skull size={24} color="#ef4444" />} 
                color="#ef4444" 
              />
              <HighlightCard 
                title="Most Asteroids Crushed" 
                player={topAsteroids} 
                value={topAsteroids?.asteroids_destroyed} 
                icon={<Trophy size={24} color="#a855f7" />} 
                color="#a855f7" 
              />
              <HighlightCard 
                title="Most Times Supercharged" 
                player={topSupercharged} 
                value={topSupercharged?.times_supercharged} 
                icon={<Zap size={24} color="#eab308" />} 
                color="#eab308" 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HighlightCard({ title, player, value, icon, color }) {
  if (!player || value === 0 || value === '0.00') {
    return (
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>{title}</div>
        <div style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Unclaimed</div>
      </div>
    );
  }

  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(20,20,20,0.8) 100%)`,
      border: `1px solid ${color}`,
      boxShadow: `inset 0 0 20px ${color}20`,
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      transition: 'transform 0.2s ease',
      cursor: 'default'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
        {icon} {title}
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>
        {player.nickname || player.username.split('@')[0]}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color }}>
        {value}
      </div>
    </div>
  );
}
