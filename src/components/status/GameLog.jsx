/* ==========================================================================
   GRAVITY PULSE 2026 - GAME LOG & EVENT HISTORY FEED
   ========================================================================== */

import React, { useRef, useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';

export function GameLog({ logs = [] }) {
  const containerRef = useRef(null);
  const [hasMoreAbove, setHasMoreAbove] = useState(false);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setHasMoreAbove(el.scrollTop > 10);
    setHasMoreBelow(el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      checkScroll();
    }
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

      {hasMoreAbove && (
        <div 
          className="scroll-bounce-up"
          onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            textAlign: 'center',
            color: 'var(--accent-cyan)',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: '2px 0',
            letterSpacing: '0.05em',
            textShadow: '0 0 8px rgba(0, 240, 255, 0.6)'
          }}
          title="Scroll to oldest events"
        >
          ▲ MORE EVENTS ABOVE ▲
        </div>
      )}

      <div 
        ref={containerRef}
        onScroll={checkScroll}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxHeight: '260px',
          minHeight: '160px',
          overflowY: 'auto',
          fontSize: '0.8rem',
          paddingRight: '4px'
        }}
      >
        {logs.length === 0 ? (
          <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', padding: '10px 0' }}>
            Awaiting gravitational movement...
          </span>
        ) : (
          logs.map((log, idx) => {
            const cleanLog = log.replace(/[✨💥⚡💀💫🕳️🌌⚠️❤️⭐🌟🔥☄️🚀]/g, '').trim();
            return (
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
                {cleanLog}
              </div>
            );
          })
        )}
      </div>

      {hasMoreBelow && (
        <div 
          className="scroll-bounce-down"
          onClick={() => containerRef.current?.scrollTo({ top: containerRef.current?.scrollHeight, behavior: 'smooth' })}
          style={{
            textAlign: 'center',
            color: 'var(--accent-cyan)',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: '2px 0',
            letterSpacing: '0.05em',
            textShadow: '0 0 8px rgba(0, 240, 255, 0.6)'
          }}
          title="Scroll to newest events"
        >
          ▼ MORE EVENTS BELOW ▼
        </div>
      )}
    </div>
  );
}
