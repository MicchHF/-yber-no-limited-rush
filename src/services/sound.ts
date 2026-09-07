// Web Audio API Procedural Synthesizer for Voxotron / Unlimited Rush
// Ultra-smooth, warm, chillwave & ambient vibe music engine
// No harsh buzzes, no clicks, mastered with analog-style lowpass filters & dynamic compression
import { SpeedClass } from '../types';

export interface VibeTrackInfo {
  id: string;
  name: string;
  subtitle: string;
  bpm: number;
}

export const VIBE_TRACKS: VibeTrackInfo[] = [
  {
    id: 'neon_drift',
    name: 'Neon Drift',
    subtitle: 'Chillwave // Mellow Sunset Glow',
    bpm: 88,
  },
  {
    id: 'cyber_twilight',
    name: 'Cyber Twilight',
    subtitle: 'Deep Space Zen // Ethereal Ambient Pads',
    bpm: 76,
  },
  {
    id: 'midnight_highway',
    name: 'Midnight Highway',
    subtitle: 'Smooth Retrowave // Warm Analog Sub Groove',
    bpm: 96,
  },
];

class VoxotronSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicInterval: any = null;
  private currentSpeedClass: SpeedClass = 'FLOW';
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;

  private currentTrackIndex: number = 0;
  private currentBiomeId: string = 'neo_metropolis';
  private currentDistance: number = 0;
  private step: number = 0;
  private chordIndex: number = 0;
  private musicVolume: number = 0.50;
  private sfxVolume: number = 0.60;
  private sharedNoiseBuffer: AudioBuffer | null = null;

  private getSharedNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (!this.sharedNoiseBuffer) {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.5); // 500ms of high quality white/pink noise
      this.sharedNoiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.sharedNoiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.25;
      }
    }
    return this.sharedNoiseBuffer;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // 1. Studio-grade Dynamics Compressor prevents any digital clipping, pops or harsh spikes
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(25, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.20, this.ctx.currentTime);
        this.compressor.connect(this.ctx.destination);

        // 2. Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);
        this.masterGain.connect(this.compressor);

        // 3. Music Bus: Warm Analog Low-pass Master Filter (cuts any harsh high frequencies above 3400Hz)
        this.musicFilter = this.ctx.createBiquadFilter();
        this.musicFilter.type = 'lowpass';
        this.musicFilter.frequency.setValueAtTime(3400, this.ctx.currentTime);
        this.musicFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);
        this.musicFilter.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.musicGain.connect(this.musicFilter);

        // 4. SFX Bus
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1.0, this.ctx.currentTime, 0.05);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public getTracks(): VibeTrackInfo[] {
    return VIBE_TRACKS;
  }

  public getCurrentTrack(): VibeTrackInfo {
    return VIBE_TRACKS[this.currentTrackIndex];
  }

  public nextTrack(): VibeTrackInfo {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % VIBE_TRACKS.length;
    this.step = 0;
    this.chordIndex = 0;
    if (this.musicInterval) {
      this.startMusic();
    }
    return this.getCurrentTrack();
  }

  public setTrack(trackId: string): VibeTrackInfo {
    const idx = VIBE_TRACKS.findIndex((t) => t.id === trackId);
    if (idx !== -1 && idx !== this.currentTrackIndex) {
      this.currentTrackIndex = idx;
      this.step = 0;
      this.chordIndex = 0;
      if (this.musicInterval) {
        this.startMusic();
      }
    }
    return this.getCurrentTrack();
  }

  // ==========================================================================
  // PLEASANT, BUTTERY-SMOOTH SOUND EFFECTS (NO HARSH BUZZING OR SCREECHES!)
  // ==========================================================================

  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.04);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Harmonious crystalline near-miss chime (soft celestial sine bell)
   */
  public playGraze() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Harmonic pleasant bell chord (Eb6 + G6 + Bb6)
    const freqs = [1244.5, 1567.98, 1864.66];

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.02);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);

      gain.gain.setValueAtTime(0.07, now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.02);
      osc.stop(now + idx * 0.02 + 0.24);
    });
  }

  /**
   * Boost: Deep warm whoosh and soft atmospheric swell (no screechy sawtooth!)
   */
  public playBoost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Warm sine wave with subtle sub sweep
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, now);
    filter.frequency.exponentialRampToValueAtTime(1100, now + 0.3);
    filter.Q.setValueAtTime(1.2, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.40);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  /**
   * Speed tier transition: celestial harmonic chord progression
   */
  public playSpeedClassShift(newClass: SpeedClass) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const chords: Record<SpeedClass, number[]> = {
      CRUISE: [261.63, 329.63, 392.0], // Cmaj
      FLOW: [329.63, 392.0, 493.88], // Em
      APEX: [392.0, 493.88, 587.33], // Gmaj
      HYPER: [440.0, 554.37, 659.25, 880.0], // Amaj
      WARP: [493.88, 622.25, 739.99, 987.77], // Bmaj
      OVERDRIVE: [523.25, 659.25, 783.99, 1046.5, 1318.51], // Cmaj7 Overdrive Shimmer
    };
    const chord = chords[newClass] || chords.FLOW;

    chord.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);

      g.gain.setValueAtTime(0.01, now + i * 0.04);
      g.gain.linearRampToValueAtTime(0.10, now + i * 0.04 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.45);

      osc.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.48);
    });
  }

  /**
   * Countdown beeps (3, 2, 1, GO!)
   */
  public playCountdownBeep(count: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    if (count > 0) {
      // 3, 2, 1 beep: high crisp chime
      const freq = 440 + (3 - count) * 120; // 440, 560, 680 Hz
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.12, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      // GO! chord fanfare
      [587.33, 739.99, 880.0, 1174.66].forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const o = this.ctx.createOscillator();
        const gn = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + idx * 0.02);
        gn.gain.setValueAtTime(0.15, now + idx * 0.02);
        gn.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.45);
        o.connect(gn);
        gn.connect(this.sfxGain);
        o.start(now + idx * 0.02);
        o.stop(now + idx * 0.02 + 0.5);
      });
    }
  }

  /**
   * Cinematic muffled impact & voxel chime (warm low thud, not painful harsh noise)
   */
  public playVoxelExplosion() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // 1. Warm low-frequency sub-thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.4);

    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.46);

    // 2. Soft filtered noise crumble (low-passed at 500Hz for warm movie thud)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.35);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.36);
  }

  public playCheckpoint() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    [440.0, 554.37, 659.25, 880.0].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      g.gain.setValueAtTime(0.09, now + idx * 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.28);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.3);
    });
  }

  public playPrismCollect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.1);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playPickupBig() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      gain.gain.setValueAtTime(0.09, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.30);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.32);
    });
  }

  public playBiomeEnemyWarning(biomeId?: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const bId = biomeId || this.currentBiomeId;
    const now = this.ctx.currentTime;

    if (bId === 'inferno_core') {
      // Inferno: Deep volcanic combat roar & sub-rumble warning
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (bId === 'cryo_void') {
      // Cryo: Piercing crystalline stasis whistle
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1480, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.22);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (bId === 'quantum_horizon') {
      // Quantum: Dimensional binaural dissonance pulse
      [220, 227].forEach((f) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        g.gain.setValueAtTime(0.15, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.32);
      });
    } else {
      // Neo Metropolis: Dual high-tech police pursuit siren
      [0, 0.12].forEach((delay, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 0 ? 587.33 : 880, now + delay);
        gain.gain.setValueAtTime(0.18, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.16);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + delay);
        osc.stop(now + delay + 0.18);
      });
    }
  }

  public playEnemyWarning() {
    this.playBiomeEnemyWarning(this.currentBiomeId);
  }

  public playBiomeEnemyFlyby(biomeId?: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const bId = biomeId || this.currentBiomeId;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (bId === 'inferno_core') {
      // Inferno: Fiery rocket exhaust blast
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.7);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.linearRampToValueAtTime(1400, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(250, now + 0.7);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
    } else if (bId === 'cryo_void') {
      // Cryo: Glacial razor wind sonic boom
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.6);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.6);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.62);
    } else if (bId === 'quantum_horizon') {
      // Quantum: Dimensional spatial tear whoosh
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.65);

      filter.type = 'notch';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    } else {
      // Metropolis: High-speed turbine whoosh
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.6);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.6);
      filter.Q.setValueAtTime(2.5, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  public playEnemyFlyby() {
    this.playBiomeEnemyFlyby(this.currentBiomeId);
  }

  public playBiomeEnemyDrop(biomeId?: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const bId = biomeId || this.currentBiomeId;
    const now = this.ctx.currentTime;

    if (bId === 'inferno_core') {
      // Inferno: Molten slag thud with burning sizzle
      const sub = this.ctx.createOscillator();
      const subG = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(180, now);
      sub.frequency.exponentialRampToValueAtTime(38, now + 0.28);
      subG.gain.setValueAtTime(0.28, now);
      subG.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      sub.connect(subG);
      subG.connect(this.sfxGain);
      sub.start(now);
      sub.stop(now + 0.32);
    } else if (bId === 'cryo_void') {
      // Cryo: Ice shatter freeze ping
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.2);
      g.gain.setValueAtTime(0.22, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.24);
    } else if (bId === 'quantum_horizon') {
      // Quantum: Gravitational implosion ping
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
      g.gain.setValueAtTime(0.24, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.26);
    } else {
      // Metropolis: Standard EMP mine latch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.22);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  public playEnemyDrop() {
    this.playBiomeEnemyDrop(this.currentBiomeId);
  }

  public playBiomeEnemyWarp(biomeId?: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const bId = biomeId || this.currentBiomeId;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    const startF = bId === 'inferno_core' ? 140 : bId === 'cryo_void' ? 440 : 220;
    const endF = bId === 'quantum_horizon' ? 980 : 740;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.exponentialRampToValueAtTime(endF, now + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.3);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playEnemyWarp() {
    this.playBiomeEnemyWarp(this.currentBiomeId);
  }

  public playPlasmaBeamFire() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.45);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.45);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playCryoFreeze() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Layer 1: High crystalline glass ping
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.35);
    g.gain.setValueAtTime(0.25, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.4);

    // Layer 2: Sub-zero frost whoosh
    const sharedBuf = this.getSharedNoiseBuffer();
    if (sharedBuf) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = sharedBuf;
      const bpf = this.ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.setValueAtTime(2400, now);
      bpf.frequency.exponentialRampToValueAtTime(900, now + 0.3);
      bpf.Q.setValueAtTime(3.0, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      noise.connect(bpf);
      bpf.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(now);
      noise.stop(now + 0.35);
    }
  }

  public playGravityVortex() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.55);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  public playBossWarning() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    [65, 82, 110].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + 0.8);

      gain.gain.setValueAtTime(0.18, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.08);
      osc.stop(now + 0.9);
    });
  }

  public playBossLaserSweep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(520, now + 0.2);
    osc.frequency.linearRampToValueAtTime(240, now + 0.6);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(3.5, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  public playBossDefeat() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // 1. Deep sub rumble
    const sub = this.ctx.createOscillator();
    const subG = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(90, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + 1.2);
    subG.gain.setValueAtTime(0.4, now);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    sub.connect(subG);
    subG.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + 1.4);

    // 2. Victory triumphant chord
    [261.63, 329.63, 392.0, 523.25].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.2 + idx * 0.05);
      g.gain.setValueAtTime(0.001, now + 0.2 + idx * 0.05);
      g.gain.linearRampToValueAtTime(0.18, now + 0.35 + idx * 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(now + 0.2 + idx * 0.05);
      osc.stop(now + 1.5);
    });
  }

  public playBiomeShift() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Deep warm atmospheric major chord
    [261.63, 329.63, 392.0, 493.88].forEach((freq) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  public setBiome(biomeId: string) {
    if (this.currentBiomeId !== biomeId) {
      this.currentBiomeId = biomeId;
      this.playBiomeShift();
    }
  }

  public setDistanceTension(distance: number) {
    this.currentDistance = Math.max(0, distance);
    if (this.ctx && this.musicFilter) {
      const progress = Math.min(1.0, this.currentDistance / 12000);
      // Smoothly opens filter cutoff from 1100Hz at start to 3400Hz at 12000m
      const cutoff = 1100 + progress * 2300;
      this.musicFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.25);
    }
  }

  // ==========================================================================
  // PROCEDURAL BIOME SOUNDTRACK & DYNAMIC TENSION SYNTH ENGINE
  // ==========================================================================

  public startMusic() {
    this.stopMusic();
    this.initContext();

    // Biome-specific and vibe-track chord progressions:
    // 1. Neo Metropolis: Soulful, warm, uplifting Synthwave
    const NEO_METROPOLIS_CHORDS = [
      { root: 43.65, chord: [174.61, 207.65, 261.63, 311.13, 392.0] },  // Fm9
      { root: 34.65, chord: [138.59, 174.61, 207.65, 261.63, 311.13] }, // Dbmaj9
      { root: 29.14, chord: [116.54, 138.59, 174.61, 207.65, 261.63] }, // Bbm9
      { root: 38.89, chord: [155.56, 174.61, 207.65, 233.08, 311.13] }, // Eb11
    ];

    // 2. Inferno Core: Heavy, driving, dark Industrial Darksynth
    const INFERNO_CORE_CHORDS = [
      { root: 36.71, chord: [146.83, 174.61, 220.0, 261.63, 329.63] },  // Dm9
      { root: 29.14, chord: [116.54, 146.83, 174.61, 233.08, 293.66] }, // Bbmaj7#11
      { root: 49.00, chord: [196.00, 233.08, 293.66, 349.23, 440.0] },  // Gm9
      { root: 55.00, chord: [220.00, 277.18, 329.63, 392.00, 493.88] }, // A7(b13)
    ];

    // 3. Cryo Void: Deep space ethereal zen ambient chill
    const CRYO_VOID_CHORDS = [
      { root: 32.70, chord: [130.81, 155.56, 196.0, 233.08, 293.66] },  // Cm9
      { root: 25.96, chord: [103.83, 130.81, 155.56, 196.0, 293.66] },  // Abmaj7#11
      { root: 43.65, chord: [174.61, 207.65, 261.63, 311.13, 349.23] }, // Fm9
      { root: 24.50, chord: [98.0, 130.81, 146.83, 196.0, 261.63] },    // G7sus4
    ];

    // 4. Quantum Horizon: Exotic chromatic future-electro & cyber warp
    const QUANTUM_HORIZON_CHORDS = [
      { root: 41.20, chord: [164.81, 196.00, 246.94, 293.66, 370.0] },  // Em9
      { root: 32.70, chord: [130.81, 164.81, 196.00, 261.63, 329.63] }, // Cmaj7#11
      { root: 30.87, chord: [123.47, 146.83, 185.00, 220.00, 293.66] }, // Bm7
      { root: 38.89, chord: [155.56, 185.00, 220.00, 261.63, 311.13] }, // D#dim7
    ];

    const getActiveChordSet = () => {
      if (this.currentBiomeId === 'inferno_core') return INFERNO_CORE_CHORDS;
      if (this.currentBiomeId === 'cryo_void') return CRYO_VOID_CHORDS;
      if (this.currentBiomeId === 'quantum_horizon') return QUANTUM_HORIZON_CHORDS;
      return NEO_METROPOLIS_CHORDS;
    };

    const getTrackBpm = () => {
      const base = VIBE_TRACKS[this.currentTrackIndex]?.bpm || 88;
      // Distance tension accelerates tempo up to +16% as distance reaches 12,000m
      const tensionMult = 1.0 + Math.min(1.0, this.currentDistance / 12000) * 0.16;
      // Slight boost for speed class
      const speedMult = this.currentSpeedClass === 'OVERDRIVE' ? 1.06 : this.currentSpeedClass === 'HYPER' ? 1.03 : 1.0;
      return base * tensionMult * speedMult;
    };

    const tick = () => {
      if (this.isMuted || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const chords = getActiveChordSet();
      const currentProg = chords[this.chordIndex % chords.length];
      const distProgress = Math.min(1.0, this.currentDistance / 12000);

      // 1. Lush, Velvety Warm Pad Chord (Plays every 16 steps = every 4 beats)
      if (this.step % 16 === 0) {
        currentProg.chord.forEach((freq) => {
          if (!this.ctx || !this.musicGain) return;
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(freq, now);
          osc2.frequency.setValueAtTime(freq * 1.002, now); // Micro chorus warmth

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(520 + distProgress * 280, now);
          filter.Q.setValueAtTime(0.7, now);

          const dur = 3.2;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.026, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + dur + 0.05);
          osc2.stop(now + dur + 0.05);
        });

        this.chordIndex = (this.chordIndex + 1) % chords.length;
      }

      // 2. Smooth Sub-Bass (Deep rolling pulse; gets more rhythmic with distance)
      const isBassStep = this.step % 16 === 0 || this.step % 16 === 8 || (distProgress > 0.45 && this.step % 16 === 4);
      if (isBassStep) {
        const subOsc = this.ctx.createOscillator();
        const subFilter = this.ctx.createBiquadFilter();
        const subGain = this.ctx.createGain();

        subOsc.type = this.currentBiomeId === 'inferno_core' ? 'sawtooth' : 'sine';
        const subFreq = currentProg.root * 1.5;
        subOsc.frequency.setValueAtTime(subFreq, now);

        subFilter.type = 'lowpass';
        subFilter.frequency.setValueAtTime(120 + distProgress * 60, now);

        subGain.gain.setValueAtTime(0.001, now);
        subGain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        subOsc.connect(subFilter);
        subFilter.connect(subGain);
        subGain.connect(this.musicGain);

        subOsc.start(now);
        subOsc.stop(now + 0.40);
      }

      // 3. Ambient Starlight Chime / Crystalline Bells
      if (this.step % 4 === 2) {
        const noteIdx = (Math.floor(this.step / 4)) % currentProg.chord.length;
        const noteFreq = currentProg.chord[noteIdx] * 2.0;

        const pluckOsc = this.ctx.createOscillator();
        const pluckFilter = this.ctx.createBiquadFilter();
        const pluckGain = this.ctx.createGain();

        pluckOsc.type = 'sine';
        pluckOsc.frequency.setValueAtTime(noteFreq, now);

        pluckFilter.type = 'lowpass';
        pluckFilter.frequency.setValueAtTime(1100 + distProgress * 700, now);

        pluckGain.gain.setValueAtTime(0.001, now);
        pluckGain.gain.linearRampToValueAtTime(0.024, now + 0.03);
        pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        pluckOsc.connect(pluckFilter);
        pluckFilter.connect(pluckGain);
        pluckGain.connect(this.musicGain);

        pluckOsc.start(now);
        pluckOsc.stop(now + 0.48);
      }

      // 4. High-Tension Cyber Arpeggio (Fades in as distance increases beyond 3000m)
      if (distProgress > 0.25 && (this.step % 2 === 0)) {
        const arpIndex = (this.step / 2) % currentProg.chord.length;
        const arpFreq = currentProg.chord[arpIndex] * (this.step % 8 < 4 ? 2.0 : 3.0);

        const arpOsc = this.ctx.createOscillator();
        const arpFilter = this.ctx.createBiquadFilter();
        const arpGain = this.ctx.createGain();

        arpOsc.type = 'triangle';
        arpOsc.frequency.setValueAtTime(arpFreq, now);

        arpFilter.type = 'bandpass';
        arpFilter.frequency.setValueAtTime(1400 + distProgress * 1200, now);
        arpFilter.Q.setValueAtTime(2.0, now);

        const arpVol = 0.012 * distProgress;
        arpGain.gain.setValueAtTime(0.001, now);
        arpGain.gain.linearRampToValueAtTime(arpVol, now + 0.02);
        arpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        arpOsc.connect(arpFilter);
        arpFilter.connect(arpGain);
        arpGain.connect(this.musicGain);

        arpOsc.start(now);
        arpOsc.stop(now + 0.14);
      }

      // 5. Velvet Tape Shaker
      if (this.step % 4 === 2) {
        const sharedBuf = this.getSharedNoiseBuffer();
        if (sharedBuf) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = sharedBuf;

          const bpf = this.ctx.createBiquadFilter();
          bpf.type = 'bandpass';
          bpf.frequency.setValueAtTime(2200, now);
          bpf.Q.setValueAtTime(1.8, now);

          const hatGain = this.ctx.createGain();
          hatGain.gain.setValueAtTime(0.015, now);
          hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

          noise.connect(bpf);
          bpf.connect(hatGain);
          hatGain.connect(this.musicGain);

          noise.start(now);
          noise.stop(now + 0.035);
        }
      }

      this.step = (this.step + 1) % 64;

      const bpm = getTrackBpm();
      const stepMs = (60000 / bpm) / 4; // 16th note subdivision in ms
      this.musicInterval = setTimeout(tick, stepMs);
    };

    tick();
  }

  public setSpeedClass(speedClass: SpeedClass) {
    if (this.currentSpeedClass !== speedClass) {
      this.currentSpeedClass = speedClass;
      this.playSpeedClassShift(speedClass);
    }
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearTimeout(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new VoxotronSoundEngine();
