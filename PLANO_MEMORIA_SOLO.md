# 🦊 Plano de Criação: Jogo da Memória Solo & vs Bot

Documento de especificação e planejamento para o **Modo Solo** do Jogo da Memória no **Blue Fox Games**.

---

## 1. Visão Geral

O Jogo da Memória passa a contar com dois grandes pilares de jogo solo:
1. ⏱️ **Desafio Solo (Tempo & Movimentos)**: O jogador joga sozinho buscando encontrar todos os pares no menor tempo e com o menor número de tentativas, conquistando de 1 a 3 estrelas (★★★) e salvando recordes pessoais.
2. 🦊 **Duelo vs Raposa (Bot com Memória Probabilística)**: O jogador disputa uma partida por turnos alternados contra a Raposa Virtual, orientada por um algoritmo de retenção cognitiva com probabilidades ajustadas por nível.

---

## 2. Modalidades de Jogo

### A. Escolha Livre (4 Níveis)
O jogador seleciona livremente a dificuldade do tabuleiro e escolhe se quer jogar o **Desafio Solo** ou o **Duelo vs Raposa**:
* **Nível 1 (Iniciante)**: 6 pares (12 cartas — grid 3×4)
* **Nível 2 (Fácil)**: 8 pares (16 cartas — grid 4×4)
* **Nível 3 (Médio)**: 12 pares (24 cartas — grid 4×6)
* **Nível 4 (Difícil)**: 18 pares (36 cartas — grid 6×6)

---

### B. Jornada de Progressão (Campanha de 9 Fases)
Uma trilha em 3 mundos temáticos. Cada mundo possui 3 fases com metas progressivas e culmina em uma fase "Chefe" contra a Raposa:

```
[Mundo 1: Planície Fácil]
├── Fase 1.1: 6 pares · Meta de tempo tranquila (★★★)
├── Fase 1.2: 8 pares · Meta de poucos movimentos (★★★)
└── Fase 1.3: Duelo contra Raposa Aprendiz (6 pares) 🦊 [Chefe do Mundo 1]

[Mundo 2: Floresta Média]
├── Fase 2.1: 10 pares · Corrida contra o relógio (★★★)
├── Fase 2.2: 12 pares · Desafio de precisão de movimentos (★★★)
└── Fase 2.3: Duelo contra Raposa Estrategista (12 pares) 🦊 [Chefe do Mundo 2]

[Mundo 3: Montanha Difícil]
├── Fase 3.1: 14 pares · Tabuleiro ampliado (★★★)
├── Fase 3.2: 16 pares · Poucas tentativas permitidas (★★★)
└── Fase 3.3: Duelo Supremo contra Raposa Mestre (18 pares) 🦊 [Chefe Final]
```

---

## 3. Algoritmo Probabilístico de Memória (Bot Raposa)

Em vez de IA generativa pesada ou trapaça simulada, o bot segue um **Modelo de Retenção Cognitiva**:

```
Carta é virada no tabuleiro (por qualquer jogador)
       │
       ▼
Registra no mapa de memória temporária do Bot: { pos -> { symbol, turnSeen } }
       │
       ▼ [Turno do Bot: Decisão da 1ª Carta]
Tem algum par já memorizado?
       ├── Sim: com probabilidade P_lembrar -> vira a 1ª carta do par
       └── Não (ou esqueceu): vira estrategicamente uma carta ainda desconhecida
       │
       ▼ [Decisão da 2ª Carta]
A 1ª carta virada tem o par correspondente memorizado?
       ├── Sim: com probabilidade P_lembrar -> vira o par e marca o ponto!
       └── Não: arrisca outra carta ainda não explorada
```

### Configurações de Probabilidade por Dificuldade:
* **Aprendiz (Fácil)**:
  * Taxa de retenção $P = 40\%$.
  * Memória curta: esquece cartas vistas há mais de 2 turnos.
  * Chance de 25% de virar carta aleatória.
* **Estrategista (Médio)**:
  * Taxa de retenção $P = 75\%$.
  * Mantém histórico dos últimos 4 turnos.
* **Mestre (Difícil)**:
  * Taxa de retenção $P = 95\%$.
  * Memória quase fotográfica, priorizando sempre virar cartas inéditas quando não tem par garantido.

---

## 4. Avaliação e Sistema de Estrelas (Desafio Solo)

* ⭐ **1 Estrela**: Concluir o tabuleiro encontrando todos os pares.
* ⭐⭐ **2 Estrelas**: Concluir dentro da meta moderada de tempo e tentativas.
* ⭐⭐⭐ **3 Estrelas**: Eficiência de mestre (tempo veloz e poucos erros).

### Persistência:
* `bf-games:solo-progress`: Fases concluídas, estrelas e fase atual desbloqueada.
* `bf-games:solo-records`: Menor tempo e menor número de movimentos por nível livre.

---

## 5. Roteiro de Implementação

- [x] **Planejamento e Especificação**: Estruturação dos níveis, regras e algoritmo.
- [x] **Etapa 1: Motor Solo e Bot Probabilístico**:
  - Criar `src/modules/memory/solo-engine.ts` (lógica de regras, pontuação, estrelas e fases).
  - Criar `src/modules/memory/probabilistic-bot.ts` (modelo de memória probabilística com testes unitários Jest).
  - Disponibilizar para o cliente em `public/solo-engine.js`.
- [x] **Etapa 2: Interface UI/UX no Frontend**:
  - Adicionar abas `[ 🌐 1x1 Online ]` e `[ 🎮 Modo Solo ]` na tela inicial de [memoria.html](public/memoria.html).
  - Criar o seletor visual: **Jornada de Fases (9 fases com estrelas e cadeados)** e **Partida Livre (4 níveis)**.
  - Criar o HUD de jogo solo (Cronômetro, Movimentos, Pares / Placar vs Raposa).
  - Criar o modal de resultado de vitória com estrelas animadas e botão "Próxima Fase".
- [x] **Etapa 3: Persistência & Gamificação**:
  - Armazenamento no `localStorage` de progresso (`bf-games:solo-progress`) e recordes (`bf-games:solo-records`).
- [x] **Etapa 4: Integração no Catálogo e Atualizações**:
  - Atualizar `public/games.js` com badges `Solo`, `Campanha` e `vs Bot`.
  - Atualizar `public/atualizacoes.html`.
