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
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Player {activePlayer.id} {activePlayer.isSupercharged && <Zap size={18} color="#00ff66" fill="#00ff66" />}
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
      {(canUndo || !isHuman) && (
        <div style={{ minHeight: '52px', marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
          {!isHuman ? (
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)', animation: 'pulse 1.5s infinite' }}>
              AI IS THINKING...
            </span>
          ) : (
            <button
              onClick={() => { soundEngine.playClick(); onUndoMove(); }}
              className="neon-btn"
              style={{
                flex: 1,
                padding: '12px 10px',
                fontSize: '0.9rem',
                background: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#ef4444',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RotateCcw size={14} /> Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
