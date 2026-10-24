/* Blue Fox Games · Controlador do Jogo Fox Pulse
 * Interface do console sônico, equalizador, eventos táteis e de teclado.
 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const { AudioSynth, PulseEngine, loadKeymap, saveKeymap, loadHighScore, saveHighScore, formatKeyDisplay, KEY_PRESETS } =
    window.BFPulse || window.BFGenius;

  // Instâncias
  const synth = new AudioSynth();
  const engine = new PulseEngine();

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

  const equalizer = $('sound-equalizer');

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
    setStatus('pulse', `Sintonizando sequência (${engine.sequence.length} ${engine.sequence.length === 1 ? 'pulso' : 'pulsos'})…`);

    // Pausa inicial suave antes do primeiro pulso
    await delay(500);

    for (let i = 0; i < engine.sequence.length; i++) {
      const color = engine.sequence[i];
      await flashButton(color, speed.onMs);
      await delay(speed.offMs);
    }

    // Turno do jogador
    isWaitingInput = true;
    disableButtons(false);
    setStatus('player', `Sua vez! Toque os pads (${engine.userIndex + 1}/${engine.sequence.length})`);
  }

  // ---------- Ação do Jogador (Clique ou Toque) ----------
  Object.entries(buttons).forEach(([color, btn]) => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handleUserInput(color);
    });
  });

  // ---------- Teclado Físico ----------
  window.addEventListener('keydown', (e) => {
    // Se o modal de teclas estiver ouvindo remapeamento
    if (isListeningRebind) {
      e.preventDefault();
      const pressedKey = e.key;
      if (pressedKey === 'Escape') {
        cancelRebind();
        return;
      }
      applyRebind(isListeningRebind, pressedKey);
      return;
    }

    // Ignora se estiver em inputs ou se o modal estiver aberto
    if (e.target.tagName === 'INPUT' || !$('modal-keymap').hidden) return;

    // Tecla Espaço ou Enter inicia o jogo se ele estiver ocioso
    if ((e.code === 'Space' || e.code === 'Enter') && !$('btn-start-game').hidden) {
      e.preventDefault();
      startGame();
      return;
    }

    // Identifica qual pad corresponde à tecla pressionada
    const keyLower = e.key.toLowerCase();
    const matchedColor = Object.entries(keymap).find(([, key]) => key.toLowerCase() === keyLower)?.[0];

    if (matchedColor) {
      e.preventDefault();
      handleUserInput(matchedColor);
    }
  });

  function handleUserInput(color) {
    if (!isWaitingInput || engine.status !== 'playing') return;

    flashButton(color, 220);

    try {
      const result = engine.submitColor(color);

      if (!result.correct) {
        // Erro
        handleGameOver(result.score);
        return;
      }

      if (result.roundComplete) {
        // Completou a rodada
        isWaitingInput = false;
        disableButtons(true);
        updateScoreDisplay(result.score);
        setStatus('player', `Correto! Pontuação: ${result.score}`);

        setTimeout(() => {
          engine.nextRound();
          playRoundSequence();
        }, 800);
      } else {
        // Acertou o passo intermediário
        setStatus('player', `Sua vez! (${engine.userIndex + 1}/${engine.sequence.length})`);
      }
    } catch {
      // Ignora submissões fora de hora
    }
  }

  // ---------- Animação e Som do Pad ----------
  async function flashButton(color, durationMs) {
    const btn = buttons[color];
    if (!btn) return;

    btn.classList.add('lit');
    if (equalizer) equalizer.classList.add('active');

    if (soundEnabled) {
      synth.playTone(color, durationMs);
    }

    await delay(durationMs);

    btn.classList.remove('lit');
    if (equalizer) equalizer.classList.remove('active');
  }

  // ---------- Fim de Jogo ----------
  function handleGameOver(finalScore) {
    isWaitingInput = false;
    disableButtons(true);
    setStatus('error', `Ops! Fim do pulso. Pontuação: ${finalScore}`);

    if (soundEnabled) {
      synth.playErrorTone(550);
    }

    // Flash vermelho em todos os pads
    Object.values(buttons).forEach((b) => b.classList.add('lit'));
    setTimeout(() => {
      Object.values(buttons).forEach((b) => b.classList.remove('lit'));
    }, 450);

    const { isNewBest, best } = saveHighScore(finalScore);
    updateHighScoreDisplay(best);

    const feedback = PulseEngine.getFeedback(finalScore);

    setTimeout(() => {
      $('modal-gameover-score').textContent = finalScore;
      $('modal-gameover-feedback').textContent = feedback.message;
      $('modal-gameover-badge').textContent = `${feedback.badge} ${feedback.tier}`;

      const badgeEl = $('modal-gameover-badge');
      badgeEl.className = 'pulse-result-badge';
      if (finalScore >= 18) badgeEl.classList.add('legend');
      else if (finalScore >= 12) badgeEl.classList.add('master');
      else badgeEl.classList.add('regular');

      $('modal-new-best-tag').hidden = !isNewBest;
      $('btn-start-game').hidden = false;
      $('btn-start-game').textContent = '⚡ Jogar Novamente';

      $('modal-gameover').hidden = false;
    }, 600);
  }

  // ---------- Atualizações de Interface ----------
  function setStatus(turnType, message) {
    const card = $('pulse-status-card');
    card.className = 'pulse-status-card';
    if (turnType === 'player') card.classList.add('turn-player');
    else if (turnType === 'pulse') card.classList.add('turn-pulse');
    else if (turnType === 'error') card.classList.add('turn-error');

    $('pulse-status-text').textContent = message;
  }

  function updateScoreDisplay(score) {
    const el = $('val-round');
    el.textContent = score < 10 ? `0${score}` : String(score);
  }

  function updateHighScoreDisplay(score = null) {
    const best = score ?? loadHighScore();
    $('val-highscore').textContent = best;
  }

  function disableButtons(disabled) {
    Object.values(buttons).forEach((b) => (b.disabled = disabled));
  }

  function updateKeyHints() {
    $('hint-green').textContent = formatKeyDisplay(keymap.green);
    $('hint-red').textContent = formatKeyDisplay(keymap.red);
    $('hint-yellow').textContent = formatKeyDisplay(keymap.yellow);
    $('hint-blue').textContent = formatKeyDisplay(keymap.blue);
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ---------- Modal de Configuração de Teclas ----------
  function initKeymapModal() {
    const modal = $('modal-keymap');

    $('btn-open-keymap').addEventListener('click', () => {
      syncKeymapModal();
      modal.hidden = false;
    });

    $('btn-close-keymap').addEventListener('click', () => {
      cancelRebind();
      modal.hidden = true;
    });

    // Presets rápidos
    document.querySelectorAll('.btn-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        const presetKey = btn.dataset.preset;
        const preset = KEY_PRESETS[presetKey];
        if (!preset) return;

        keymap = { ...preset.keys };
        saveKeymap(keymap);
        updateKeyHints();
        syncKeymapModal();
        updatePresetLabel(presetKey);
      });
    });

    // Slots de remapeamento individual por cor
    document.querySelectorAll('.key-bind-slot').forEach((slot) => {
      slot.addEventListener('click', () => {
        const color = slot.dataset.bindColor;
        startRebind(color, slot);
      });
    });
  }

  function startRebind(color, slotEl) {
    document.querySelectorAll('.key-bind-slot').forEach((s) => s.classList.remove('listening'));
    slotEl.classList.add('listening');
    isListeningRebind = color;
    slotEl.querySelector('.key-tag').textContent = 'Pressione uma tecla…';
  }

  function cancelRebind() {
    isListeningRebind = null;
    document.querySelectorAll('.key-bind-slot').forEach((s) => s.classList.remove('listening'));
    syncKeymapModal();
  }

  function applyRebind(color, key) {
    keymap[color] = key.toLowerCase();
    saveKeymap(keymap);
    updateKeyHints();
    cancelRebind();
    $('label-active-preset').textContent = 'Teclas: Personalizadas';
  }

  function syncKeymapModal() {
    $('bind-key-green').textContent = formatKeyDisplay(keymap.green);
    $('bind-key-red').textContent = formatKeyDisplay(keymap.red);
    $('bind-key-yellow').textContent = formatKeyDisplay(keymap.yellow);
    $('bind-key-blue').textContent = formatKeyDisplay(keymap.blue);

    // Marca preset ativo se coincidir
    const currentStr = JSON.stringify(keymap);
    document.querySelectorAll('.btn-preset').forEach((btn) => {
      const pKey = btn.dataset.preset;
      const match = JSON.stringify(KEY_PRESETS[pKey]?.keys) === currentStr;
      btn.classList.toggle('active', match);
    });
  }

  function updatePresetLabel(presetKey) {
    const labels = {
      fghj: 'Teclas: FGHJ',
      qwas: 'Teclas: QWAS',
      arrows: 'Teclas: Setas',
      numbers: 'Teclas: 1234',
    };
    $('label-active-preset').textContent = labels[presetKey] || 'Teclas';
  }

  // ---------- Alternador de Som ----------
  function initSoundToggle() {
    $('btn-toggle-sound').addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      $('icon-sound').textContent = soundEnabled ? '🔊' : '🔇';
      $('btn-toggle-sound').title = soundEnabled ? 'Som ativado (clique para mutar)' : 'Som mudo (clique para ativar)';
    });
  }
})();
