/* ==========================================================================
   GRAVITY PULSE 2026 - RULES MODAL
   ========================================================================== */

import React, { useState } from 'react';
import { BookOpen, X, ChevronRight, ChevronLeft, Orbit, Waves, Zap, ShieldCheck, Clock, BookText } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine.js';

export function RulesModal({ isOpen, onClose }) {
  const [viewMode, setViewMode] = useState('quick'); // 'quick' | 'detailed'
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const quickSlides = [
    {
      title: "1. The Basics",
      icon: <Clock color="var(--accent-cyan)" size={24} />,
      color: "var(--accent-cyan)",
      content: (
        <>
          <p>Each round you play exactly <strong>4 turns</strong>. You have 5 action cards:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li>Move 1 Space</li>
            <li>Move 2 Spaces</li>
            <li>Move 3 Spaces</li>
            <li>Gravity Wave</li>
            <li>Pulse Wave</li>
          </ul>
          <p style={{ marginTop: '8px' }}>Choose which 4 to play and which 1 to rest. Cards recharge every round!</p>
        </>
      )
    },
    {
      title: "2. Waves & Movement",
      icon: <Waves color="var(--accent-violet)" size={24} />,
      color: "var(--accent-violet)",
      content: (
        <>
          <p>Unleash cosmic waves to push and pull your enemies!</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li><strong>Gravity Wave:</strong> Pulls opponents and Asteroids towards you.</li>
            <li><strong>Pulse Wave:</strong> Pushes opponents and Asteroids away.</li>
          </ul>
          <p style={{ marginTop: '8px' }}>Move around the board and use waves to force opponents into hazards!</p>
        </>
      )
    },
    {
      title: "3. Winning & Scoring",
      icon: <Zap color="#ff007f" size={24} />,
      color: "#ff007f",
      content: (
        <>
          <p>Eliminate your opponents to score points!</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li>Push opponents into the center <strong>Black Hole</strong>.</li>
            <li>Smash them into <strong>Asteroids</strong>.</li>
            <li>Earn <strong>+1 point</strong> for every opponent you destroy.</li>
          </ul>
          <p style={{ marginTop: '8px', fontStyle: 'italic', opacity: 0.8 }}>Ready to play? Or check Detailed Rules for advanced mechanics.</p>
        </>
      )
    }
  ];

  const handleNext = () => {
    soundEngine.playClick();
    if (currentSlide < quickSlides.length - 1) {
      setCurrentSlide(s => s + 1);
    }
  };

  const handlePrev = () => {
    soundEngine.playClick();
    if (currentSlide > 0) {
      setCurrentSlide(s => s - 1);
    }
  };

  const toggleView = () => {
    soundEngine.playClick();
    setViewMode(viewMode === 'quick' ? 'detailed' : 'quick');
    setCurrentSlide(0);
  };

  const activeSlide = quickSlides[currentSlide];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 5, 8, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--accent-violet)',
        boxShadow: '0 0 50px rgba(157, 78, 221, 0.2)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', padding: '24px 24px 12px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen color="var(--accent-violet)" size={24} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              {viewMode === 'quick' ? 'QUICK START' : 'DETAILED RULES'}
            </h2>
          </div>
          <button onClick={() => { soundEngine.playClick(); onClose(); }} className="neon-btn" style={{ padding: '6px 10px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', minHeight: '280px' }}>
          {viewMode === 'quick' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
              <div style={{ 
                padding: '20px', 
                background: `rgba(${activeSlide.color === '#ff007f' ? '255, 0, 127' : activeSlide.color === 'var(--accent-cyan)' ? '0, 240, 255' : '157, 78, 221'}, 0.05)`, 
                borderRadius: '10px', 
                borderLeft: `4px solid ${activeSlide.color}`,
                minHeight: '180px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  {activeSlide.icon}
                  <h3 style={{ fontWeight: 800, color: activeSlide.color, margin: 0, fontSize: '1.2rem' }}>{activeSlide.title}</h3>
                </div>
                {activeSlide.content}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
              {/* Detailed Rules Content */}
              <div style={{ padding: '12px', background: 'rgba(157, 78, 221, 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent-violet)' }}>
                <h4 style={{ fontWeight: 800, color: 'var(--accent-violet)', marginBottom: '4px' }}>🌊 WAVE ATTENUATION</h4>
                <p>Waves push/pull by <strong>1 space</strong> normally. If <strong>Supercharged</strong>, waves move targets by <strong>2 spaces</strong> within close range (1-2 spaces), but attenuate to <strong>1 space</strong> at medium range (3-4 spaces).</p>
              </div>
              <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent-gold)' }}>
                <h4 style={{ fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '4px' }}>🕳️ TURN 4 SINGULARITY & ORBITAL DRIFT</h4>
                <p>End of every turn: ⚡ Cosmic Energy Fields rotate 1 space clockwise. <br/>End of Turn 4: The center Black Hole pulls <strong>all pieces across the entire map inward by 1 space</strong>.</p>
              </div>
              <div style={{ padding: '12px', background: 'rgba(0, 255, 102, 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent-supercharge)' }}>
                <h4 style={{ fontWeight: 800, color: 'var(--accent-supercharge)', marginBottom: '4px' }}>⚡ SUPERCHARGE OVERLOAD</h4>
                <p>Collect ⚡ Cosmic Energy to become Supercharged (double wave power). Energy fields have no mass and aren't affected by waves. <strong>Warning:</strong> Collecting a second energy field while already supercharged causes a fatal <strong>Energy Overload</strong>!</p>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255, 0, 127, 0.05)', borderRadius: '10px', borderLeft: '3px solid #ff007f' }}>
                <h4 style={{ fontWeight: 800, color: '#ff007f', marginBottom: '4px' }}>💥 KAMIKAZE SACRIFICE</h4>
                <p>Crashing your ship directly into an opponent destroys BOTH pieces, but you still earn +1 point for the elimination! Use this tactic wisely!</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', padding: '16px 24px' }}>
          
          <button 
            onClick={toggleView}
            className="neon-btn" 
            style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', gap: '6px', opacity: 0.8 }}
          >
            <BookText size={16} />
            {viewMode === 'quick' ? 'Read Detailed Rules' : 'Back to Quick Start'}
          </button>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {viewMode === 'quick' && (
              <>
                <div style={{ display: 'flex', gap: '4px', marginRight: '10px' }}>
                  {quickSlides.map((_, i) => (
                    <div key={i} style={{ 
                      width: '8px', height: '8px', borderRadius: '50%', 
                      background: i === currentSlide ? 'var(--accent-violet)' : 'rgba(255,255,255,0.2)',
                      transition: 'background 0.2s'
                    }} />
                  ))}
                </div>
                
                <button 
                  onClick={handlePrev}
                  disabled={currentSlide === 0}
                  className="neon-btn" 
                  style={{ padding: '8px', opacity: currentSlide === 0 ? 0.3 : 1, cursor: currentSlide === 0 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={18} />
                </button>
                
                {currentSlide < quickSlides.length - 1 ? (
                  <button 
                    onClick={handleNext}
                    className="neon-btn" 
                    style={{ padding: '8px 16px', display: 'flex', gap: '6px' }}
                  >
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => { soundEngine.playClick(); onClose(); }}
                    className="neon-btn btn-violet"
                    style={{ padding: '8px 16px', display: 'flex', gap: '6px', fontWeight: 'bold' }}
                  >
                    <ShieldCheck size={18} /> PLAY
                  </button>
                )}
              </>
            )}

            {viewMode === 'detailed' && (
               <button
                 onClick={() => { soundEngine.playClick(); onClose(); }}
                 className="neon-btn btn-violet"
                 style={{ padding: '8px 16px', display: 'flex', gap: '6px', fontWeight: 'bold' }}
               >
                 <ShieldCheck size={18} /> GOT IT
               </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
