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
    modes: ['multiplayer'],
    tags: ['1x1 online', 'Por turnos'],
    players: '2 jogadores',
    duration: '3–8 min',
    description:
      'Encontre os pares antes do adversário. Crie uma sala, envie o link e jogue em tempo real com alguém em qualquer lugar.',
    rules: [
      'Na sua vez, vire duas cartas.',
      'Acertou o par: ganha 1 ponto e joga de novo.',
      'Errou: as cartas viram de volta e a vez passa.',
      'Quem tiver mais pares no fim vence. Tabuleiros de 16, 24 ou 36 cartas.',
    ],
  },
];
