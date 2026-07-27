/* ==========================================================================
   GRAVITY PULSE 2026 - GAME OVER VICTORY MODAL
   ========================================================================== */

import React from 'react';
import { Trophy, RotateCcw, Settings, Sparkles } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine.js';

export function GameOverModal({ isOpen, players, onRematch, onOpenSetup }) {
  if (!isOpen) return null;

  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return (b.score || 0) - (a.score || 0);
    return (a.deaths || 0) - (b.deaths || 0);
  });

  const topScore = sorted[0]?.score || 0;
  const topDeaths = sorted[0]?.deaths || 0;
  const winners = sorted.filter(p => (p.score || 0) === topScore && (p.deaths || 0) === topDeaths);
  const isTrueTie = winners.length > 1;
  const runnerUp = sorted[1];
  const isTiedScoreOnly = !isTrueTie && runnerUp && (runnerUp.score || 0) === topScore;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 5, 8, 0.9)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1500,
      padding: '16px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        border: '2px solid var(--accent-gold)',
        boxShadow: '0 0 60px rgba(245, 158, 11, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-gold) 0%, #000 80%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px var(--accent-gold)'
        }}>
          <Trophy size={36} color="#fff" />
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-gold)', letterSpacing: '0.15em' }}>
            MATCH CONCLUDED
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>
            {isTrueTie
              ? (winners.length === 2 ? `PLAYERS ${winners[0].id} & ${winners[1].id} TIE! 🤝` : `IT'S A ${winners.length}-WAY TIE! 🤝`)
              : `PLAYER ${winners[0]?.id || 1} WINS! 🏆`}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isTrueTie
              ? `Tied with ${topScore} survival points and ${topDeaths} deaths across deep space!`
              : `Survived with ${topScore} survival points across deep space!`}
          </p>
          {isTrueTie && (
            <div style={{ marginTop: '10px', padding: '8px 14px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--accent-gold)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
              ⚖️ RESULT: COMPLETE DRAW! BOTH VICTORIOUS!
            </div>
          )}
          {isTiedScoreOnly && (
            <div style={{ marginTop: '10px', padding: '8px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', fontSize: '0.8rem', color: '#fca5a5', fontWeight: 700 }}>
              ⚖️ WON BY TIE-BREAKER: FEWEST DEATHS (${topDeaths} deaths vs ${runnerUp.deaths || 0} deaths)!
            </div>
          )}
        </div>

        {/* Top 3 Leaderboard Summary */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '12px' }}>
          {sorted.slice(0, 4).map((p, idx) => {
            const isWinRow = winners.some(w => w.id === p.id);
            const rank = isWinRow ? 1 : idx + 1;
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: isWinRow ? 'rgba(245, 158, 11, 0.15)' : 'transparent', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, color: isWinRow ? 'var(--accent-gold)' : 'var(--text-muted)' }}>#{rank}</span>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: p.color.hex }} />
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>Player {p.id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.deaths || 0} deaths</span>
                  <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>{p.score || 0} pts</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
          <button
            onClick={() => { soundEngine.playClick(); onOpenSetup(); }}
            className="neon-btn"
            style={{ flex: 1, padding: '14px', justifyContent: 'center' }}
          >
            <Settings size={18} /> Setup
          </button>

          <button
            onClick={() => { soundEngine.playClick(); onRematch(); }}
            className="neon-btn btn-violet"
            style={{ flex: 1, padding: '14px', justifyContent: 'center', boxShadow: '0 0 25px rgba(157, 78, 221, 0.5)' }}
          >
            <RotateCcw size={18} /> Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
