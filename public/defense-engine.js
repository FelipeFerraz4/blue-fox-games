/* Blue Fox Games · Milky Way Defense (Defesa da Via Láctea)
 * Motor de combate espacial em Canvas 2D com ilusão de voo para frente,
 * sintetizador de áudio WebAudio, 11 fases do Sistema Solar e upgrades.
 */
(() => {
  'use strict';

  const STORAGE_KEY = 'bf-games:defense-save';

  // -------------------------------------------------------------
  // 1. Sintetizador de Áudio Nativo (Web Audio API)
  // -------------------------------------------------------------
  class SpaceAudioEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }

    playLaser(isPlasma = false) {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isPlasma ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isPlasma ? 880 : 720, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.14);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    }

    playAlienLaser() {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.18);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.19);
    }

    playExplosion(large = false) {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const duration = large ? 0.6 : 0.28;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp((-3 * i) / bufferSize);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(large ? 450 : 700, t);
      filter.frequency.exponentialRampToValueAtTime(40, t + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(large ? 0.35 : 0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
    }

    playSmartBomb() {
      if (this.muted || !this.ctx) return;
      this.playExplosion(true);
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.8);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.85);
    }

    playShieldHit() {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.setValueAtTime(480, t + 0.05);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.2);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    }

    playPowerupChime() {
      if (this.muted || !this.ctx) return;
      const notes = [440, 554.37, 659.25, 880];
      const t = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.17);
      });
    }

    playWarpSound() {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 1.2);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 1.35);
    }
  }

  // -------------------------------------------------------------
  // 2. Motor Gráfico e Lógica do Jogo
  // -------------------------------------------------------------
  class MilkyWayDefenseGame {
    constructor() {
      this.canvas = document.getElementById('defenseCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.audio = new SpaceAudioEngine();

      this.story = window.BFDefenseStory || {
        GLOBAL_STORY: { introCrawl: [], epilogue: [] },
        SOLAR_SYSTEM_STAGES: [],
      };

      this.stages = this.story.SOLAR_SYSTEM_STAGES || [];

      // Carregar progresso salvo
      this.saveData = this.loadSave();

      // Estado do jogo: 'CRAWL', 'BRIEFING', 'MAP', 'PLAYING', 'VICTORY', 'GAMEOVER', 'PAUSED'
      this.state = 'MAP';
      this.currentStageIndex = 0;
      this.currentStage = this.stages[0];

      // Dimensões virtuais fixas do Canvas (proporção 4:3)
      this.V_WIDTH = 800;
      this.V_HEIGHT = 600;
      this.canvas.width = this.V_WIDTH;
      this.canvas.height = this.V_HEIGHT;

      // Estrelas 3D para o efeito de voo para frente
      this.numStars = 160;
      this.stars = [];
      this.initStarfield();

      // Partículas e Efeitos Visuais
      this.particles = [];
      this.shockwaves = [];
      this.floatingAsteroids = [];

      // Estado do Jogador
      this.player = {
        x: this.V_WIDTH / 2,
        y: this.V_HEIGHT - 65,
        width: 44,
        height: 42,
        speed: 6.2,
        baseSpeed: 6.2,
        lives: 3,
        shields: 100,
        maxShields: 100,
        shieldRegenTimer: 0,
        bombs: 1,
        lastShootTime: 0,
        shootCooldown: 320,
        invulnerableUntil: 0,
      };

      // Frotas Inimigas e Tiros
      this.playerBullets = [];
      this.alienBullets = [];
      this.alienFleet = [];
      this.fleetDirection = 1;
      this.fleetStepDownNeeded = false;
      this.fleetMoveTimer = 0;
      this.fleetStepInterval = 650;
      this.alienShootTimer = 0;

      // Chefão da Fase
      this.boss = null;

      // Status da Fase
      this.score = 0;
      this.stageKillCount = 0;
      this.stageTotalAliens = 0;
      this.warpSpeedFactor = 1.0;
      this.isWarping = false;
      this.warpTimer = 0;

      // Entradas (Teclado e Toque)
      this.keys = {
        left: false,
        right: false,
        fire: false,
        bomb: false,
      };

      // Cache de Elementos da UI
      this.ui = {
        hudStageName: document.getElementById('hudStageName'),
        hudCoords: document.getElementById('hudCoords'),
        hudWave: document.getElementById('hudWave'),
        hudScore: document.getElementById('hudScore'),
        hudLives: document.getElementById('hudLives'),
        hudShieldsFill: document.getElementById('hudShieldsFill'),
        hudBombs: document.getElementById('hudBombs'),
        activeUpgradesList: document.getElementById('activeUpgradesList'),

        screenCrawl: document.getElementById('screenCrawl'),
        crawlTextContainer: document.getElementById('crawlTextContainer'),
        btnSkipCrawl: document.getElementById('btnSkipCrawl'),

        screenBriefing: document.getElementById('screenBriefing'),
        briefingBadge: document.getElementById('briefingStageBadge'),
        briefingCoords: document.getElementById('briefingCoords'),
        briefingTitle: document.getElementById('briefingTitle'),
        briefingCodename: document.getElementById('briefingCodename'),
        briefingStory: document.getElementById('briefingStory'),
        briefingPilotLog: document.getElementById('briefingPilotLog'),
        briefingReward: document.getElementById('briefingRewardContainer'),
        btnLaunchStage: document.getElementById('btnLaunchStage'),
        btnBackToMapFromBriefing: document.getElementById('btnBackToMapFromBriefing'),

        screenSolarMap: document.getElementById('screenSolarMap'),
        solarStagesList: document.getElementById('solarStagesList'),
        btnResumeFromMap: document.getElementById('btnResumeFromMap'),
        btnShowCrawl: document.getElementById('btnShowCrawl'),

        screenVictory: document.getElementById('screenVictory'),
        victoryTitle: document.getElementById('victoryTitle'),
        victorySubtitle: document.getElementById('victorySubtitle'),
        victoryText: document.getElementById('victoryText'),
        victoryUpgradeBox: document.getElementById('victoryUpgradeBox'),
        btnNextStage: document.getElementById('btnNextStage'),
        btnVictoryMap: document.getElementById('btnVictoryMap'),

        screenGameOver: document.getElementById('screenGameOver'),
        gameOverScore: document.getElementById('gameOverScore'),
        btnRetryStage: document.getElementById('btnRetryStage'),
        btnGameOverMap: document.getElementById('btnGameOverMap'),

        screenPause: document.getElementById('screenPause'),
        btnResumePause: document.getElementById('btnResumePause'),
        btnQuitToMap: document.getElementById('btnQuitToMap'),

        btnSoundToggle: document.getElementById('btnSoundToggle'),
        btnPauseToggle: document.getElementById('btnPauseToggle'),
        btnMapToggle: document.getElementById('btnMapToggle'),

        // Controles touch
        btnTouchLeft: document.getElementById('btnTouchLeft'),
        btnTouchRight: document.getElementById('btnTouchRight'),
        btnTouchFire: document.getElementById('btnTouchFire'),
        btnTouchBomb: document.getElementById('btnTouchBomb'),
      };

      this.bindEvents();
      this.renderSolarMap();
      this.applyUpgrades();
      this.updateHud();

      // Se é a primeira vez que entra e não há fases completadas, mostra o Crawl Estelar
      if (this.saveData.highestStageUnlocked === 1 && !this.saveData.hasSeenIntro) {
        this.showCrawl();
      } else {
        this.showSolarMap();
      }

      // Iniciar loop principal
      this.lastFrameTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    // -------------------------------------------------------------
    // Persistência em LocalStorage
    // -------------------------------------------------------------
    loadSave() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (e) {
        console.warn('Erro ao carregar dados salvos de Milky Way Defense', e);
      }
      return {
        highestStageUnlocked: 1,
        completedStages: [],
        highScore: 0,
        hasSeenIntro: false,
        unlockedUpgrades: [],
      };
    }

    saveProgress() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.saveData));
      } catch (e) {
        console.warn('Erro ao salvar progresso em localStorage', e);
      }
    }

    // -------------------------------------------------------------
    // Sistema Estelar 3D e Ilusão de Avanço no Espaço
    // -------------------------------------------------------------
    initStarfield() {
      this.stars = [];
      for (let i = 0; i < this.numStars; i++) {
        this.stars.push({
          x: (Math.random() - 0.5) * this.V_WIDTH * 2.2,
          y: (Math.random() - 0.5) * this.V_HEIGHT * 2.2,
          z: Math.random() * 1000 + 1,
          pz: 0, // Z anterior para desenhar linhas de velocidade (motion blur)
          color: Math.random() > 0.85 ? '#38b6ff' : Math.random() > 0.9 ? '#8b5cf6' : '#ffffff',
          size: Math.random() * 1.5 + 0.8,
        });
      }
    }

    updateStarfield(dt) {
      // Base speed no vácuo + aceleração de salto hiperespacial
      const baseSpeed = 240 * (this.isWarping ? 8.0 : 1.0) * this.warpSpeedFactor;
      const fov = 300;
      const cx = this.V_WIDTH / 2;
      const cy = this.V_HEIGHT / 2 - 40;

      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        s.pz = s.z;
        s.z -= baseSpeed * dt;

        if (s.z <= 1) {
          s.z = 1000;
          s.pz = 1000;
          s.x = (Math.random() - 0.5) * this.V_WIDTH * 2.2;
          s.y = (Math.random() - 0.5) * this.V_HEIGHT * 2.2;
        }
      }
    }

    drawStarfield() {
      const cx = this.V_WIDTH / 2;
      const cy = this.V_HEIGHT / 2 - 40;
      const fov = 300;

      this.ctx.fillStyle = '#020617';
      this.ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

      // Renderizar o Planeta ou Astro de Destino no horizonte cósmico
      this.drawCelestialDestination();

      // Renderizar as estrelas projetadas em 3D
      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        const screenX = cx + (s.x / s.z) * fov;
        const screenY = cy + (s.y / s.z) * fov;

        // Ponto anterior para efeito de rastro de velocidade
        const prevScreenX = cx + (s.x / s.pz) * fov;
        const prevScreenY = cy + (s.y / s.pz) * fov;

        if (screenX >= 0 && screenX <= this.V_WIDTH && screenY >= 0 && screenY <= this.V_HEIGHT) {
          const depthAlpha = Math.min(1, Math.max(0.1, (1000 - s.z) / 800));

          if (this.isWarping || this.warpSpeedFactor > 1.2) {
            // Linhas de hiperespaço
            this.ctx.strokeStyle = s.color;
            this.ctx.lineWidth = s.size * (1000 / s.z) * 0.8;
            this.ctx.globalAlpha = depthAlpha;
            this.ctx.beginPath();
            this.ctx.moveTo(prevScreenX, prevScreenY);
            this.ctx.lineTo(screenX, screenY);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
          } else {
            // Estrela pontual suavemente projetada
            const r = Math.max(0.7, (s.size * (600 / s.z)) * 0.9);
            this.ctx.fillStyle = s.color;
            this.ctx.globalAlpha = depthAlpha;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, r, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
          }
        }
      }
    }

    // -------------------------------------------------------------
    // Desenho do Astro / Planeta de Destino no Horizonte
    // Cria a ilusão de aproximação real durante a fase!
    // -------------------------------------------------------------
    drawCelestialDestination() {
      if (!this.currentStage) return;

      const progress = this.stageTotalAliens > 0
        ? Math.min(1, this.stageKillCount / this.stageTotalAliens)
        : 0;

      // Conforme o jogador destrói a frota alienígena, a nave se aproxima do planeta
      const baseRadius = 45;
      const targetRadius = 140;
      const currentRadius = baseRadius + (targetRadius - baseRadius) * progress;

      const px = this.V_WIDTH / 2;
      const py = 150 + progress * 20;

      const theme = this.currentStage.theme || {};
      const primary = theme.planetPrimary || '#38b6ff';
      const secondary = theme.planetSecondary || '#1e3a8a';
      const atmosphere = theme.atmosphereGlow || 'rgba(56, 182, 255, 0.4)';

      this.ctx.save();

      // Brilho atmosférico exterior
      const glow = this.ctx.createRadialGradient(px, py, currentRadius * 0.8, px, py, currentRadius * 1.5);
      glow.addColorStop(0, atmosphere);
      glow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(px, py, currentRadius * 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Se for o Sol (Fase 4), adicione labaredas e pulso térmico
      if (this.currentStage.key === 'sol') {
        const time = performance.now() * 0.003;
        const flareGlow = this.ctx.createRadialGradient(px, py, currentRadius * 0.5, px, py, currentRadius * 2.2);
        flareGlow.addColorStop(0, 'rgba(255, 230, 100, 0.8)');
        flareGlow.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
        flareGlow.addColorStop(1, 'transparent');
        this.ctx.fillStyle = flareGlow;
        this.ctx.beginPath();
        this.ctx.arc(px, py, currentRadius * 2.2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Corpo principal do planeta
      const grad = this.ctx.createRadialGradient(
        px - currentRadius * 0.35,
        py - currentRadius * 0.35,
        currentRadius * 0.1,
        px,
        py,
        currentRadius
      );
      grad.addColorStop(0, primary);
      grad.addColorStop(0.7, secondary);
      grad.addColorStop(1, '#030712');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Aneis de Saturno e Urano
      if (this.currentStage.key === 'saturno' || this.currentStage.key === 'urano') {
        this.ctx.save();
        this.ctx.translate(px, py);
        this.ctx.rotate(this.currentStage.key === 'saturno' ? 0.35 : 0.8);
        this.ctx.scale(1, 0.28);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, currentRadius * 2.1, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.currentStage.key === 'saturno' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(165, 243, 252, 0.4)';
        this.ctx.lineWidth = 14;
        this.ctx.stroke();
        this.ctx.restore();
      }

      this.ctx.restore();
    }

    // -------------------------------------------------------------
    // Inicialização da Fase
    // -------------------------------------------------------------
    startStage(stageIndex) {
      this.audio.init();
      const s = this.stages[stageIndex];
      if (!s) return;

      this.currentStageIndex = stageIndex;
      this.currentStage = s;
      this.state = 'PLAYING';

      // Reset de combate
      this.player.x = this.V_WIDTH / 2;
      this.player.y = this.V_HEIGHT - 65;
      this.player.shields = this.player.maxShields;
      this.playerBullets = [];
      this.alienBullets = [];
      this.particles = [];
      this.shockwaves = [];
      this.floatingAsteroids = [];

      this.isWarping = false;
      this.warpSpeedFactor = 1.0;
      this.warpTimer = 0;

      // Construção da Frota Inimiga da Fase
      this.buildFleet(s.wave);

      // Se a fase tem asteroides soltos (Cinturão Principal ou Kuiper)
      if (s.wave.hasAsteroids) {
        this.spawnAsteroids(8);
      }

      this.hideAllScreens();
      this.updateHud();
    }

    buildFleet(waveConfig) {
      this.alienFleet = [];
      const rows = waveConfig.rows || 4;
      const cols = waveConfig.cols || 8;
      const alienW = 34;
      const alienH = 26;
      const gapX = 18;
      const gapY = 16;
      const startX = (this.V_WIDTH - (cols * (alienW + gapX) - gapX)) / 2;
      const startY = 70;

      let idCounter = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let type = 'scout';
          let points = 50;
          let color = '#38b6ff';
          let hp = 1;

          if (r === 0) {
            type = 'vanguard';
            points = 150;
            color = '#ef4444';
            hp = 2;
          } else if (r === 1) {
            type = 'interceptor';
            points = 100;
            color = '#8b5cf6';
            hp = 1;
          }

          this.alienFleet.push({
            id: ++idCounter,
            x: startX + c * (alienW + gapX),
            y: startY + r * (alienH + gapY),
            width: alienW,
            height: alienH,
            type,
            points,
            color,
            hp,
            alive: true,
            frame: 0,
          });
        }
      }

      this.stageTotalAliens = this.alienFleet.length;
      this.stageKillCount = 0;
      this.fleetDirection = 1;
      this.fleetStepDownNeeded = false;
      this.fleetMoveTimer = 0;
      this.fleetStepInterval = Math.max(300, 750 - (waveConfig.alienSpeed || 1.0) * 120);

      // Configuração de Chefe se houver
      if (waveConfig.boss) {
        this.boss = {
          name: waveConfig.boss.name,
          title: waveConfig.boss.title,
          maxHp: waveConfig.boss.hp || 40,
          hp: waveConfig.boss.hp || 40,
          phases: waveConfig.boss.phases || 2,
          x: this.V_WIDTH / 2 - 50,
          y: -100, // Entra descendo
          targetY: 80,
          width: 100,
          height: 60,
          alive: false, // Ativado quando a frota diminuir
          shootTimer: 0,
          dir: 1,
        };
      } else {
        this.boss = null;
      }
    }

    spawnAsteroids(count) {
      for (let i = 0; i < count; i++) {
        this.floatingAsteroids.push({
          x: Math.random() * (this.V_WIDTH - 60) + 30,
          y: Math.random() * -400 - 40,
          radius: Math.random() * 16 + 12,
          speed: Math.random() * 1.5 + 1.2,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          hp: 2,
        });
      }
    }

    // -------------------------------------------------------------
    // Aplicação de Upgrades Desbloqueados
    // -------------------------------------------------------------
    applyUpgrades() {
      const unlocked = this.saveData.unlockedUpgrades || [];

      // Double / Triple Laser
      this.hasDoubleLaser = unlocked.includes('double_laser') || unlocked.includes('triple_laser');
      this.hasTripleLaser = unlocked.includes('triple_laser');

      // Rapid Fire
      if (unlocked.includes('rapid_fire')) {
        this.player.shootCooldown = 220;
      } else {
        this.player.shootCooldown = 320;
      }

      // Speed Thrusters
      if (unlocked.includes('speed_thrusters')) {
        this.player.speed = 8.0;
      } else {
        this.player.speed = 6.2;
      }

      // Plasma Shield & Armor
      if (unlocked.includes('shield_regen')) {
        this.player.maxShields = 150;
      } else {
        this.player.maxShields = 100;
      }
      this.player.shields = Math.min(this.player.shields, this.player.maxShields);

      // Renderizar badges na HUD
      if (this.ui.activeUpgradesList) {
        this.ui.activeUpgradesList.innerHTML = '';
        if (unlocked.length === 0) {
          const empty = document.createElement('span');
          empty.textContent = 'Nenhum upgrade ativo (Desbloqueie ao vencer fases)';
          empty.style.color = '#64748b';
          empty.style.fontSize = '0.75rem';
          this.ui.activeUpgradesList.appendChild(empty);
        } else {
          unlocked.forEach((uKey) => {
            const chip = document.createElement('div');
            chip.className = 'upgrade-chip';
            chip.innerHTML = `<span>⚡</span> <span>${this.formatUpgradeName(uKey)}</span>`;
            this.ui.activeUpgradesList.appendChild(chip);
          });
        }
      }
    }

    formatUpgradeName(key) {
      const map = {
        double_laser: 'Laser Duplo',
        shield_regen: 'Escudo de Plasma',
        speed_thrusters: 'Propulsores Iônicos',
        solar_plating: 'Blindagem Solar',
        rapid_fire: 'Canhões de Alta Frequência',
        main_belt_radar: 'Radar Espacial',
        triple_laser: 'Laser Triplo',
        grav_repulsor: 'Repulsor Gravitacional',
        sub_zero_cooling: 'Refrigeração Subzero',
        hydra_torpedo: 'Bomba de Antimatéria',
        hyper_drive: 'Hiper-Propulsão Ômega',
      };
      return map[key] || key;
    }

    // -------------------------------------------------------------
    // Loop de Atualização e Desenho
    // -------------------------------------------------------------
    loop(currentTime) {
      const dt = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = currentTime;

      this.updateStarfield(dt);

      if (this.state === 'PLAYING') {
        this.update(dt);
      }

      this.draw();

      requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
      // 1. Salto Hiperespacial (Transição de Vitória)
      if (this.isWarping) {
        this.warpTimer += dt;
        this.warpSpeedFactor = 1.0 + this.warpTimer * 4.0;
        this.player.y -= 120 * dt; // Nave acelera para a frente
        if (this.warpTimer > 1.8) {
          this.finishStageVictory();
        }
        return;
      }

      // 2. Movimento do Jogador
      if (this.keys.left) {
        this.player.x -= this.player.speed;
      }
      if (this.keys.right) {
        this.player.x += this.player.speed;
      }

      // Limites de tela
      const halfW = this.player.width / 2;
      if (this.player.x < halfW + 10) this.player.x = halfW + 10;
      if (this.player.x > this.V_WIDTH - halfW - 10) this.player.x = this.V_WIDTH - halfW - 10;

      // 3. Tiro do Jogador
      const now = performance.now();
      if (this.keys.fire && now - this.player.lastShootTime >= this.player.shootCooldown) {
        this.shootPlayerLasers();
        this.player.lastShootTime = now;
      }

      // 4. Bomba Inteligente
      if (this.keys.bomb && this.player.bombs > 0) {
        this.triggerSmartBomb();
        this.keys.bomb = false;
      }

      // 5. Regeneração Lenta de Escudos
      if (this.player.shields < this.player.maxShields) {
        this.player.shieldRegenTimer += dt;
        if (this.player.shieldRegenTimer >= 1.5) {
          this.player.shields = Math.min(this.player.maxShields, this.player.shields + 3);
          this.player.shieldRegenTimer = 0;
          this.updateHud();
        }
      }

      // 6. Atualizar Tiros do Jogador
      for (let i = this.playerBullets.length - 1; i >= 0; i--) {
        const b = this.playerBullets[i];
        b.y -= b.speed;
        if (b.y < -20) {
          this.playerBullets.splice(i, 1);
        }
      }

      // 7. Movimentação da Frota Alienígena (Grid Step)
      this.fleetMoveTimer += dt * 1000;
      if (this.fleetMoveTimer >= this.fleetStepInterval) {
        this.fleetMoveTimer = 0;
        this.stepFleet();
      }

      // 8. Tiros Alienígenas
      this.alienShootTimer += dt * 1000;
      const shootInterval = this.currentStage.wave.alienCooldownMs || 650;
      if (this.alienShootTimer >= shootInterval) {
        this.alienShootTimer = 0;
        this.alienShoot();
      }

      // Atualizar Tiros Inimigos
      for (let i = this.alienBullets.length - 1; i >= 0; i--) {
        const b = this.alienBullets[i];
        b.y += b.speed;

        // Colisão com Jogador
        if (this.checkCollision(b, {
          x: this.player.x - this.player.width / 2,
          y: this.player.y - this.player.height / 2,
          width: this.player.width,
          height: this.player.height,
        })) {
          this.alienBullets.splice(i, 1);
          this.hitPlayer(b.damage || 25);
          continue;
        }

        if (b.y > this.V_HEIGHT + 20) {
          this.alienBullets.splice(i, 1);
        }
      }

      // 9. Atualizar Asteroides Flutuantes
      for (let i = this.floatingAsteroids.length - 1; i >= 0; i--) {
        const ast = this.floatingAsteroids[i];
        ast.y += ast.speed;
        ast.rotation += ast.rotSpeed;

        // Colisão com tiros do jogador
        for (let j = this.playerBullets.length - 1; j >= 0; j--) {
          const pb = this.playerBullets[j];
          const dist = Math.hypot(pb.x - ast.x, pb.y - ast.y);
          if (dist < ast.radius + 6) {
            this.playerBullets.splice(j, 1);
            ast.hp--;
            this.createSparks(pb.x, pb.y, '#f59e0b', 6);
            if (ast.hp <= 0) {
              this.audio.playExplosion(false);
              this.createExplosion(ast.x, ast.y, '#cbd5e1', 14);
              this.score += 75;
              this.floatingAsteroids.splice(i, 1);
              this.updateHud();
              break;
            }
          }
        }

        // Colisão asteroide com jogador
        if (ast && Math.hypot(this.player.x - ast.x, this.player.y - ast.y) < ast.radius + 18) {
          this.hitPlayer(35);
          this.audio.playExplosion(true);
          this.createExplosion(ast.x, ast.y, '#f59e0b', 20);
          this.floatingAsteroids.splice(i, 1);
          continue;
        }

        // Loop de reciclagem de asteroides
        if (ast && ast.y > this.V_HEIGHT + 50) {
          ast.y = -60;
          ast.x = Math.random() * (this.V_WIDTH - 60) + 30;
          ast.hp = 2;
        }
      }

      // 10. Atualizar Chefão (se ativo)
      if (this.boss) {
        this.updateBoss(dt);
      }

      // 11. Colisões de Tiros do Jogador com Aliens
      this.checkPlayerBulletCollisions();

      // 12. Atualizar Partículas e Ondas de Choque
      this.updateParticles(dt);

      // 13. Checar Condição de Vitória da Fase
      const remainingAliens = this.alienFleet.filter((a) => a.alive).length;
      const bossDefeated = !this.boss || (this.boss.alive && this.boss.hp <= 0);

      if (remainingAliens === 0 && (!this.boss || this.boss.hp <= 0)) {
        this.triggerHyperWarp();
      }
    }

    // -------------------------------------------------------------
    // Sistema de Tiros do Jogador
    // -------------------------------------------------------------
    shootPlayerLasers() {
      const px = this.player.x;
      const py = this.player.y - 20;

      if (this.hasTripleLaser) {
        this.playerBullets.push({ x: px, y: py, speed: 11, color: '#38b6ff' });
        this.playerBullets.push({ x: px - 14, y: py + 4, speed: 10.5, color: '#8b5cf6' });
        this.playerBullets.push({ x: px + 14, y: py + 4, speed: 10.5, color: '#8b5cf6' });
        this.audio.playLaser(true);
      } else if (this.hasDoubleLaser) {
        this.playerBullets.push({ x: px - 10, y: py, speed: 10, color: '#38b6ff' });
        this.playerBullets.push({ x: px + 10, y: py, speed: 10, color: '#38b6ff' });
        this.audio.playLaser(true);
      } else {
        this.playerBullets.push({ x: px, y: py, speed: 9.5, color: '#38b6ff' });
        this.audio.playLaser(false);
      }
    }

    // -------------------------------------------------------------
    // Bomba Inteligente (Super Ataque)
    // -------------------------------------------------------------
    triggerSmartBomb() {
      this.player.bombs--;
      this.audio.playSmartBomb();
      this.shockwaves.push({
        x: this.player.x,
        y: this.player.y,
        radius: 10,
        maxRadius: 500,
        speed: 600,
        color: '#f59e0b',
      });

      // Destruir todos os tiros inimigos em tela
      this.alienBullets = [];

      // Dano massivo a todos os aliens
      this.alienFleet.forEach((alien) => {
        if (alien.alive) {
          alien.alive = false;
          this.stageKillCount++;
          this.score += alien.points;
          this.createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2, alien.color, 12);
        }
      });

      if (this.boss && this.boss.alive) {
        this.boss.hp = Math.max(0, this.boss.hp - 15);
        this.createExplosion(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, '#f59e0b', 24);
      }

      this.updateHud();
    }

    // -------------------------------------------------------------
    // Movimentação e Ataques da Frota Inimiga
    // -------------------------------------------------------------
    stepFleet() {
      let hitEdge = false;
      const stepX = 14 * this.fleetDirection;

      // Verificar se algum alien bateu na borda lateral
      for (const alien of this.alienFleet) {
        if (!alien.alive) continue;
        const nextX = alien.x + stepX;
        if (nextX < 20 || nextX + alien.width > this.V_WIDTH - 20) {
          hitEdge = true;
          break;
        }
      }

      if (hitEdge) {
        this.fleetDirection *= -1;
        // Desce um nível
        for (const alien of this.alienFleet) {
          if (!alien.alive) continue;
          alien.y += 18;
          // Invasão terrestre! Se os aliens alcançarem a nave, game over
          if (alien.y + alien.height >= this.player.y - 10) {
            this.gameOver();
            return;
          }
        }
      } else {
        for (const alien of this.alienFleet) {
          if (!alien.alive) continue;
          alien.x += stepX;
        }
      }

      // Aumenta a velocidade dos aliens conforme a frota diminui
      const aliveCount = this.alienFleet.filter((a) => a.alive).length;
      if (aliveCount > 0) {
        const ratio = aliveCount / this.stageTotalAliens;
        this.fleetStepInterval = Math.max(120, 200 + ratio * 450);
      }

      // Ativar Boss se a frota estiver em 25% ou menos
      if (this.boss && !this.boss.alive && aliveCount <= Math.max(2, this.stageTotalAliens * 0.25)) {
        this.boss.alive = true;
        this.audio.playExplosion(true);
      }
    }

    alienShoot() {
      const aliveAliens = this.alienFleet.filter((a) => a.alive);
      if (aliveAliens.length === 0) return;

      // Escolhe um alien aleatório na linha de frente
      const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
      this.alienBullets.push({
        x: shooter.x + shooter.width / 2,
        y: shooter.y + shooter.height,
        width: 4,
        height: 12,
        speed: this.currentStage.wave.bulletSpeed || 4.2,
        color: '#ef4444',
        damage: 22,
      });

      this.audio.playAlienLaser();
    }

    // -------------------------------------------------------------
    // Chefe de Fase (ex: Coletor Vulcan ou Dreadnought Leviatã)
    // -------------------------------------------------------------
    updateBoss(dt) {
      if (!this.boss.alive) return;

      // Descida dramática na entrada
      if (this.boss.y < this.boss.targetY) {
        this.boss.y += 60 * dt;
      } else {
        // Movimento senoidal horizontal
        this.boss.x += 80 * this.boss.dir * dt;
        if (this.boss.x < 40) {
          this.boss.x = 40;
          this.boss.dir = 1;
        } else if (this.boss.x + this.boss.width > this.V_WIDTH - 40) {
          this.boss.x = this.V_WIDTH - 40 - this.boss.width;
          this.boss.dir = -1;
        }

        // Tiros do chefe
        this.boss.shootTimer += dt * 1000;
        if (this.boss.shootTimer > 850) {
          this.boss.shootTimer = 0;
          const bx = this.boss.x + this.boss.width / 2;
          const by = this.boss.y + this.boss.height;

          // Disparo duplo em leque
          this.alienBullets.push({ x: bx - 25, y: by, width: 6, height: 16, speed: 4.8, color: '#f59e0b', damage: 30 });
          this.alienBullets.push({ x: bx + 25, y: by, width: 6, height: 16, speed: 4.8, color: '#f59e0b', damage: 30 });
          this.audio.playAlienLaser();
        }
      }
    }

    // -------------------------------------------------------------
    // Colisões e Dano
    // -------------------------------------------------------------
    checkPlayerBulletCollisions() {
      for (let i = this.playerBullets.length - 1; i >= 0; i--) {
        const b = this.playerBullets[i];
        let bulletRemoved = false;

        // Checar colisão com Chefão
        if (this.boss && this.boss.alive && this.boss.hp > 0) {
          if (
            b.x >= this.boss.x &&
            b.x <= this.boss.x + this.boss.width &&
            b.y >= this.boss.y &&
            b.y <= this.boss.y + this.boss.height
          ) {
            this.boss.hp--;
            this.score += 25;
            this.createSparks(b.x, b.y, '#f59e0b', 4);
            this.playerBullets.splice(i, 1);

            if (this.boss.hp <= 0) {
              this.audio.playExplosion(true);
              this.createExplosion(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, '#f59e0b', 35);
              this.score += 2000;
              this.triggerHyperWarp();
            }
            this.updateHud();
            continue;
          }
        }

        // Checar colisão com Aliens normais
        for (const alien of this.alienFleet) {
          if (!alien.alive) continue;

          if (
            b.x >= alien.x &&
            b.x <= alien.x + alien.width &&
            b.y >= alien.y &&
            b.y <= alien.y + alien.height
          ) {
            alien.hp--;
            this.createSparks(b.x, b.y, alien.color, 5);
            this.playerBullets.splice(i, 1);
            bulletRemoved = true;

            if (alien.hp <= 0) {
              alien.alive = false;
              this.stageKillCount++;
              this.score += alien.points;
              this.audio.playExplosion(false);
              this.createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2, alien.color, 14);
            }
            this.updateHud();
            break;
          }
        }

        if (bulletRemoved) continue;
      }
    }

    hitPlayer(damage) {
      if (performance.now() < this.player.invulnerableUntil) return;

      this.audio.playShieldHit();
      this.createSparks(this.player.x, this.player.y, '#38b6ff', 8);

      if (this.player.shields > 0) {
        this.player.shields = Math.max(0, this.player.shields - damage);
        this.updateHud();
        if (this.player.shields <= 0) {
          this.createExplosion(this.player.x, this.player.y, '#38b6ff', 12);
        }
      } else {
        // Sem escudos: Perde uma vida
        this.player.lives--;
        this.audio.playExplosion(true);
        this.createExplosion(this.player.x, this.player.y, '#ef4444', 24);
        this.player.shields = this.player.maxShields;
        this.player.invulnerableUntil = performance.now() + 2000; // 2s de invulnerabilidade
        this.updateHud();

        if (this.player.lives <= 0) {
          this.gameOver();
        }
      }
    }

    checkCollision(box1, box2) {
      return (
        box1.x < box2.x + box2.width &&
        box1.x + (box1.width || 4) > box2.x &&
        box1.y < box2.y + box2.height &&
        box1.y + (box1.height || 8) > box2.y
      );
    }

    // -------------------------------------------------------------
    // Partículas e Efeitos de Explosão
    // -------------------------------------------------------------
    createExplosion(x, y, color, count = 16) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 140 + 30;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          alpha: 1.0,
          decay: Math.random() * 1.5 + 1.2,
          size: Math.random() * 3 + 1.5,
        });
      }
    }

    createSparks(x, y, color, count = 6) {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 160,
          vy: (Math.random() - 0.5) * 160,
          color,
          alpha: 1.0,
          decay: 3.5,
          size: 2,
        });
      }
    }

    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= p.decay * dt;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }

      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += sw.speed * dt;
        if (sw.radius >= sw.maxRadius) {
          this.shockwaves.splice(i, 1);
        }
      }
    }

    // -------------------------------------------------------------
    // Renderização do Canvas (Nave, Frotas, Tiros, Propulsores)
    // -------------------------------------------------------------
    draw() {
      // 1. Fundo Espacial 3D e Horizonte do Planeta
      this.drawStarfield();

      // 2. Ondas de Choque
      this.ctx.save();
      for (const sw of this.shockwaves) {
        const alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
        this.ctx.strokeStyle = sw.color;
        this.ctx.globalAlpha = alpha;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      this.ctx.restore();

      // 3. Asteroides Flutuantes
      for (const ast of this.floatingAsteroids) {
        this.ctx.save();
        this.ctx.translate(ast.x, ast.y);
        this.ctx.rotate(ast.rotation);

        this.ctx.fillStyle = '#64748b';
        this.ctx.strokeStyle = '#94a3b8';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        // Desenho poligonal irregular de asteroide
        const r = ast.radius;
        this.ctx.moveTo(r, 0);
        this.ctx.lineTo(r * 0.7, r * 0.8);
        this.ctx.lineTo(-r * 0.5, r * 0.9);
        this.ctx.lineTo(-r * 0.9, r * 0.2);
        this.ctx.lineTo(-r * 0.6, -r * 0.8);
        this.ctx.lineTo(r * 0.4, -r * 0.9);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
      }

      // 4. Frota Alienígena
      for (const alien of this.alienFleet) {
        if (!alien.alive) continue;
        this.drawAlien(alien);
      }

      // 5. Chefão de Fase
      if (this.boss && this.boss.alive && this.boss.hp > 0) {
        this.drawBoss(this.boss);
      }

      // 6. Tiros do Jogador e dos Inimigos
      this.ctx.save();
      for (const b of this.playerBullets) {
        this.ctx.fillStyle = b.color;
        this.ctx.shadowColor = b.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fillRect(b.x - 2, b.y, 4, 14);
      }

      for (const b of this.alienBullets) {
        this.ctx.fillStyle = b.color;
        this.ctx.shadowColor = b.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fillRect(b.x - 2, b.y, 4, 12);
      }
      this.ctx.restore();

      // 7. Nave do Jogador (Blue Fox Starfighter)
      if (this.state === 'PLAYING') {
        this.drawPlayerShip();
      }

      // 8. Partículas
      this.ctx.save();
      for (const p of this.particles) {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    drawPlayerShip() {
      const px = this.player.x;
      const py = this.player.y;
      const isInvul = performance.now() < this.player.invulnerableUntil;

      this.ctx.save();

      // Efeito de piscar durante invulnerabilidade pós-dano
      if (isInvul && Math.floor(performance.now() / 100) % 2 === 0) {
        this.ctx.globalAlpha = 0.35;
      }

      // Jato Propulsor Duplo (Chamas azuis animadas em direção para trás = voo para frente!)
      const flameH = (Math.random() * 12 + 16) * (this.isWarping ? 3.5 : 1.0);
      const thrusterGrad = this.ctx.createLinearGradient(px, py + 16, px, py + 16 + flameH);
      thrusterGrad.addColorStop(0, '#ffffff');
      thrusterGrad.addColorStop(0.3, '#38b6ff');
      thrusterGrad.addColorStop(0.8, '#8b5cf6');
      thrusterGrad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = thrusterGrad;
      // Propulsor esquerdo
      this.ctx.beginPath();
      this.ctx.moveTo(px - 12, py + 16);
      this.ctx.lineTo(px - 8, py + 16 + flameH);
      this.ctx.lineTo(px - 4, py + 16);
      this.ctx.fill();
      // Propulsor direito
      this.ctx.beginPath();
      this.ctx.moveTo(px + 4, py + 16);
      this.ctx.lineTo(px + 8, py + 16 + flameH);
      this.ctx.lineTo(px + 12, py + 16);
      this.ctx.fill();

      // Fuselagem da Blue Fox Starfighter
      // Asas
      this.ctx.fillStyle = '#1e3a8a';
      this.ctx.strokeStyle = '#38b6ff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(px, py - 22);
      this.ctx.lineTo(px + 22, py + 14);
      this.ctx.lineTo(px + 14, py + 18);
      this.ctx.lineTo(px, py + 10);
      this.ctx.lineTo(px - 14, py + 18);
      this.ctx.lineTo(px - 22, py + 14);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Cabine do Piloto (Cockpit de Vidro Azul Fluorescente)
      this.ctx.fillStyle = '#38b6ff';
      this.ctx.beginPath();
      this.ctx.moveTo(px, py - 14);
      this.ctx.lineTo(px + 5, py + 2);
      this.ctx.lineTo(px, py + 6);
      this.ctx.lineTo(px - 5, py + 2);
      this.ctx.closePath();
      this.ctx.fill();

      // Orelhas da Raposa Azul estilizadas na nave
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.beginPath();
      this.ctx.moveTo(px - 7, py - 6);
      this.ctx.lineTo(px - 12, py - 16);
      this.ctx.lineTo(px - 5, py - 10);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.moveTo(px + 7, py - 6);
      this.ctx.lineTo(px + 12, py - 16);
      this.ctx.lineTo(px + 5, py - 10);
      this.ctx.fill();

      // Campo de Força de Plasma (se tiver escudos ativos)
      if (this.player.shields > 0) {
        this.ctx.strokeStyle = 'rgba(56, 182, 255, 0.4)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(px, py, 28, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      this.ctx.restore();
    }

    drawAlien(alien) {
      this.ctx.save();
      const ax = alien.x;
      const ay = alien.y;
      const w = alien.width;
      const h = alien.height;

      this.ctx.fillStyle = alien.color;
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1;

      if (alien.type === 'vanguard') {
        // Bio-dreadnought com presas frontais
        this.ctx.beginPath();
        this.ctx.moveTo(ax + w / 2, ay + h);
        this.ctx.lineTo(ax + w, ay);
        this.ctx.lineTo(ax + w * 0.7, ay + h * 0.3);
        this.ctx.lineTo(ax + w / 2, ay);
        this.ctx.lineTo(ax + w * 0.3, ay + h * 0.3);
        this.ctx.lineTo(ax, ay);
        this.ctx.closePath();
        this.ctx.fill();
        // Núcleo pulsante
        this.ctx.fillStyle = '#ffedd5';
        this.ctx.fillRect(ax + w / 2 - 2, ay + h * 0.4, 4, 4);
      } else if (alien.type === 'interceptor') {
        // Interceptador com asas em delta invertido
        this.ctx.beginPath();
        this.ctx.moveTo(ax + w / 2, ay);
        this.ctx.lineTo(ax + w, ay + h * 0.7);
        this.ctx.lineTo(ax + w * 0.6, ay + h);
        this.ctx.lineTo(ax + w / 2, ay + h * 0.6);
        this.ctx.lineTo(ax + w * 0.4, ay + h);
        this.ctx.lineTo(ax, ay + h * 0.7);
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        // Scout ágil clássico
        this.ctx.beginPath();
        this.ctx.arc(ax + w / 2, ay + h / 2, w / 2.6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#030814';
        this.ctx.fillRect(ax + 8, ay + 10, 4, 6);
        this.ctx.fillRect(ax + w - 12, ay + 10, 4, 6);
      }

      this.ctx.restore();
    }

    drawBoss(boss) {
      this.ctx.save();
      const bx = boss.x;
      const by = boss.y;
      const w = boss.width;
      const h = boss.height;

      // Barra de Vida do Chefe no topo
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      this.ctx.fillRect(bx, by - 14, w, 6);
      const hpRatio = Math.max(0, boss.hp / boss.maxHp);
      this.ctx.fillStyle = hpRatio > 0.4 ? '#ef4444' : '#f59e0b';
      this.ctx.fillRect(bx, by - 14, w * hpRatio, 6);

      // Nome do Chefe
      this.ctx.font = 'bold 10px monospace';
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(boss.name, bx + w / 2, by - 18);

      // Corpo da Nave-Mãe / Coletor Solar
      const grad = this.ctx.createLinearGradient(bx, by, bx + w, by + h);
      grad.addColorStop(0, '#7f1d1d');
      grad.addColorStop(0.5, '#dc2626');
      grad.addColorStop(1, '#991b1b');

      this.ctx.fillStyle = grad;
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 2;

      this.ctx.beginPath();
      this.ctx.moveTo(bx + w / 2, by + h);
      this.ctx.lineTo(bx + w, by + h * 0.4);
      this.ctx.lineTo(bx + w * 0.8, by);
      this.ctx.lineTo(bx + w * 0.2, by);
      this.ctx.lineTo(bx, by + h * 0.4);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Canhões de Plasma Laterais
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.fillRect(bx + 10, by + h - 8, 8, 12);
      this.ctx.fillRect(bx + w - 18, by + h - 8, 8, 12);

      this.ctx.restore();
    }

    // -------------------------------------------------------------
    // Transições de Fase e Vitória
    // -------------------------------------------------------------
    triggerHyperWarp() {
      if (this.isWarping) return;
      this.isWarping = true;
      this.warpTimer = 0;
      this.audio.playWarpSound();
    }

    finishStageVictory() {
      this.isWarping = false;
      this.state = 'VICTORY';

      const s = this.currentStage;
      const nextStageId = s.id + 1;

      // Desbloqueia próximo estágio e upgrade
      if (!this.saveData.completedStages.includes(s.id)) {
        this.saveData.completedStages.push(s.id);
      }

      if (s.unlocksUpgrade && !this.saveData.unlockedUpgrades.includes(s.unlocksUpgrade.key)) {
        this.saveData.unlockedUpgrades.push(s.unlocksUpgrade.key);
      }

      if (nextStageId <= this.stages.length && this.saveData.highestStageUnlocked < nextStageId) {
        this.saveData.highestStageUnlocked = nextStageId;
      }

      if (this.score > this.saveData.highScore) {
        this.saveData.highScore = this.score;
      }

      this.saveProgress();
      this.applyUpgrades();
      this.renderSolarMap();

      // Configurar Modal de Vitória
      const isFinalStage = s.id === this.stages.length;

      this.ui.victoryTitle.textContent = isFinalStage
        ? '🏆 DEFESA DA VIA LÁCTEA COMPLETA!'
        : `✨ VITÓRIA EM ${s.name.toUpperCase()}!`;

      this.ui.victorySubtitle.textContent = isFinalStage
        ? 'O Sistema Solar está seguro e a Horda do Vazio foi repelida!'
        : `A rota para o próximo corpo celeste foi liberada com sucesso.`;

      this.ui.victoryText.textContent = isFinalStage
        ? this.story.GLOBAL_STORY.epilogue.join('\n')
        : `Pontuação nesta defesa: ${this.score} pts.\nParabéns Comandante, os sensores de longo alcance confirmam retirada inimiga nesta órbita!`;

      if (s.unlocksUpgrade) {
        this.ui.victoryUpgradeBox.hidden = false;
        this.ui.victoryUpgradeBox.innerHTML = `
          <div class="reward-icon">${s.unlocksUpgrade.icon}</div>
          <div class="reward-info">
            <h4>UPGRADE DESBLOQUEADO: ${s.unlocksUpgrade.name}</h4>
            <p>${s.unlocksUpgrade.desc}</p>
          </div>
        `;
        this.audio.playPowerupChime();
      } else {
        this.ui.victoryUpgradeBox.hidden = true;
      }

      this.ui.btnNextStage.hidden = isFinalStage;
      this.hideAllScreens();
      this.ui.screenVictory.hidden = false;
    }

    gameOver() {
      this.state = 'GAMEOVER';
      this.hideAllScreens();
      this.ui.gameOverScore.textContent = `Pontuação final: ${this.score}`;
      this.ui.screenGameOver.hidden = false;
    }

    // -------------------------------------------------------------
    // Telas e Modais de Interface
    // -------------------------------------------------------------
    hideAllScreens() {
      this.ui.screenCrawl.hidden = true;
      this.ui.screenBriefing.hidden = true;
      this.ui.screenSolarMap.hidden = true;
      this.ui.screenVictory.hidden = true;
      this.ui.screenGameOver.hidden = true;
      this.ui.screenPause.hidden = true;
    }

    showCrawl() {
      this.state = 'CRAWL';
      this.hideAllScreens();

      const lines = this.story.GLOBAL_STORY.introCrawl || [];
      this.ui.crawlTextContainer.innerHTML = lines
        .map((l) => (l.trim() === '' ? '<br/>' : `<p class="crawl-text">${l}</p>`))
        .join('');

      this.ui.screenCrawl.hidden = false;
    }

    showBriefing(stageIndex) {
      this.state = 'BRIEFING';
      const s = this.stages[stageIndex];
      if (!s) return;

      this.currentStageIndex = stageIndex;
      this.currentStage = s;

      this.hideAllScreens();
      this.ui.briefingBadge.textContent = `FASE ${s.id} DE 11`;
      this.ui.briefingCoords.textContent = `${s.distanceAU.toFixed(2)} AU (${s.distanceFromSun})`;
      this.ui.briefingTitle.textContent = s.name;
      this.ui.briefingCodename.textContent = `Operação: ${s.codename}`;
      this.ui.briefingStory.textContent = s.story;
      this.ui.briefingPilotLog.textContent = `"${s.pilotLog}"`;

      if (s.unlocksUpgrade) {
        this.ui.briefingReward.hidden = false;
        this.ui.briefingReward.innerHTML = `
          <div class="reward-icon">${s.unlocksUpgrade.icon}</div>
          <div class="reward-info">
            <h4>Recompensa de Vitória: ${s.unlocksUpgrade.name}</h4>
            <p>${s.unlocksUpgrade.desc}</p>
          </div>
        `;
      } else {
        this.ui.briefingReward.hidden = true;
      }

      this.ui.screenBriefing.hidden = false;
    }

    showSolarMap() {
      this.state = 'MAP';
      this.hideAllScreens();
      this.renderSolarMap();
      this.ui.screenSolarMap.hidden = false;
    }

    renderSolarMap() {
      if (!this.ui.solarStagesList) return;
      this.ui.solarStagesList.innerHTML = '';

      const highest = this.saveData.highestStageUnlocked || 1;
      const completed = this.saveData.completedStages || [];

      this.stages.forEach((stage, idx) => {
        const card = document.createElement('div');
        const isLocked = stage.id > highest;
        const isCompleted = completed.includes(stage.id);

        card.className = `stage-solar-card ${isLocked ? 'locked' : ''} ${
          idx === this.currentStageIndex ? 'active' : ''
        }`;

        card.innerHTML = `
          <div class="stage-solar-header">
            <span class="stage-solar-num">#${stage.id} · ${stage.distanceAU.toFixed(2)} AU</span>
            <span>${isCompleted ? '⭐' : isLocked ? '🔒' : '🚀'}</span>
          </div>
          <h3 class="stage-solar-name">${stage.name}</h3>
          <div class="stage-solar-codename">${stage.codename}</div>
          ${
            stage.wave.boss
              ? `<span style="font-size:0.7rem; color:#ef4444; font-weight:bold;">⚔️ CHEFÃO</span>`
              : ''
          }
        `;

        if (!isLocked) {
          card.onclick = () => {
            this.showBriefing(idx);
          };
        }

        this.ui.solarStagesList.appendChild(card);
      });
    }

    updateHud() {
      if (!this.currentStage) return;

      this.ui.hudStageName.textContent = this.currentStage.name;
      this.ui.hudCoords.textContent = `${this.currentStage.distanceAU.toFixed(2)} AU`;
      this.ui.hudWave.textContent = `Fase ${this.currentStage.id}/11`;
      this.ui.hudScore.textContent = this.score.toString().padStart(6, '0');

      // Vidas representadas por naves
      let livesIcons = '';
      for (let i = 0; i < this.player.lives; i++) {
        livesIcons += '🚀 ';
      }
      this.ui.hudLives.textContent = livesIcons || '💀';

      // Barra de Escudo de Plasma
      const shieldPct = Math.max(0, Math.min(100, (this.player.shields / this.player.maxShields) * 100));
      this.ui.hudShieldsFill.style.width = `${shieldPct}%`;
      if (shieldPct < 30) {
        this.ui.hudShieldsFill.style.background = 'var(--hud-danger)';
      } else {
        this.ui.hudShieldsFill.style.background = 'linear-gradient(90deg, var(--hud-cyan), var(--hud-violet))';
      }

      // Bombas
      this.ui.hudBombs.textContent = this.player.bombs;
    }

    // -------------------------------------------------------------
    // Eventos e Entradas
    // -------------------------------------------------------------
    bindEvents() {
      // Teclado
      window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          this.keys.left = true;
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          this.keys.right = true;
        } else if (e.code === 'Space' || e.code === 'ArrowUp') {
          this.keys.fire = true;
        } else if (e.code === 'KeyB') {
          this.keys.bomb = true;
        } else if (e.code === 'KeyP' || e.code === 'Escape') {
          this.togglePause();
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          this.keys.left = false;
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          this.keys.right = false;
        } else if (e.code === 'Space' || e.code === 'ArrowUp') {
          this.keys.fire = false;
        } else if (e.code === 'KeyB') {
          this.keys.bomb = false;
        }
      });

      // Controles Virtuais Touch para Celular / Tablet
      if (this.ui.btnTouchLeft) {
        this.bindTouchButton(this.ui.btnTouchLeft, (down) => (this.keys.left = down));
        this.bindTouchButton(this.ui.btnTouchRight, (down) => (this.keys.right = down));
        this.bindTouchButton(this.ui.btnTouchFire, (down) => (this.keys.fire = down));
        this.bindTouchButton(this.ui.btnTouchBomb, (down) => {
          if (down) this.keys.bomb = true;
        });
      }

      // Botões de Menus e Modais
      this.ui.btnSkipCrawl.onclick = () => {
        this.saveData.hasSeenIntro = true;
        this.saveProgress();
        this.showSolarMap();
      };

      this.ui.btnShowCrawl.onclick = () => {
        this.showCrawl();
      };

      this.ui.btnResumeFromMap.onclick = () => {
        this.showBriefing(this.currentStageIndex);
      };

      this.ui.btnLaunchStage.onclick = () => {
        this.startStage(this.currentStageIndex);
      };

      this.ui.btnBackToMapFromBriefing.onclick = () => {
        this.showSolarMap();
      };

      this.ui.btnNextStage.onclick = () => {
        if (this.currentStageIndex < this.stages.length - 1) {
          this.showBriefing(this.currentStageIndex + 1);
        } else {
          this.showSolarMap();
        }
      };

      this.ui.btnVictoryMap.onclick = () => {
        this.showSolarMap();
      };

      this.ui.btnRetryStage.onclick = () => {
        this.player.lives = 3;
        this.player.bombs = 1;
        this.startStage(this.currentStageIndex);
      };

      this.ui.btnGameOverMap.onclick = () => {
        this.showSolarMap();
      };

      this.ui.btnSoundToggle.onclick = () => {
        const isMuted = this.audio.toggleMute();
        this.ui.btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
      };

      this.ui.btnMapToggle.onclick = () => {
        this.showSolarMap();
      };

      this.ui.btnPauseToggle.onclick = () => {
        this.togglePause();
      };

      this.ui.btnResumePause.onclick = () => {
        this.togglePause();
      };

      this.ui.btnQuitToMap.onclick = () => {
        this.showSolarMap();
      };
    }

    bindTouchButton(elem, callback) {
      elem.addEventListener('touchstart', (e) => {
        e.preventDefault();
        callback(true);
      });
      elem.addEventListener('touchend', (e) => {
        e.preventDefault();
        callback(false);
      });
      elem.addEventListener('mousedown', (e) => {
        e.preventDefault();
        callback(true);
      });
      elem.addEventListener('mouseup', (e) => {
        e.preventDefault();
        callback(false);
      });
      elem.addEventListener('mouseleave', () => {
        callback(false);
      });
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        this.ui.screenPause.hidden = false;
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.ui.screenPause.hidden = true;
        this.lastFrameTime = performance.now();
      }
    }
  }

  // Inicialização quando a página carregar
  window.addEventListener('DOMContentLoaded', () => {
    window.milkyWayDefense = new MilkyWayDefenseGame();
  });
})();
