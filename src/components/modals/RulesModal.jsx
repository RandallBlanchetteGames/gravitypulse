/* ==========================================================================
   GRAVITY PULSE 2026 - RULES QUICK REFERENCE MODAL (4-TURN ROUNDS)
   ========================================================================== */

import React from 'react';
import { BookOpen, X, Orbit, Waves, Zap, Sparkles, ShieldCheck, Clock } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine.js';

export function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

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
        maxWidth: '620px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid var(--accent-violet)',
        boxShadow: '0 0 50px rgba(157, 78, 221, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen color="var(--accent-violet)" size={24} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>QUICK RULES REFERENCE</h2>
          </div>
          <button onClick={() => { soundEngine.playClick(); onClose(); }} className="neon-btn" style={{ padding: '6px 10px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
          <div style={{ padding: '12px', background: 'rgba(0, 240, 255, 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent-cyan)' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '4px' }}>⏰ 4-TURN ROUND CADENCE & CARDS</h4>
            <p>Each round consists of exactly <strong>4 turns</strong> per player. You hold 5 action cards (Move 1, 2, 3, Gravity, Pulse)—choose which 4 to play and which 1 to rest! All cards recharge automatically at the start of each new round!</p>
          </div>

          <div style={{ padding: '12px', background: 'rgba(157, 78, 221, 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent-violet)' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--accent-violet)', marginBottom: '4px' }}>🌊 GRAVITY & PULSE WAVES (DISTANCE ATTENUATED)</h4>
            <p>Unleash cosmic waves! <strong>Gravity Wave</strong> pulls opponents and floating <strong>Asteroids</strong> toward you; <strong>Pulse Wave</strong> pushes them away! Wave strength weakens with distance: <strong>Full power</strong> within 2 spaces, <strong>1 space</strong> at 3-4 spaces, and <strong>unaffected</strong> at 5+ spaces! Hover over a wave card to preview displacement arrows (amber diamonds for asteroids)!</p>
          </div>

          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent-gold)' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '4px' }}>🕳️ TURN 4 SINGULARITY SUCTION & ORBITAL DRIFT</h4>
            <p>At the end of every turn, massless ⚡ <strong>Cosmic Energy Fields</strong> rotate 1 space clockwise along their orbit ring! Then, at the climax of Turn 4 (end of round), the center Black Hole Singularity pulls <strong>all ships, asteroids, and energy fields across the entire map inward by 1 space</strong>!</p>
          </div>

          <div style={{ padding: '12px', background: 'rgba(0, 255, 102, 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent-supercharge)' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--accent-supercharge)', marginBottom: '4px' }}>⚡ SUPERCHARGE & ENERGY OVERLOAD</h4>
            <p>Enter orbiting ⚡ <strong>Cosmic Energy Fields</strong> to absorb plasma and become <strong>Supercharged</strong> (doubling your wave power to 2 spaces!). Because these fields have no mass, they cannot be pushed or pulled by waves! Beware: absorbing another energy field while already supercharged causes an <strong>Energy Overload blow up</strong> that destroys your ship!</p>
          </div>
        </div>

        <button
          onClick={() => { soundEngine.playClick(); onClose(); }}
          className="neon-btn btn-violet"
          style={{ padding: '14px', fontSize: '1rem', marginTop: '10px', justifyContent: 'center' }}
        >
          <ShieldCheck size={18} /> GOT IT, LET'S PLAY! 🚀
        </button>
      </div>
    </div>
  );
}
