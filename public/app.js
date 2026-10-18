/* Blue Fox Games · Jogo da Memória (cliente do protótipo)
 * O servidor é a autoridade: aqui só enviamos intenções (criar, entrar, virar)
 * e desenhamos o estado recebido em "game:state". */
(() => {
  'use strict';

  const STORAGE_ID = 'bf-games:player-id';
  const STORAGE_NAME = 'bf-games:name';
  const COLS_BY_CARDS = { 16: 4, 24: 6, 36: 6 };

  const $ = (id) => document.getElementById(id);
  const screens = { home: $('screen-home'), lobby: $('screen-lobby'), game: $('screen-game') };

  const playerId = loadPlayerId();
  let roomCode = null;
  let mySeat = -1;
  let lastState = null;
  let cardEls = [];

  const socket = io('/memory');

  // ---------- Conexão ----------
  socket.on('connect', () => {
    setConn('online', 'Online');
    // Reconexão (queda de rede ou reload com ?sala=): volta para o mesmo assento.
    const code = roomCode || codeFromUrl();
    const name = savedName();
    if (code && name) join(code, name, { silent: !roomCode });
  });
  socket.on('disconnect', () => setConn('offline', 'Reconectando…'));
  socket.on('game:state', ({ code, you, state }) => {
    roomCode = code;
    mySeat = you;
    render(state);
  });

  // ---------- Tela inicial ----------
  $('name').value = savedName();
  const urlCode = codeFromUrl();
  if (urlCode) {
    $('code').value = urlCode;
    $('form-join').querySelector('h2').textContent = 'Você foi convidado!';
  }

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
    join(code, name);
  });

  function join(code, name, { silent = false } = {}) {
    socket.emit('room:join', { playerId, name, code }, (res) => {
      if (res.ok) return setUrlCode(res.code);
      if (!silent) toast(res.error, true);
      if (roomCode) leave(); // sala sumiu (ex.: servidor reiniciado)
    });
  }

  // ---------- Lobby ----------
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

  // ---------- Partida ----------
  $('board').addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card || card.disabled) return;
    socket.emit('game:flip', { index: Number(card.dataset.index) }, (res) => {
      if (!res.ok) toast(res.error, true);
    });
  });

  $('rematch').addEventListener('click', () => {
    socket.emit('game:restart', null, (res) => {
      if (!res.ok) toast(res.error, true);
    });
  });

  document.querySelectorAll('[data-action="leave"]').forEach((btn) => btn.addEventListener('click', leave));

  function leave() {
    // Recarrega sem o código: o servidor marca o jogador como offline.
    window.location.href = window.location.pathname;
  }

  // ---------- Renderização ----------
  function render(state) {
    const prev = lastState;
    lastState = state;

    if (state.status === 'waiting') {
      show('lobby');
      $('lobby-code').textContent = roomCode;
      $('share-link').value = `${location.origin}${location.pathname}?sala=${roomCode}`;
      return;
    }

    show('game');
    $('game-code').textContent = roomCode;
    renderPlayers(state);
    renderBoard(state);
    renderResult(state);
    notifyPresence(prev, state);
  }

  function renderPlayers(state) {
    state.players.forEach((p, i) => {
      const el = $(`player-${i}`);
      el.classList.toggle('active', state.status === 'playing' && state.currentTurn === i);
      el.classList.toggle('offline', !p.connected);
      const tag = i === mySeat ? 'Você' : p.connected ? 'Adversário' : 'Desconectado';
      el.innerHTML = `
        <div class="info"><div class="name"></div><div class="tag">${tag}</div></div>
        <div class="score">${p.score}</div>`;
      el.querySelector('.name').textContent = p.name; // textContent: nome vem do outro jogador
    });

    const turn = $('turn');
    const myTurn = state.status === 'playing' && state.currentTurn === mySeat;
    turn.classList.toggle('mine', myTurn);
    if (state.status === 'finished') turn.textContent = 'Fim de jogo';
    else if (state.locked) turn.textContent = 'Não foi dessa vez…';
    else turn.textContent = myTurn ? 'Sua vez!' : `Vez de ${state.players[state.currentTurn]?.name ?? '…'}`;
  }

  function renderBoard(state) {
    const board = $('board');
    if (cardEls.length !== state.cards.length) {
      board.innerHTML = '';
      board.style.setProperty('--cols', COLS_BY_CARDS[state.cards.length] ?? 6);
      board.dataset.cards = String(state.cards.length);
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
      // Mantém o símbolo durante a animação de desvirar, depois limpa.
      if (card.symbol) el.querySelector('.front').textContent = card.symbol;
      else if (!up) setTimeout(() => !el.classList.contains('up') && (el.querySelector('.front').textContent = ''), 450);
      el.disabled = !canPlay || up;
      el.setAttribute('aria-label', up ? `Carta ${card.symbol}` : `Carta ${i + 1} virada para baixo`);
    });
  }

  function renderResult(state) {
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

  // ---------- Utilitários ----------
  function show(name) {
    Object.entries(screens).forEach(([key, el]) => (el.hidden = key !== name));
  }

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

  /** ID anônimo e persistente: permite voltar ao mesmo assento após reload. */
  function loadPlayerId() {
    try {
      let id = localStorage.getItem(STORAGE_ID);
      if (!id) {
        // crypto.randomUUID só existe em contexto seguro (https/localhost).
        id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
        localStorage.setItem(STORAGE_ID, id);
      }
      return id;
    } catch {
      return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    }
  }
})();
