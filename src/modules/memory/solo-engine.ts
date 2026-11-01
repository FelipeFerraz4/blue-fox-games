import { SYMBOLS } from './memory-game';
import { BotDifficulty } from './probabilistic-bot';

export type SoloGameMode = 'time-trial' | 'vs-bot';

export interface StageDefinition {
  id: string; // ex: '1.1', '1.2', '1.3', '1.4' ... '5.1'
  world: number; // 1, 2, 3, 4, 5
  stage: number; // 1, 2, 3, 4
  title: string;
  description: string;
  mode: SoloGameMode;
  pairs: number;
  cols?: number;
  botDifficulty?: BotDifficulty;
  targets: {
    twoStars: { maxSeconds?: number; maxMoves?: number; minLead?: number };
    threeStars: { maxSeconds?: number; maxMoves?: number; minLead?: number };
  };
}

export const CAMPAIGN_STAGES: StageDefinition[] = [
  // Mundo 1: Iniciante (Planície dos Primeiros Passos)
  {
    id: '1.1',
    world: 1,
    stage: 1,
    title: 'Primeiros Passos',
    description: 'Encontre 6 pares para aquecer o raciocínio.',
    mode: 'time-trial',
    pairs: 6,
    cols: 4,
    targets: {
      twoStars: { maxSeconds: 45, maxMoves: 12 },
      threeStars: { maxSeconds: 30, maxMoves: 9 },
    },
  },
  {
    id: '1.2',
    world: 1,
    stage: 2,
    title: 'Trilha das Lembranças',
    description: '8 pares com foco em precisão de movimentos.',
    mode: 'time-trial',
    pairs: 8,
    cols: 4,
    targets: {
      twoStars: { maxSeconds: 60, maxMoves: 16 },
      threeStars: { maxSeconds: 42, maxMoves: 12 },
    },
  },
  {
    id: '1.3',
    world: 1,
    stage: 3,
    title: 'Clareira das Descobertas',
    description: '10 pares com mais concentração exigida.',
    mode: 'time-trial',
    pairs: 10,
    cols: 5,
    targets: {
      twoStars: { maxSeconds: 75, maxMoves: 20 },
      threeStars: { maxSeconds: 52, maxMoves: 15 },
    },
  },
  {
    id: '1.4',
    world: 1,
    stage: 4,
    title: 'Raposa Aprendiz',
    description: 'Duelo por turnos contra a Raposa Aprendiz (10 pares).',
    mode: 'vs-bot',
    pairs: 10,
    cols: 5,
    botDifficulty: 'easy',
    targets: {
      twoStars: { minLead: 2 },
      threeStars: { minLead: 4 },
    },
  },

  // Mundo 2: Fácil (Floresta das Memórias)
  {
    id: '2.1',
    world: 2,
    stage: 1,
    title: 'Entrada da Floresta',
    description: '8 pares para acelerar seu ritmo.',
    mode: 'time-trial',
    pairs: 8,
    cols: 4,
    targets: {
      twoStars: { maxSeconds: 60, maxMoves: 16 },
      threeStars: { maxSeconds: 42, maxMoves: 12 },
    },
  },
  {
    id: '2.2',
    world: 2,
    stage: 2,
    title: 'Labirinto das Folhas',
    description: '10 pares com foco e ritmo constante.',
    mode: 'time-trial',
    pairs: 10,
    cols: 5,
    targets: {
      twoStars: { maxSeconds: 75, maxMoves: 20 },
      threeStars: { maxSeconds: 52, maxMoves: 15 },
    },
  },
  {
    id: '2.3',
    world: 2,
    stage: 3,
    title: 'Bosque das Sombras',
    description: '12 pares clássicos. Agilidade e boa memória!',
    mode: 'time-trial',
    pairs: 12,
    cols: 6,
    targets: {
      twoStars: { maxSeconds: 90, maxMoves: 24 },
      threeStars: { maxSeconds: 65, maxMoves: 18 },
    },
  },
  {
    id: '2.4',
    world: 2,
    stage: 4,
    title: 'Raposa Esperta',
    description: 'Duelo contra a Raposa Esperta (12 pares).',
    mode: 'vs-bot',
    pairs: 12,
    cols: 6,
    botDifficulty: 'easy',
    targets: {
      twoStars: { minLead: 2 },
      threeStars: { minLead: 4 },
    },
  },

  // Mundo 3: Médio (Montanha dos Mestres)
  {
    id: '3.1',
    world: 3,
    stage: 1,
    title: 'Subida da Montanha',
    description: '10 pares no ar rarefeito das alturas.',
    mode: 'time-trial',
    pairs: 10,
    cols: 5,
    targets: {
      twoStars: { maxSeconds: 75, maxMoves: 20 },
      threeStars: { maxSeconds: 52, maxMoves: 15 },
    },
  },
  {
    id: '3.2',
    world: 3,
    stage: 2,
    title: 'Pico Nevado',
    description: '12 pares com foco sob pressão.',
    mode: 'time-trial',
    pairs: 12,
    cols: 6,
    targets: {
      twoStars: { maxSeconds: 90, maxMoves: 24 },
      threeStars: { maxSeconds: 65, maxMoves: 18 },
    },
  },
  {
    id: '3.3',
    world: 3,
    stage: 3,
    title: 'Cume dos Ventos',
    description: '14 pares em um tabuleiro amplo.',
    mode: 'time-trial',
    pairs: 14,
    cols: 7,
    targets: {
      twoStars: { maxSeconds: 110, maxMoves: 28 },
      threeStars: { maxSeconds: 80, maxMoves: 21 },
    },
  },
  {
    id: '3.4',
    world: 3,
    stage: 4,
    title: 'Raposa Estrategista',
    description: 'Duelo tático contra a temida Raposa Estrategista (14 pares).',
    mode: 'vs-bot',
    pairs: 14,
    cols: 7,
    botDifficulty: 'medium',
    targets: {
      twoStars: { minLead: 2 },
      threeStars: { minLead: 4 },
    },
  },

  // Mundo 4: Difícil (Pico das Sombras)
  {
    id: '4.1',
    world: 4,
    stage: 1,
    title: 'Desfiladeiro Obscuro',
    description: '12 pares exigindo memória impecável.',
    mode: 'time-trial',
    pairs: 12,
    cols: 6,
    targets: {
      twoStars: { maxSeconds: 90, maxMoves: 24 },
      threeStars: { maxSeconds: 65, maxMoves: 18 },
    },
  },
  {
    id: '4.2',
    world: 4,
    stage: 2,
    title: 'Portal da Fortaleza',
    description: '14 pares com alto nível de dispersão.',
    mode: 'time-trial',
    pairs: 14,
    cols: 7,
    targets: {
      twoStars: { maxSeconds: 110, maxMoves: 28 },
      threeStars: { maxSeconds: 80, maxMoves: 21 },
    },
  },
  {
    id: '4.3',
    world: 4,
    stage: 3,
    title: 'Salão dos Guardiões',
    description: '16 pares de alta complexidade e raciocínio veloz.',
    mode: 'time-trial',
    pairs: 16,
    cols: 8,
    targets: {
      twoStars: { maxSeconds: 130, maxMoves: 32 },
      threeStars: { maxSeconds: 95, maxMoves: 24 },
    },
  },
  {
    id: '4.4',
    world: 4,
    stage: 4,
    title: 'Raposa Soberana',
    description: 'Duelo supremo contra a Raposa Soberana (16 pares)!',
    mode: 'vs-bot',
    pairs: 16,
    cols: 8,
    botDifficulty: 'hard',
    targets: {
      twoStars: { minLead: 2 },
      threeStars: { minLead: 4 },
    },
  },

  // Mundo 5: Bônus (O Covil Ancestral)
  {
    id: '5.1',
    world: 5,
    stage: 1,
    title: 'Raposa Ancestral (Bônus)',
    description: 'O desafio supremo de memória: 18 pares (36 cartas) contra o bot definitivo!',
    mode: 'vs-bot',
    pairs: 18,
    cols: 9,
    botDifficulty: 'hard',
    targets: {
      twoStars: { minLead: 2 },
      threeStars: { minLead: 4 },
    },
  },
];

