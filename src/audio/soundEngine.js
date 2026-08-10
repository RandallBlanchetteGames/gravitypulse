/* ==========================================================================
   GRAVITY PULSE 2026 - PURE WEB AUDIO API SOUND ENGINE
   Zero external audio files. Instant sub-millisecond synthesis.
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isBackgroundPaused = false;
    
    // Master routing nodes
    this.masterGain = null;
    this.compressor = null;
    this.delayNode = null;

    // HTML5 Audio for background music playlist
    this.playlist = ['/background-music.mp3', '/background-music-2.mp3'];
    this.currentTrackIndex = 0;

    if (typeof window !== 'undefined') {
      this.bgMusic = new Audio(this.playlist[this.currentTrackIndex]);
      this.bgMusic.volume = 0.15; // Lowered volume further
      
      // Advance to next track when one ends
      this.bgMusic.addEventListener('ended', () => {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.bgMusic.src = this.playlist[this.currentTrackIndex];
        this.bgMusic.load(); // Force the browser to load the new source
        if (!this.isMuted && !this.isBackgroundPaused) {
          this.bgMusic.play().catch(e => console.warn('Audio play failed:', e));
        }
      });
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        
        // Setup Master Bus
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.6, this.ctx.currentTime); // Global SFX volume mix

        // Setup Space Echo (Delay)
        this.delayNode = this.ctx.createDelay();
        this.delayNode.delayTime.setValueAtTime(0.3, this.ctx.currentTime);
        const feedback = this.ctx.createGain();
        feedback.gain.setValueAtTime(0.2, this.ctx.currentTime);
        
        // Routing
        this.delayNode.connect(feedback);
        feedback.connect(this.delayNode);
        this.delayNode.connect(this.masterGain);

        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    if (this.bgMusic && this.bgMusic.paused && !this.isMuted && !this.isBackgroundPaused) {
      this.bgMusic.play().catch(e => console.warn('Audio play failed:', e));
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    
    if (this.bgMusic) {
      this.bgMusic.muted = this.isMuted;
      if (!this.isMuted && this.bgMusic.paused && !this.isBackgroundPaused) {
        this.bgMusic.play().catch(e => console.warn('Audio play failed:', e));
      }
    }
    return this.isMuted;
  }

  pauseBackground() {
    this.isBackgroundPaused = true;
    if (this.bgMusic && !this.bgMusic.paused) {
      this.bgMusic.pause();
    }
  }

  resumeBackground() {
    this.isBackgroundPaused = false;
    if (this.bgMusic && this.bgMusic.paused && !this.isMuted) {
      this.bgMusic.play().catch(e => console.warn('Audio play failed:', e));
    }
  }

  /* --- Premium UI Click: Glassy Blip --- */
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle'; // Glassy tone
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);
      
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime); // Subtle volume
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  /* --- Premium Move: Soft Sci-Fi Sweep --- */
  playMove() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, this.ctx.currentTime);
      filter.Q.value = 1.0;

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }

  /* --- Premium Gravity/Pulse Hum: Cinematic Subs --- */
  playGravityHum(isPulse = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc1 = this.ctx.createOscillator(); // Sub bass
      const osc2 = this.ctx.createOscillator(); // Mid hum
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      
      osc1.type = 'sine';
      osc2.type = 'triangle';

      const t0 = this.ctx.currentTime;
      const t1 = t0 + 0.4;
      
      if (isPulse) {
        // Push outward
        osc1.frequency.setValueAtTime(60, t0);
        osc1.frequency.exponentialRampToValueAtTime(200, t1);
        osc2.frequency.setValueAtTime(120, t0);
        osc2.frequency.exponentialRampToValueAtTime(400, t1);
      } else {
        // Pull inward
        osc1.frequency.setValueAtTime(200, t0);
        osc1.frequency.exponentialRampToValueAtTime(60, t1);
        osc2.frequency.setValueAtTime(400, t0);
        osc2.frequency.exponentialRampToValueAtTime(120, t1);
      }

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isPulse ? 300 : 800, t0);
      filter.frequency.linearRampToValueAtTime(isPulse ? 800 : 300, t1);

      gain.gain.setValueAtTime(0.0, t0);
      gain.gain.linearRampToValueAtTime(0.2, t0 + 0.05); // Attack
      gain.gain.exponentialRampToValueAtTime(0.001, t1); // Decay
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      // Route to delay for space feel
      gain.connect(this.delayNode);
      
      osc1.start(); osc2.start();
      osc1.stop(t1 + 0.1); osc2.stop(t1 + 0.1);
    } catch (e) {}
  }

  /* --- Premium Explosion: Filtered Rumble + Crackle --- */
  playExplosion() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t0 = this.ctx.currentTime;
      const dur = 0.3;

      // Sub Rumble Layer
      const sub = this.ctx.createOscillator();
      sub.type = 'square';
      sub.frequency.setValueAtTime(100, t0);
      sub.frequency.exponentialRampToValueAtTime(20, t0 + dur);
      const subFilter = this.ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(250, t0);
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.3, t0);
      subGain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      sub.connect(subFilter).connect(subGain).connect(this.masterGain);

      // Noise Layer
      const bufferSize = this.ctx.sampleRate * dur;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, t0);
      noiseFilter.frequency.exponentialRampToValueAtTime(200, t0 + dur);
      noiseFilter.Q.value = 1.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, t0);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

      noise.connect(noiseFilter).connect(noiseGain).connect(this.masterGain);
      
      // Echo tail
      subGain.connect(this.delayNode);
      noiseGain.connect(this.delayNode);

      sub.start(); noise.start();
      sub.stop(t0 + dur);
    } catch (e) {}
  }

  /* --- Premium Supercharge: Ethereal FM Chime --- */
  playSupercharge() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t0 = this.ctx.currentTime;
      const notes = [523.25, 783.99, 1046.50]; // C5, G5, C6 (Spaced out chord)
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const fm = this.ctx.createOscillator();
        const fmGain = this.ctx.createGain();
        const gain = this.ctx.createGain();
        
        const startTime = t0 + idx * 0.1;
        
        // Modulator (FM)
        fm.type = 'sine';
        fm.frequency.setValueAtTime(freq * 2.01, startTime); // Slight detune for metallic ring
        fmGain.gain.setValueAtTime(300, startTime);
        fmGain.gain.exponentialRampToValueAtTime(1, startTime + 0.3);
        
        // Carrier
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Envelopes
        gain.gain.setValueAtTime(0.0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05); // Soft attack
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
        
        fm.connect(fmGain).connect(osc.frequency);
        osc.connect(gain);
        gain.connect(this.masterGain);
        gain.connect(this.delayNode); // Heavy delay on chimes
        
        fm.start(startTime); osc.start(startTime);
        fm.stop(startTime + 1.0); osc.stop(startTime + 1.0);
      });
    } catch (e) {}
  }

  /* --- Overload: Electric Zap --- */
  playOverload() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t0 = this.ctx.currentTime;
      const dur = 0.4;
      
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      // Fast erratic frequency jumps to simulate electric zap
      osc.frequency.setValueAtTime(400, t0);
      osc.frequency.setValueAtTime(800, t0 + 0.05);
      osc.frequency.setValueAtTime(200, t0 + 0.1);
      osc.frequency.setValueAtTime(600, t0 + 0.15);
      osc.frequency.setValueAtTime(100, t0 + 0.2);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, t0);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, t0);
      gain.gain.linearRampToValueAtTime(0.001, t0 + dur);
      
      osc.connect(filter).connect(gain).connect(this.masterGain);
      osc.start();
      osc.stop(t0 + dur);
    } catch (e) {}
  }

  /* --- Black Hole: Vacuum Suck --- */
  playBlackHole() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t0 = this.ctx.currentTime;
      const dur = 1.2;

      // Deep vacuum oscillator
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, t0);
      osc.frequency.exponentialRampToValueAtTime(20, t0 + dur);
      
      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.2, t0);
      oscGain.gain.linearRampToValueAtTime(0.001, t0 + dur);
      
      osc.connect(oscGain).connect(this.masterGain);
      oscGain.connect(this.delayNode);

      // Filtered rushing air noise
      const bufferSize = this.ctx.sampleRate * dur;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(2000, t0);
      noiseFilter.exponentialRampToValueAtTime(50, t0 + dur);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0, t0);
      noiseGain.gain.linearRampToValueAtTime(0.15, t0 + 0.2); // Attack
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

      noise.connect(noiseFilter).connect(noiseGain).connect(this.masterGain);
      noiseGain.connect(this.delayNode);

      osc.start(); noise.start();
      osc.stop(t0 + dur);
    } catch (e) {}
  }
}

export const soundEngine = new SoundEngine();
