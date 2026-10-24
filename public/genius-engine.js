/* Blue Fox Games · Motor do Jogo Genius e Sintetizador Web Audio API
 * Implementação cliente em Vanilla JS sem dependências externas.
 */
(() => {
  'use strict';

  const GENIUS_COLORS = ['green', 'red', 'yellow', 'blue'];

  // Frequências clássicas dos 4 tons musicais (em Hertz)
  const SOUND_FREQUENCIES = {
    green: 329.63, // Mi (E4)
    red: 261.63,   // Dó (C4)
    yellow: 220.0, // Lá (A3)
    blue: 164.81,  // Mi grave (E3)
  };

  // Presets rápidos de teclado
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

  const STORAGE_KEYMAP = 'bf-games:genius-keymap';
  const STORAGE_HIGHSCORE = 'bf-games:genius-highscore';

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
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Suave ataque e decaimento (envelope ADSR simples)
      const now = this.ctx.currentTime;
      const durationSec = durationMs / 1000;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationSec);
    }

    playErrorTone(durationMs = 600) {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      const durationSec = durationMs / 1000;

      // Frequência decrescente áspera
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + durationSec);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationSec);
    }
  }

  // ---------- Motor de Regras do Jogo ----------
  class GeniusEngine {
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
      const nextColor = GENIUS_COLORS[Math.floor(Math.random() * GENIUS_COLORS.length)];
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
      if (round <= 4) return { onMs: 460, offMs: 140 };
      if (round <= 8) return { onMs: 380, offMs: 110 };
      if (round <= 12) return { onMs: 300, offMs: 90 };
      return { onMs: 240, offMs: 70 };
    }

    static getFeedback(score) {
      if (score < 6) {
        return {
          tier: 'Iniciante',
          badge: '🌱',
          message: 'Bom começo! Pratique mais para afinar a memória e o reflexo.',
        };
      }
      if (score < 12) {
        return {
          tier: 'Boa Memória',
          badge: '⚡',
          message: 'Muito bem! Sua concentração está afiada, quase no nível mestre!',
        };
      }
      if (score <= 15) {
        return {
          tier: 'Mestre Genius',
          badge: '🏆',
          message: 'Sensacional! Acertar 12 ou mais é uma marca excelente! Memória de raposa!',
        };
      }
      return {
        tier: 'Gênio Supremo',
        badge: '👑',
        message: 'Inacreditável! Você tem memória fotográfica absoluta! Um verdadeiro Gênio!',
      };
    }
  }

  // ---------- Gerenciamento de Teclas & LocalStorage ----------
  function loadKeymap() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYMAP);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Padrão F - G - H - J
    return { ...KEY_PRESETS.fghj.keys };
  }

  function saveKeymap(keymap) {
    try {
      localStorage.setItem(STORAGE_KEYMAP, JSON.stringify(keymap));
    } catch {}
  }

  function loadHighScore() {
    try {
      return Number(localStorage.getItem(STORAGE_HIGHSCORE)) || 0;
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

  // Exportação global
  window.BFGenius = {
    GENIUS_COLORS,
    KEY_PRESETS,
    AudioSynth,
    GeniusEngine,
    loadKeymap,
    saveKeymap,
    loadHighScore,
    saveHighScore,
    formatKeyDisplay,
  };
})();
