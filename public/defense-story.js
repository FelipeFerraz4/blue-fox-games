/* Blue Fox Games · Milky Way Defense (Defesa da Via Láctea)
 * História completa e dados narrativos de cada fase do Sistema Solar para o cliente Web.
 */
(() => {
  'use strict';

  const GLOBAL_STORY = {
    title: 'MILKY WAY DEFENSE',
    subtitle: 'A Batalha pelo Sistema Solar',
    stardate: 'Data Estelar 2525.4',
    introCrawl: [
      'MILKY WAY DEFENSE',
      '',
      'Na data estelar 2525, a Via Láctea está sob ataque massivo.',
      '',
      'Uma armada alienígena de bio-naves mecânicas, a Horda do Vazio,',
      'rompeu as fronteiras cósmicas e iniciou um cerco surpresa sobre a TERRA.',
      '',
      'Como piloto da nave de combate BLUE FOX STARFIGHTER,',
      'você é a última linha de defesa da humanidade.',
      '',
      'Sua missão é conter a invasão na Terra, expurgar os inimigos que avançam',
      'em direção ao SOL e liderar a contraofensiva por todo o Sistema Solar,',
      'atravessando planetas e cinturões de asteroides até os confins de Kuiper.',
      '',
      'Sistemas ligados. Propulsores em potência máxima.',
      'PREPARE-SE PARA A DEFESA!',
    ],
    epilogue: [
      'VITÓRIA NO CINTURÃO DE KUIPER!',
      '',
      'O Dreadnought invasor foi aniquilado nos confins do Sistema Solar.',
      'A Terra e todos os mundos celebram a liberdade.',
      'Obrigado por defender a nossa galáxia, Comandante Fox!',
    ],
  };

  const SOLAR_SYSTEM_STAGES = [
    // 1. Terra
    {
      id: 1,
      key: 'terra',
      name: 'Planeta Terra',
      codename: 'A Resistência Orbital',
      celestialBody: 'Terra (1.00 UA)',
      distanceAU: '1.00 UA',
      briefing:
        'A esquadrilha inimiga iniciou o cerco sobre a Terra. Destrua a primeira formação invasora antes que atinjam a atmosfera.',
      pilotLog: 'Comando Terra, aqui é o Fox Starfighter! Canhões prontos, a Terra não cairá hoje!',
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
        'Invasores escondem-se nas nuvens ácidas de Vênus para reabastecimento. Neutralize a formação inimiga.',
      pilotLog: 'Escudos térmicos no limite. Inimigos avistados entre as nuvens de Vênus!',
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
        id: 'double-laser',
        name: 'Canhão Duplo de Plasma',
        icon: '⚡',
        description: 'Dispara dois feixes laser paralelos aumentando a cobertura de tiro.',
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
        'Batedores ágeis atacam a órbita de Mercúrio. Seja veloz nas manobras sob intensa radiação solar.',
      pilotLog: 'Sol imenso no horizonte. Naves velozes se aproximando em cunha!',
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
        alienSpeed: 1.5,
        bulletSpeed: 4.0,
      },
    },

    // 4. Sol (Boss)
    {
      id: 4,
      key: 'sol',
      name: 'Coroa Solar',
      codename: 'Forja da Coroa Estelar',
      celestialBody: 'Sol (0.00 UA)',
      distanceAU: '0.00 UA',
      briefing:
        'O Coletor Vulcan tenta drenar energia da nossa estrela. Destrua a fortaleza solar antes que seja tarde!',
      pilotLog: 'Calor crítico nos motores! Dreadnought Coletor Vulcan à vista na coroa solar!',
      visualTheme: {
        skyColor: '#1c0500',
        planetGlow: '#ef4444',
        starSpeed: 1.6,
        asteroidDensity: 0.15,
        nebulaAccent: 'rgba(239, 68, 68, 0.45)',
      },
      wave: {
        rows: 4,
        cols: 7,
        alienCooldownMs: 650,
        alienSpeed: 1.6,
        bulletSpeed: 4.2,
        boss: {
          name: 'Coletor Estelar Vulcan',
          title: 'Dreadnought Coletor de Plasma Solar',
          hp: 35,
          phases: 2,
        },
      },
      unlockUpgrade: {
        id: 'plasma-shield',
        name: 'Escudo de Plasma Reforçado',
        icon: '🛡️',
        description: 'Barreira protetora reforçada que absorve impactos de projéteis e asteroides.',
      },
    },

    // 5. Marte
    {
      id: 5,
      key: 'marte',
      name: 'Planeta Marte',
      codename: 'As Luas Vermelhas',
      celestialBody: 'Marte (1.52 UA)',
      distanceAU: '1.52 UA',
      briefing:
        'Inimigos tentam bloquear o avanço entre Fobos e Deimos. Rompa as defesas sobre o planeta vermelho.',
      pilotLog: 'Cruzando o horizonte avermelhado. Esquadrilhas inimigas engajadas!',
      visualTheme: {
        skyColor: '#120404',
        planetGlow: '#f87171',
        starSpeed: 1.3,
        asteroidDensity: 0.1,
        nebulaAccent: 'rgba(248, 113, 113, 0.25)',
      },
      wave: {
        rows: 4,
        cols: 7,
        alienCooldownMs: 720,
        alienSpeed: 1.6,
        bulletSpeed: 4.1,
      },
    },

    // 6. Cinturão Principal de Asteroides
    {
      id: 6,
      key: 'cinturao-asteroides',
      name: 'Cinturão de Asteroides',
      codename: 'Navegação de Alta Densidade',
      celestialBody: 'Cinturão Principal (2.70 UA)',
      distanceAU: '2.70 UA',
      briefing:
        'Navegue com cautela pelo denso campo de asteroides móveis e destrua as naves camufladas nas rochas.',
      pilotLog: 'Alerta de colisão! Desviando de rochas espaciais e abrindo fogo!',
      visualTheme: {
        skyColor: '#0a0d14',
        planetGlow: '#94a3b8',
        starSpeed: 1.5,
        asteroidDensity: 0.45,
        nebulaAccent: 'rgba(148, 163, 184, 0.3)',
      },
      wave: {
        rows: 4,
        cols: 8,
        alienCooldownMs: 660,
        alienSpeed: 1.7,
        bulletSpeed: 4.3,
        hasAsteroids: true,
      },
      unlockUpgrade: {
        id: 'rapid-fire',
        name: 'Canhões de Tiro Rápido',
        icon: '🔥',
        description: 'Acelera a cadência de disparo dos canhões de plasma da Starfighter.',
      },
    },

    // 7. Júpiter
    {
      id: 7,
      key: 'jupiter',
      name: 'Planeta Júpiter',
      codename: 'O Olho da Grande Mancha',
      celestialBody: 'Júpiter (5.20 UA)',
      distanceAU: '5.20 UA',
      briefing:
        'Esquadrões pesados manobram sobre a Grande Mancha Vermelha. Expulse a armada invasora de Júpiter.',
      pilotLog: 'Vórtices imensos logo abaixo. A gravidade de Júpiter é colossal... atacando!',
      visualTheme: {
        skyColor: '#140c06',
        planetGlow: '#fbbf24',
        starSpeed: 1.4,
        asteroidDensity: 0.12,
        nebulaAccent: 'rgba(251, 191, 36, 0.28)',
      },
      wave: {
        rows: 5,
        cols: 8,
        alienCooldownMs: 620,
        alienSpeed: 1.8,
        bulletSpeed: 4.4,
      },
      unlockUpgrade: {
        id: 'triple-laser',
        name: 'Canhão Triplo de Plasma',
        icon: '🔱',
        description: 'Dispara três feixes simultâneos em leque, ampliando drasticamente o poder de fogo.',
      },
    },

    // 8. Saturno
    {
      id: 8,
      key: 'saturno',
      name: 'Planeta Saturno',
      codename: 'A Trincheira dos Anéis',
      celestialBody: 'Saturno (9.58 UA)',
      distanceAU: '9.58 UA',
      briefing:
        'Combate em meio aos anéis de gelo de Saturno. Manobre com perícia e liquide os cruzadores de vanguarda.',
      pilotLog: 'Cruzando a divisão de Cassini entre fragmentos brilhantes de gelo!',
      visualTheme: {
        skyColor: '#0f0e08',
        planetGlow: '#fde047',
        starSpeed: 1.4,
        asteroidDensity: 0.2,
        nebulaAccent: 'rgba(253, 224, 71, 0.25)',
      },
      wave: {
        rows: 5,
        cols: 8,
        alienCooldownMs: 600,
        alienSpeed: 1.9,
        bulletSpeed: 4.5,
      },
    },

    // 9. Urano
    {
      id: 9,
      key: 'urano',
      name: 'Planeta Urano',
      codename: 'A Esfera de Gelo Inclinada',
      celestialBody: 'Urano (19.20 UA)',
      distanceAU: '19.20 UA',
      briefing:
        'Invasores recuam para a órbita de Urano sob frio glacial. Não permita que reestruturem suas frotas.',
      pilotLog: 'Frio extremo e atmosfera turquesa. Inimigos em fuga não escaparão!',
      visualTheme: {
        skyColor: '#041217',
        planetGlow: '#22d3ee',
        starSpeed: 1.5,
        asteroidDensity: 0.15,
        nebulaAccent: 'rgba(34, 211, 238, 0.25)',
      },
      wave: {
        rows: 5,
        cols: 8,
        alienCooldownMs: 580,
        alienSpeed: 2.0,
        bulletSpeed: 4.6,
      },
      unlockUpgrade: {
        id: 'smart-bomb',
        name: 'Bomba de Antimatéria',
        icon: '💣',
        description: 'Armazena superbombas que desintegram todos os projéteis e causam dano maciço em área.',
      },
    },

    // 10. Netuno
    {
      id: 10,
      key: 'netuno',
      name: 'Planeta Netuno',
      codename: 'Ventos Hipersônicos de Tritão',
      celestialBody: 'Netuno (30.05 UA)',
      distanceAU: '30.05 UA',
      briefing:
        'Ventos hipersônicos assolam a atmosfera de Netuno. Destrua a escolta final que protege a nave-mãe.',
      pilotLog: 'Ventos de dois mil km/h na órbita de Netuno. Última parada antes da borda do sistema!',
      visualTheme: {
        skyColor: '#03081e',
        planetGlow: '#60a5fa',
        starSpeed: 1.6,
        asteroidDensity: 0.18,
        nebulaAccent: 'rgba(96, 165, 250, 0.3)',
      },
      wave: {
        rows: 5,
        cols: 9,
        alienCooldownMs: 550,
        alienSpeed: 2.1,
        bulletSpeed: 4.8,
      },
    },

    // 11. Cinturão de Kuiper (Final Boss)
    {
      id: 11,
      key: 'cinturao-kuiper',
      name: 'Cinturão de Kuiper',
      codename: 'A Fronteira Cósmica Final',
      celestialBody: 'Cinturão de Kuiper (40.00 UA)',
      distanceAU: '40.00 UA',
      briefing:
        'Confronte o temível Dreadnought Leviatã do Vazio no limite do Sistema Solar e liberte a Via Láctea!',
      pilotLog: 'Aqui termina a invasão. Pela Terra e por toda a galáxia, fogo à vontade!',
      visualTheme: {
        skyColor: '#020308',
        planetGlow: '#c084fc',
        starSpeed: 1.8,
        asteroidDensity: 0.4,
        nebulaAccent: 'rgba(192, 132, 252, 0.4)',
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
          hp: 55,
          phases: 3,
        },
      },
    },
  ];

  window.BFDefenseStory = {
    GLOBAL_STORY,
    SOLAR_SYSTEM_STAGES,
  };
})();
