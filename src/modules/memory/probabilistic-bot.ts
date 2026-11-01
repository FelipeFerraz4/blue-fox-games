/**
 * Bot com Modelo de Retenção Probabilística de Memória para o Jogo da Memória.
 *
 * Simula um oponente humano realista:
 * - Observa cartas viradas no tabuleiro por qualquer jogador.
 * - Possui taxa de retenção configurável (retentionRate) e limite de turnos de memória.
 * - Na sua vez, decide a primeira e a segunda carta com base nas cartas lembradas e lógica dedutiva.
 */

export type BotDifficulty = 'easy' | 'medium' | 'hard' | 'master';

export interface BotConfig {
  /** Probabilidade de lembrar uma carta já vista (0.0 a 1.0) */
  retentionRate: number;
  /** Quantos turnos uma carta permanece na memória antes de decair */
  memoryTurns: number;
  /** Chance de cometer um erro aleatório mesmo lembrando */
  blunderRate: number;
}

export const BOT_CONFIGS: Record<BotDifficulty, BotConfig> = {
  easy: {
    retentionRate: 0.45,
    memoryTurns: 3,
    blunderRate: 0.2,
  },
  medium: {
    retentionRate: 0.75,
    memoryTurns: 6,
    blunderRate: 0.08,
  },
  hard: {
    retentionRate: 0.92,
    memoryTurns: 12,
    blunderRate: 0.02,
  },
  master: {
    retentionRate: 0.99,
    memoryTurns: 50,
    blunderRate: 0.0,
  },
};

interface MemoryEntry {
  symbol: string;
  turnSeen: number;
}

export class ProbabilisticBot {
  private readonly config: BotConfig;
  /** Mapa: index da carta -> informação memorizada */
  private readonly memory = new Map<number, MemoryEntry>();
  private readonly matched = new Set<number>();
  private currentTurn = 0;

  constructor(
    difficulty: BotDifficulty = 'medium',
    private readonly random: () => number = Math.random,
  ) {
    this.config = BOT_CONFIGS[difficulty];
  }

  /** Atualiza o número de turnos decorridos para cálculo de decaimento */
  setTurn(turn: number): void {
    this.currentTurn = turn;
    this.pruneDecayedMemory();
  }

  /** Registra que uma carta foi virada no tabuleiro */
  observe(index: number, symbol: string): void {
    if (this.matched.has(index)) return;
    this.memory.set(index, { symbol, turnSeen: this.currentTurn });
  }

  /** Registra que um par foi encontrado e não está mais em jogo */
  markMatched(indexA: number, indexB: number): void {
    this.matched.add(indexA);
    this.matched.add(indexB);
    this.memory.delete(indexA);
    this.memory.delete(indexB);
  }

  /** Remove cartas da memória que ultrapassaram o tempo limite de retenção */
  private pruneDecayedMemory(): void {
    for (const [index, entry] of this.memory.entries()) {
      const age = this.currentTurn - entry.turnSeen;
      if (age > this.config.memoryTurns) {
        this.memory.delete(index);
      }
    }
  }

  /** Testa se o bot lembra ativamente de uma carta armazenada */
  private remembers(index: number): boolean {
    if (!this.memory.has(index)) return false;
    return this.random() < this.config.retentionRate;
  }

  /**
   * Escolhe a primeira carta a ser virada pelo Bot.
   */
  chooseFirstCard(totalCards: number): number {
    this.pruneDecayedMemory();
    const available = this.getAvailableIndices(totalCards);
    if (available.length === 0) return -1;

    // Se o bot comete uma "bobeira" intencional por blunderRate
    const isBlunder = this.random() < this.config.blunderRate;

    if (!isBlunder) {
      // 1. Procura se na memória já existe um par conhecido completo
      const knownPairs = this.findKnownPairs();
      if (knownPairs.length > 0) {
        // Escolhe o primeiro par lembrado
        const [a] = knownPairs[Math.floor(this.random() * knownPairs.length)];
        return a;
      }
    }

    // 2. Se não tem par memorizado, prefere virar uma carta que ainda NÃO está na memória
    const unknown = available.filter((idx) => !this.memory.has(idx));
    if (unknown.length > 0) {
      return unknown[Math.floor(this.random() * unknown.length)];
    }

    // 3. Fallback: vira qualquer carta disponível
    return available[Math.floor(this.random() * available.length)];
  }

  /**
   * Escolhe a segunda carta a ser virada pelo Bot.
   * Recebe o índice da primeira carta que ele acabou de virar e o símbolo revelado nela.
   */
  chooseSecondCard(firstIndex: number, firstSymbol: string, totalCards: number): number {
    // Imediatamente memoriza a carta que ele acabou de virar
    this.observe(firstIndex, firstSymbol);

    const available = this.getAvailableIndices(totalCards).filter((idx) => idx !== firstIndex);
    if (available.length === 0) return -1;

    const isBlunder = this.random() < this.config.blunderRate;

    if (!isBlunder) {
      // 1. Procura na memória se já viu a outra carta do mesmo símbolo
      for (const [idx, entry] of this.memory.entries()) {
        if (idx !== firstIndex && entry.symbol === firstSymbol && !this.matched.has(idx)) {
          if (this.remembers(idx)) {
            return idx; // Encontrou o par memorizado!
          }
        }
      }
    }

    // 2. Se não lembrou do par, prefere virar uma carta ainda desconhecida para coletar informação
    const unknown = available.filter((idx) => !this.memory.has(idx));
    if (unknown.length > 0) {
      return unknown[Math.floor(this.random() * unknown.length)];
    }

    // 3. Fallback: vira qualquer outra disponível
    return available[Math.floor(this.random() * available.length)];
  }

  /** Lista índices válidos que ainda não foram marcados como matched */
  private getAvailableIndices(totalCards: number): number[] {
    const list: number[] = [];
    for (let i = 0; i < totalCards; i++) {
      if (!this.matched.has(i)) list.push(i);
    }
    return list;
  }

  /** Procura na memória pares com o mesmo símbolo onde ambas as cartas são lembradas */
  private findKnownPairs(): [number, number][] {
    const symbolsMap = new Map<string, number[]>();
    for (const [idx, entry] of this.memory.entries()) {
      if (this.matched.has(idx)) continue;
      if (!this.remembers(idx)) continue;

      const list = symbolsMap.get(entry.symbol) ?? [];
      list.push(idx);
      symbolsMap.set(entry.symbol, list);
    }

    const pairs: [number, number][] = [];
    for (const indices of symbolsMap.values()) {
      if (indices.length >= 2) {
        pairs.push([indices[0], indices[1]]);
      }
    }
    return pairs;
  }
}
