/* ==========================================================================
   GRAVITY PULSE 2026 - ACTION DASHBOARD & UNDO CONTROLS
   ========================================================================== */

import React from 'react';
import { ActionCard } from './ActionCard.jsx';
import { DIRECTIONS, MOVEMENT_STYLES, PHASES } from '../../engine/types.js';
import { RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ShieldAlert, Zap, Rocket } from 'lucide-react';
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
      {/* Action Buttons List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            SELECT AN ACTION. TAP TO CONFIRM.
          </span>
        {/* Moves Group */}
        <div className="action-grid">
          {legalActions.filter(act => !act.special).map(act => (
            <ActionCard
              key={act.id}
              action={act}
              isSelected={selectedAction?.id === act.id}
              isUsed={activePlayer.usedActions[act.id]}
              disabled={!isHuman}
              onSelectAction={(a) => { 
                soundEngine.playClick(); 
                if (selectedAction?.id === a.id) {
                  onExecuteAction(a, selectedDirection);
                } else {
                  onSelectAction(a); 
                }
              }}
            />
          ))}
        </div>

        {/* Direction Selector Injection (Only in Free Directional Mode) */}
        {isFreeMove && isHuman && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '6px', 
            opacity: showDirSelector ? 1 : 0.4,
            pointerEvents: showDirSelector ? 'auto' : 'none',
            transition: 'opacity 0.2s ease'
          }}>
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
        )}

        {/* Waves Group */}
        <div className="action-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {legalActions.filter(act => act.special).map(act => (
            <ActionCard
              key={act.id}
              action={act}
              isSelected={selectedAction?.id === act.id}
              isUsed={activePlayer.usedActions[act.id]}
              disabled={!isHuman}
              onSelectAction={(a) => { 
                soundEngine.playClick(); 
                if (selectedAction?.id === a.id) {
                  onExecuteAction(a, selectedDirection);
                } else {
                  onSelectAction(a); 
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Consolidated Action Execution Area */}
      {!isHuman && (
        <div style={{ minHeight: '52px', marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)', animation: 'pulse 1.5s infinite' }}>
            AI IS THINKING...
          </span>
        </div>
      )}
    </div>
  );
}
