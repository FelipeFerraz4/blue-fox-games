/* Blue Fox Games · Motor do Modo Solo e Bot com Memória Probabilística
 * Implementação cliente sem dependências para execução fluida e instantânea.
 */
(() => {
  'use strict';

  const SYMBOLS = [
    '🦊', '🐠', '🐙', '🐢', '🦀', '🐬', '🐳', '🦉', '🐼',
    '🐸', '🦁', '🐯', '🐨', '🐧', '🦄', '🐝', '🦋', '🦜',
  ];

  const BOT_CONFIGS = {
    easy: { retentionRate: 0.45, memoryTurns: 3, blunderRate: 0.2 },
    medium: { retentionRate: 0.75, memoryTurns: 6, blunderRate: 0.08 },
    hard: { retentionRate: 0.92, memoryTurns: 12, blunderRate: 0.02 },
    master: { retentionRate: 0.99, memoryTurns: 50, blunderRate: 0.0 },
  };

  const CAMPAIGN_STAGES = [
    // Mundo 1: Iniciante (Planície dos Primeiros Passos)
    {
      id: '1.1',
      world: 1,
      stage: 1,
      worldTitle: 'Mundo 1: Planície Iniciante',
      title: 'Primeiros Passos',
      desc: '6 pares para aquecer o raciocínio.',
      mode: 'time-trial',
      pairs: 6,
      cols: 4,
      targets: {
        twoStars: { maxSeconds: 45, maxMoves: 12 },
        threeStars: { maxSeconds: 30, maxMoves: 9 },
      },
    },
    {
      id: '1.2',
      world: 1,
      stage: 2,
      worldTitle: 'Mundo 1: Planície Iniciante',
      title: 'Trilha das Lembranças',
      desc: '8 pares com foco em precisão de movimentos.',
      mode: 'time-trial',
      pairs: 8,
      cols: 4,
      targets: {
        twoStars: { maxSeconds: 60, maxMoves: 16 },
        threeStars: { maxSeconds: 42, maxMoves: 12 },
      },
    },
    {
      id: '1.3',
      world: 1,
      stage: 3,
      worldTitle: 'Mundo 1: Planície Iniciante',
      title: 'Clareira das Descobertas',
      desc: '10 pares com mais concentração exigida.',
      mode: 'time-trial',
      pairs: 10,
      cols: 5,
      targets: {
        twoStars: { maxSeconds: 75, maxMoves: 20 },
        threeStars: { maxSeconds: 52, maxMoves: 15 },
      },
    },
    {
      id: '1.4',
      world: 1,
      stage: 4,
      worldTitle: 'Mundo 1: Planície Iniciante',
      title: 'Raposa Aprendiz',
      desc: 'Chefão: Duelo por turnos contra a Raposa Aprendiz (10 pares).',
      mode: 'vs-bot',
      pairs: 10,
      cols: 5,
      botDifficulty: 'easy',
      targets: {
        twoStars: { minLead: 2 },
        threeStars: { minLead: 4 },
      },
    },

    // Mundo 2: Fácil (Floresta das Memórias)
    {
      id: '2.1',
      world: 2,
      stage: 1,
      worldTitle: 'Mundo 2: Floresta Fácil',
      title: 'Entrada da Floresta',
      desc: '8 pares para acelerar seu ritmo.',
      mode: 'time-trial',
      pairs: 8,
      cols: 4,
      targets: {
        twoStars: { maxSeconds: 60, maxMoves: 16 },
        threeStars: { maxSeconds: 42, maxMoves: 12 },
      },
    },
    {
      id: '2.2',
      world: 2,
      stage: 2,
      worldTitle: 'Mundo 2: Floresta Fácil',
      title: 'Labirinto das Folhas',
      desc: '10 pares com foco e ritmo constante.',
      mode: 'time-trial',
      pairs: 10,
      cols: 5,
      targets: {
        twoStars: { maxSeconds: 75, maxMoves: 20 },
        threeStars: { maxSeconds: 52, maxMoves: 15 },
      },
    },
    {
      id: '2.3',
      world: 2,
      stage: 3,
      worldTitle: 'Mundo 2: Floresta Fácil',
      title: 'Bosque das Sombras',
      desc: '12 pares clássicos. Agilidade e boa memória!',
      mode: 'time-trial',
      pairs: 12,
      cols: 6,
      targets: {
        twoStars: { maxSeconds: 90, maxMoves: 24 },
        threeStars: { maxSeconds: 65, maxMoves: 18 },
      },
    },
    {
      id: '2.4',
      world: 2,
      stage: 4,
      worldTitle: 'Mundo 2: Floresta Fácil',
      title: 'Raposa Esperta',
      desc: 'Chefão: Duelo contra a Raposa Esperta (12 pares).',
      mode: 'vs-bot',
      pairs: 12,
      cols: 6,
      botDifficulty: 'easy',
      targets: {
        twoStars: { minLead: 2 },
        threeStars: { minLead: 4 },
      },
    },

    // Mundo 3: Médio (Montanha dos Mestres)
    {
      id: '3.1',
      world: 3,
      stage: 1,
      worldTitle: 'Mundo 3: Montanha Média',
      title: 'Subida da Montanha',
      desc: '10 pares no ar rarefeito das alturas.',
      mode: 'time-trial',
      pairs: 10,
      cols: 5,
      targets: {
        twoStars: { maxSeconds: 75, maxMoves: 20 },
        threeStars: { maxSeconds: 52, maxMoves: 15 },
      },
    },
    {
      id: '3.2',
      world: 3,
      stage: 2,
      worldTitle: 'Mundo 3: Montanha Média',
      title: 'Pico Nevado',
      desc: '12 pares com foco sob pressão.',
      mode: 'time-trial',
      pairs: 12,
      cols: 6,
      targets: {
        twoStars: { maxSeconds: 90, maxMoves: 24 },
        threeStars: { maxSeconds: 65, maxMoves: 18 },
      },
    },
    {
      id: '3.3',
      world: 3,
      stage: 3,
      worldTitle: 'Mundo 3: Montanha Média',
      title: 'Cume dos Ventos',
      desc: '14 pares em um tabuleiro amplo.',
      mode: 'time-trial',
      pairs: 14,
      cols: 7,
      targets: {
        twoStars: { maxSeconds: 110, maxMoves: 28 },
        threeStars: { maxSeconds: 80, maxMoves: 21 },
      },
    },
    {
      id: '3.4',
      world: 3,
      stage: 4,
      worldTitle: 'Mundo 3: Montanha Média',
      title: 'Raposa Estrategista',
      desc: 'Chefão: Duelo tático contra a Raposa Estrategista (14 pares).',
      mode: 'vs-bot',
      pairs: 14,
      cols: 7,
      botDifficulty: 'medium',
      targets: {
        twoStars: { minLead: 2 },
        threeStars: { minLead: 4 },
      },
    },

    // Mundo 4: Difícil (Pico das Sombras)
    {
      id: '4.1',
      world: 4,
      stage: 1,
      worldTitle: 'Mundo 4: Pico Difícil',
      title: 'Desfiladeiro Obscuro',
      desc: '12 pares exigindo memória impecável.',
      mode: 'time-trial',
      pairs: 12,
      cols: 6,
      targets: {
        twoStars: { maxSeconds: 90, maxMoves: 24 },
        threeStars: { maxSeconds: 65, maxMoves: 18 },
      },
    },
    {
      id: '4.2',
      world: 4,
      stage: 2,
      worldTitle: 'Mundo 4: Pico Difícil',
      title: 'Portal da Fortaleza',
      desc: '14 pares com alto nível de dispersão.',
      mode: 'time-trial',
      pairs: 14,
      cols: 7,
      targets: {
        twoStars: { maxSeconds: 110, maxMoves: 28 },
        threeStars: { maxSeconds: 80, maxMoves: 21 },
      },
    },
    {
      id: '4.3',
      world: 4,
      stage: 3,
      worldTitle: 'Mundo 4: Pico Difícil',
      title: 'Salão dos Guardiões',
      desc: '16 pares de alta complexidade e raciocínio veloz.',
      mode: 'time-trial',
      pairs: 16,
      cols: 8,
      targets: {
        twoStars: { maxSeconds: 130, maxMoves: 32 },
        threeStars: { maxSeconds: 95, maxMoves: 24 },
      },
    },
    {
      id: '4.4',
      world: 4,
      stage: 4,
      worldTitle: 'Mundo 4: Pico Difícil',
      title: 'Raposa Soberana',
      desc: 'Chefão: Duelo supremo contra a Raposa Soberana (16 pares)!',
      mode: 'vs-bot',
      pairs: 16,
      cols: 8,
      botDifficulty: 'hard',
      targets: {
        twoStars: { minLead: 2 },
        threeStars: { minLead: 4 },
      },
    },

    // Mundo 5: Bônus (O Covil Ancestral)
    {
      id: '5.1',
      world: 5,
      stage: 1,
      worldTitle: 'Fase Bônus: Desafio Supremo',
      title: 'Raposa Ancestral (Bônus)',
      desc: 'O desafio supremo de memória: 18 pares (36 cartas) contra o bot definitivo!',
      mode: 'vs-bot',
      pairs: 18,
      cols: 9,
      botDifficulty: 'hard',
      targets: {
        twoStars: { minLead: 2 },
        threeStars: { minLead: 4 },
      },
    },
  ];

  const FREE_PLAY_LEVELS = [
    { level: 1, name: 'Iniciante', pairs: 6, cards: 12, cols: 4, botDifficulty: 'easy' },
    { level: 2, name: 'Fácil', pairs: 8, cards: 16, cols: 4, botDifficulty: 'easy' },
    { level: 3, name: 'Médio', pairs: 12, cards: 24, cols: 6, botDifficulty: 'medium' },
    { level: 4, name: 'Difícil', pairs: 18, cards: 36, cols: 6, botDifficulty: 'hard' },
  ];

  // ---------- Probabilistic Bot ----------
  class ProbabilisticBot {
    constructor(difficulty = 'medium') {
      this.config = BOT_CONFIGS[difficulty] || BOT_CONFIGS.medium;
      this.memory = new Map(); // index -> { symbol, turnSeen }
      this.matched = new Set();
      this.currentTurn = 0;
    }

    setTurn(turn) {
      this.currentTurn = turn;
      this.pruneDecayedMemory();
    }

    observe(index, symbol) {
      if (this.matched.has(index)) return;
      this.memory.set(index, { symbol, turnSeen: this.currentTurn });
    }

    markMatched(indexA, indexB) {
      this.matched.add(indexA);
      this.matched.add(indexB);
      this.memory.delete(indexA);
      this.memory.delete(indexB);
    }

    pruneDecayedMemory() {
      for (const [index, entry] of this.memory.entries()) {
        if (this.currentTurn - entry.turnSeen > this.config.memoryTurns) {
          this.memory.delete(index);
        }
      }
    }

    remembers(index) {
      if (!this.memory.has(index)) return false;
      return Math.random() < this.config.retentionRate;
    }

    chooseFirstCard(totalCards) {
      this.pruneDecayedMemory();
      const available = this.getAvailable(totalCards);
      if (available.length === 0) return -1;

      if (Math.random() >= this.config.blunderRate) {
        const knownPairs = this.findKnownPairs();
        if (knownPairs.length > 0) {
          const [a] = knownPairs[Math.floor(Math.random() * knownPairs.length)];
          return a;
        }
      }

      const unknown = available.filter((idx) => !this.memory.has(idx));
      if (unknown.length > 0) {
        return unknown[Math.floor(Math.random() * unknown.length)];
      }

      return available[Math.floor(Math.random() * available.length)];
    }

    chooseSecondCard(firstIndex, firstSymbol, totalCards) {
      this.observe(firstIndex, firstSymbol);
      const available = this.getAvailable(totalCards).filter((i) => i !== firstIndex);
      if (available.length === 0) return -1;

      if (Math.random() >= this.config.blunderRate) {
        for (const [idx, entry] of this.memory.entries()) {
          if (idx !== firstIndex && entry.symbol === firstSymbol && !this.matched.has(idx)) {
            if (this.remembers(idx)) return idx;
          }
        }
      }

      const unknown = available.filter((idx) => !this.memory.has(idx));
      if (unknown.length > 0) {
        return unknown[Math.floor(Math.random() * unknown.length)];
      }

      return available[Math.floor(Math.random() * available.length)];
    }

    getAvailable(totalCards) {
      const res = [];
      for (let i = 0; i < totalCards; i++) {
        if (!this.matched.has(i)) res.push(i);
      }
      return res;
    }

    findKnownPairs() {
      const map = new Map();
      for (const [idx, entry] of this.memory.entries()) {
        if (this.matched.has(idx) || !this.remembers(idx)) continue;
        const list = map.get(entry.symbol) || [];
        list.push(idx);
        map.set(entry.symbol, list);
      }
      const pairs = [];
      for (const indices of map.values()) {
        if (indices.length >= 2) pairs.push([indices[0], indices[1]]);
      }
      return pairs;
    }
  }

  // ---------- Gerador de Tabuleiro ----------
  function shuffle(arr) {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  }

  function generateDeck(pairs) {
    const chosen = shuffle(SYMBOLS).slice(0, pairs);
    return shuffle([...chosen, ...chosen]);
  }

  // ---------- Armazenamento de Progresso e Recordes ----------
  const PROGRESS_KEY = 'bf-games:solo-progress';
  const RECORDS_KEY = 'bf-games:solo-records';

  function loadProgress() {
    try {
      const data = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
      return {
        unlockedStageId: data.unlockedStageId || '1.1',
        starsByStage: data.starsByStage || {},
      };
    } catch {
      return { unlockedStageId: '1.1', starsByStage: {} };
    }
  }

  function saveStageResult(stageId, stars) {
    const progress = loadProgress();
    const currentStars = progress.starsByStage[stageId] || 0;
    if (stars > currentStars) {
      progress.starsByStage[stageId] = stars;
    }

    // Se completou com ao menos 1 estrela, desbloqueia a próxima fase
    if (stars >= 1) {
      const currentIndex = CAMPAIGN_STAGES.findIndex((s) => s.id === stageId);
      if (currentIndex !== -1 && currentIndex + 1 < CAMPAIGN_STAGES.length) {
        const nextStage = CAMPAIGN_STAGES[currentIndex + 1];
        // Se a próxima estiver além do que já foi desbloqueado
        const currentUnlockedIndex = CAMPAIGN_STAGES.findIndex((s) => s.id === progress.unlockedStageId);
        if (currentIndex + 1 > currentUnlockedIndex) {
          progress.unlockedStageId = nextStage.id;
        }
      }
    }

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return progress;
  }

  function loadRecords() {
    try {
      return JSON.parse(localStorage.getItem(RECORDS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveRecord(levelKey, { seconds, moves }) {
    const records = loadRecords();
    const existing = records[levelKey];
    const isBest = !existing || seconds < existing.seconds || (seconds === existing.seconds && moves < existing.moves);
    if (isBest) {
      records[levelKey] = { seconds, moves, date: new Date().toISOString() };
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    }
    return { isBest, records };
  }

  // Exporta globalmente para o cliente
  window.BFSolo = {
    CAMPAIGN_STAGES,
    FREE_PLAY_LEVELS,
    ProbabilisticBot,
    generateDeck,
    loadProgress,
    saveStageResult,
    loadRecords,
    saveRecord,
  };
})();
