import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { ALLOWED_PAIRS, GameError, PairCount } from './memory-game';
import { Room, RoomsService } from './rooms.service';

/** Quanto tempo as duas cartas erradas ficam visíveis antes de esconder. */
const MISMATCH_REVEAL_MS = 1200;
const MAX_NAME_LENGTH = 20;

interface SocketData {
  code?: string;
  playerId?: string;
}

type Ack = { ok: true; code?: string } | { ok: false; error: string };

@WebSocketGateway({ namespace: '/memory' })
export class MemoryGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Namespace;
  private readonly logger = new Logger(MemoryGateway.name);

  constructor(private readonly rooms: RoomsService) {}

  @SubscribeMessage('room:create')
  create(@ConnectedSocket() socket: Socket, @MessageBody() body: unknown): Ack {
    return this.handle(() => {
      const { playerId, name, pairs } = this.parseIdentity(body);
      if (!ALLOWED_PAIRS.includes(pairs as PairCount)) throw new GameError('Tamanho de tabuleiro inválido.');

      const room = this.rooms.create(pairs as PairCount);
      this.enter(socket, room, playerId, name);
      this.logger.log(`Sala ${room.code} criada (${pairs} pares)`);
      return { ok: true, code: room.code };
    });
  }

  @SubscribeMessage('room:join')
  join(@ConnectedSocket() socket: Socket, @MessageBody() body: unknown): Ack {
    return this.handle(() => {
      const { playerId, name, code } = this.parseIdentity(body);
      if (typeof code !== 'string') throw new GameError('Informe o código da sala.');

      const room = this.rooms.get(code);
      this.enter(socket, room, playerId, name);
      return { ok: true, code: room.code };
    });
  }

  @SubscribeMessage('game:flip')
  flip(@ConnectedSocket() socket: Socket, @MessageBody() body: unknown): Ack {
    return this.handle(() => {
      const { room, playerId } = this.current(socket);
      const index = (body as { index?: unknown })?.index;
      const result = room.game.flip(playerId, Number(index));

      if (result.type === 'mismatch') {
        room.mismatchTimer = setTimeout(() => {
          room.mismatchTimer = undefined;
          room.game.resolveMismatch();
          this.broadcast(room);
        }, MISMATCH_REVEAL_MS);
      }
      this.broadcast(room);
      return { ok: true };
    });
  }

  @SubscribeMessage('game:restart')
  restart(@ConnectedSocket() socket: Socket): Ack {
    return this.handle(() => {
      const { room } = this.current(socket);
      if (room.game.status !== 'finished') throw new GameError('A partida ainda não terminou.');
      room.game.restart();
      this.broadcast(room);
      return { ok: true };
    });
  }

  handleDisconnect(socket: Socket): void {
    const { code, playerId } = socket.data as SocketData;
    if (!code || !playerId) return;
    try {
      const room = this.rooms.get(code);
      // Só marca offline se não houver outra aba/conexão do mesmo jogador na sala.
      const stillConnected = this.socketsIn(code).some(
        (s) => s.id !== socket.id && (s.data as SocketData).playerId === playerId,
      );
      if (!stillConnected) room.game.setConnected(playerId, false);
      this.rooms.refreshCleanup(room);
      this.broadcast(room);
    } catch {
      // Sala já removida: nada a fazer.
    }
  }

  private enter(socket: Socket, room: Room, playerId: string, name: string): void {
    const previous = socket.data as SocketData;
    if (previous.code && previous.code !== room.code) socket.leave(previous.code);

    room.game.join(playerId, name);
    socket.data = { code: room.code, playerId } satisfies SocketData;
    socket.join(room.code);
    this.rooms.refreshCleanup(room);
    this.broadcast(room);
  }

  /** Envia o estado público + o assento de cada destinatário. */
  private broadcast(room: Room): void {
    const state = room.game.toPublicState();
    for (const socket of this.socketsIn(room.code)) {
      const data = socket.data as SocketData;
      const you = room.game.players.findIndex((p) => p.id === data.playerId);
      socket.emit('game:state', { code: room.code, you, state });
    }
  }

  private socketsIn(code: string): Socket[] {
    const ids = this.server.adapter.rooms.get(code) ?? new Set<string>();
    return [...ids].flatMap((id) => this.server.sockets.get(id) ?? []);
  }

  private current(socket: Socket): { room: Room; playerId: string } {
    const { code, playerId } = socket.data as SocketData;
    if (!code || !playerId) throw new GameError('Você não está em uma sala.');
    return { room: this.rooms.get(code), playerId };
  }

  private parseIdentity(body: unknown) {
    const { playerId, name, pairs, code } = (body ?? {}) as Record<string, unknown>;
    if (typeof playerId !== 'string' || playerId.length < 8 || playerId.length > 64) {
      throw new GameError('Identificador de jogador inválido.');
    }
    const cleanName = typeof name === 'string' ? name.trim().slice(0, MAX_NAME_LENGTH) : '';
    if (!cleanName) throw new GameError('Informe seu nome.');
    return { playerId, name: cleanName, pairs: Number(pairs), code };
  }

  /** Erros de regra viram resposta para o cliente; erros inesperados são logados. */
  private handle(fn: () => Ack): Ack {
    try {
      return fn();
    } catch (error) {
      if (error instanceof GameError) return { ok: false, error: error.message };
      this.logger.error(error);
      return { ok: false, error: 'Erro inesperado no servidor.' };
    }
  }
}
