import { GameError, MemoryGame } from './memory-game';

/** Lê os símbolos reais (privados) para montar jogadas de teste. */
function symbolsOf(game: MemoryGame): string[] {
  return (game as unknown as { cards: { symbol: string }[] }).cards.map((c) => c.symbol);
}

function findPair(game: MemoryGame): [number, number] {
  const symbols = symbolsOf(game);
  const state = game.toPublicState();
  const i = symbols.findIndex((_, idx) => state.cards[idx].matchedBy === null);
  const j = symbols.findIndex((s, idx) => idx !== i && s === symbols[i]);
  return [i, j];
}

function findMismatch(game: MemoryGame): [number, number] {
  const symbols = symbolsOf(game);
  const j = symbols.findIndex((s) => s !== symbols[0]);
  return [0, j];
}

function startedGame(): MemoryGame {
  const game = new MemoryGame(8);
  game.join('player-aaaa', 'Ana');
  game.join('player-bbbb', 'Bruno');
  return game;
}

describe('MemoryGame', () => {
  it('distribui 2 cartas de cada símbolo e esconde os símbolos do cliente', () => {
    const game = new MemoryGame(8);
    const symbols = symbolsOf(game);
    expect(symbols).toHaveLength(16);
    expect(new Set(symbols).size).toBe(8);
    expect(game.toPublicState().cards.every((c) => c.symbol === null)).toBe(true);
  });

  it('começa a partida só quando o segundo jogador entra e recusa um terceiro', () => {
    const game = new MemoryGame(8);
    game.join('player-aaaa', 'Ana');
    expect(game.status).toBe('waiting');
    game.join('player-bbbb', 'Bruno');
    expect(game.status).toBe('playing');
    expect(() => game.join('player-cccc', 'Caio')).toThrow(GameError);
  });

  it('reconecta o mesmo jogador no mesmo assento', () => {
    const game = startedGame();
    game.setConnected('player-bbbb', false);
    expect(game.join('player-bbbb', 'Bruno')).toBe(1);
    expect(game.players[1].connected).toBe(true);
  });

  it('não deixa jogar fora da vez', () => {
    const game = startedGame();
    expect(() => game.flip('player-bbbb', 0)).toThrow('Não é a sua vez.');
  });

  it('acerto pontua e mantém a vez', () => {
    const game = startedGame();
    const [a, b] = findPair(game);
    game.flip('player-aaaa', a);
    expect(game.flip('player-aaaa', b)).toEqual({ type: 'match', finished: false });
    expect(game.players[0].score).toBe(1);
    expect(game.currentTurn).toBe(0);
    expect(game.toPublicState().cards[a].symbol).not.toBeNull();
  });

  it('erro trava o tabuleiro até resolver e então passa a vez', () => {
    const game = startedGame();
    const [a, b] = findMismatch(game);
    game.flip('player-aaaa', a);
    expect(game.flip('player-aaaa', b)).toEqual({ type: 'mismatch' });
    expect(game.toPublicState().locked).toBe(true);
    expect(() => game.flip('player-aaaa', 2)).toThrow(GameError);

    game.resolveMismatch();
    const state = game.toPublicState();
    expect(state.locked).toBe(false);
    expect(state.currentTurn).toBe(1);
    expect(state.cards[a].symbol).toBeNull();
  });

  it('não permite virar a mesma carta duas vezes', () => {
    const game = startedGame();
    game.flip('player-aaaa', 0);
    expect(() => game.flip('player-aaaa', 0)).toThrow('Essa carta já está virada.');
  });

  it('termina quando todos os pares são encontrados, aponta o vencedor e permite revanche', () => {
    const game = startedGame();
    for (let i = 0; i < 8; i++) {
      const [a, b] = findPair(game);
      game.flip('player-aaaa', a);
      game.flip('player-aaaa', b);
    }
    expect(game.status).toBe('finished');
    expect(game.winners()).toEqual([0]);

    game.restart();
    expect(game.status).toBe('playing');
    expect(game.players.map((p) => p.score)).toEqual([0, 0]);
    expect(game.currentTurn).toBe(1); // revanche alterna quem começa
  });
});
