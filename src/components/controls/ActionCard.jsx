/* ==========================================================================
   GRAVITY PULSE 2026 - ACTION CARD COMPONENT (WITH TOUCH PREVIEW)
   ========================================================================== */

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Waves, Zap, CheckCircle2 } from 'lucide-react';
import { DIRECTIONS, TURN_ACTIONS } from '../../engine/types.js';

export function ActionCard({ action, isSelected, isUsed, disabled, onSelectAction }) {
  const getIcon = () => {
    // If selected, we force '#030508' using inline color so it always stays dark over cyan.
    // If not selected, we don't supply 'color', but instead attach the appropriate CSS class
    // so it naturally takes the default color and properly inverts on CSS hover.
    if (isSelected) {
      if (action.id === TURN_ACTIONS.GRAVITY) return <Waves className="action-icon" color="#030508" />;
      if (action.id === TURN_ACTIONS.PULSE) return <Zap className="action-icon" color="#030508" />;
      return <ArrowRight className="action-icon" color="#030508" />;
    }

    if (action.id === TURN_ACTIONS.GRAVITY) return <Waves className="action-icon icon-cyan" />;
    if (action.id === TURN_ACTIONS.PULSE) return <Zap className="action-icon icon-violet" />;
    return <ArrowRight className="action-icon" color="#fff" />;
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
        <span className="action-label" style={{ fontWeight: 700 }}>
          {isSelected ? (
            <>
              <span className="label-desktop">CONFIRM {action.label}</span>
              <span className="label-mobile">{action.label}</span>
            </>
          ) : (
            action.label
          )}
        </span>
      </div>

      {isUsed && (
        <span style={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <CheckCircle2 size={14} /> Used
        </span>
      )}
    </button>
  );
}
