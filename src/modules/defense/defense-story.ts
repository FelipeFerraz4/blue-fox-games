/**
 * Blue Fox Games · Milky Way Defense (Defesa da Via Láctea)
 * História completa e dados narrativos de cada fase do Sistema Solar.
 */

export interface EnemyWaveConfig {
  rows: number;
  cols: number;
  alienCooldownMs: number;
  alienSpeed: number;
  bulletSpeed: number;
  hasAsteroids?: boolean;
  boss?: {
    name: string;
    title: string;
    hp: number;
    phases: number;
  };
}

export interface SolarStageStory {
  id: number;
  key: string;
  name: string;
  codename: string;
  celestialBody: string;
  distanceAU: string; // Unidades Astronômicas
  briefing: string;
  pilotLog: string;
  visualTheme: {
    skyColor: string;
    planetGlow: string;
    starSpeed: number;
    asteroidDensity: number;
    nebulaAccent: string;
  };
  unlockUpgrade?: {
    id: string;
    name: string;
    icon: string;
    description: string;
  };
  wave: EnemyWaveConfig;
}

export const GLOBAL_STORY = {
  title: 'MILKY WAY DEFENSE',
  subtitle: 'Capítulo 1: A Batalha pelo Sistema Solar',
  stardate: 'Data Estelar 2525.4',
  introCrawl: [
    'MILKY WAY DEFENSE',
    '',
    'Na data estelar 2525,',
    'A Via Láctea está sob ataque massivo.',
    '',
    'Uma armada alienígena de bio-naves mecânicas,',
    'conhecida como a Horda do Vazio, rompeu os limites',
    'da galáxia e iniciou uma marcha fulminante rumo ao Sistema Solar.',
    '',
    'Colônias humanas em postos remotos foram silenciadas.',
    'A vanguarda inimiga conseguiu penetrar o núcleo de defesa',
    'e montou um cerco surpresa diretamente sobre a órbita da TERRA.',
    '',
    'Como piloto da lendária nave BLUE FOX STARFIGHTER,',
    'você é a última esperança de sobrevivência da humanidade.',
    '',
    'Sua missão é conter a invasão na Terra, expurgar os invasores',
    'que avançam em direção ao SOL para consumir nossa estrela,',
    'e em seguida liderar a contraofensiva atravessando todo o',
    'Sistema Solar — passando pelos dois cinturões de asteroides',
    'e repelindo a frota inimiga de volta para os confins do espaço.',
    '',
    'O destino da humanidade... e de toda a Via Láctea...',
    'está em suas mãos.',
    '',
    'Sistemas ligados. Propulsores em potência máxima.',
    'PREPARE-SE PARA A DEFESA!',
  ],
  epilogue: [
    'VITÓRIA NO CINTURÃO DE KUIPER!',
    '',
    'A nave-mãe invasora foi reduzida a poeira cósmica.',
    'O Sistema Solar está seguro e a Terra celebra a liberdade.',
    '',
    'Mas nos radares de longo alcance da Raposa Azul,',
    'sinais codificados indicam que outros braços espirais',
    'da Via Láctea ainda clamam por socorro...',
    '',
    'Obrigado por defender a nossa galáxia, Comandante Fox!',
  ],
};

