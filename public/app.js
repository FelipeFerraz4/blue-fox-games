/* Blue Fox Games · Jogo da Memória
 * Cliente com suporte duplo:
 * 1. 1x1 Online Multiplayer via Socket.IO (/memory)
 * 2. Modo Solo (Jornada das 9 Fases & Partida Livre em 4 Níveis com Bot Probabilístico)
 */
(() => {
  'use strict';

  const STORAGE_ID = 'bf-games:player-id';
  const STORAGE_NAME = 'bf-games:name';
  const COLS_BY_CARDS = { 12: 4, 16: 4, 20: 5, 24: 6, 28: 7, 32: 8, 36: 6 };

  const $ = (id) => document.getElementById(id);
  const screens = { home: $('screen-home'), lobby: $('screen-lobby'), game: $('screen-game') };

  const playerId = loadPlayerId();
  let roomCode = null;
  let mySeat = -1;
  let lastState = null;
  let cardEls = [];

  // ============================================================
  // MODO SOLO: ESTADO & CONTROLADOR
  // ============================================================
  let activeSoloGame = null;
  let soloTimer = null;
  let selectedFreeLevel = 1;
  let selectedFreeMode = 'time-trial';

  // ---------- Inicialização de UI ----------
  initModeTabs();
  initSoloSubtabs();
  initFreePlayControls();
  renderCampaignMap();
  updateFreeRecordDisplay();

  // Se veio código na URL (?sala=ABCD), foca no multiplayer online
  const urlCode = codeFromUrl();
  if (urlCode) {
    switchModeTab('online');
    $('code').value = urlCode;
    $('form-join').querySelector('h2').textContent = 'Você foi convidado!';
  } else {
    switchModeTab('solo');
  }

  $('name').value = savedName();

  // ============================================================
  // MULTIPLAYER ONLINE (Socket.IO)
  // ============================================================
  const socket = io('/memory');

  socket.on('connect', () => {
    setConn('online', 'Online');
    const code = roomCode || codeFromUrl();
    const name = savedName();
    if (code && name) joinOnline(code, name, { silent: !roomCode });
  });

  socket.on('disconnect', () => setConn('offline', 'Reconectando…'));

  socket.on('game:state', ({ code, you, state }) => {
    roomCode = code;
    mySeat = you;
    renderMultiplayer(state);
  });

  $('form-create').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = requireName();
    if (!name) return;
    socket.emit('room:create', { playerId, name, pairs: Number($('pairs').value) }, (res) => {
      if (!res.ok) return toast(res.error, true);
      setUrlCode(res.code);
    });
  });

  $('form-join').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = requireName();
    const code = $('code').value.trim().toUpperCase();
    if (!name) return;
    if (code.length !== 4) return toast('O código tem 4 caracteres.', true);
    joinOnline(code, name);
  });

  function joinOnline(code, name, { silent = false } = {}) {
    socket.emit('room:join', { playerId, name, code }, (res) => {
      if (res.ok) return setUrlCode(res.code);
      if (!silent) toast(res.error, true);
      if (roomCode) leave();
    });
  }

  $('copy-link').addEventListener('click', async () => {
    const input = $('share-link');
    try {
      await navigator.clipboard.writeText(input.value);
    } catch {
      input.select();
      document.execCommand('copy');
    }
    toast('Link copiado! Envie para a outra pessoa.');
  });

  // ============================================================
  // GESTÃO DE ABAS E TELAS
  // ============================================================
  function initModeTabs() {
    $('tab-solo').addEventListener('click', () => switchModeTab('solo'));
    $('tab-online').addEventListener('click', () => switchModeTab('online'));
  }

  function switchModeTab(mode) {
    const isSolo = mode === 'solo';
    $('tab-solo').classList.toggle('active', isSolo);
    $('tab-solo').classList.toggle('active-games', isSolo);
    $('tab-online').classList.toggle('active', !isSolo);

    $('panel-solo').hidden = !isSolo;
    $('panel-online').hidden = isSolo;

    $('home-lead').textContent = isSolo
      ? 'Jogue a campanha com 9 fases ou dispute livremente contra a Raposa.'
      : 'Desafie alguém em qualquer lugar. Crie uma sala e envie o link.';
  }

  function initSoloSubtabs() {
    $('subtab-campaign').addEventListener('click', () => {
      $('subtab-campaign').classList.add('active');
      $('subtab-freeplay').classList.remove('active');
      $('view-campaign').hidden = false;
      $('view-freeplay').hidden = true;
    });

    $('subtab-freeplay').addEventListener('click', () => {
      $('subtab-freeplay').classList.add('active');
      $('subtab-campaign').classList.remove('active');
      $('view-campaign').hidden = true;
      $('view-freeplay').hidden = false;
    });
  }

  function initFreePlayControls() {
    document.querySelectorAll('.level-card').forEach((card) => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.level-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        selectedFreeLevel = Number(card.dataset.level);
        updateFreeRecordDisplay();
      });
    });

    $('mode-opt-time').addEventListener('click', () => {
      $('mode-opt-time').classList.add('active');
      $('mode-opt-bot').classList.remove('active');
      selectedFreeMode = 'time-trial';
      updateFreeRecordDisplay();
    });

    $('mode-opt-bot').addEventListener('click', () => {
      $('mode-opt-bot').classList.add('active');
      $('mode-opt-time').classList.remove('active');
      selectedFreeMode = 'vs-bot';
      updateFreeRecordDisplay();
    });

    $('btn-start-freeplay').addEventListener('click', () => {
      const lvlConfig = window.BFSolo.FREE_PLAY_LEVELS.find((l) => l.level === selectedFreeLevel);
      if (!lvlConfig) return;

      startSoloGame({
        stageDef: null,
        title: `${lvlConfig.name} (${lvlConfig.pairs} pares)`,
        pairs: lvlConfig.pairs,
        cols: lvlConfig.cols,
        mode: selectedFreeMode,
        botDifficulty: lvlConfig.botDifficulty,
      });
    });
  }

  function updateFreeRecordDisplay() {
    const lvlConfig = window.BFSolo.FREE_PLAY_LEVELS.find((l) => l.level === selectedFreeLevel);
    if (!lvlConfig) return;

    if (selectedFreeMode === 'vs-bot') {
      $('free-record-display').hidden = true;
      return;
    }

    $('free-record-display').hidden = false;
    const records = window.BFSolo.loadRecords();
    const key = `level-${lvlConfig.pairs}`;
    const rec = records[key];

    if (rec) {
      const m = Math.floor(rec.seconds / 60);
      const s = rec.seconds % 60;
      const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      $('free-record-text').textContent = `⏱️ ${timeStr} · 🎯 ${rec.moves} mov`;
    } else {
      $('free-record-text').textContent = 'Nenhum recorde ainda';
    }
  }

  // ============================================================
  // RENDERIZAÇÃO DO MAPA DA CAMPANHA (Jornada)
  // ============================================================
  function renderCampaignMap() {
    const container = $('view-campaign');
    if (!container || !window.BFSolo) return;

    const stages = window.BFSolo.CAMPAIGN_STAGES;
    const progress = window.BFSolo.loadProgress();
    const unlockedIndex = stages.findIndex((s) => s.id === progress.unlockedStageId);
    const maxUnlocked = unlockedIndex === -1 ? 0 : unlockedIndex;

    const worlds = [
      { num: 1, title: 'Mundo 1: Planície Fácil', cssClass: 'w1' },
      { num: 2, title: 'Mundo 2: Floresta Média', cssClass: 'w2' },
      { num: 3, title: 'Mundo 3: Montanha Difícil', cssClass: 'w3' },
    ];

    container.innerHTML = worlds
      .map((world) => {
        const worldStages = stages.filter((s) => s.world === world.num);
        const stageCardsHtml = worldStages
          .map((stage) => {
            const stageIndex = stages.findIndex((s) => s.id === stage.id);
            const isUnlocked = stageIndex <= maxUnlocked;
            const stars = progress.starsByStage[stage.id] || 0;
            const isBoss = stage.mode === 'vs-bot';

            const starsHtml = isUnlocked
              ? Array.from({ length: 3 }, (_, i) => (i < stars ? '⭐' : '☆')).join('')
              : '🔒';

            const modeBadge = isBoss
              ? '🦊 Duelo vs Raposa'
              : `⏱️ ${stage.pairs} pares`;

            return `
              <div class="stage-card ${isUnlocked ? '' : 'locked'} ${isBoss ? 'is-boss' : ''}" data-stage-id="${stage.id}">
                <div class="stage-top">
                  <span class="stage-number">Fase ${stage.id}</span>
                  <div class="stage-stars">${starsHtml}</div>
                </div>
                <h3 class="stage-title">${stage.title}</h3>
                <p class="stage-desc">${stage.desc}</p>
                <div class="stage-action">
                  <span class="stage-mode-tag">${modeBadge}</span>
                  ${
                    isUnlocked
                      ? `<button class="btn btn-primary btn-stage" type="button" data-play-stage="${stage.id}">Jogar</button>`
                      : `<span class="stage-mode-tag">Bloqueada</span>`
                  }
                </div>
              </div>
            `;
          })
          .join('');

        return `
          <div class="world-section ${world.cssClass}">
            <div class="world-header">
              <span class="world-badge">MUNDO ${world.num}</span>
              <h2 class="world-title">${world.title}</h2>
            </div>
            <div class="stages-grid">${stageCardsHtml}</div>
          </div>
        `;
      })
      .join('');

    // Listener para iniciar fases da campanha
    container.querySelectorAll('[data-play-stage]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stageId = btn.dataset.playStage;
        const stageDef = window.BFSolo.CAMPAIGN_STAGES.find((s) => s.id === stageId);
        if (stageDef) {
          startSoloGame({
            stageDef,
            title: `Fase ${stageDef.id}: ${stageDef.title}`,
            pairs: stageDef.pairs,
            cols: stageDef.cols || 6,
            mode: stageDef.mode,
            botDifficulty: stageDef.botDifficulty || 'medium',
          });
        }
      });
    });
  }

  // ============================================================
  // MOTOR DE PARTIDA SOLO (Execução Instantânea no Navegador)
  // ============================================================
  function startSoloGame({ stageDef, title, pairs, cols, mode, botDifficulty }) {
    clearInterval(soloTimer);

    const cards = window.BFSolo.generateDeck(pairs);

    activeSoloGame = {
      stageDef,
      title,
      pairs,
      cols,
      mode,
      botDifficulty,
      cards,
      matchedIndices: new Set(),
      faceUpIndices: [],
      locked: false,
      seconds: 0,
      moves: 0,
      playerScore: 0,
      botScore: 0,
      turn: 0, // 0 = Player, 1 = Bot
      bot: mode === 'vs-bot' ? new window.BFSolo.ProbabilisticBot(botDifficulty) : null,
    };

    show('game');
    $('result').hidden = true;
    $('btn-next-stage').hidden = true;

    // Configura os placares
    $('scoreboard-multiplayer').hidden = true;
    $('scoreboard-solo').hidden = mode !== 'time-trial';
    $('scoreboard-bot').hidden = mode !== 'vs-bot';

    if (mode === 'time-trial') {
      $('solo-stage-title').textContent = stageDef ? `Fase ${stageDef.id}` : title;
      $('solo-time').textContent = '00:00';
      $('solo-moves').textContent = '0';
      $('solo-pairs').textContent = `0 / ${pairs}`;

      soloTimer = setInterval(() => {
        if (!activeSoloGame) return;
        activeSoloGame.seconds++;
        const m = Math.floor(activeSoloGame.seconds / 60);
        const s = activeSoloGame.seconds % 60;
        $('solo-time').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }, 1000);
    } else {
      $('bot-score-user').textContent = '0';
      $('bot-score-fox').textContent = '0';
      $('bot-turn').textContent = 'Sua vez!';
      $('bot-turn').classList.add('mine');
      $('bot-fox-tag').textContent = `Bot (${botDifficulty === 'easy' ? 'Fácil' : botDifficulty === 'medium' ? 'Médio' : 'Mestre'})`;
    }

    $('game-footer-label').innerHTML = `Modo Solo · <strong>${title}</strong>`;
    renderSoloBoard();
  }

  function renderSoloBoard() {
    const board = $('board');
    board.innerHTML = '';
    const totalCards = activeSoloGame.cards.length;
    const isDesktop = window.innerWidth >= 768;
    const cols = isDesktop && totalCards === 36 ? 9 : (activeSoloGame.cols ?? 6);
    const rows = Math.ceil(totalCards / cols);
    board.style.setProperty('--cols', cols);
    board.style.setProperty('--rows', rows);
    board.dataset.cards = String(totalCards);
    board.classList.add('playable');

    cardEls = activeSoloGame.cards.map((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'card';
      btn.type = 'button';
      btn.dataset.index = String(i);
      btn.innerHTML = '<span class="inner"><span class="face back"></span><span class="face front"></span></span>';
      btn.setAttribute('aria-label', `Carta ${i + 1} virada para baixo`);
      board.appendChild(btn);
      return btn;
    });
  }

  // Listener do tabuleiro (unificado para Solo e Multiplayer)
  $('board').addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card || card.disabled) return;
    const index = Number(card.dataset.index);

    if (activeSoloGame) {
      handleSoloCardClick(index);
    } else {
      socket.emit('game:flip', { index }, (res) => {
        if (!res.ok) toast(res.error, true);
      });
    }
  });

  function handleSoloCardClick(index) {
    const g = activeSoloGame;
    if (!g || g.locked || g.turn !== 0) return;
    if (g.matchedIndices.has(index) || g.faceUpIndices.includes(index)) return;

    revealCard(index);
    if (g.bot) g.bot.observe(index, g.cards[index]);

    g.faceUpIndices.push(index);

    if (g.faceUpIndices.length === 2) {
      g.moves++;
      if (g.mode === 'time-trial') {
        $('solo-moves').textContent = String(g.moves);
      }
      checkSoloMatch();
    }
  }

  function revealCard(index) {
    const el = cardEls[index];
    if (!el) return;
    el.classList.add('up');
    el.querySelector('.front').textContent = activeSoloGame.cards[index];
  }

  function hideCard(index) {
    const el = cardEls[index];
    if (!el) return;
    el.classList.remove('up');
    setTimeout(() => {
      if (!el.classList.contains('up')) {
        el.querySelector('.front').textContent = '';
      }
    }, 450);
  }

  function checkSoloMatch() {
    const g = activeSoloGame;
    const [a, b] = g.faceUpIndices;
    g.locked = true;

    const isMatch = g.cards[a] === g.cards[b];

    if (isMatch) {
      g.matchedIndices.add(a);
      g.matchedIndices.add(b);
      if (g.bot) g.bot.markMatched(a, b);

      const matchClass = g.turn === 0 ? 'matched-0' : 'matched-1';
      cardEls[a].classList.add(matchClass);
      cardEls[b].classList.add(matchClass);

      if (g.turn === 0) {
        g.playerScore++;
        if (g.mode === 'vs-bot') $('bot-score-user').textContent = String(g.playerScore);
      } else {
        g.botScore++;
        $('bot-score-fox').textContent = String(g.botScore);
      }

      if (g.mode === 'time-trial') {
        $('solo-pairs').textContent = `${g.matchedIndices.size / 2} / ${g.pairs}`;
      }

      g.faceUpIndices = [];
      g.locked = false;

      // Verifica fim de jogo
      if (g.matchedIndices.size === g.cards.length) {
        finishSoloGame();
        return;
      }

      // Se foi o bot e ele acertou, joga de novo após um delay suave
      if (g.turn === 1) {
        setTimeout(executeBotTurn, 850);
      }
    } else {
      // Errou
      setTimeout(() => {
        hideCard(a);
        hideCard(b);
        g.faceUpIndices = [];
        g.locked = false;

        if (g.mode === 'vs-bot') {
          g.turn = g.turn === 0 ? 1 : 0;
          updateBotTurnUi();
          if (g.turn === 1) {
            setTimeout(executeBotTurn, 750);
          }
        }
      }, 1000);
    }
  }

  function updateBotTurnUi() {
    const g = activeSoloGame;
    const isPlayerTurn = g.turn === 0;
    $('bot-turn').classList.toggle('mine', isPlayerTurn);
    $('bot-turn').textContent = isPlayerTurn ? 'Sua vez!' : 'Raposa pensando…';
    $('bot-player-user').classList.toggle('active', isPlayerTurn);
    $('bot-player-fox').classList.toggle('active', !isPlayerTurn);
  }

  function executeBotTurn() {
    const g = activeSoloGame;
    if (!g || g.turn !== 1 || g.matchedIndices.size === g.cards.length) return;

    g.locked = true;
    updateBotTurnUi();

    // 1. Bot escolhe a primeira carta
    const firstIndex = g.bot.chooseFirstCard(g.cards.length);
    if (firstIndex === -1) return;

    revealCard(firstIndex);
    g.faceUpIndices.push(firstIndex);

    // 2. Aguarda um intervalo natural e escolhe a segunda carta
    setTimeout(() => {
      if (!activeSoloGame || activeSoloGame.turn !== 1) return;

      const secondIndex = g.bot.chooseSecondCard(firstIndex, g.cards[firstIndex], g.cards.length);
      if (secondIndex === -1) return;

      revealCard(secondIndex);
      g.faceUpIndices.push(secondIndex);

      checkSoloMatch();
    }, 850);
  }

  function finishSoloGame() {
    clearInterval(soloTimer);
    const g = activeSoloGame;
    if (!g) return;

    const overlay = $('result');
    const starsRow = $('result-stars');
    const nextBtn = $('btn-next-stage');

    starsRow.hidden = true;
    nextBtn.hidden = true;

    if (g.stageDef) {
      // Jogo de Campanha
      const won = g.mode === 'vs-bot' ? g.playerScore > g.botScore : true;
      const stars = calculateSoloStars(g.stageDef, {
        won,
        seconds: g.seconds,
        moves: g.moves,
        playerScore: g.playerScore,
        botScore: g.botScore,
      });

      // Salva resultado
      window.BFSolo.saveStageResult(g.stageDef.id, stars);
      renderCampaignMap(); // Atualiza cadeados e estrelas no mapa

      $('result-emoji').textContent = stars >= 3 ? '🏆' : stars >= 1 ? '🎉' : '🦊';
      $('result-title').textContent =
        stars >= 1 ? `Fase ${g.stageDef.id} Concluída!` : 'Não foi dessa vez…';

      starsRow.hidden = false;
      starsRow.innerHTML = Array.from({ length: 3 }, (_, i) =>
        i < stars ? '<span>⭐</span>' : '<span>☆</span>'
      ).join('');

      if (g.mode === 'vs-bot') {
        $('result-score').textContent = `Placar: Você ${g.playerScore} × ${g.botScore} Raposa`;
      } else {
        const m = Math.floor(g.seconds / 60);
        const s = g.seconds % 60;
        const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        $('result-score').textContent = `Tempo: ${timeStr} · Tentativas: ${g.moves} movimentos`;
      }

      // Se desbloqueou a próxima fase da campanha, exibe botão
      if (stars >= 1) {
        const stages = window.BFSolo.CAMPAIGN_STAGES;
        const currentIdx = stages.findIndex((s) => s.id === g.stageDef.id);
        if (currentIdx !== -1 && currentIdx + 1 < stages.length) {
          const nextStage = stages[currentIdx + 1];
          nextBtn.hidden = false;
          nextBtn.onclick = () => {
            overlay.hidden = true;
            startSoloGame({
              stageDef: nextStage,
              title: `Fase ${nextStage.id}: ${nextStage.title}`,
              pairs: nextStage.pairs,
              cols: nextStage.cols || 6,
              mode: nextStage.mode,
              botDifficulty: nextStage.botDifficulty || 'medium',
            });
          };
        }
      }
    } else {
      // Partida Livre
      if (g.mode === 'vs-bot') {
        const won = g.playerScore > g.botScore;
        const draw = g.playerScore === g.botScore;
        $('result-emoji').textContent = draw ? '🤝' : won ? '🏆' : '🦊';
        $('result-title').textContent = draw ? 'Empate!' : won ? 'Você venceu a Raposa!' : 'A Raposa venceu!';
        $('result-score').textContent = `Placar final: Você ${g.playerScore} × ${g.botScore} Raposa`;
      } else {
        const res = window.BFSolo.saveRecord(`level-${g.pairs}`, { seconds: g.seconds, moves: g.moves });
        updateFreeRecordDisplay();

        const m = Math.floor(g.seconds / 60);
        const s = g.seconds % 60;
        const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        $('result-emoji').textContent = res.isBest ? '⭐' : '🎉';
        $('result-title').textContent = res.isBest ? 'Novo Recorde Pessoal!' : 'Tabuleiro Concluído!';
        $('result-score').textContent = `Tempo: ${timeStr} · ${g.moves} movimentos`;
      }
    }

    overlay.hidden = false;
  }

  function calculateSoloStars(stageDef, stats) {
    if (!stats.won) return 0;
    if (stageDef.mode === 'vs-bot') {
      const lead = (stats.playerScore ?? 0) - (stats.botScore ?? 0);
      if (lead <= 0) return 0;
      if (stageDef.targets.threeStars.minLead && lead >= stageDef.targets.threeStars.minLead) return 3;
      if (stageDef.targets.twoStars.minLead && lead >= stageDef.targets.twoStars.minLead) return 2;
      return 1;
    }

    const t3 = stageDef.targets.threeStars;
    const t2 = stageDef.targets.twoStars;
    const hits3 =
      (!t3.maxSeconds || stats.seconds <= t3.maxSeconds) &&
      (!t3.maxMoves || stats.moves <= t3.maxMoves);
    if (hits3) return 3;

    const hits2 =
      (!t2.maxSeconds || stats.seconds <= t2.maxSeconds) ||
      (!t2.maxMoves || stats.moves <= t2.maxMoves);
    if (hits2) return 2;

    return 1;
  }

  // ---------- Botões de Ação ----------
  $('rematch').addEventListener('click', () => {
    $('result').hidden = true;
    if (activeSoloGame) {
      startSoloGame(activeSoloGame);
    } else {
      socket.emit('game:restart', null, (res) => {
        if (!res.ok) toast(res.error, true);
      });
    }
  });

  document.querySelectorAll('[data-action="leave"]').forEach((btn) => btn.addEventListener('click', leave));

  function leave() {
    clearInterval(soloTimer);
    activeSoloGame = null;
    $('result').hidden = true;

    if (roomCode) {
      window.location.href = window.location.pathname;
    } else {
      show('home');
      renderCampaignMap();
      updateFreeRecordDisplay();
    }
  }

  // ============================================================
  // RENDERIZAÇÃO DO MODO MULTIPLAYER (1x1)
  // ============================================================
  function renderMultiplayer(state) {
    activeSoloGame = null;
    clearInterval(soloTimer);
    const prev = lastState;
    lastState = state;

    if (state.status === 'waiting') {
      show('lobby');
      $('lobby-code').textContent = roomCode;
      $('share-link').value = `${location.origin}${location.pathname}?sala=${roomCode}`;
      return;
    }

    show('game');
    $('result').hidden = true;
    $('btn-next-stage').hidden = true;
    $('result-stars').hidden = true;

    $('scoreboard-multiplayer').hidden = false;
    $('scoreboard-solo').hidden = true;
    $('scoreboard-bot').hidden = true;

    $('game-footer-label').innerHTML = `Sala <strong id="game-code">${roomCode}</strong>`;

    renderMultiplayerPlayers(state);
    renderMultiplayerBoard(state);
    renderMultiplayerResult(state);
    notifyPresence(prev, state);
  }

  function renderMultiplayerPlayers(state) {
    state.players.forEach((p, i) => {
      const el = $(`player-${i}`);
      el.classList.toggle('active', state.status === 'playing' && state.currentTurn === i);
      el.classList.toggle('offline', !p.connected);
      const tag = i === mySeat ? 'Você' : p.connected ? 'Adversário' : 'Desconectado';
      el.innerHTML = `
        <div class="info"><div class="name"></div><div class="tag">${tag}</div></div>
        <div class="score">${p.score}</div>`;
      el.querySelector('.name').textContent = p.name;
    });

    const turn = $('turn');
    const myTurn = state.status === 'playing' && state.currentTurn === mySeat;
    turn.classList.toggle('mine', myTurn);
    if (state.status === 'finished') turn.textContent = 'Fim de jogo';
    else if (state.locked) turn.textContent = 'Não foi dessa vez…';
    else turn.textContent = myTurn ? 'Sua vez!' : `Vez de ${state.players[state.currentTurn]?.name ?? '…'}`;
  }

  function renderMultiplayerBoard(state) {
    const board = $('board');
    if (cardEls.length !== state.cards.length) {
      board.innerHTML = '';
      const totalCards = state.cards.length;
      const isDesktop = window.innerWidth >= 768;
      const cols = isDesktop && totalCards === 36 ? 9 : (COLS_BY_CARDS[totalCards] ?? 6);
      const rows = Math.ceil(totalCards / cols);
      board.style.setProperty('--cols', cols);
      board.style.setProperty('--rows', rows);
      board.dataset.cards = String(totalCards);
      cardEls = state.cards.map((_, i) => {
        const btn = document.createElement('button');
        btn.className = 'card';
        btn.type = 'button';
        btn.dataset.index = String(i);
        btn.innerHTML = '<span class="inner"><span class="face back"></span><span class="face front"></span></span>';
        board.appendChild(btn);
        return btn;
      });
    }

    const canPlay = state.status === 'playing' && state.currentTurn === mySeat && !state.locked;
    board.classList.toggle('playable', canPlay);

    state.cards.forEach((card, i) => {
      const el = cardEls[i];
      const up = card.faceUp || card.matchedBy !== null;
      el.classList.toggle('up', up);
      el.classList.toggle('matched-0', card.matchedBy === 0);
      el.classList.toggle('matched-1', card.matchedBy === 1);
      if (card.symbol) el.querySelector('.front').textContent = card.symbol;
      else if (!up) setTimeout(() => !el.classList.contains('up') && (el.querySelector('.front').textContent = ''), 450);
      el.disabled = !canPlay || up;
      el.setAttribute('aria-label', up ? `Carta ${card.symbol}` : `Carta ${i + 1} virada para baixo`);
    });
  }

  function renderMultiplayerResult(state) {
    const overlay = $('result');
    if (state.status !== 'finished') {
      overlay.hidden = true;
      return;
    }
    const [a, b] = state.players;
    const draw = state.winners.length > 1;
    const iWon = !draw && state.winners[0] === mySeat;
    $('result-emoji').textContent = draw ? '🤝' : iWon ? '🏆' : '🦊';
    $('result-title').textContent = draw ? 'Empate!' : iWon ? 'Você venceu!' : `${state.players[state.winners[0]].name} venceu`;
    $('result-score').textContent = `${a.name} ${a.score} × ${b.score} ${b.name}`;
    overlay.hidden = false;
  }

  function notifyPresence(prev, state) {
    if (!prev || prev.status === 'waiting') return;
    state.players.forEach((p, i) => {
      if (i === mySeat || !prev.players[i]) return;
      if (prev.players[i].connected && !p.connected) toast(`${p.name} desconectou. Aguardando voltar…`, true);
      if (!prev.players[i].connected && p.connected) toast(`${p.name} voltou!`);
    });
  }

  // ============================================================
  // UTILITÁRIOS GERAIS
  // ============================================================
  function show(name) {
    document.body.classList.toggle('in-game', name === 'game');
    Object.entries(screens).forEach(([key, el]) => (el.hidden = key !== name));
  }

  window.addEventListener('resize', () => {
    if (!screens.game.hidden && cardEls.length > 0) {
      const board = $('board');
      const totalCards = cardEls.length;
      const isDesktop = window.innerWidth >= 768;
      const defaultCols = activeSoloGame ? activeSoloGame.cols : COLS_BY_CARDS[totalCards];
      const cols = isDesktop && totalCards === 36 ? 9 : (defaultCols ?? 6);
      const rows = Math.ceil(totalCards / cols);
      board.style.setProperty('--cols', cols);
      board.style.setProperty('--rows', rows);
    }
  });

  function setConn(state, label) {
    const el = $('conn');
    el.dataset.state = state;
    el.textContent = label;
  }

  let toastTimer;
  function toast(message, isError = false) {
    const el = $('toast');
    el.textContent = message;
    el.classList.toggle('error', isError);
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), 3200);
  }

  function requireName() {
    const name = $('name').value.trim();
    if (!name) {
      toast('Digite seu nome para jogar.', true);
      $('name').focus();
      return null;
    }
    try { localStorage.setItem(STORAGE_NAME, name); } catch {}
    return name;
  }

  function savedName() {
    try { return localStorage.getItem(STORAGE_NAME) || ''; } catch { return ''; }
  }

  function codeFromUrl() {
    const code = new URLSearchParams(location.search).get('sala');
    return code ? code.trim().toUpperCase().slice(0, 4) : null;
  }

  function setUrlCode(code) {
    roomCode = code;
    history.replaceState(null, '', `${location.pathname}?sala=${code}`);
  }

  function loadPlayerId() {
    try {
      let id = localStorage.getItem(STORAGE_ID);
      if (!id) {
        id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
        localStorage.setItem(STORAGE_ID, id);
      }
      return id;
    } catch {
      return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    }
  }
})();
