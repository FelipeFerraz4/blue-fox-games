import { SYMBOLS } from './memory-game';
import { BotDifficulty } from './probabilistic-bot';

export type SoloGameMode = 'time-trial' | 'vs-bot';

export interface StageDefinition {
  id: string; // ex: '1.1', '1.2', '1.3'
  world: number; // 1, 2, 3
  stage: number; // 1, 2, 3
  title: string;
  description: string;
  mode: SoloGameMode;
  pairs: number;
  botDifficulty?: BotDifficulty;
  targets: {
    twoStars: { maxSeconds?: number; maxMoves?: number; minLead?: number };
    threeStars: { maxSeconds?: number; maxMoves?: number; minLead?: number };
  };
}

export const CAMPAIGN_STAGES: StageDefinition[] = [
  // Mundo 1: Planície Fácil
  {
    id: '1.1',
    world: 1,
    stage: 1,
    title: 'Planície dos Primeiros Passos',
    description: 'Encontre 6 pares para aquecer o raciocínio.',
    mode: 'time-trial',
    pairs: 6,
    targets: {
      twoStars: { maxSeconds: 50, maxMoves: 12 },
      threeStars: { maxSeconds: 35, maxMoves: 9 },
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
    targets: {
      twoStars: { maxSeconds: 70, maxMoves: 16 },
      threeStars: { maxSeconds: 50, maxMoves: 12 },
    },
  },
  {
    id: '1.3',
    world: 1,
    stage: 3,
    title: 'Raposa Aprendiz',
    description: 'Duelo por turnos contra a Raposa Aprendiz (6 pares).',
    mode: 'vs-bot',
    pairs: 6,
    botDifficulty: 'easy',
    targets: {
      twoStars: { minLead: 2 }, // venceu por 2 ou mais pares de vantagem
      threeStars: { minLead: 4 }, // venceu com folga ampla
    },
  },

  // Mundo 2: Floresta Média
  {
    id: '2.1',
    world: 2,
    stage: 1,
    title: 'Labirinto das Folhas',
    description: '10 pares com mais concentração exigida.',
    mode: 'time-trial',
    pairs: 10,
    targets: {
      twoStars: { maxSeconds: 85, maxMoves: 20 },
      threeStars: { maxSeconds: 65, maxMoves: 16 },
    },
  },
  {
    id: '2.2',
    world: 2,
    stage: 2,
    title: 'Bosque das Sombras',
    description: '12 pares clássicos. Agilidade e boa memória!',
    mode: 'time-trial',
    pairs: 12,
    targets: {
      twoStars: { maxSeconds: 100, maxMoves: 24 },
      threeStars: { maxSeconds: 75, maxMoves: 19 },
    },
  },
  {
    id: '2.3',
    world: 2,
    stage: 3,
    title: 'Raposa Estrategista',
    description: 'Duelo acirrado contra a Raposa Estrategista (12 pares).',
    mode: 'vs-bot',
    pairs: 12,
    botDifficulty: 'medium',
    targets: {
      twoStars: { minLead: 2 },
      threeStars: { minLead: 4 },
    },
  },

  // Mundo 3: Montanha Difícil
  {
    id: '3.1',
    world: 3,
    stage: 1,
    title: 'Pico Nevado',
    description: '14 pares em um tabuleiro amplo.',
    mode: 'time-trial',
    pairs: 14,
    targets: {
      twoStars: { maxSeconds: 125, maxMoves: 30 },
      threeStars: { maxSeconds: 95, maxMoves: 23 },
    },
  },
  {
    id: '3.2',
    world: 3,
    stage: 2,
    title: 'Desfiladeiro dos Mestres',
    description: '16 pares de alta complexidade.',
    mode: 'time-trial',
    pairs: 16,
    targets: {
      twoStars: { maxSeconds: 145, maxMoves: 34 },
      threeStars: { maxSeconds: 110, maxMoves: 26 },
    },
  },
  {
    id: '3.3',
    world: 3,
    stage: 3,
    title: 'Raposa Soberana',
    description: 'O grande teste final: Duelo contra a Raposa Mestre (18 pares)!',
    mode: 'vs-bot',
    pairs: 18,
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
