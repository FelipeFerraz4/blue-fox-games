# 🦊 Blue Fox Games

Jogos web do ecossistema Blue Fox. Primeiro jogo: **Jogo da Memória 1x1 online**. Duas pessoas, cada uma no seu dispositivo, jogando por turnos em tempo real.

## Como jogar

1. Abra o site e clique em **Jogar agora** (ou vá direto a `/memoria`), digite seu nome, escolha o tamanho e clique em **Criar sala**.
2. Clique em **Copiar link** e envie para a outra pessoa (ou passe o código de 4 letras).
3. Ela abre o link, digita o nome e clica em **Entrar**. A partida começa na hora.
4. Na sua vez, vire duas cartas. Acertou: ganha o ponto e joga de novo. Errou: as cartas viram de volta e a vez passa.
5. No fim, **Jogar de novo** começa uma revanche (quem começa alterna).

Caiu a conexão ou recarregou a página? Basta abrir o mesmo link: você volta para o seu lugar.

## Rodar localmente

```bash
npm install
npm run start:dev    # http://localhost:3001
npm test
```

## Jogar com alguém em outro lugar

O servidor precisa estar acessível pela internet. Há duas opções.

### Opção A: túnel temporário (teste rápido, sem deploy)

Com o servidor rodando na sua máquina (`npm run start:dev`), em outro terminal:

```bash
docker run --rm --network host cloudflare/cloudflared:2024.12.2 tunnel --url http://localhost:3001
```

O comando imprime uma URL `https://<algo>.trycloudflare.com`. Abra essa URL **você também** (não use `localhost`), crie a sala e mande o link. O túnel dura enquanto o comando estiver rodando, e a sua máquina precisa ficar ligada.

### Opção B: servidor de produção (junto dos outros projetos Blue Fox)

```bash
cp .env.prod.example .env.prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Aponte um domínio (ex.: `games.bluefoxglobalgroup.com`) no reverse proxy para `blue-fox-games:3001` na `infra-net`. **O proxy precisa repassar WebSocket** (headers `Upgrade` e `Connection`).

## Limitações do protótipo

- Salas ficam na memória: reiniciar o servidor encerra as partidas em andamento.
- Sem contas, histórico ou ranking (planejado com Keycloak + Postgres).
