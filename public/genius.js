/* Blue Fox Games · Controlador do Jogo Genius
 * Integração da interface visual, reprodução de áudio, eventos de teclado e mouse.
 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const { AudioSynth, GeniusEngine, loadKeymap, saveKeymap, loadHighScore, saveHighScore, formatKeyDisplay, KEY_PRESETS } =
    window.BFGenius;

  // Instâncias principais
  const synth = new AudioSynth();
  const engine = new GeniusEngine();

  let keymap = loadKeymap();
  let soundEnabled = true;
  let isWaitingInput = false;
  let isListeningRebind = null; // null ou 'green' | 'red' | 'yellow' | 'blue'

  const buttons = {
    green: $('btn-color-green'),
    red: $('btn-color-red'),
    yellow: $('btn-color-yellow'),
    blue: $('btn-color-blue'),
  };

  // Inicialização
  updateKeyHints();
  updateHighScoreDisplay();
  initKeymapModal();
  initSoundToggle();

  // ---------- Iniciar Partida ----------
  $('btn-start-game').addEventListener('click', startGame);
  $('btn-restart-game').addEventListener('click', () => {
    $('modal-gameover').hidden = true;
    startGame();
  });

  function startGame() {
    synth.init();
    $('modal-gameover').hidden = true;
    $('btn-start-game').hidden = true;

    engine.start();
    updateScoreDisplay(0);
    playRoundSequence();
  }

  // ---------- Reprodução da Sequência da Rodada ----------
  async function playRoundSequence() {
    isWaitingInput = false;
    disableButtons(true);

    const speed = engine.getSpeed();
    setStatus('simon', `Observe a sequência (${engine.sequence.length} ${engine.sequence.length === 1 ? 'cor' : 'cores'})…`);

    // Pausa inicial suave antes da primeira cor
    await delay(500);

    for (let i = 0; i < engine.sequence.length; i++) {
      const color = engine.sequence[i];
      await flashButton(color, speed.onMs);
      await delay(speed.offMs);
    }

    // Turno do jogador
    isWaitingInput = true;
    disableButtons(false);
    setStatus('player', `Sua vez! Repita a sequência (${engine.userIndex + 1}/${engine.sequence.length})`);
  }

  // ---------- Ação do Jogador (Clique ou Teclado) ----------
  Object.entries(buttons).forEach(([color, btn]) => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handleUserInput(color);
    });
  });

  window.addEventListener('keydown', (e) => {
    // Se o modal de remapeamento estiver capturando tecla
    if (isListeningRebind) {
      e.preventDefault();
      applyKeyRebind(isListeningRebind, e.key);
      return;
    }

    // Ignora se tecla modificadora estiver pressionada
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const pressedKey = e.key.toLowerCase();
    const matchedColor = Object.keys(keymap).find((c) => keymap[c].toLowerCase() === pressedKey);

    if (matchedColor) {
      e.preventDefault();
      handleUserInput(matchedColor);
    }
  });

  function handleUserInput(color) {
    if (!isWaitingInput || engine.status !== 'playing') return;

    const speed = engine.getSpeed();
    flashButton(color, Math.min(speed.onMs, 250));

    try {
      const result = engine.submitColor(color);

      if (result.correct) {
        if (result.roundComplete) {
          // Completou a rodada com sucesso!
          isWaitingInput = false;
          updateScoreDisplay(result.score);
          setStatus('player', `Correto! Pontuação: ${result.score}`);

          // Pequena pausa comemorativa antes da próxima rodada
          setTimeout(() => {
            if (engine.status === 'playing') {
              engine.nextRound();
              playRoundSequence();
            }
          }, 700);
        } else {
          // Passo correto, continua esperando os próximos passos
          setStatus('player', `Sua vez! (${engine.userIndex + 1}/${engine.sequence.length})`);
        }
      } else {
        // Errou (Game Over)
        handleGameOver();
      }
    } catch {
      handleGameOver();
    }
  }

  // ---------- Efeito Visual e Sonoro do Botão ----------
  function flashButton(color, durationMs) {
    return new Promise((resolve) => {
      const btn = buttons[color];
      if (!btn) return resolve();

      btn.classList.add('lit');
      if (soundEnabled) synth.playTone(color, durationMs);

      setTimeout(() => {
        btn.classList.remove('lit');
        resolve();
      }, durationMs);
    });
  }

  // ---------- Game Over ----------
  async function handleGameOver() {
    isWaitingInput = false;
    disableButtons(true);

    if (soundEnabled) synth.playErrorTone(650);

    // Efeito de flash em todos os botões indicando erro
    Object.values(buttons).forEach((b) => b.classList.add('lit'));
    setStatus('error', 'Ops! Sequência incorreta.');

    await delay(500);
    Object.values(buttons).forEach((b) => b.classList.remove('lit'));

    await delay(350);
    showGameOverModal();
  }

  function showGameOverModal() {
    const score = engine.score;
    const { isNewBest, best } = saveHighScore(score);
    updateHighScoreDisplay(best);

    const feedback = GeniusEngine.getFeedback(score);

    $('go-emoji').textContent = feedback.badge;
    $('go-title').textContent = score >= 12 ? 'Desempenho Impressionante!' : 'Fim de Partida!';
    $('go-score').textContent = `${score} ${score === 1 ? 'Acerto' : 'Acertos'}`;
    $('go-message').textContent = feedback.message;

    const badge = $('go-tier-badge');
    badge.textContent = feedback.tier;
    badge.className = `genius-result-badge ${score >= 16 ? 'legend' : score >= 12 ? 'master' : 'regular'}`;

    $('go-record-banner').hidden = !isNewBest || score === 0;

    $('modal-gameover').hidden = false;
    $('btn-start-game').hidden = false;
  }

  // ---------- Configuração de Teclas & Presets ----------
  function initKeymapModal() {
    $('btn-open-keymap').addEventListener('click', () => {
      $('modal-keymap').hidden = false;
    });

    $('btn-close-keymap').addEventListener('click', () => {
      $('modal-keymap').hidden = true;
      cancelKeyRebind();
    });

    // Presets rápidos
    document.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const presetKey = btn.dataset.preset;
        const preset = KEY_PRESETS[presetKey];
        if (preset) {
          keymap = { ...preset.keys };
          saveKeymap(keymap);
          updateKeyHints();
          updatePresetActiveButton(presetKey);
        }
      });
    });

    // Slots individuais
    document.querySelectorAll('[data-bind-color]').forEach((slot) => {
      slot.addEventListener('click', () => {
        const color = slot.dataset.bindColor;
        startKeyRebind(color, slot);
      });
    });
  }

  function startKeyRebind(color, slot) {
    cancelKeyRebind();
    isListeningRebind = color;
    slot.classList.add('listening');
    slot.querySelector('.key-tag').textContent = 'Pressione uma tecla…';
  }

  function applyKeyRebind(color, rawKey) {
    keymap[color] = rawKey.toLowerCase();
    saveKeymap(keymap);
    cancelKeyRebind();
    updateKeyHints();
    updatePresetActiveButton(null); // Customizado
  }

  function cancelKeyRebind() {
    document.querySelectorAll('.key-bind-slot').forEach((s) => s.classList.remove('listening'));
    isListeningRebind = null;
    updateKeyHints();
  }

  function updateKeyHints() {
    Object.entries(keymap).forEach(([color, key]) => {
      const display = formatKeyDisplay(key);
      const hintEl = $(`hint-${color}`);
      if (hintEl) hintEl.textContent = display;

      const bindEl = $(`bind-key-${color}`);
      if (bindEl) bindEl.textContent = display;
    });

    // Atualiza label no botão do topo
    const currentPresetKey = Object.keys(KEY_PRESETS).find((k) => {
      const p = KEY_PRESETS[k].keys;
      return Object.keys(keymap).every((c) => keymap[c] === p[c]);
    });
    updatePresetActiveButton(currentPresetKey);

    const topLabel = currentPresetKey
      ? KEY_PRESETS[currentPresetKey].name.split(' ')[0]
      : 'Personalizado';
    $('label-active-preset').textContent = `Teclas: ${topLabel}`;
  }

  function updatePresetActiveButton(activeKey) {
    document.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.preset === activeKey);
    });
  }

  // ---------- Áudio Toggle ----------
  function initSoundToggle() {
    $('btn-toggle-sound').addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      $('icon-sound').textContent = soundEnabled ? '🔊' : '🔇';
    });
  }

  // ---------- Utilitários de Interface ----------
  function updateScoreDisplay(score) {
    const formatted = String(score).padStart(2, '0');
    $('val-round').textContent = formatted;
  }

  function updateHighScoreDisplay(score) {
    const val = score !== undefined ? score : loadHighScore();
    $('val-highscore').textContent = String(val);
  }

  function disableButtons(disabled) {
    Object.values(buttons).forEach((b) => (b.disabled = disabled));
  }

  function setStatus(type, text) {
    const dot = $('status-dot');
    dot.className = 'status-indicator-dot';
    if (type === 'player') dot.classList.add('active-player');
    else if (type === 'simon') dot.classList.add('active-simon');

    $('genius-status-text').textContent = text;
  }

  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
})();
