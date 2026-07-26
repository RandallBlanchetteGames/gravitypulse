/* ==========================================================================
   GRAVITY PULSE 2026 - GAME LOG & EVENT HISTORY FEED
   ========================================================================== */

import React, { useRef, useEffect } from 'react';
import { ScrollText } from 'lucide-react';

export function GameLog({ logs = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <ScrollText size={18} color="var(--accent-violet)" />
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
          COSMIC EVENT LOG
        </h3>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        maxHeight: '260px',
        minHeight: '160px',
        overflowY: 'auto',
        fontSize: '0.8rem',
        paddingRight: '4px'
      }}>
        {logs.length === 0 ? (
          <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', padding: '10px 0' }}>
            Awaiting gravitational movement...
          </span>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              style={{
                padding: '6px 10px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderLeft: log.includes('💥') || log.includes('☄️') || log.includes('🚀') ? '3px solid #ef4444' :
                            log.includes('⚡') ? '3px solid #00ff66' :
                            log.includes('🕳️') ? '3px solid var(--accent-gold)' : '3px solid var(--accent-cyan)',
                borderRadius: '4px',
                color: 'var(--text-main)',
                lineHeight: 1.3
              }}
            >
              {log}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
