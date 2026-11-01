# 🧠 Plano de Criação: Blue Fox Genius (Jogo das Cores & Sons)

Especificação e roteiro de implementação para o jogo **Genius** no **Blue Fox Games**.

---

## 1. Visão Geral

O **Blue Fox Genius** é um jogo solo de memória e reflexos audiovisuais:
1. O jogo reproduz uma sequência crescente de cores e sons (1 cor, 2 cores, 3 cores...).
2. O jogador repete a sequência exata utilizando cliques com mouse/toque ou teclas do teclado.
3. A velocidade da sequência aumenta ligeiramente conforme a pontuação avança.
4. O objetivo é alcançar o maior número de acertos possível, com avaliação especial a partir de **12 acertos** ("Nível Mestre").

---

## 2. Cores e Tons Sonoros

As 4 cores clássicas oficiais:
* 🟢 **Verde** (Top-Left / 0): Frequência 329.63 Hz (Mi - E4)
* 🔴 **Vermelho** (Top-Right / 1): Frequência 261.63 Hz (Dó - C4)
* 🟡 **Amarelo** (Bottom-Left / 2): Frequência 220.00 Hz (Lá - A3)
* 🔵 **Azul** (Bottom-Right / 3): Frequência 164.81 Hz (Mi grave - E3)
* 💥 **Som de Erro (Game Over)**: Frequência baixa decrescente (85 Hz) com efeito de ruído e vibração.

---

## 3. Controles & Mapeamento de Teclas

### A. Padrão Oficial: `F`, `G`, `H`, `J`
* 🟢 **Verde**: Tecla **`F`**
* 🔴 **Vermelho**: Tecla **`G`**
* 🟡 **Amarelo**: Tecla **`H`**
* 🔵 **Azul**: Tecla **`J`**

### B. Presets Rápidos em 1 Clique
* **Padrão Home Row**: `F`, `G`, `H`, `J`
* **Mão Esquerda 2×2**: `Q`, `W`, `A`, `S`
* **Setas Direcionais**: `←`, `↑`, `↓`, `→`
* **Teclado Numérico**: `1`, `2`, `3`, `4`

### C. Mapeamento Individual por Cor
O jogador pode clicar em qualquer cor nas configurações e pressionar qualquer tecla do seu teclado para associá-la individualmente. A configuração é salva no `localStorage` (`bf-games:genius-keymap`).

---

## 4. Avaliação e Mensagens de Fim de Jogo

| Acertos | Nível | Mensagem |
| :--- | :--- | :--- |
| **0 a 5** | 🌱 Iniciante | *"Bom começo! Pratique mais para afinar a memória e o reflexo."* |
| **6 a 11** | ⚡ Boa Memória | *"Muito bem! Sua concentração está afiada, quase no nível mestre!"* |
| **12 a 15** | 🏆 **Mestre Genius** | *"Sensacional! Acertar 12 ou mais é uma marca excelente! Memória de raposa!"* |
| **16 ou mais** | 👑 Gênio Supremo | *"Inacreditável! Você tem memória fotográfica absoluta! Um verdadeiro Gênio!"* |

---

## 5. Roteiro de Implementação

- [x] **Fase 1: Motor e Regras de Jogo**:
  - `src/modules/genius/genius-game.ts`: Regras em TS puro (gerador de sequência, validação de passo, pontuação, velocidade).
  - `src/modules/genius/genius-game.spec.ts`: Testes unitários Jest.
  - `public/genius-engine.js`: Síntese de áudio Web Audio API e gerenciador de playback/input.
- [x] **Fase 2: Interface Visual e Controles**:
  - `public/genius.html` e `public/genius.css` no Blue Fox Design System.
  - Painel de configuração de teclas com presets rápidos e mapeamento individual por cor.
  - Modal de Game Over com mensagem personalizada por faixa de pontuação e destaque para 12+ acertos.
- [x] **Fase 3: Integração no Ecossistema & Polimento**:
  - Adicionado ao catálogo `public/games.js`.
  - Atualizado `public/atualizacoes.html`.
