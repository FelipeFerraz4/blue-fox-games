import { ProbabilisticBot, BOT_CONFIGS } from './probabilistic-bot';

describe('ProbabilisticBot', () => {
  it('instantiates correctly for all difficulties', () => {
    const difficulties = ['easy', 'medium', 'hard', 'master'] as const;
    difficulties.forEach((diff) => {
      const bot = new ProbabilisticBot(diff);
      expect(bot).toBeDefined();
    });
  });

  it('selects valid cards when board is fresh', () => {
    const bot = new ProbabilisticBot('medium');
    const first = bot.chooseFirstCard(12);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(12);

    const second = bot.chooseSecondCard(first, '🦊', 12);
    expect(second).toBeGreaterThanOrEqual(0);
    expect(second).toBeLessThan(12);
    expect(second).not.toBe(first);
  });

  it('master bot remembers a revealed pair with high probability', () => {
    // Determinist random generator that returns 0.0 (always remembers, never blunders)
    const alwaysRemembers = () => 0.0;
    const bot = new ProbabilisticBot('master', alwaysRemembers);

    // Turn 1: Player reveals card 0 ('🦊') and card 3 ('🐙')
    bot.setTurn(1);
    bot.observe(0, '🦊');
    bot.observe(3, '🐙');

    // Turn 2: Player reveals card 4 ('🦊') and card 5 ('🐢')
    bot.setTurn(2);
    bot.observe(4, '🦊');
    bot.observe(5, '🐢');

    // Turn 3: Bot's turn. Bot already knows card 0 is '🦊' and card 4 is '🦊'!
    bot.setTurn(3);
    const firstCard = bot.chooseFirstCard(12);
    expect([0, 4]).toContain(firstCard);

    const symbol = '🦊';
    const secondCard = bot.chooseSecondCard(firstCard, symbol, 12);
    const expectedOther = firstCard === 0 ? 4 : 0;
    expect(secondCard).toBe(expectedOther);
  });

  it('does not pick cards that have been matched', () => {
    const bot = new ProbabilisticBot('master', () => 0.0);
    bot.setTurn(1);
    bot.observe(0, '🦊');
    bot.observe(1, '🦊');
    bot.markMatched(0, 1);

    // Cards 0 and 1 should never be picked
    for (let i = 0; i < 20; i++) {
      const first = bot.chooseFirstCard(4);
      expect([0, 1]).not.toContain(first);
      const second = bot.chooseSecondCard(first, '🐙', 4);
      expect([0, 1]).not.toContain(second);
    }
  });

  it('prunes memory after memoryTurns exceeded', () => {
    // Easy bot has memoryTurns = 3
    const bot = new ProbabilisticBot('easy');
    bot.setTurn(1);
    bot.observe(2, '🦊');

    // Fast-forward 5 turns
    bot.setTurn(7);
    // Card 2 was seen at turn 1, age is 6 > 3, should be forgotten
    // We can verify bot doesn't crash and behaves normally
    const first = bot.chooseFirstCard(10);
    expect(first).toBeGreaterThanOrEqual(0);
  });
});