export const SOLAR_SYSTEM_STAGES: SolarStageStory[] = [
  // 1. Terra
  {
    id: 1,
    key: 'terra',
    name: 'Planeta Terra',
    codename: 'A Resistência Orbital',
    celestialBody: 'Terra (1.00 UA)',
    distanceAU: '1.00 UA',
    briefing:
      'A esquadrilha inimiga iniciou o bombardeio aos satélites de defesa terrestre. Decole imediatamente da Base Blue Fox e expulse a primeira onda invasora antes que atinjam a atmosfera.',
    pilotLog:
      'Comando Terra, aqui é o Fox Starfighter! Motores estabilizados e canhões de plasma alimentados. A Terra não cairá hoje!',
    visualTheme: {
      skyColor: '#030814',
      planetGlow: '#38b6ff',
      starSpeed: 1.0,
      asteroidDensity: 0.05,
      nebulaAccent: 'rgba(56, 182, 255, 0.25)',
    },
    wave: {
      rows: 3,
      cols: 6,
      alienCooldownMs: 900,
      alienSpeed: 1.2,
      bulletSpeed: 3.5,
    },
    unlockUpgrade: {
      id: 'double-laser',
      name: 'Canhão Duplo de Plasma',
      icon: '⚡',
      description: 'Dispara dois feixes laser paralelos aumentando a cobertura de tiro.',
    },
  },

  // 2. Vênus
  {
    id: 2,
    key: 'venus',
    name: 'Planeta Vênus',
    codename: 'A Forja Ácida',
    celestialBody: 'Vênus (0.72 UA)',
    distanceAU: '0.72 UA',
    briefing:
      'Detectamos que batedores inimigos estão usando as nuvens densas de ácido sulfúrico de Vênus para ocultar bases de reabastecimento. Mergulhe na alta atmosfera e destrua as formações inimigas.',
    pilotLog:
      'A visibilidade é baixa e os escudos térmicos estão trabalhando no limite. Inimigos avistados entre as nuvens de Vênus!',
    visualTheme: {
      skyColor: '#120904',
      planetGlow: '#f59e0b',
      starSpeed: 1.2,
      asteroidDensity: 0.08,
      nebulaAccent: 'rgba(245, 158, 11, 0.28)',
    },
    wave: {
      rows: 4,
      cols: 6,
      alienCooldownMs: 820,
      alienSpeed: 1.4,
      bulletSpeed: 3.8,
    },
    unlockUpgrade: {
      id: 'plasma-shield',
      name: 'Escudo de Reforço Iônico',
      icon: '🛡️',
      description: 'Gera uma barreira protetora que absorve 1 impacto sem danificar a blindagem.',
    },
  },

  // 3. Mercúrio
  {
    id: 3,
    key: 'mercurio',
    name: 'Planeta Mercúrio',
    codename: 'A Fronteira Escaldante',
    celestialBody: 'Mercúrio (0.39 UA)',
    distanceAU: '0.39 UA',
    briefing:
      'Mercúrio está sob cerco de naves velozes de ataque térmico. A radiação solar intensa eleva a agressividade dos invasores. Seja rápido e preciso nas manobras de esquiva.',
    pilotLog:
      'Sol imenso no horizonte. Sensores detectam naves ágeis em formação em cunha. Iniciando disparos de precisão!',
    visualTheme: {
      skyColor: '#160a03',
      planetGlow: '#fb923c',
      starSpeed: 1.4,
      asteroidDensity: 0.12,
      nebulaAccent: 'rgba(251, 146, 60, 0.3)',
    },
    wave: {
      rows: 4,
      cols: 7,
      alienCooldownMs: 760,
      alienSpeed: 1.6,
      bulletSpeed: 4.0,
    },
    unlockUpgrade: {
      id: 'speed-thrusters',
      name: 'Propulsores de Pós-Combustão',
      icon: '🚀',
      description: 'Aumenta em 25% a velocidade de deslocamento lateral da nave.',
    },
  },

  // 4. Sol
  {
    id: 4,
    key: 'sol',
    name: 'O Sol',
    codename: 'A Batalha da Coroa Solar',
    celestialBody: 'Sol (0.00 UA - Centro do Sistema)',
    distanceAU: '0.00 UA',
    briefing:
      'Alerta vermelho! Uma colossal sonda coletora da Horda alienígena está orbitando a coroa solar para drenar o plasma do Sol e abastecer sua armada. Neutralize o Guardião Solar antes da catástrofe!',
    pilotLog:
      'Calor absurdo, tempestades magnéticas a todo lado! A nave-coletora é colossal. Atacando o núcleo agora!',
    visualTheme: {
      skyColor: '#240a02',
      planetGlow: '#fde047',
      starSpeed: 1.8,
      asteroidDensity: 0.05,
      nebulaAccent: 'rgba(254, 240, 138, 0.45)',
    },
    wave: {
      rows: 4,
      cols: 7,
      alienCooldownMs: 700,
      alienSpeed: 1.7,
      bulletSpeed: 4.2,
      boss: {
        name: 'Coletor Estelar Vulcan',
        title: 'Guardião de Plasma Solar',
        hp: 30,
        phases: 2,
      },
    },
    unlockUpgrade: {
      id: 'rapid-fire',
      name: 'Refrigerador de Quarks (Tiro Rápido)',
      icon: '🔋',
      description: 'Reduz o intervalo de recarga dos canhões permitindo disparos em rajada.',
    },
  },

  // 5. Marte
  {
    id: 5,
    key: 'marte',
    name: 'Planeta Marte',
    codename: 'O Bastião Vermelho',
    celestialBody: 'Marte (1.52 UA)',
    distanceAU: '1.52 UA',
    briefing:
      'Com o Sol protegido, a contraofensiva ruma aos confins exteriores! Em Marte, as colônias nos cânions de Valles Marineris foram cercadas. Libere o espaço aéreo do Planeta Vermelho.',
    pilotLog:
      'Aqui é a Raposa Azul chegando em Marte. Vejo os canhões marcianos resistindo na superfície. Entrando em formação de assalto!',
    visualTheme: {
      skyColor: '#170606',
      planetGlow: '#ef4444',
      starSpeed: 1.3,
      asteroidDensity: 0.15,
      nebulaAccent: 'rgba(239, 68, 68, 0.3)',
    },
    wave: {
      rows: 4,
      cols: 7,
      alienCooldownMs: 720,
      alienSpeed: 1.6,
      bulletSpeed: 4.0,
    },
    unlockUpgrade: {
      id: 'triple-laser',
      name: 'Dispersor Tríplice',
      icon: '🔱',
      description: 'Dispara três feixes (frontal e duas diagonais) cobrindo grande área.',
    },
  },

  // 6. Cinturão Principal de Asteroides
  {
    id: 6,
    key: 'cinturao-asteroides',
    name: 'Cinturão de Asteroides',
    codename: 'O Labirinto Rochoso',
    celestialBody: 'Cinturão Principal (2.70 UA)',
    distanceAU: '2.70 UA',
    briefing:
      'Entre Marte e Júpiter há milhões de rochas e asteroides. Os invasores montaram uma emboscada utilizando os grandes meteoros como cobertura. Desvie dos asteroides e elimine os franco-atiradores alienígenas.',
    pilotLog:
      'Rochas gigantescas por todos os lados! Radar piscando em 360 graus. É preciso reflexo e precisão cirúrgica.',
    visualTheme: {
      skyColor: '#0a0d14',
      planetGlow: '#94a3b8',
      starSpeed: 1.6,
      asteroidDensity: 0.45,
      nebulaAccent: 'rgba(148, 163, 184, 0.25)',
    },
    wave: {
      rows: 4,
      cols: 8,
      alienCooldownMs: 680,
      alienSpeed: 1.8,
      bulletSpeed: 4.2,
      hasAsteroids: true,
    },
    unlockUpgrade: {
      id: 'smart-bomb',
      name: 'Bomba de Pulso Estelar',
      icon: '💣',
      description: 'Arma tática ativada com Tecla B ou toque duplo que vaporiza tiros inimigos na tela.',
    },
  },

  // 7. Júpiter
  {
    id: 7,
    key: 'jupiter',
    name: 'Planeta Júpiter',
    codename: 'O Colosso Gasoso',
    celestialBody: 'Júpiter (5.20 UA)',
    distanceAU: '5.20 UA',
    briefing:
      'Chegamos ao rei dos planetas. Acima da Grande Mancha Vermelha, ventos furiosos e campo gravitacional intenso testarão sua nave contra esquadrões pesados blindados da frota inimiga.',
    pilotLog:
      'A gravidade de Júpiter puxa a nave enquanto relâmpagos cósmicos cortam a atmosfera. Naves inimigas blindadas à frente!',
    visualTheme: {
      skyColor: '#170f08',
      planetGlow: '#fbbf24',
      starSpeed: 1.5,
      asteroidDensity: 0.1,
      nebulaAccent: 'rgba(251, 191, 36, 0.32)',
    },
    wave: {
      rows: 5,
      cols: 8,
      alienCooldownMs: 650,
      alienSpeed: 1.8,
      bulletSpeed: 4.4,
    },
    unlockUpgrade: {
      id: 'heavy-overcharge',
      name: 'Sobrecarga de Fótons',
      icon: '💥',
      description: 'Cada tiro causa 50% mais dano de impacto e gera mini-explosões secundárias.',
    },
  },

  // 8. Saturno
  {
    id: 8,
    key: 'saturno',
    name: 'Planeta Saturno',
    codename: 'Os Anéis de Gelo',
    celestialBody: 'Saturno (9.58 UA)',
    distanceAU: '9.58 UA',
    briefing:
      'Os anéis majestosos de Saturno viraram palco de uma perseguição em alta velocidade. Milhões de fragmentos de gelo refletem as luzes dos lasers enquanto cruzamos o anel de Cassini.',
    pilotLog:
      'Voando rente aos anéis de gelo. O visual é deslumbrante, mas os drones inimigos estão armando emboscadas em curvas rápidas!',
    visualTheme: {
      skyColor: '#081119',
      planetGlow: '#fef08a',
      starSpeed: 1.7,
      asteroidDensity: 0.3,
      nebulaAccent: 'rgba(254, 240, 138, 0.28)',
    },
    wave: {
      rows: 5,
      cols: 8,
      alienCooldownMs: 620,
      alienSpeed: 1.9,
      bulletSpeed: 4.5,
    },
    unlockUpgrade: {
      id: 'side-boosters',
      name: 'Micro-Propulsores Quânticos',
      icon: '✨',
      description: 'Permite esquiva instantânea com toque duplo de rolagem lateral.',
    },
  },

  // 9. Urano
  {
    id: 9,
    key: 'urano',
    name: 'Planeta Urano',
    codename: 'O Abismo Glacial',
    celestialBody: 'Urano (19.20 UA)',
    distanceAU: '19.20 UA',
    briefing:
      'Nas profundezas geladas de Urano, o planeta gira de lado com campos magnéticos caóticos. As naves inimigas aqui possuem camuflagem térmica e disparam projéteis criogênicos.',
    pilotLog:
      'Sistemas de bordo marcando frio congelante. Nuvens de metano ciano iluminadas por disparos inimigos. Manter foco total!',
    visualTheme: {
      skyColor: '#03141c',
      planetGlow: '#38bdf8',
      starSpeed: 1.8,
      asteroidDensity: 0.12,
      nebulaAccent: 'rgba(56, 189, 248, 0.32)',
    },
    wave: {
      rows: 5,
      cols: 8,
      alienCooldownMs: 600,
      alienSpeed: 2.0,
      bulletSpeed: 4.6,
    },
    unlockUpgrade: {
      id: 'cryo-shield',
      name: 'Blindagem de Titânio Criogênico',
      icon: '💠',
      description: 'Aumenta a vida máxima da nave para 4 pontos e regenera 1 ponto por fase.',
    },
  },

  // 10. Netuno
  {
    id: 10,
    key: 'netuno',
    name: 'Planeta Netuno',
    codename: 'Os Ventos Supersônicos',
    celestialBody: 'Netuno (30.05 UA)',
    distanceAU: '30.05 UA',
    briefing:
      'O último planeta clássico do Sistema Solar. Ventos de 2.000 km/h rasgam o espaço orbital. Os generais invasores montaram sua última linha de defesa planetária antes do cinturão exterior.',
    pilotLog:
      'Última parada planetária antes da fronteira escura. A frota inimiga está desesperada e atirando em todas as direções!',
    visualTheme: {
      skyColor: '#040b24',
      planetGlow: '#6366f1',
      starSpeed: 2.0,
      asteroidDensity: 0.15,
      nebulaAccent: 'rgba(99, 102, 241, 0.38)',
    },
    wave: {
      rows: 5,
      cols: 9,
      alienCooldownMs: 560,
      alienSpeed: 2.1,
      bulletSpeed: 4.8,
    },
    unlockUpgrade: {
      id: 'hyper-drive',
      name: 'Super-Condensador Estelar',
      icon: '🌌',
      description: 'Aumenta a cadência e o poder de todos os canhões simultaneamente.',
    },
  },

  // 11. Cinturão de Kuiper (Final Boss)
  {
    id: 11,
    key: 'cinturao-kuiper',
    name: 'Cinturão de Kuiper',
    codename: 'A Fronteira Cósmica',
    celestialBody: 'Cinturão de Kuiper (40.00 UA - Limite do Sistema Solar)',
    distanceAU: '40.00 UA',
    briefing:
      'Além de Netuno, na escuridão eterna da borda do Sistema Solar. A Nave-Mãe Dreadnought da Horda alienígena lidera a invasão galáctica a partir daqui. Destrua-a para libertar o Sistema Solar e salvar a Via Láctea!',
    pilotLog:
      'Comando Terra, localizei o Dreadnought alienígena! É gigantesco, cercado de frotas escolta e asteroides de gelo. Toda a jornada levou a este momento. Pela Terra e pela Via Láctea... ATACAR!',
    visualTheme: {
      skyColor: '#0a0319',
      planetGlow: '#c084fc',
      starSpeed: 2.3,
      asteroidDensity: 0.4,
      nebulaAccent: 'rgba(192, 132, 252, 0.45)',
    },
    wave: {
      rows: 5,
      cols: 9,
      alienCooldownMs: 520,
      alienSpeed: 2.3,
      bulletSpeed: 5.0,
      hasAsteroids: true,
      boss: {
        name: 'Dreadnought Leviatã do Vazio',
        title: 'Nave-Mãe Invasora Galáctica',
        hp: 60,
        phases: 3,
      },
    },
  },
];
