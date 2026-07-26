/* ==========================================================================
   GRAVITY PULSE 2026 - ACTION CARD COMPONENT (WITH TOUCH PREVIEW)
   ========================================================================== */

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Waves, Zap, CheckCircle2 } from 'lucide-react';
import { DIRECTIONS, TURN_ACTIONS } from '../../engine/types.js';

export function ActionCard({ action, isSelected, isUsed, disabled, onSelectAction }) {
  const getIcon = () => {
    if (action.id === TURN_ACTIONS.GRAVITY) return <Waves size={18} color="var(--accent-cyan)" />;
    if (action.id === TURN_ACTIONS.PULSE) return <Zap size={18} color="var(--accent-violet)" />;
    return <ArrowRight size={18} color="#fff" />;
  };

  return (
    <button
      onClick={() => !disabled && !isUsed && onSelectAction(action)}
      disabled={disabled || isUsed}
      className={`neon-btn ${action.special ? 'btn-violet' : ''}`}
      style={{
        width: '100%',
        justifyContent: 'space-between',
        padding: '14px 18px',
        background: isSelected ? 'var(--accent-cyan)' : (isUsed ? 'rgba(255,255,255,0.02)' : undefined),
        color: isSelected ? '#030508' : (isUsed ? 'var(--text-dim)' : undefined),
        borderColor: isSelected ? '#fff' : undefined,
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {getIcon()}
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{action.label}</span>
      </div>

      {isUsed && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <CheckCircle2 size={14} /> Used
        </span>
      )}
    </button>
  );
}
