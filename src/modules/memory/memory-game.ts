/**
 * Regras do jogo da memória para 2 jogadores, em TypeScript puro (sem Nest/Socket.IO),
 * para poder ser testado isoladamente e reaproveitado no futuro frontend.
 *
 * O servidor é a autoridade: o cliente só recebe o símbolo de uma carta quando ela
 * está virada ou já foi encontrada (ver `toPublicState`).
 */

export const SYMBOLS = [
  '🦊', '🐠', '🐙', '🐢', '🦀', '🐬', '🐳', '🦉', '🐼',
  '🐸', '🦁', '🐯', '🐨', '🐧', '🦄', '🐝', '🦋', '🦜',
];

export const ALLOWED_PAIRS = [8, 12, 18] as const;
export type PairCount = (typeof ALLOWED_PAIRS)[number];

export const MAX_PLAYERS = 2;

export type GameStatus = 'waiting' | 'playing' | 'finished';

interface Card {
  symbol: string;
  /** Índice do jogador que encontrou o par, ou null. */
  matchedBy: number | null;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  connected: boolean;
}

export type FlipResult =
  | { type: 'flipped' }
  | { type: 'match'; finished: boolean }
  | { type: 'mismatch' };

export class GameError extends Error {}

export interface PublicCard {
  symbol: string | null;
  faceUp: boolean;
  matchedBy: number | null;
}

export interface PublicState {
  status: GameStatus;
  pairs: PairCount;
  players: { name: string; score: number; connected: boolean }[];
  currentTurn: number;
  cards: PublicCard[];
  /** true enquanto duas cartas diferentes estão viradas aguardando esconder. */
  locked: boolean;
  /** Índices dos vencedores (2 em caso de empate). Vazio enquanto não terminou. */
  winners: number[];
}

export class MemoryGame {
  status: GameStatus = 'waiting';
  players: Player[] = [];
  currentTurn = 0;
  private cards: Card[] = [];
  private faceUp: number[] = [];
  private startingPlayer = 0;

  constructor(
    readonly pairs: PairCount,
    private readonly random: () => number = Math.random,
  ) {
    if (!ALLOWED_PAIRS.includes(pairs)) {
      throw new GameError(`Quantidade de pares inválida: ${pairs}`);
    }
    this.deal();
  }

  /** Adiciona o jogador ou reconecta quem já estava na sala. Retorna o índice do assento. */
  join(playerId: string, name: string): number {
    const existing = this.players.findIndex((p) => p.id === playerId);
    if (existing !== -1) {
      this.players[existing].connected = true;
      this.players[existing].name = name;
      return existing;
    }
    if (this.players.length >= MAX_PLAYERS) {
      throw new GameError('A sala já está cheia.');
    }
    this.players.push({ id: playerId, name, score: 0, connected: true });
    if (this.players.length === MAX_PLAYERS) {
      this.status = 'playing';
    }
    return this.players.length - 1;
  }

  setConnected(playerId: string, connected: boolean): void {
    const player = this.players.find((p) => p.id === playerId);
    if (player) player.connected = connected;
  }

  get isLocked(): boolean {
    return this.faceUp.length === 2;
  }

  flip(playerId: string, index: number): FlipResult {
    if (this.status !== 'playing') throw new GameError('A partida não está em andamento.');
    const seat = this.players.findIndex((p) => p.id === playerId);
    if (seat !== this.currentTurn) throw new GameError('Não é a sua vez.');
    if (this.isLocked) throw new GameError('Aguarde as cartas serem escondidas.');
    if (!Number.isInteger(index) || index < 0 || index >= this.cards.length) {
      throw new GameError('Carta inválida.');
    }
    if (this.cards[index].matchedBy !== null || this.faceUp.includes(index)) {
      throw new GameError('Essa carta já está virada.');
    }

    this.faceUp.push(index);
    if (this.faceUp.length < 2) return { type: 'flipped' };

    const [a, b] = this.faceUp;
    if (this.cards[a].symbol !== this.cards[b].symbol) return { type: 'mismatch' };

    // Acertou: marca o par, pontua e continua jogando.
    this.cards[a].matchedBy = seat;
    this.cards[b].matchedBy = seat;
    this.players[seat].score += 1;
    this.faceUp = [];

    const finished = this.cards.every((c) => c.matchedBy !== null);
    if (finished) this.status = 'finished';
    return { type: 'match', finished };
  }

  /** Esconde as duas cartas erradas e passa a vez. Chamado pelo servidor após o delay de exibição. */
  resolveMismatch(): void {
    if (!this.isLocked) return;
    this.faceUp = [];
    this.currentTurn = (this.currentTurn + 1) % MAX_PLAYERS;
  }

  /** Nova partida com os mesmos jogadores; quem começa alterna a cada revanche. */
  restart(): void {
    if (this.players.length < MAX_PLAYERS) throw new GameError('Aguardando o segundo jogador.');
    this.players.forEach((p) => (p.score = 0));
    this.startingPlayer = (this.startingPlayer + 1) % MAX_PLAYERS;
    this.currentTurn = this.startingPlayer;
    this.status = 'playing';
    this.deal();
  }

  winners(): number[] {
    if (this.status !== 'finished') return [];
    const best = Math.max(...this.players.map((p) => p.score));
    return this.players.flatMap((p, i) => (p.score === best ? [i] : []));
  }

  toPublicState(): PublicState {
    return {
      status: this.status,
      pairs: this.pairs,
      players: this.players.map(({ name, score, connected }) => ({ name, score, connected })),
      currentTurn: this.currentTurn,
      locked: this.isLocked,
      winners: this.winners(),
      cards: this.cards.map((card, i) => {
        const faceUp = this.faceUp.includes(i);
        const visible = faceUp || card.matchedBy !== null;
        return { symbol: visible ? card.symbol : null, faceUp, matchedBy: card.matchedBy };
      }),
    };
  }

  private deal(): void {
    const symbols = this.shuffle([...SYMBOLS]).slice(0, this.pairs);
    this.cards = this.shuffle([...symbols, ...symbols]).map((symbol) => ({ symbol, matchedBy: null }));
    this.faceUp = [];
  }

  /** Fisher–Yates. */
  private shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }
}
