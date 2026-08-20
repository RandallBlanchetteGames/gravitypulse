import React, { useState, useEffect } from 'react';
import { X, Trophy, Skull, Crosshair, Star, Zap, Activity, Gamepad2, ShieldAlert, Target } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine.js';
import { api } from '../../api/client.js';
import { calculateAverages, formatPercent, formatDecimalOne, formatDecimal } from '../../utils/statCalculators.js';

export function LeaderboardModal({ isOpen, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('AVERAGES');

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
  const getTopPlayer = (data, sortFn) => {
    if (!data || data.length === 0) return null;
    const sorted = [...data].sort(sortFn);
    // Ignore if top player has 0 for this stat
    // We check the raw value dynamically by doing the same subtraction:
    // This is easier in the cards themselves, but we'll do it there.
    return sorted[0];
  };

  const getTopAverage = (metric, gameLimit, gameMax = Infinity) => {
    const validPlayers = leaderboard.filter(p => {
        const games = p.total_games_played || 0;
        return games >= gameLimit && games < gameMax;
    });
    if (validPlayers.length === 0) return null;

    const sorted = [...validPlayers].sort((a, b) => {
        const avgA = calculateAverages(a)[metric];
        const avgB = calculateAverages(b)[metric];
        return avgB - avgA;
    });
    
    return sorted[0];
  };

  // Lifetime
  const topWins = getTopPlayer(leaderboard, (a, b) => (b.total_wins || 0) - (a.total_wins || 0));
  const topPoints = getTopPlayer(leaderboard, (a, b) => (b.total_cumulative_points || 0) - (a.total_cumulative_points || 0));
  const topMatches = getTopPlayer(leaderboard, (a, b) => (b.total_games_played || 0) - (a.total_games_played || 0));
  const getSurvived = (p) => Math.max(0, (p.total_rounds_played || 0) - (p.total_cumulative_deaths || 0));
  const topRounds = getTopPlayer(leaderboard, (a, b) => getSurvived(b) - getSurvived(a));
  const topDeaths = getTopPlayer(leaderboard, (a, b) => (b.total_cumulative_deaths || 0) - (a.total_cumulative_deaths || 0));

  // Eliminations
  const topKills = getTopPlayer(leaderboard, (a, b) => (b.players_destroyed || 0) - (a.players_destroyed || 0));
  const topKamikazes = getTopPlayer(leaderboard, (a, b) => (b.kamikazes || 0) - (a.kamikazes || 0));
  const topAsteroids = getTopPlayer(leaderboard, (a, b) => (b.asteroids_destroyed || 0) - (a.asteroids_destroyed || 0));
  const topSupercharged = getTopPlayer(leaderboard, (a, b) => (b.times_supercharged || 0) - (a.times_supercharged || 0));

  // Hazards
  const topCubeCrashed = getTopPlayer(leaderboard, (a, b) => (b.times_cube_crashed || 0) - (a.times_cube_crashed || 0));
  const topAsteroidCrushed = getTopPlayer(leaderboard, (a, b) => (b.times_crushed_by_asteroid || 0) - (a.times_crushed_by_asteroid || 0));
  const topVoidDrift = getTopPlayer(leaderboard, (a, b) => (b.times_drifted_into_void || 0) - (a.times_drifted_into_void || 0));
  const topBlackHole = getTopPlayer(leaderboard, (a, b) => (b.times_sucked_into_black_hole || 0) - (a.times_sucked_into_black_hole || 0));
  const topOverload = getTopPlayer(leaderboard, (a, b) => (b.times_overloaded || 0) - (a.times_overloaded || 0));

  // Averages (< 20 and 20+)
  const topWinRateUnder20 = getTopAverage('winRate', 1, 20);
  const topWinRateOver20 = getTopAverage('winRate', 20);

  const topPdUnder20 = getTopAverage('pdRatio', 1, 20);
  const topPdOver20 = getTopAverage('pdRatio', 20);

  const topKdUnder20 = getTopAverage('kdRatio', 1, 20);
  const topKdOver20 = getTopAverage('kdRatio', 20);

  const topPointsPerRoundUnder20 = getTopAverage('pointsPerRound', 1, 20);
  const topPointsPerRoundOver20 = getTopAverage('pointsPerRound', 20);

  const topKillsPerGameUnder20 = getTopAverage('killsPerGame', 1, 20);
  const topKillsPerGameOver20 = getTopAverage('killsPerGame', 20);

  const renderAverageCard = (title, pUnder20, pOver20, metric, formatFn, icon, color) => {
    const renderCard = (p, labelSuffix) => {
      if (!p) return null;
      const val = calculateAverages(p)[metric];
      if (val === 0) return null;
      return (
        <HighlightCard 
          key={p.id + labelSuffix}
          title={`${title} ${labelSuffix}`} 
          player={p} 
          value={formatFn(val)} 
          icon={icon} 
          color={color} 
        />
      );
    };

    const card1 = renderCard(pOver20, '(20+ Games)');
    const card2 = renderCard(pUnder20, '(< 20 Games)');

    return (
      <>
        {card1}
        {card2}
      </>
    );
  };

  const tabs = [
    { id: 'AVERAGES', icon: <Activity size={18} />, label: 'Averages' },
    { id: 'LIFETIME', icon: <Target size={18} />, label: 'Lifetime' },
    { id: 'ELIMINATIONS', icon: <Crosshair size={18} />, label: 'Eliminations' },
    { id: 'HAZARDS', icon: <ShieldAlert size={18} />, label: 'Hazards' }
  ];

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

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { soundEngine.playClick(); setActiveTab(t.id); }}
              style={{
                background: activeTab === t.id ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                border: `1px solid ${activeTab === t.id ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'}`,
                color: activeTab === t.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap'
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent-cyan)' }}>Loading global data...</div>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>{error}</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No ranked players yet. Be the first!</div>
        ) : (
          <div style={{ marginTop: '8px' }}>
            {activeTab === 'AVERAGES' && (
              <div className="highlights-grid">
                {renderAverageCard('Win Rate', topWinRateUnder20, topWinRateOver20, 'winRate', formatPercent, <Trophy size={24} color="var(--accent-gold)" />, 'var(--accent-gold)')}
                {renderAverageCard('Points / Death', topPdUnder20, topPdOver20, 'pdRatio', formatDecimal, <Activity size={24} color="var(--accent-cyan)" />, 'var(--accent-cyan)')}
                {renderAverageCard('Kills / Death', topKdUnder20, topKdOver20, 'kdRatio', formatDecimal, <Crosshair size={24} color="#ff007f" />, '#ff007f')}
                {renderAverageCard('Points / Round', topPointsPerRoundUnder20, topPointsPerRoundOver20, 'pointsPerRound', formatDecimalOne, <Star size={24} color="#00ff66" />, '#00ff66')}
                {renderAverageCard('Kills / Game', topKillsPerGameUnder20, topKillsPerGameOver20, 'killsPerGame', formatDecimalOne, <Crosshair size={24} color="#ff007f" />, '#ff007f')}
              </div>
            )}

            {activeTab === 'LIFETIME' && (
              <div className="highlights-grid">
                <HighlightCard title="Most Wins" player={topWins} value={topWins?.total_wins} icon={<Trophy size={24} color="var(--accent-gold)" />} color="var(--accent-gold)" />
                <HighlightCard title="Highest Total Points" player={topPoints} value={topPoints?.total_cumulative_points} icon={<Star size={24} color="#00ff66" />} color="#00ff66" />
                <HighlightCard title="Most Matches Played" player={topMatches} value={topMatches?.total_games_played} icon={<Gamepad2 size={24} color="#3b82f6" />} color="#3b82f6" />
                <HighlightCard title="Most Rounds Survived" player={topRounds} value={topRounds ? Math.max(0, (topRounds.total_rounds_played || 0) - (topRounds.total_cumulative_deaths || 0)) : 0} icon={<Activity size={24} color="var(--accent-cyan)" />} color="var(--accent-cyan)" />
                <HighlightCard title="Most Times Supercharged" player={topSupercharged} value={topSupercharged?.times_supercharged} icon={<Zap size={24} color="#eab308" />} color="#eab308" />
              </div>
            )}

            {activeTab === 'ELIMINATIONS' && (
              <div className="highlights-grid">
                <HighlightCard title="Most Opponents Destroyed" player={topKills} value={topKills?.players_destroyed} icon={<Crosshair size={24} color="#ff007f" />} color="#ff007f" />
                <HighlightCard title="Most Kamikaze Attacks" player={topKamikazes} value={topKamikazes?.kamikazes} icon={<Skull size={24} color="#ef4444" />} color="#ef4444" />
                <HighlightCard title="Most Asteroids Crushed" player={topAsteroids} value={topAsteroids?.asteroids_destroyed} icon={<Trophy size={24} color="#a855f7" />} color="#a855f7" />
              </div>
            )}

            {activeTab === 'HAZARDS' && (
              <div className="highlights-grid">
                <HighlightCard title="Most Total Deaths" player={topDeaths} value={topDeaths?.total_cumulative_deaths} icon={<Skull size={24} color="#ef4444" />} color="#ef4444" />
                <HighlightCard title="Most Head-on Collisions" player={topCubeCrashed} value={topCubeCrashed?.times_cube_crashed} icon={<ShieldAlert size={24} color="#ef4444" />} color="#ef4444" />
                <HighlightCard title="Most Asteroid Impacts" player={topAsteroidCrushed} value={topAsteroidCrushed?.times_crushed_by_asteroid} icon={<ShieldAlert size={24} color="#ef4444" />} color="#ef4444" />
                <HighlightCard title="Most Void Drifts" player={topVoidDrift} value={topVoidDrift?.times_drifted_into_void} icon={<ShieldAlert size={24} color="#ef4444" />} color="#ef4444" />
                <HighlightCard title="Most Black Hole Deaths" player={topBlackHole} value={topBlackHole?.times_sucked_into_black_hole} icon={<ShieldAlert size={24} color="#ef4444" />} color="#ef4444" />
                <HighlightCard title="Most Energy Overloads" player={topOverload} value={topOverload?.times_overloaded} icon={<ShieldAlert size={24} color="#ef4444" />} color="#ef4444" />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

function HighlightCard({ title, player, value, icon, color }) {
  if (!player || value === 0 || value === '0.00' || value === '0.0%' || value === '0') {
    return null;
  }

  return (
    <div className="glass-card anim-pop highlight-card">
      <div className="highlight-card-icon-bg">
        {icon}
      </div>
      <div className="highlight-card-icon" style={{ boxShadow: `0 0 15px ${color}40` }}>
        {icon}
      </div>
      <div className="highlight-card-title" style={{ fontSize: '0.85rem' }}>
        {title}
      </div>
      <div className="highlight-card-player" style={{ 
        whiteSpace: 'nowrap', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis', 
        width: '100%', 
        textAlign: 'center' 
      }}>
        {player ? (player.display_name || player.email.split('@')[0]) : '---'}
        {player?.user_id && <span style={{ color: 'var(--text-muted)', fontSize: '0.85em', marginLeft: '4px' }}>#{player.user_id.substring(0,4).toUpperCase()}</span>}
      </div>
      <div className="highlight-card-value" style={{ color: color, textShadow: `0 0 10px ${color}80` }}>
        {value !== undefined ? value : '---'}
      </div>
    </div>
  );
}
