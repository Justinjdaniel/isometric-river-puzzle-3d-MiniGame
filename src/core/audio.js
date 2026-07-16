// Procedural Sound Synthesizer & Ambient Environment using Web Audio API

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true; // Sfx toggle tracking

    // Master Gain for easy state synchronization (Mute/Unmute)
    this.masterGain = null;

    // Ambient valley loops nodes
    this.windNode = null;
    this.birdTimer = null;

    // Attempt to load settings from localStorage if available
    try {
      const saved = localStorage.getItem('river_crossing_sfx_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch (e) {
      console.warn('[SoundManager] Could not access localStorage', e);
    }
  }

  // Lazy initializer so audio contexts are only instantiated on user interaction or toggle to avoid console warnings
  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();

        // Setup Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.enabled ? 1.0 : 0.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Start Ambient Soundscape if enabled
        if (this.enabled) {
          this.startAmbient();
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('river_crossing_sfx_enabled', this.enabled.toString());
    } catch (e) {}

    // Init if not already initialized
    this.init();

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      if (this.enabled) {
        // Unmute and start ambient
        this.masterGain.gain.setTargetAtTime(1.0, now, 0.1);
        this.startAmbient();
        this.playToggleOn();
      } else {
        // Mute immediately and stop/suspend ambient
        this.masterGain.gain.setTargetAtTime(0.0, now, 0.05);
        this.stopAmbient();
      }
    }
    return this.enabled;
  }

  // Start the background valley ambient soundscape
  startAmbient() {
    if (!this.enabled || !this.ctx) return;
    if (this.windNode) return; // Already running

    const now = this.ctx.currentTime;

    // 1. Synthesize Wind (pinkish/brownish noise)
    const bufferSize = this.ctx.sampleRate * 2; // 2-second loop buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate pink-like noise filter
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // normalise pink/brown noise
      b6 = white * 0.115926;
    }

    this.windNode = this.ctx.createBufferSource();
    this.windNode.buffer = buffer;
    this.windNode.loop = true;

    // Lowpass filter to make wind sound deep and atmospheric
    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(350, now);

    // Wind volume gain (low volume)
    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.04, now);

    this.windNode.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.masterGain);

    this.windNode.start(0);

    // 2. Schedule procedurally generated cute bird chirps
    this.scheduleBirdChirps();
  }

  stopAmbient() {
    if (this.windNode) {
      try {
        this.windNode.stop();
      } catch (e) {}
      this.windNode = null;
    }
    if (this.birdTimer) {
      clearTimeout(this.birdTimer);
      this.birdTimer = null;
    }
  }

  scheduleBirdChirps() {
    if (!this.enabled || !this.ctx) return;

    // Schedule a chirp every 6 to 12 seconds
    const delay = 6000 + Math.random() * 6000;
    this.birdTimer = setTimeout(() => {
      this.playBirdChirp();
      this.scheduleBirdChirps();
    }, delay);
  }

  playBirdChirp() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Synthesize 2-3 cute high bird chirplets
    const numChirps = 2 + Math.floor(Math.random() * 2);
    let startTime = now;

    for (let i = 0; i < numChirps; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.type = 'sine';
      const baseFreq = 2200 + Math.random() * 600; // very high frequency bird chirps
      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, startTime + 0.08);

      gain.gain.setValueAtTime(0.0, startTime);
      gain.gain.linearRampToValueAtTime(0.015, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      osc.start(startTime);
      osc.stop(startTime + 0.08);

      startTime += 0.12 + Math.random() * 0.08;
    }
  }

  // Play a soft, happy high blip when sound is toggled on
  playToggleOn() {
    this.init();
    if (!this.enabled || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Play a comical bouncy hop (squash and stretch hop sound)
  playHop() {
    this.init();
    if (!this.enabled || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.quadraticRampToValueAtTime(320, now + 0.18);
    osc.frequency.quadraticRampToValueAtTime(120, now + 0.35);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.setValueAtTime(0.15, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Kayak rowing paddle splash with water sloshing and a wooden paddle creak
  playSplash() {
    this.init();
    if (!this.enabled || !this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.65;

    // Buffer creation for white noise (simulating rushing/splashing water)
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Bandpass filter to make it sound muddy like splashing river water
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.Q.setValueAtTime(1.5, now);
    filter.frequency.exponentialRampToValueAtTime(160, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseNode.start(now);
    noiseNode.stop(now + duration);

    // Wooden paddle creak sound (short modulated low-pitch triangle wave block)
    const creakOsc = this.ctx.createOscillator();
    const creakGain = this.ctx.createGain();
    creakOsc.connect(creakGain);
    creakGain.connect(this.masterGain);

    creakOsc.type = 'triangle';
    creakOsc.frequency.setValueAtTime(80, now + 0.15);
    creakOsc.frequency.linearRampToValueAtTime(95, now + 0.35);

    creakGain.gain.setValueAtTime(0.0, now + 0.15);
    creakGain.gain.linearRampToValueAtTime(0.06, now + 0.2);
    creakGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    creakOsc.start(now + 0.15);
    creakOsc.stop(now + 0.38);
  }

  // Play a sheep Baa sound using square waves with FM/pitch sweep modulation
  playSheepBaa() {
    this.init();
    if (!this.enabled || !this.ctx) return;

    const now = this.ctx.currentTime;

    // Main oscillator - square or triangle for that classic retro low-poly feel
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    // Mimic the pitch variation of a sheep's "baa-aa-aa" (modulated sweep down)
    osc.frequency.linearRampToValueAtTime(145, now + 0.15);
    osc.frequency.linearRampToValueAtTime(135, now + 0.45);

    // Bandpass filter to capture the sheep vocal nasal tract resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.Q.setValueAtTime(3.0, now);

    // Gain envelope
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.08);
    // Vibrato effect on volume for "baa-aa-aa"
    gain.gain.setValueAtTime(0.12, now + 0.18);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.25);
    gain.gain.setValueAtTime(0.10, now + 0.32);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  // Play a quick playful rustle sound for the Fox
  playFoxRustle() {
    this.init();
    if (!this.enabled || !this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.22;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.linearRampToValueAtTime(1200, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Play a solid friendly thud sound for the Shepherd
  playShepherdThud() {
    this.init();
    if (!this.enabled || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Play a low error buzzer sound on invalid load/moves
  playBuzzer() {
    this.init();
    if (!this.enabled || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.setValueAtTime(105, now + 0.08);

    // Low pass filter to make it a dull buzz
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    osc.disconnect(gain);
    osc.connect(filter);
    filter.connect(gain);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Play a triumphant bright scale for victory
  playVictory() {
    this.init();
    if (!this.enabled || !this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio

    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain);

      const noteTime = now + index * 0.12;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.08, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }

  // Play a dramatic comic sliding cartoon fail sound for Game Over
  playGameOver() {
    this.init();
    if (!this.enabled || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.85);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(200, now + 0.85);

    osc.disconnect(gain);
    osc.connect(filter);
    filter.connect(gain);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.start(now);
    osc.stop(now + 0.85);
  }
}

export const soundManager = new SoundManager();
