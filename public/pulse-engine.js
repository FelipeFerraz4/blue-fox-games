/* Blue Fox Games · Motor do Jogo Fox Beat & Sintetizador Web Audio API
 * Implementação cliente em Vanilla JS sem dependências externas.
 */
(() => {
  'use strict';

  const PULSE_COLORS = ['green', 'red', 'yellow', 'blue'];

  // Frequências ricas dos 4 tons musicais (em Hertz)
  // Acorde harmônico aberto de Lá menor (A3, C4, E4, A4)
  const SOUND_FREQUENCIES = {
    blue: 220.0,    // Lá grave (A3) - 220 Hz
    yellow: 261.63, // Dó central (C4) - 261.63 Hz
    red: 329.63,    // Mi (E4) - 329.63 Hz
    green: 440.0,   // Lá agudo (A4) - 440 Hz
  };

  // Presets de teclado ergonômicos
  const KEY_PRESETS = {
    fghj: {
      name: 'Padrão (F - G - H - J)',
      desc: 'Mão na linha central do teclado (recomendado)',
      keys: { green: 'f', red: 'g', yellow: 'h', blue: 'j' },
    },
    qwas: {
      name: 'Mão Esquerda 2×2 (Q - W - A - S)',
      desc: 'Distribuição espacial no canto esquerdo',
      keys: { green: 'q', red: 'w', yellow: 'a', blue: 's' },
    },
    arrows: {
      name: 'Setas (← ↑ ↓ →)',
      desc: 'Teclas direcionais',
      keys: { green: 'arrowleft', red: 'arrowup', yellow: 'arrowdown', blue: 'arrowright' },
    },
    numbers: {
      name: 'Números (1 - 2 - 3 - 4)',
      desc: 'Teclado numérico ou superior',
      keys: { green: '1', red: '2', yellow: '3', blue: '4' },
    },
  };

  const STORAGE_KEYMAP = 'bf-games:beat-keymap';
  const STORAGE_KEYMAP_LEGACY = 'bf-games:pulse-keymap';
  const STORAGE_HIGHSCORE = 'bf-games:beat-highscore';
  const STORAGE_HIGHSCORE_LEGACY = 'bf-games:pulse-highscore';

  // ---------- Sintetizador de Áudio (Web Audio API) ----------
  class AudioSynth {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(color, durationMs = 300) {
      this.init();
      if (!this.ctx) return;

      const freq = SOUND_FREQUENCIES[color];
      if (!freq) return;

      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const gainHarmonic = this.ctx.createGain();

      // Timbre sintetizado moderno: fundamental senoidal + harmônico sutil
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      const durationSec = durationMs / 1000;

      // Envelope ADSR suave
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.32, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      gainHarmonic.gain.setValueAtTime(0.001, now);
      gainHarmonic.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
      gainHarmonic.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      osc.connect(gain);
      oscHarmonic.connect(gainHarmonic);
      gain.connect(this.ctx.destination);
      gainHarmonic.connect(this.ctx.destination);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + durationSec);
      oscHarmonic.stop(now + durationSec);
    }

    playErrorTone(durationMs = 600) {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      const durationSec = durationMs / 1000;

      // Frequência decrescente áspera característica de erro
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + durationSec);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationSec);
    }
  }

  // ---------- Motor de Regras do Jogo ----------
  class PulseEngine {
    constructor() {
      this.sequence = [];
      this.userIndex = 0;
      this.score = 0;
      this.status = 'idle'; // 'idle' | 'playing' | 'game_over'
    }

    start() {
      this.sequence = [];
      this.score = 0;
      this.status = 'playing';
      return this.nextRound();
    }

    nextRound() {
      const nextColor = PULSE_COLORS[Math.floor(Math.random() * PULSE_COLORS.length)];
      this.sequence.push(nextColor);
      this.userIndex = 0;
      this.status = 'playing';
      return nextColor;
    }

    submitColor(color) {
      if (this.status !== 'playing') {
        throw new Error('A partida não está em andamento.');
      }

      const expectedColor = this.sequence[this.userIndex];

      if (color !== expectedColor) {
        this.status = 'game_over';
        return { correct: false, roundComplete: false, score: this.score };
      }

      this.userIndex++;

      if (this.userIndex === this.sequence.length) {
        this.score = this.sequence.length;
        return { correct: true, roundComplete: true, score: this.score };
      }

      return { correct: true, roundComplete: false, score: this.score };
    }

    getSpeed() {
      const round = this.sequence.length;
      if (round <= 4) return { onMs: 440, offMs: 140 };
      if (round <= 8) return { onMs: 360, offMs: 110 };
      if (round <= 12) return { onMs: 290, offMs: 85 };
      return { onMs: 220, offMs: 65 };
    }

    static getFeedback(score) {
      if (score < 6) {
        return {
          tier: 'Iniciante',
          badge: '🌱',
          message: 'Bom começo! Sintonize sua atenção e tente bater sua marca anterior.',
        };
      }
      if (score < 12) {
        return {
          tier: 'Reflexo Ágil',
          badge: '⚡',
          message: 'Excelente ritmo! Seus reflexos e memória estão bem afiados, quase no nível Mestre!',
        };
      }
      if (score <= 17) {
        return {
          tier: 'Mestre do Beat',
          badge: '🦊',
          message: 'Sensacional! 12 ou mais batidas memorizadas é uma marca de Mestre! Memória de Raposa!',
        };
      }
      return {
        tier: 'Lenda do Beat',
        badge: '👑',
        message: 'Inacreditável! Você tem memória fotográfica e reflexo absoluto! Uma verdadeira Lenda do Beat!',
      };
    }
  }

  // ---------- Gerenciamento de Teclas & LocalStorage ----------
  function loadKeymap() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYMAP) || localStorage.getItem(STORAGE_KEYMAP_LEGACY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...KEY_PRESETS.fghj.keys };
  }

  function saveKeymap(keymap) {
    try {
      localStorage.setItem(STORAGE_KEYMAP, JSON.stringify(keymap));
    } catch {}
  }

  function loadHighScore() {
    try {
      return Number(localStorage.getItem(STORAGE_HIGHSCORE) || localStorage.getItem(STORAGE_HIGHSCORE_LEGACY)) || 0;
    } catch {
      return 0;
    }
  }

  function saveHighScore(score) {
    const current = loadHighScore();
    const isNewBest = score > current;
    if (isNewBest) {
      try {
        localStorage.setItem(STORAGE_HIGHSCORE, String(score));
      } catch {}
    }
    return { isNewBest, best: Math.max(score, current) };
  }

  function formatKeyDisplay(keyStr) {
    if (!keyStr) return '?';
    const lower = keyStr.toLowerCase();
    if (lower === 'arrowup') return '↑';
    if (lower === 'arrowdown') return '↓';
    if (lower === 'arrowleft') return '←';
    if (lower === 'arrowright') return '→';
    if (lower === ' ') return 'Espaço';
    return keyStr.toUpperCase();
  }

  // Exportação global moderna
  window.BFBeat = window.BFPulse = {
    BEAT_COLORS: PULSE_COLORS,
    PULSE_COLORS,
    KEY_PRESETS,
    AudioSynth,
    BeatEngine: PulseEngine,
    PulseEngine,
    loadKeymap,
    saveKeymap,
    loadHighScore,
    saveHighScore,
    formatKeyDisplay,
  };

  // Compatibilidade
  window.BFGenius = {
    GENIUS_COLORS: PULSE_COLORS,
    KEY_PRESETS,
    AudioSynth,
    GeniusEngine: PulseEngine,
    loadKeymap,
    saveKeymap,
    loadHighScore,
    saveHighScore,
    formatKeyDisplay,
  };
})();
