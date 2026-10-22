/**
 * Romantic Space Date Experience — Audio Engine
 * Pure Web Audio API Synthesizer (0 external audio files, 100% offline & reliable)
 */
class SpaceAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isPlaying = false;
    this.masterGain = null;
    this.droneGain = null;
    this.padOscillators = [];
    this.currentChordIndex = 0;
    this.timer = null;
    
    // Romantic, celestial chords (Hz frequencies)
    // Progression: Ebmaj9 -> Cm9 -> Abmaj9 -> Bbadd9
    this.chords = [
      [155.56, 196.00, 233.08, 293.66, 349.23], // Eb3, G3, Bb3, D4, F4
      [130.81, 155.56, 196.00, 261.63, 293.66], // C3, Eb3, G3, C4, D4
      [103.83, 155.56, 207.65, 246.94, 311.13], // Ab2, Eb3, Ab3, B3, Eb4
      [116.54, 174.61, 233.08, 261.63, 349.23]  // Bb2, F3, Bb3, C4, F4
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;
    
    this.playAmbientDrone();
    this.scheduleNextChord();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.timer) clearTimeout(this.timer);
    
    // Fade out active pad notes
    this.padOscillators.forEach(({ osc, gain }) => {
      try {
        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
        osc.stop(now + 1.6);
      } catch (e) {}
    });
    this.padOscillators = [];
  }

  toggleMute() {
    if (!this.ctx) {
      this.start();
      return true;
    }
    
    this.isMuted = !this.isMuted;
    const now = this.ctx.currentTime;
    
    if (this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.3);
    } else {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      if (!this.isPlaying) this.start();
      this.masterGain.gain.setValueAtTime(0, now);
      this.masterGain.gain.linearRampToValueAtTime(0.35, now + 0.5);
    }
    return !this.isMuted;
  }

  playAmbientDrone() {
    if (!this.ctx) return;
    // Deep 432Hz harmonic cosmic background hum
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    this.droneGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(54.0, this.ctx.currentTime); // Low A/C tone
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(108.0, this.ctx.currentTime);
    osc2.detune.setValueAtTime(4, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, this.ctx.currentTime);
    filter.Q.setValueAtTime(2, this.ctx.currentTime);

    this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.droneGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 3.0);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
  }

  scheduleNextChord() {
    if (!this.isPlaying || !this.ctx) return;

    const chord = this.chords[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;

    this.playChord(chord, 5.5);

    // Schedule next chord with smooth crossfade
    this.timer = setTimeout(() => {
      this.scheduleNextChord();
    }, 5000);
  }

  playChord(frequencies, duration) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(650, now + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(380, now + duration);
    filter.connect(this.masterGain);

    frequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

      // Warm attack & long release
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 1.8);
      gain.gain.setValueAtTime(0.035, now + duration - 1.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc.stop(now + duration + 0.1);

      this.padOscillators.push({ osc, gain });
    });

    // Clean up expired oscillators
    setTimeout(() => {
      this.padOscillators = this.padOscillators.filter(p => {
        try { return p.osc.playbackState !== 3; } catch (e) { return false; }
      });
    }, (duration + 0.5) * 1000);
  }

  /**
   * Sound effect when transitioning planets
   */
  playPlanetWhoosh() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Filtered noise sweep
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.35);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.8);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);

    // Ethereal chime note
    this.playStellarChime(587.33); // D5
  }

  /**
   * Ethereal bell / chime tone
   */
  playStellarChime(freq = 659.25) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 2.3);
  }

  /**
   * Triumphant sparkling celebration when she clicks "Yes, obviously"
   */
  playYesCelebration() {
    if (!this.ctx || this.isMuted) return;
    
    // Uplifting crystalline harp cascade: C5 -> E5 -> G5 -> B5 -> C6 -> E6
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 2.6);
      }, i * 140);
    });

    // Warm chord swell
    setTimeout(() => {
      this.playChord([261.63, 329.63, 392.00, 493.88, 587.33], 6.0);
    }, 400);
  }

  /**
   * Subtle button tap sound
   */
  playButtonTap() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }
}

window.spaceAudio = new SpaceAudioEngine();
