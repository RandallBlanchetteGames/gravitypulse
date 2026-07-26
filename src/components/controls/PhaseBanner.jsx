/* ==========================================================================
   GRAVITY PULSE 2026 - PHASE BANNER & 4-TURN ROUND AWARENESS
   ========================================================================== */

import React from 'react';
import { PHASES } from '../../engine/types.js';
import { Sparkles } from 'lucide-react';

export function PhaseBanner({ phase, currentRound, maxRounds, activePlayer, turnInRound = 1 }) {
  const getBannerContent = () => {
    switch (phase) {
      case PHASES.SETUP:
        return {
          title: "SETUP PHASE",
          text: "Tap anywhere in a 3x3 Region to deploy your piece to its center!",
          color: "var(--accent-cyan)",
          border: "rgba(0, 240, 255, 0.3)"
        };
      case PHASES.PLAYING:
        return {
          title: `ROUND ${currentRound} OF ${maxRounds} | TURN ${turnInRound} OF 4`,
          text: `Player ${activePlayer?.id || 1}'s Turn (${5 - turnInRound} turn(s) until Turn 4 Singularity Suction!). Select an action.`,
          color: "#fff",
          border: "rgba(255, 255, 255, 0.15)"
        };
      case PHASES.RESPAWN:
        return {
          title: "RESPAWN PHASE",
          text: `Player ${activePlayer?.id || 1}: Tap a safe region center to re-enter the cosmic field!`,
          color: "var(--accent-supercharge)",
          border: "rgba(0, 255, 102, 0.3)"
        };
      default:
        return {
          title: "COSMIC FIELD ACTIVE",
          text: "Survival objective in progress.",
          color: "var(--text-main)",
          border: "rgba(255, 255, 255, 0.1)"
        };
    }
  };

  const info = getBannerContent();

  return (
    <div className="glass-card" style={{
      padding: '14px 18px',
      borderLeft: `4px solid ${info.color}`,
      background: 'rgba(13, 16, 29, 0.85)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <Sparkles size={20} color={info.color} />
      <div>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: info.color, letterSpacing: '0.05em' }}>
          {info.title}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '2px' }}>
          {info.text}
        </p>
      </div>
    </div>
  );
}
