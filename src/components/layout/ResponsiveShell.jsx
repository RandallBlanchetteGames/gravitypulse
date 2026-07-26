/* ==========================================================================
   GRAVITY PULSE 2026 - RESPONSIVE SHELL COMPONENT
   ========================================================================== */

import React, { useState } from 'react';
import { ListFilter, Trophy } from 'lucide-react';

export function ResponsiveShell({ leftPanel, centerBoard, rightPanel }) {
  const [mobileTab, setMobileTab] = useState('controls'); // 'controls', 'scores', 'log'

  return (
    <main className="cosmic-shell">
      {/* Left Column: Action Dashboard & Phase Status */}
      <section className="shell-left" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {leftPanel}
      </section>

      {/* Center Column: Interactive Aspect-Ratio Board */}
      <section className="shell-center board-wrapper">
        {centerBoard}
      </section>

      {/* Right Column (Desktop/Tablet): Scoreboard & Game Log */}
      <section className="shell-right" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {rightPanel}
      </section>
    </main>
  );
}
