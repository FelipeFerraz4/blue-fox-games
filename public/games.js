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
      'Encontre os pares na Jornada de 17 fases, enfrente o Bot da Raposa em duelos táticos ou crie uma sala para desafiar alguém online.',
    rules: [
      'Modo Campanha: 4 Mundos e 17 Fases (com Chefão Bônus) e avaliação em 3 estrelas (★★★).',
      'Modo Livre: Escolha entre 4 níveis contra o relógio ou em Duelo contra a Raposa.',
      '1x1 Online: Crie uma sala, compartilhe o link e jogue com alguém em tempo real.',
      'Na sua vez, vire duas cartas. Acertou: ganha o ponto e joga de novo.',
    ],
  },
  {
    id: 'pulse',
    title: 'Fox Pulse',
    emoji: '⚡',
    cover: ['⚡', '🟢', '🔴', '🟡', '🔵', '🦊'],
    href: '/pulse',
    status: 'available',
    modes: ['single'],
    tags: ['Solo', 'Reflexo & Sons', 'Teclado ou Mouse'],
    players: '1 jogador',
    duration: '1–5 min',
    description:
      'Siga o pulso de luzes e sons do deck da Raposa. Memorize a sequência crescente das frequências e repita no tempo certo sem errar!',
    rules: [
      'Observe e ouça a sequência sônica tocada pelo console Fox Pulse.',
      'Repita na mesma ordem tocando nos pads iluminados ou nas teclas.',
      'A cada rodada bem-sucedida, um novo pulso é somado e o ritmo acelera.',
      'Atinja 12 ou mais pulsos para entrar no ranking de Mestres do Pulso!',
    ],
  },
];
