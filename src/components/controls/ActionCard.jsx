/* ==========================================================================
   GRAVITY PULSE 2026 - ACTION CARD COMPONENT (WITH TOUCH PREVIEW)
   ========================================================================== */

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Waves, Zap, CheckCircle2 } from 'lucide-react';
import { DIRECTIONS, TURN_ACTIONS } from '../../engine/types.js';

export function ActionCard({ action, isSelected, isUsed, disabled, onSelectAction }) {
  const getIcon = () => {
    const iconColor = isSelected ? '#030508' : (action.id === TURN_ACTIONS.GRAVITY ? 'var(--accent-cyan)' : (action.id === TURN_ACTIONS.PULSE ? 'var(--accent-violet)' : '#fff'));
    if (action.id === TURN_ACTIONS.GRAVITY) return <Waves className="action-icon" color={iconColor} />;
    if (action.id === TURN_ACTIONS.PULSE) return <Zap className="action-icon" color={iconColor} />;
    return <ArrowRight className="action-icon" color={iconColor} />;
  };

  // Only apply the violet hover styling if it is specifically the Pulse action AND not currently selected
  const specialClass = action.id === TURN_ACTIONS.PULSE && !isSelected ? 'btn-violet' : '';

  return (
    <button
      onClick={() => !disabled && !isUsed && onSelectAction(action)}
      disabled={disabled || isUsed}
      className={`neon-btn action-card-btn ${specialClass}`}
      style={{
        width: '100%',
        justifyContent: 'center',
        background: isSelected ? 'var(--accent-cyan)' : (isUsed ? 'rgba(255,255,255,0.02)' : undefined),
        color: isSelected ? '#030508' : (isUsed ? 'var(--text-dim)' : undefined),
        borderColor: isSelected ? '#fff' : undefined,
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {getIcon()}
        <span className="action-label" style={{ fontWeight: 700 }}>{action.label}</span>
      </div>

      {isUsed && (
        <span style={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <CheckCircle2 size={14} /> Used
        </span>
      )}
    </button>
  );
}
