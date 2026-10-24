/* Blue Fox Games · catálogo de jogos (fonte única)
 * Para adicionar um jogo, inclua um objeto neste array; a página /jogos se monta sozinha.
 *
 * status:  'available' (jogável) | 'soon' (em breve, sem link)
 * modes:   'multiplayer' e/ou 'single' (usado nos filtros)
 */
window.BF_GAMES = [
  {
    id: 'memoria',
    title: 'Jogo da Memória',
    emoji: '🧠',
    cover: ['🦊', '🐙', '🐢', '🦉', '🐬', '🦊'],
    href: '/memoria',
    status: 'available',
    modes: ['multiplayer', 'single'],
    tags: ['1x1 online', 'Campanha Solo', 'vs Raposa (Bot)'],
    players: '1 ou 2 jogadores',
    duration: '2–8 min',
    description:
      'Encontre os pares na Jornada de 9 fases, enfrente o Bot da Raposa em duelos táticos ou crie uma sala para desafiar alguém online.',
    rules: [
      'Modo Campanha: 3 Mundos e 9 Fases com avaliação em 3 estrelas (★★★).',
      'Modo Livre: Escolha entre 4 níveis contra o relógio ou em Duelo contra a Raposa.',
      '1x1 Online: Crie uma sala, compartilhe o link e jogue com alguém em tempo real.',
      'Na sua vez, vire duas cartas. Acertou: ganha o ponto e joga de novo.',
    ],
  },
  {
    id: 'genius',
    title: 'Genius (Cores & Sons)',
    emoji: '🔴',
    cover: ['🟢', '🔴', '🟡', '🔵', '🦊', '⚡'],
    href: '/genius',
    status: 'available',
    modes: ['single'],
    tags: ['Solo', 'Memória Sequencial', 'Teclado ou Mouse'],
    players: '1 jogador',
    duration: '1–5 min',
    description:
      'Memorize a sequência luminosa e sonora das 4 cores e repita sem errar. Jogue no mouse ou no teclado com as teclas F, G, H, J (personalizáveis).',
    rules: [
      'Observe e ouça a sequência tocada pelo Genius.',
      'Repita na mesma ordem clicando nas cores ou pressionando as teclas.',
      'A cada acerto, uma nova cor é adicionada e o ritmo acelera.',
      'Acertar 12 ou mais é uma marca excelente (Nível Mestre)!',
    ],
  },
];
