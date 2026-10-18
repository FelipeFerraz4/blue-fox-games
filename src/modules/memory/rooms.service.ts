import { Injectable } from '@nestjs/common';
import { GameError, MemoryGame, PairCount } from './memory-game';

/** Sem 0/O/1/I/L para o código ser fácil de ditar por telefone/chat. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;
/** Sala sem ninguém conectado é removida após esse tempo. */
const EMPTY_ROOM_TTL_MS = 30 * 60 * 1000;

export interface Room {
  code: string;
  game: MemoryGame;
  /** Timer do "esconder cartas" após um erro; evita agendar duas vezes. */
  mismatchTimer?: NodeJS.Timeout;
  cleanupTimer?: NodeJS.Timeout;
}

/**
 * Salas em memória (protótipo). Reiniciar o servidor encerra as partidas.
 * Para escalar para várias instâncias, mover para Redis.
 */
@Injectable()
export class RoomsService {
  private readonly rooms = new Map<string, Room>();

  create(pairs: PairCount): Room {
    let code: string;
    do {
      code = Array.from(
        { length: CODE_LENGTH },
        () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)],
      ).join('');
    } while (this.rooms.has(code));

    const room: Room = { code, game: new MemoryGame(pairs) };
    this.rooms.set(code, room);
    return room;
  }

  get(code: string): Room {
    const room = this.rooms.get(code.trim().toUpperCase());
    if (!room) throw new GameError('Sala não encontrada. Confira o código.');
    return room;
  }

  /** Agenda a remoção quando todos saem; cancela se alguém voltar. */
  refreshCleanup(room: Room): void {
    clearTimeout(room.cleanupTimer);
    room.cleanupTimer = undefined;
    if (room.game.players.some((p) => p.connected)) return;

    room.cleanupTimer = setTimeout(() => {
      clearTimeout(room.mismatchTimer);
      this.rooms.delete(room.code);
    }, EMPTY_ROOM_TTL_MS);
    room.cleanupTimer.unref();
  }
}
