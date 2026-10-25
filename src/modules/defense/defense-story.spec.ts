import { GLOBAL_STORY, SOLAR_SYSTEM_STAGES } from './defense-story';

describe('MilkyWayDefense Story & Solar Stages', () => {
  it('has global story intro and epilogue with Star Date 2525', () => {
    expect(GLOBAL_STORY.title).toContain('MILKY WAY DEFENSE');
    expect(GLOBAL_STORY.stardate).toContain('2525');
    expect(GLOBAL_STORY.introCrawl.length).toBeGreaterThan(10);
    expect(GLOBAL_STORY.epilogue.length).toBeGreaterThan(3);
  });

  it('contains exactly 11 solar system stages in astronomical defense order starting from Earth', () => {
    expect(SOLAR_SYSTEM_STAGES.length).toBe(11);

    // 1st is Earth (Terra)
    expect(SOLAR_SYSTEM_STAGES[0].key).toBe('terra');
    expect(SOLAR_SYSTEM_STAGES[0].id).toBe(1);

    // 2nd Vênus, 3rd Mercúrio, 4th Sol
    expect(SOLAR_SYSTEM_STAGES[1].key).toBe('venus');
    expect(SOLAR_SYSTEM_STAGES[2].key).toBe('mercurio');
    expect(SOLAR_SYSTEM_STAGES[3].key).toBe('sol');

    // 5th Marte, 6th Cinturão de Asteroides, 7th Júpiter, 8th Saturno
    expect(SOLAR_SYSTEM_STAGES[4].key).toBe('marte');
    expect(SOLAR_SYSTEM_STAGES[5].key).toBe('cinturao-asteroides');
    expect(SOLAR_SYSTEM_STAGES[6].key).toBe('jupiter');
    expect(SOLAR_SYSTEM_STAGES[7].key).toBe('saturno');

    // 9th Urano, 10th Netuno, 11th Cinturão de Kuiper (Final Boss)
    expect(SOLAR_SYSTEM_STAGES[8].key).toBe('urano');
    expect(SOLAR_SYSTEM_STAGES[9].key).toBe('netuno');
    expect(SOLAR_SYSTEM_STAGES[10].key).toBe('cinturao-kuiper');
  });

  it('includes all 8 planets, the Sun, and both asteroid belts', () => {
    const keys = SOLAR_SYSTEM_STAGES.map((s) => s.key);
    // 8 planets:
    expect(keys).toContain('mercurio');
    expect(keys).toContain('venus');
    expect(keys).toContain('terra');
    expect(keys).toContain('marte');
    expect(keys).toContain('jupiter');
    expect(keys).toContain('saturno');
    expect(keys).toContain('urano');
    expect(keys).toContain('netuno');
    // Sun:
    expect(keys).toContain('sol');
    // 2 asteroid belts:
    expect(keys).toContain('cinturao-asteroides');
    expect(keys).toContain('cinturao-kuiper');
  });

  it('defines progressive upgrades and wave difficulty', () => {
    // Sol has a boss (Vulcan)
    expect(SOLAR_SYSTEM_STAGES[3].wave.boss).toBeDefined();
    expect(SOLAR_SYSTEM_STAGES[3].wave.boss?.name).toBe('Coletor Estelar Vulcan');

    // Cinturão de Kuiper has final boss (Dreadnought)
    expect(SOLAR_SYSTEM_STAGES[10].wave.boss).toBeDefined();
    expect(SOLAR_SYSTEM_STAGES[10].wave.boss?.name).toContain('Dreadnought');

    // Both asteroid belts have hasAsteroids = true
    expect(SOLAR_SYSTEM_STAGES[5].wave.hasAsteroids).toBe(true);
    expect(SOLAR_SYSTEM_STAGES[10].wave.hasAsteroids).toBe(true);

    // Each stage has briefing and pilotLog
    SOLAR_SYSTEM_STAGES.forEach((stage) => {
      expect(stage.briefing.length).toBeGreaterThan(15);
      expect(stage.pilotLog.length).toBeGreaterThan(10);
      expect(stage.visualTheme.skyColor).toBeDefined();
      expect(stage.visualTheme.planetGlow).toBeDefined();
    });
  });
});
