import {
  CAMPAIGN_STAGES,
  FREE_PLAY_LEVELS,
  calculateStars,
  generateSoloDeck,
} from './solo-engine';

describe('SoloEngine', () => {
  it('has 9 campaign stages correctly grouped in 3 worlds', () => {
    expect(CAMPAIGN_STAGES.length).toBe(9);
    const world1 = CAMPAIGN_STAGES.filter((s) => s.world === 1);
    const world2 = CAMPAIGN_STAGES.filter((s) => s.world === 2);
    const world3 = CAMPAIGN_STAGES.filter((s) => s.world === 3);

    expect(world1.length).toBe(3);
    expect(world2.length).toBe(3);
    expect(world3.length).toBe(3);

    // Each world ends with a vs-bot boss stage
    expect(world1[2].mode).toBe('vs-bot');
    expect(world2[2].mode).toBe('vs-bot');
    expect(world3[2].mode).toBe('vs-bot');
  });

  it('has 4 free-play levels', () => {
    expect(FREE_PLAY_LEVELS.length).toBe(4);
    expect(FREE_PLAY_LEVELS[0].pairs).toBe(6);
    expect(FREE_PLAY_LEVELS[1].pairs).toBe(8);
    expect(FREE_PLAY_LEVELS[2].pairs).toBe(12);
    expect(FREE_PLAY_LEVELS[3].pairs).toBe(18);
  });

  it('generates a valid deck with exact pair duplicates', () => {
    const deck = generateSoloDeck(6);
    expect(deck.length).toBe(12);

    // Every symbol appears exactly twice
    const counts = new Map<string, number>();
    deck.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1));
    for (const count of counts.values()) {
      expect(count).toBe(2);
    }
  });

  it('calculates stars accurately for time-trial stages', () => {
    const stage = CAMPAIGN_STAGES[0]; // stage 1.1: 3 stars <= 35s and <= 9 moves

    // 3 stars
    expect(calculateStars(stage, { won: true, seconds: 30, moves: 8 })).toBe(3);

    // 2 stars
    expect(calculateStars(stage, { won: true, seconds: 45, moves: 11 })).toBe(2);

    // 1 star (completed but above targets)
    expect(calculateStars(stage, { won: true, seconds: 90, moves: 25 })).toBe(1);

    // 0 stars (lost/forfeited)
    expect(calculateStars(stage, { won: false, seconds: 10, moves: 5 })).toBe(0);
  });

  it('calculates stars accurately for vs-bot stages', () => {
    const stage = CAMPAIGN_STAGES[2]; // stage 1.3: vs-bot (6 pairs total)

    // Player wins by 4 pairs -> 3 stars
    expect(calculateStars(stage, { won: true, seconds: 50, moves: 10, playerScore: 5, botScore: 1 })).toBe(3);

    // Player wins by 2 pairs -> 2 stars
    expect(calculateStars(stage, { won: true, seconds: 50, moves: 10, playerScore: 4, botScore: 2 })).toBe(2);

    // Player wins by 1 pair -> 1 star
    expect(calculateStars(stage, { won: true, seconds: 50, moves: 10, playerScore: 3, botScore: 2 })).toBe(1);

    // Tie or bot won -> 0 stars
    expect(calculateStars(stage, { won: false, seconds: 50, moves: 10, playerScore: 3, botScore: 3 })).toBe(0);
  });
});
