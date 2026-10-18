# Blue Fox Games — Contexto para IA

Plataforma de jogos web single e multiplayer. **Estágio atual: protótipo** com um único jogo, o **Jogo da Memória 1x1 online** (duas pessoas em lugares diferentes, por turnos).

- **Stack**: NestJS 10 + `@nestjs/websockets` / Socket.IO 4. O próprio backend serve um cliente estático em vanilla JS (`public/`).
- **Porta**: 3001 · namespace WebSocket `/memory` · container `blue-fox-games` na `infra-net`.
- **Sem banco e sem login** no protótipo: salas em memória, jogador identificado por um UUID anônimo no `localStorage`.

## Estrutura

```
src/
├── main.ts                         # bootstrap + serve public/ como estático
├── app.module.ts
└── modules/memory/
    ├── memory-game.ts              # REGRAS em TS puro (sem Nest): embaralhar, virar, par/erro, vez, placar, revanche
    ├── memory-game.spec.ts         # testes das regras
    ├── rooms.service.ts            # salas em memória (código de 4 letras, limpeza após 30 min vazia)
    ├── memory.gateway.ts           # eventos Socket.IO ↔ MemoryGame, timer de esconder cartas
    └── memory.module.ts
public/                             # site estático servido pelo Nest (URLs limpas via `extensions: ['html']`)
├── index.html                      # /             Início (hero, destaque de jogos, recursos, resumo do sobre, CTA)
├── jogos.html + games.js           # /jogos        catálogo com filtros; **jogo novo = 1 item no array `BF_GAMES` de games.js**
├── sobre.html                      # /sobre        história, como o multiplayer funciona, ecossistema, login futuro
├── atualizacoes.html               # /atualizacoes roadmap em 3 colunas com abas (dados no array COLUMNS do próprio arquivo)
├── memoria.html + app.js + styles.css   # /memoria  o jogo (convites: /memoria?sala=CODE; /?sala= redireciona)
├── site.css                        # layout público, mesma linha da área pública do BlueFox Finance com acento roxo
└── site.js                         # injeta header/gaveta mobile/rodapé/modal de login: <div id="site-header" data-active="home|games|about|updates">
```

- **Página nova**: crie `public/<rota>.html` com `body.site`, `#site-header`, `#site-footer` e `site.js`, e adicione no array `NAV` do `site.js` se for para o menu.
- **Botão de login**: qualquer elemento com `[data-login]` abre o modal "Login em breve". O login real (Keycloak) ainda não está integrado.

## Protocolo (namespace `/memory`)

| Cliente → servidor | Payload | Ack |
| :--- | :--- | :--- |
| `room:create` | `{ playerId, name, pairs: 8\|12\|18 }` | `{ ok, code }` |
| `room:join` | `{ playerId, name, code }` (também serve para reconectar) | `{ ok, code }` |
| `game:flip` | `{ index }` | `{ ok }` ou `{ ok: false, error }` |
| `game:restart` | — (só com a partida terminada) | `{ ok }` |

Servidor → cliente: `game:state` `{ code, you, state }`, enviado a cada mudança e personalizado por socket (`you` = assento 0/1).

## Regras de arquitetura

1. **O servidor é a autoridade.** O cliente só manda intenções. `toPublicState()` **nunca** envia o símbolo de uma carta virada para baixo; não quebre isso, ou dá para trapacear pelo DevTools.
2. **Regras de jogo ficam em TS puro** (`memory-game.ts`), sem Nest nem Socket.IO, testáveis com Jest. Jogos novos seguem o mesmo padrão: `<jogo>-game.ts` + gateway em `modules/<jogo>/`.
3. Mensagens de erro de regra usam `GameError` e voltam no ack. Exceções inesperadas são logadas e o cliente recebe uma mensagem genérica.
4. Reconexão: o mesmo `playerId` volta ao mesmo assento. O cliente refaz o `room:join` automaticamente no evento `connect`.
5. Salas em memória ⇒ **uma instância só**. Reiniciar o container encerra as partidas. Para escalar: Redis + `@socket.io/redis-adapter`.

## Próximos passos planejados

Frontend Angular separado (portal, lobby, perfil), login opcional via Keycloak (clients `blue-fox-games-web` / `-backend`, roles `ROLE_GAMES_*`, convidado continua podendo jogar), Postgres/Prisma para histórico e ranking, e Phaser para jogos com canvas. Use a skill `bluefox-new-service`.

## Comandos

```bash
npm install
npm run start:dev        # http://localhost:3001
npm test                 # regras do jogo
npm run build && npm run start:prod

docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up -d --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Para jogar com alguém fora da sua rede sem deploy, use um túnel temporário (ver README).
