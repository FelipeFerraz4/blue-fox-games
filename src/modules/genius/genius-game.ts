/**
 * Regras do jogo Genius em TypeScript puro sem dependências externas.
 */

export type GeniusColor = 'green' | 'red' | 'yellow' | 'blue';

export const GENIUS_COLORS: readonly GeniusColor[] = ['green', 'red', 'yellow', 'blue'] as const;

export type GeniusStatus = 'idle' | 'playing' | 'game_over';

export interface SubmitResult {
  correct: boolean;
  roundComplete: boolean;
  score: number;
}

export interface ScoreFeedback {
  tier: string;
  badge: string;
  message: string;
}

export class GeniusGame {
  private _sequence: GeniusColor[] = [];
  private _userIndex = 0;
  private _score = 0;
  private _status: GeniusStatus = 'idle';

  constructor(private readonly random: () => number = Math.random) {}

  get sequence(): readonly GeniusColor[] {
    return this._sequence;
  }

  get userIndex(): number {
    return this._userIndex;
  }

  get score(): number {
    return this._score;
  }

  get status(): GeniusStatus {
    return this._status;
  }

  /**
   * Inicia ou reinicia uma partida do zero gerando o primeiro passo.
   */
  start(): GeniusColor {
    this._sequence = [];
    this._score = 0;
    this._status = 'playing';
    return this.nextRound();
  }

  /**
   * Adiciona uma nova cor aleatória à sequência e prepara o turno do usuário.
   */
  nextRound(): GeniusColor {
    const nextColor = GENIUS_COLORS[Math.floor(this.random() * GENIUS_COLORS.length)];
    this._sequence.push(nextColor);
    this._userIndex = 0;
    this._status = 'playing';
    return nextColor;
  }

  /**
   * Valida a cor pressionada pelo jogador no passo atual da sequência.
   */
  submitColor(color: GeniusColor): SubmitResult {
    if (this._status !== 'playing') {
      throw new Error('A partida não está em andamento.');
    }

    const expectedColor = this._sequence[this._userIndex];

    if (color !== expectedColor) {
      this._status = 'game_over';
      return {
        correct: false,
        roundComplete: false,
        score: this._score,
      };
    }

    this._userIndex++;

    // O jogador completou a sequência inteira da rodada atual
    if (this._userIndex === this._sequence.length) {
      this._score = this._sequence.length;
      return {
        correct: true,
        roundComplete: true,
        score: this._score,
      };
    }

    // Acertou o passo, mas ainda faltam cores nesta rodada
    return {
      correct: true,
      roundComplete: false,
      score: this._score,
    };
  }

  /**
   * Retorna a velocidade recomendada (tempo de flash da cor) para a rodada.
   */
  getPlaybackSpeed(): { onDurationMs: number; offDurationMs: number } {
    const round = this._sequence.length;
    if (round <= 4) return { onDurationMs: 460, offDurationMs: 140 };
    if (round <= 8) return { onDurationMs: 380, offDurationMs: 110 };
    if (round <= 12) return { onDurationMs: 300, offDurationMs: 90 };
    return { onDurationMs: 240, offDurationMs: 70 };
  }

  /**
   * Avalia a pontuação com mensagens personalizadas, com destaque especial a partir de 12 acertos.
   */
  static getFeedback(score: number): ScoreFeedback {
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
        tier: 'Mestre do Pulso',
        badge: '🦊',
        message: 'Sensacional! Acertar 12 ou mais é uma marca excelente! Memória de raposa!',
      };
    }
    return {
      tier: 'Lenda Sônica',
      badge: '👑',
      message: 'Inacreditável! Você tem memória fotográfica e reflexo absoluto! Uma verdadeira Lenda!',
    };
  }
}

export { GeniusGame as BeatGame, GeniusGame as PulseGame };
