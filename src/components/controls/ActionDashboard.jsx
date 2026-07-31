/* ==========================================================================
   GRAVITY PULSE 2026 - ACTION DASHBOARD & UNDO CONTROLS
   ========================================================================== */

import React from 'react';
import { ActionCard } from './ActionCard.jsx';
import { DIRECTIONS, MOVEMENT_STYLES, PHASES } from '../../engine/types.js';
import { RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine.js';

export function ActionDashboard({
  activePlayer,
  rulesConfig,
  legalActions,
  selectedAction,
  selectedDirection,
  phase,
  canUndo,
  onSelectAction,
  onSelectDirection,
  onExecuteAction,
  onUndoMove
}) {
  if (!activePlayer || phase !== PHASES.PLAYING) {
    return (
      <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontWeight: 600 }}>Waiting for action turn phase...</p>
      </div>
    );
  }

  const isHuman = activePlayer.isHuman !== false;
  const isFreeMove = rulesConfig.movementStyle.id === MOVEMENT_STYLES.FREE_DIRECTIONAL.id;
  const showDirSelector = isFreeMove && selectedAction && !selectedAction.special;

  return (
    <div className="glass-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Active Player Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            background: activePlayer.color.hex,
            boxShadow: `0 0 10px ${activePlayer.color.hex}`
          }} />
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
            Player {activePlayer.id} {activePlayer.isSupercharged ? '⚡' : ''}
          </span>
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          background: isHuman ? 'rgba(0, 240, 255, 0.15)' : 'rgba(148, 163, 184, 0.15)',
          color: isHuman ? 'var(--accent-cyan)' : 'var(--text-muted)',
          padding: '4px 10px',
          borderRadius: '12px',
          border: `1px solid ${isHuman ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'}`
        }}>
          {isHuman ? 'YOUR TURN' : 'AI OPPONENT'}
        </span>
      </div>

      {/* Execute Button - MOVED TO TOP FOR MOBILE UX */}
      {isHuman && selectedAction && (
        <button
          onClick={() => onExecuteAction(selectedAction, selectedDirection)}
          className="neon-btn btn-violet"
          style={{
            padding: '14px',
            fontSize: '1rem',
            boxShadow: '0 0 20px rgba(157, 78, 221, 0.4)'
          }}
        >
          CONFIRM & EXECUTE MOVEMENT 🚀
        </button>
      )}

      {/* Action Buttons List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>SELECT ACTION:</span>
        <div className="action-grid">
          {legalActions.map(act => (
            <ActionCard
              key={act.id}
              action={act}
              isSelected={selectedAction?.id === act.id}
              isUsed={activePlayer.usedActions[act.id]}
              disabled={!isHuman}
              onSelectAction={(a) => { soundEngine.playClick(); onSelectAction(a); }}
            />
          ))}
        </div>
      </div>

      {/* Direction Selector (Only in Free Directional Mode for directional moves) */}
      {showDirSelector && isHuman && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>CHOOSE DIRECTION:</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT].map(dir => {
              const isSel = selectedDirection?.label === dir.label;
              return (
                <button
                  key={dir.label}
                  onClick={() => { soundEngine.playClick(); onSelectDirection(dir); }}
                  className="neon-btn direction-btn"
                  style={{
                    background: isSel ? 'var(--accent-cyan)' : undefined,
                    color: isSel ? '#030508' : undefined
                  }}
                >
                  {dir.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Undo Move Button (Casual Mistake Protection!) */}
      {canUndo && isHuman && (
        <button
          onClick={() => { soundEngine.playClick(); onUndoMove(); }}
          className="neon-btn"
          style={{
            padding: '10px',
            fontSize: '0.85rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
            color: '#ef4444',
            marginTop: '4px'
          }}
        >
          <RotateCcw size={14} /> Undo Last Move (Casual Protection)
        </button>
      )}
    </div>
  );
}