export const FREE_PLAY_LEVELS = [
  { level: 1, name: 'Iniciante', pairs: 6, cards: 12, cols: 4, botDifficulty: 'easy' as BotDifficulty },
  { level: 2, name: 'Fácil', pairs: 8, cards: 16, cols: 4, botDifficulty: 'easy' as BotDifficulty },
  { level: 3, name: 'Médio', pairs: 12, cards: 24, cols: 6, botDifficulty: 'medium' as BotDifficulty },
  { level: 4, name: 'Difícil', pairs: 18, cards: 36, cols: 6, botDifficulty: 'hard' as BotDifficulty },
];

export interface SoloGameResult {
  won: boolean;
  stars: number; // 0 a 3
  seconds: number;
  moves: number;
  playerScore?: number;
  botScore?: number;
}

export function calculateStars(
  stage: StageDefinition,
  stats: { won: boolean; seconds: number; moves: number; playerScore?: number; botScore?: number },
): number {
  if (!stats.won) return 0;

  if (stage.mode === 'vs-bot') {
    const lead = (stats.playerScore ?? 0) - (stats.botScore ?? 0);
    if (lead <= 0) return 0; // Não ganhou

    if (stage.targets.threeStars.minLead && lead >= stage.targets.threeStars.minLead) {
      return 3;
    }
    if (stage.targets.twoStars.minLead && lead >= stage.targets.twoStars.minLead) {
      return 2;
    }
    return 1;
  }

  // Modo time-trial (tempo & movimentos)
  const hits3 =
    (!stage.targets.threeStars.maxSeconds || stats.seconds <= stage.targets.threeStars.maxSeconds) &&
    (!stage.targets.threeStars.maxMoves || stats.moves <= stage.targets.threeStars.maxMoves);

  if (hits3) return 3;

  const hits2 =
    (!stage.targets.twoStars.maxSeconds || stats.seconds <= stage.targets.twoStars.maxSeconds) ||
    (!stage.targets.twoStars.maxMoves || stats.moves <= stage.targets.twoStars.maxMoves);

  if (hits2) return 2;

  return 1;
}

/** Embaralha e gera a lista de cartas com símbolos */
export function generateSoloDeck(pairs: number, random: () => number = Math.random): string[] {
  const chosen = shuffle([...SYMBOLS], random).slice(0, pairs);
  return shuffle([...chosen, ...chosen], random);
}

function shuffle<T>(array: T[], random: () => number): T[] {
  const res = [...array];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}
