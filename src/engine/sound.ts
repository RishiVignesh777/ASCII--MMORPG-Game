// Retro 8-bit Sound FX synthesizer using Web Audio API

class SoundSystem {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private volume: number = 0.3;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  // Step sound: low soft thud
  public step() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // AudioContext fallback
    }
  }

  // Turn 90° sound: swish
  public turn() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(this.volume * 0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {}
  }

  // Wall bump sound: dull knock
  public bump() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  // Door opening creak
  public door() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(320, this.ctx.currentTime + 0.15);
      osc.frequency.linearRampToValueAtTime(190, this.ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  // Attack slash
  public attack() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(this.volume * 0.6, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch {}
  }

  // Monster hit impact
  public monsterHit() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  // Player hurt damage sound
  public playerHurt() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(70, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(this.volume * 0.7, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {}
  }

  // Monster defeat sound
  public monsterDeath() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(this.volume * 0.6, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {}
  }

  // Item pickup / loot sound
  public loot() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);

        gain.gain.setValueAtTime(this.volume * 0.35, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.06 + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.1);
      });
    } catch {}
  }

  // Magic Spell Cast: Fireball roaring blast
  public fireball() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(450, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.35);

      gain.gain.setValueAtTime(this.volume * 0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    } catch {}
  }

  // Magic Spell: Frost nova shimmer
  public frost() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      [880, 1174, 1567].forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + i * 0.05);
        gain.gain.setValueAtTime(this.volume * 0.4, t + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.05);
        osc.stop(t + i * 0.05 + 0.15);
      });
    } catch {}
  }

  // Light Torch: warm crackling flare
  public torch() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.linearRampToValueAtTime(320, t + 0.15);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.4);

      gain.gain.setValueAtTime(this.volume * 0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.4);
    } catch {}
  }

  // Weapon Repair: metallic anvil strike
  public repair() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.25);

      gain.gain.setValueAtTime(this.volume * 0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch {}
  }

  // Merchant interaction: coins clinking
  public merchant() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      [987, 1318, 1760].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        gain.gain.setValueAtTime(this.volume * 0.4, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.12);
      });
    } catch {}
  }

  // Healing Spell
  public heal() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      [330, 440, 554, 659].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        gain.gain.setValueAtTime(this.volume * 0.35, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.18);
      });
    } catch {}
  }

  // Buff sound
  public buff() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      [440, 554, 659, 880].forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + i * 0.06);
        gain.gain.setValueAtTime(this.volume * 0.35, t + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.06 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.12);
      });
    } catch {}
  }

  // Debuff sound
  public debuff() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      [659, 554, 440, 330].forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t + i * 0.07);
        gain.gain.setValueAtTime(this.volume * 0.3, t + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.07 + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.07);
        osc.stop(t + i * 0.07 + 0.14);
      });
    } catch {}
  }

  // Level down stairs fanfare
  public stairs() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      [261, 329, 392, 523, 659].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.1);
        gain.gain.setValueAtTime(this.volume * 0.4, t + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.2);
      });
    } catch {}
  }

  // Game over sorrow chord
  public gameOver() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      [196, 185, 174, 164].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + idx * 0.18);
        gain.gain.setValueAtTime(this.volume * 0.45, t + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.18 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + idx * 0.18);
        osc.stop(t + idx * 0.18 + 0.3);
      });
    } catch {}
  }
}

export const sounds = new SoundSystem();
