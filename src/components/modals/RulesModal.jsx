/* ==========================================================================
   GRAVITY PULSE 2026 - RULES QUICK REFERENCE MODAL
   ========================================================================== */

import React from 'react';
import { BookOpen, X, Orbit, Waves, Zap, Sparkles, ShieldCheck } from 'lucide-react';
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
        maxWidth: '600px',
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
            <h4 style={{ fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '4px' }}>🎯 OBJECTIVE & SCORE</h4>
            <p>Navigate the deep space grid without drifting into the void or colliding with hazards! Navigate directly into the center <strong>Black Hole Singularity</strong> to score points and gain ⚡ <strong>Supercharged</strong> status!</p>
          </div>

          <div style={{ padding: '12px', background: 'rgba(157, 78, 221, 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent-violet)' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--accent-violet)', marginBottom: '4px' }}>🌊 GRAVITY & PULSE WAVES</h4>
            <p>Instead of regular steps, unleash waves! <strong>Gravity Wave</strong> pulls all opponents 1 space toward you. <strong>Pulse Wave</strong> pushes all opponents 1 space away! (If you are Supercharged, wave power doubles!).</p>
          </div>

          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent-gold)' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '4px' }}>🕳️ TURN 4 SINGULARITY SUCTION</h4>
            <p>At the end of every round, the center Black Hole activates, pulling every piece on the board 1 space inward! Plan your positioning so opponents get sucked into the void while you stay safe!</p>
          </div>

          <div style={{ padding: '12px', background: 'rgba(0, 255, 102, 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent-supercharge)' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--accent-supercharge)', marginBottom: '4px' }}>⚡ MISTAKE PROTECTION & UNDO</h4>
            <p>Made a casual miscalculation? Tap the <strong>Undo Last Move</strong> button at any time during your turn to safely rewind and try a different tactical approach!</p>
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
