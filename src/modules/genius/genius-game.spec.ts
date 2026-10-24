import { GeniusGame, GeniusColor } from './genius-game';

describe('GeniusGame', () => {
  it('starts at round 1 with a single color and playing status', () => {
    const game = new GeniusGame();
    const firstColor = game.start();

    expect(game.status).toBe('playing');
    expect(game.sequence.length).toBe(1);
    expect(game.sequence[0]).toBe(firstColor);
    expect(game.score).toBe(0);
  });

  it('correctly handles correct input and advances round on complete sequence', () => {
    // Deterministic random generator returning 0 -> index 0 = 'green'
    const game = new GeniusGame(() => 0);
    game.start(); // sequence: ['green']

    const res1 = game.submitColor('green');
    expect(res1.correct).toBe(true);
    expect(res1.roundComplete).toBe(true);
    expect(res1.score).toBe(1);

    // Next round
    game.nextRound(); // sequence: ['green', 'green']
    expect(game.sequence.length).toBe(2);

    const step1 = game.submitColor('green');
    expect(step1.correct).toBe(true);
    expect(step1.roundComplete).toBe(false);

    const step2 = game.submitColor('green');
    expect(step2.correct).toBe(true);
    expect(step2.roundComplete).toBe(true);
    expect(step2.score).toBe(2);
  });

  it('triggers game over on wrong color input', () => {
    const game = new GeniusGame(() => 0); // returns 'green'
    game.start();

    const res = game.submitColor('red');
    expect(res.correct).toBe(false);
    expect(res.roundComplete).toBe(false);
    expect(game.status).toBe('game_over');

    // Trying to submit while game_over throws
    expect(() => game.submitColor('green')).toThrow();
  });

  it('evaluates feedback correctly, marking 12+ as Mestre do Pulso', () => {
    const fb3 = GeniusGame.getFeedback(3);
    expect(fb3.tier).toBe('Iniciante');

    const fb10 = GeniusGame.getFeedback(10);
    expect(fb10.tier).toBe('Boa Memória');

    const fb12 = GeniusGame.getFeedback(12);
    expect(fb12.tier).toBe('Mestre do Pulso');
    expect(fb12.message).toContain('12 ou mais é uma marca excelente');

    const fb18 = GeniusGame.getFeedback(18);
    expect(fb18.tier).toBe('Lenda Sônica');
  });

  it('adjusts playback speed dynamically as rounds increase', () => {
    const game = new GeniusGame(() => 0);
    game.start();

    const speedR1 = game.getPlaybackSpeed();
    expect(speedR1.onDurationMs).toBe(460);

    // Simulate round 10
    for (let i = 0; i < 9; i++) game.nextRound();
    const speedR10 = game.getPlaybackSpeed();
    expect(speedR10.onDurationMs).toBe(300);
  });
});
