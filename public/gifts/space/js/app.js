/**
 * Interstellar Journey — Application Controller
 * Drives the HUD, warp choreography, telemetry, odometer, flight log,
 * keyboard/swipe navigation and the closing scene.
 */

class InterstellarJourney {
  constructor() {
    this.config = window.SPACE_DATE_CONFIG;
    this.stops = this.config.planetStops;
    this.route = this.stops.filter(s => !s.secret);       // the seven public worlds
    this.lastRouteIndex = this.route.length - 1;
    this.secretIndex = this.stops.findIndex(s => s.secret);
    this.warpDuration = this.config.warpDuration || window.WARP_MS || 2800;
    this.currentStopIndex = 0;
    this.currentDistance = 0;
    this.isTransitioning = false;
    this.odometerAnimationId = null;
    this.timers = [];
    this.autoConfig = this.config.autoPilot || { enabled: true, holdMs: 7000 };
    this.autoPilot = this.autoConfig.enabled !== false;
    this.autoTimer = null;

    const $ = (id) => document.getElementById(id);
    this.dom = {
      canvasContainer: $('space-canvas-container'),
      lightSweep: $('light-sweep'),
      warpFlash: $('warp-flash'),
      sceneIntro: $('scene-intro'),
      introTextLine: $('intro-text-line'),
      btnStartTrip: $('btn-start-trip'),
      btnStartTripText: $('btn-start-trip-text'),
      btnStartManual: $('btn-start-manual'),
      crewEditor: $('crew-editor'),
      inputRecipient: $('input-recipient'),
      inputSender: $('input-sender'),
      crewNameA: $('crew-name-a'),
      crewNameB: $('crew-name-b'),
      btnRestart: $('btn-restart'),
      btnAutopilot: $('btn-autopilot'),
      autopilotIcon: $('autopilot-icon'),
      autoCountdown: $('auto-countdown'),
      autoCountdownBar: $('auto-countdown-bar'),
      headerHud: $('header-hud'),
      footerHud: $('footer-hud'),
      telemetry: $('telemetry'),
      telemetryShip: $('telemetry-ship'),
      telemetryVelocity: $('telemetry-velocity'),
      telemetryTime: $('telemetry-time'),
      hudStatus: $('hud-status-text'),
      btnSoundToggle: $('btn-sound-toggle'),
      audioVisualizer: $('audio-visualizer'),
      btnFlightLog: $('btn-flight-log'),
      flightLogModal: $('flight-log-modal'),
      flightLogList: $('flight-log-list'),
      btnCloseLog: $('btn-close-log'),
      planetStoryCard: $('planet-story-card'),
      stopSubTag: $('stop-sub-tag'),
      stopPlanetTitle: $('stop-planet-title'),
      stopPlanetCaption: $('stop-planet-caption'),
      stopPlanetQuote: $('stop-planet-quote'),
      warpBanner: $('warp-banner'),
      warpBannerTarget: $('warp-banner-target'),
      warpProgressBar: $('warp-progress-bar'),
      distanceCounter: $('distance-counter'),
      routeTimeline: $('route-timeline'),
      btnNavPrev: $('btn-nav-prev'),
      btnNavNext: $('btn-nav-next'),
      btnNextLabel: $('btn-next-label'),
      sceneEnd: $('scene-end'),
      endBadge: $('end-badge'),
      endTitle: $('end-title'),
      endMessage: $('end-message'),
      endFooter: $('end-footer'),
      btnKeepDrifting: $('btn-keep-drifting'),
      btnSurprise: $('btn-surprise'),
      btnReplayTrip: $('btn-replay-trip')
    };

    this.init();
  }

  init() {
    this.loadNames();
    this.populateConfigText();
    this.buildRouteTimeline();
    this.buildFlightLog();

    this.spaceScene = new window.SpaceScene(this.dom.canvasContainer);
    this.spaceScene.onWarpStart = (stop) => this.onWarpStart(stop);
    this.spaceScene.onWarpArrive = () => this.onWarpArrive();

    this.bindEvents();

    const params = new URLSearchParams(window.location.search);
    const targetStop = params.get('stop');
    const skipIntro = params.get('skipIntro') === 'true' || !!targetStop || params.get('end') === 'true';

    if (skipIntro) {
      this.dom.sceneIntro.style.display = 'none';
      this.revealHud();
      let index = 0;
      if (targetStop) {
        const found = this.stops.findIndex(s => s.id.toLowerCase() === targetStop.toLowerCase());
        if (found !== -1) index = found;
      } else if (params.get('end') === 'true') {
        index = this.lastRouteIndex;
      }
      this.goToStop(index, true);
      if (params.get('end') === 'true') this.showEndScene('end');
    } else {
      // Earth is already on screen behind the opening titles
      this.spaceScene.goToStop(0, true);
      this.runIntroSequence();
    }
  }

  /* ---------------------------------------------------------------- names */
  /** Names come from the URL (?her=&me=), then the browser, then the config. */
  loadNames() {
    const params = new URLSearchParams(window.location.search);
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('journey-crew') || '{}'); } catch (e) { saved = {}; }

    // An early build stored the placeholders as if they were real names — drop those
    const isPlaceholder = (v) => ['you', 'me'].includes(String(v || '').trim().toLowerCase());

    this.names = {
      recipient: params.get('her') || (isPlaceholder(saved.recipient) ? '' : saved.recipient) || this.config.recipientName || '',
      sender: params.get('me') || (isPlaceholder(saved.sender) ? '' : saved.sender) || this.config.senderName || ''
    };
    this.applyNames();
  }

  saveNames() {
    try { localStorage.setItem('journey-crew', JSON.stringify(this.names)); } catch (e) { /* private mode */ }
  }

  /** Pushes the current names into every place they appear. */
  applyNames(skipInputs = false) {
    const a = (this.names.recipient || '').trim();
    const b = (this.names.sender || '').trim();

    if (!skipInputs) {
      if (this.dom.inputRecipient) this.dom.inputRecipient.value = a;
      if (this.dom.inputSender) this.dom.inputSender.value = b;
    }
    // The HUD spans stay literally empty when there is no name — the
    // placeholder is drawn in CSS, so it can never be saved as a real name.
    if (this.dom.crewNameA && this.dom.crewNameA.textContent !== a) this.dom.crewNameA.textContent = a;
    if (this.dom.crewNameB && this.dom.crewNameB.textContent !== b) this.dom.crewNameB.textContent = b;
  }

  /* ---------------------------------------------------------------- setup */
  populateConfigText() {
    const c = this.config;
    if (c.ctaButtonText) this.dom.btnStartTripText.textContent = c.ctaButtonText;
    if (c.shipName) this.dom.telemetryShip.textContent = c.shipName;
    const ph = c.namePlaceholders || {};
    if (ph.recipient) this.dom.inputRecipient.placeholder = ph.recipient;
    if (ph.sender) this.dom.inputSender.placeholder = ph.sender;

    const end = c.journeyEnd || {};
    if (end.badge) this.dom.endBadge.textContent = end.badge;
    if (end.title) this.dom.endTitle.textContent = end.title;
    if (end.message) this.dom.endMessage.textContent = end.message;
    if (end.footer) this.dom.endFooter.textContent = end.footer;
    if (end.btnReplay) this.dom.btnReplayTrip.textContent = end.btnReplay;
    if (end.btnSurprise) this.dom.btnSurprise.textContent = end.btnSurprise;
  }

  buildRouteTimeline() {
    this.dom.routeTimeline.innerHTML = '';
    this.route.forEach((stop, idx) => {
      const dot = document.createElement('button');
      dot.className = `timeline-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('title', stop.name);
      dot.setAttribute('aria-label', `Travel to ${stop.name}`);
      dot.addEventListener('click', () => {
        if (this.isTransitioning || idx === this.currentStopIndex) return;
        this.takeManualControl();
        this.goToStop(idx);
      });
      this.dom.routeTimeline.appendChild(dot);
    });
  }

  buildFlightLog() {
    this.dom.flightLogList.innerHTML = '';
    this.route.forEach((stop, i) => {
      const item = document.createElement('div');
      item.className = 'log-entry-item';
      item.id = `log-item-${i}`;
      item.innerHTML = `
        <div class="log-entry-header">
          <span>${String(i + 1).padStart(2, '0')}. ${stop.name.toUpperCase()}</span>
          <span>${this.formatDistance(stop.distance)}</span>
        </div>
        <div class="log-entry-text">${stop.logEntry || stop.caption}</div>
      `;
      this.dom.flightLogList.appendChild(item);
    });
  }

  markLogVisited(index) {
    const item = document.getElementById(`log-item-${index}`);
    if (item) item.classList.add('visited');
  }

  /* ---------------------------------------------------------------- intro */
  runIntroSequence() {
    this.introStep = 0;
    this.introRunning = true;
    this.showIntroLine(0);
  }

  showIntroLine(index) {
    const seq = this.config.introSequence || [];
    this.clearIntroTimers();

    if (index >= seq.length) {
      this.introRunning = false;
      this.revealStartControls();
      return;
    }

    const item = seq[index];
    this.introStep = index;
    this.dom.introTextLine.classList.remove('active');

    this.timers.push(setTimeout(() => {
      this.dom.introTextLine.textContent = item.text;
      this.dom.introTextLine.classList.add('active');
      this.timers.push(setTimeout(() => this.showIntroLine(index + 1), item.duration));
    }, index === 0 ? item.delay : Math.min(item.delay, 450)));
  }

  /** A tap moves on to the next line rather than jumping to the end. */
  advanceIntro() {
    if (!this.introRunning) {
      this.revealStartControls();
      return;
    }
    this.showIntroLine(this.introStep + 1);
  }

  clearIntroTimers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  skipIntro() {
    this.clearIntroTimers();
    this.introRunning = false;
    const seq = this.config.introSequence || [];
    const last = seq[seq.length - 1];
    this.dom.introTextLine.textContent = last ? last.text : 'Ready?';
    this.dom.introTextLine.classList.add('active');
    this.revealStartControls();
  }

  revealStartControls() {
    this.dom.crewEditor.classList.add('visible');
    this.dom.btnStartTrip.classList.add('visible');
  }

  revealHud() {
    this.dom.headerHud.classList.add('visible');
    this.dom.footerHud.classList.add('visible');
    this.dom.telemetry.classList.add('visible');
  }

  startJourney(autoPilot = true) {
    this.setAutoPilot(autoPilot, true);

    if (window.spaceAudio) {
      window.spaceAudio.start();
      this.dom.audioVisualizer.classList.add('playing');
    }

    this.dom.sceneIntro.classList.add('fade-out');
    setTimeout(() => {
      this.dom.sceneIntro.style.display = 'none';
      this.revealHud();
      this.goToStop(0, true);
    }, 900);
  }

  /* ------------------------------------------------------------ autopilot */
  /** Header pill: flight mode + what the ship is doing right now. */
  updateStatus(state) {
    if (state) this.statusState = state;
    const mode = this.autoPilot ? 'AUTOPILOT' : 'MANUAL';
    this.dom.hudStatus.textContent = `${mode} · ${this.statusState || 'IN ORBIT'}`;
  }

  setAutoPilot(on, silent = false) {
    this.autoPilot = !!on;
    this.updateStatus();
    this.dom.btnAutopilot.classList.toggle('engaged', this.autoPilot);
    this.dom.autopilotIcon.textContent = this.autoPilot ? '❚❚' : '▶';
    this.dom.btnAutopilot.title = this.autoPilot ? 'Autopilot on — pause it' : 'Autopilot off — resume';

    if (this.autoPilot) {
      if (!silent) this.scheduleAutoJump();
    } else {
      this.clearAutoJump();
    }
  }

  clearAutoJump() {
    if (this.autoTimer) clearTimeout(this.autoTimer);
    this.autoTimer = null;
    const bar = this.dom.autoCountdownBar;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    this.dom.autoCountdown.classList.remove('visible');
  }

  /** Holds in orbit for a beat, then jumps to the next world on its own. */
  scheduleAutoJump() {
    this.clearAutoJump();
    if (!this.autoPilot) return;
    if (this.currentStopIndex >= this.lastRouteIndex) return;
    if (this.dom.sceneEnd.classList.contains('visible')) return;

    const hold = this.autoConfig.holdMs || 7000;
    this.dom.autoCountdown.classList.add('visible');

    const bar = this.dom.autoCountdownBar;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${hold}ms linear`;
      bar.style.width = '100%';
    });

    this.autoTimer = setTimeout(() => {
      this.autoTimer = null;
      if (this.autoPilot && !this.isTransitioning) this.goToStop(this.currentStopIndex + 1);
    }, hold);
  }

  /** Any manual input takes the wheel back from the autopilot. */
  takeManualControl() {
    if (this.autoPilot) this.setAutoPilot(false);
    else this.clearAutoJump();
  }

  /* ------------------------------------------------------------ traveling */
  goToStop(index, immediate = false) {
    if (index < 0 || index >= this.stops.length) return;

    const stop = this.stops[index];
    this.currentStopIndex = index;
    this.isTransitioning = !immediate;

    this.dom.sceneEnd.classList.remove('visible');
    this.clearAutoJump();

    // 3D layer
    this.spaceScene.goToStop(index, immediate);

    // Timeline dots
    this.dom.routeTimeline.querySelectorAll('.timeline-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
      dot.classList.toggle('completed', idx < index);
    });

    // Ambient colour grade
    this.dom.lightSweep.style.background =
      `radial-gradient(ellipse 95% 55% at 50% 88%, ${stop.glowColor || 'rgba(56,189,248,0.25)'} 0%, transparent 72%)`;
    document.documentElement.style.setProperty('--accent-live', stop.accentColor || '#38bdf8');

    // Story card
    this.dom.planetStoryCard.classList.remove('visible');
    const reveal = () => {
      const isFirst = index === 0;
      this.dom.stopSubTag.textContent = isFirst
        ? 'DEPARTURE'
        : stop.secret
          ? 'THE SURPRISE'
          : `WORLD ${String(index + 1).padStart(2, '0')} / ${String(this.route.length).padStart(2, '0')}`;
      this.dom.stopSubTag.style.color = stop.accentColor || '#38bdf8';
      this.dom.stopPlanetTitle.textContent = stop.name;
      this.dom.stopPlanetCaption.textContent = stop.caption;
      this.dom.stopPlanetQuote.textContent = stop.quote || '';
      this.dom.warpBanner.classList.remove('visible');
      this.dom.planetStoryCard.classList.add('visible');
      this.dom.telemetryVelocity.textContent = stop.velocity;
      this.dom.telemetryTime.textContent = stop.travelTime;
      this.updateStatus(stop.secret ? 'SOLAR ORBIT' : (index === this.lastRouteIndex ? 'FINAL ORBIT' : 'IN ORBIT'));
      if (window.spaceAudio && !immediate) window.spaceAudio.playStellarChime();
    };

    if (immediate) reveal();
    else setTimeout(reveal, this.warpDuration * 0.62);

    // Odometer
    this.animateDistance(stop.distance, immediate ? 0 : this.warpDuration * 0.8);

    // Navigation state
    this.dom.btnNavPrev.disabled = index === 0;
    if (stop.secret) {
      this.dom.btnNavNext.style.display = 'none';
    } else if (index < this.lastRouteIndex) {
      const next = this.stops[index + 1];
      this.dom.btnNextLabel.textContent = next.label || `Set course: ${next.name}`;
      this.dom.btnNavNext.classList.remove('is-final');
      this.dom.btnNavNext.style.display = 'inline-flex';
    } else {
      this.dom.btnNextLabel.textContent = 'End of the line';
      this.dom.btnNavNext.classList.add('is-final');
      this.dom.btnNavNext.style.display = 'inline-flex';
    }

    this.markLogVisited(index);

    if (!immediate) {
      setTimeout(() => {
        this.isTransitioning = false;
        this.scheduleAutoJump();
      }, this.warpDuration);
    } else if (this.autoPilot) {
      this.scheduleAutoJump();
    }

    // The heart only comes forward at the secret stop
    this.spaceScene.setHeartFocus(!!stop.secret);

    if (stop.secret) {
      this.clearAutoJump();
      this.addSecretLogEntry();
      setTimeout(() => this.showEndScene('surprise'), immediate ? 600 : this.warpDuration + 5200);
    } else if (index === this.lastRouteIndex) {
      this.clearAutoJump();
      this.spaceScene.glowHeartConstellation();
      setTimeout(() => this.showEndScene('end'), immediate ? 400 : this.warpDuration + 1400);
    }
  }

  /** Fired by the engine the moment the warp drive kicks in. */
  onWarpStart(stop) {
    this.dom.planetStoryCard.classList.remove('visible');
    this.updateStatus('WARP');
    this.dom.warpBannerTarget.textContent = `Destination · ${stop.name}`;
    this.dom.warpBanner.classList.add('visible');
    this.dom.telemetryVelocity.textContent = stop.velocity;
    this.dom.telemetryTime.textContent = stop.travelTime;

    // Progress bar tied to the real jump duration
    const bar = this.dom.warpProgressBar;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${this.warpDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      bar.style.width = '100%';
    });

    this.dom.warpFlash.classList.add('firing');
    setTimeout(() => this.dom.warpFlash.classList.remove('firing'), 900);
  }

  /** Fired as the new world resolves out of the distance. */
  onWarpArrive() {
    this.dom.warpBanner.classList.remove('visible');
  }

  animateDistance(target, duration = 1500) {
    if (this.odometerAnimationId) cancelAnimationFrame(this.odometerAnimationId);

    if (duration === 0) {
      this.currentDistance = target;
      this.dom.distanceCounter.textContent = this.formatDistance(target);
      return;
    }

    const start = this.currentDistance;
    const t0 = performance.now();

    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      this.currentDistance = Math.floor(start + (target - start) * ease);
      this.dom.distanceCounter.textContent = this.formatDistance(this.currentDistance);
      if (p < 1) this.odometerAnimationId = requestAnimationFrame(tick);
      else {
        this.currentDistance = target;
        this.dom.distanceCounter.textContent = this.formatDistance(target);
      }
    };
    this.odometerAnimationId = requestAnimationFrame(tick);
  }

  formatDistance(dist) {
    return `${dist.toLocaleString('en-US')} ${this.config.distanceUnits || 'km'}`;
  }

  /* ------------------------------------------------------------------ end */
  /** 'end' = the route is done; 'surprise' = the secret stop at the Sun. */
  showEndScene(variant = 'end') {
    const isSurprise = variant === 'surprise';
    const copy = isSurprise ? (this.config.surprise || {}) : (this.config.journeyEnd || {});

    if (copy.badge) this.dom.endBadge.textContent = copy.badge;
    if (copy.title) this.dom.endTitle.textContent = copy.title;
    if (copy.message) this.dom.endMessage.textContent = this.fillNames(copy.message);
    if (copy.footer) this.dom.endFooter.textContent = this.fillNames(copy.footer);

    this.dom.sceneEnd.classList.toggle('is-surprise', isSurprise);
    this.dom.btnSurprise.style.display = isSurprise ? 'none' : 'inline-flex';
    this.dom.btnKeepDrifting.style.display = isSurprise ? 'none' : 'inline-flex';

    if (window.spaceAudio) window.spaceAudio.playYesCelebration();
    this.dom.sceneEnd.classList.add('visible');
    this.createStardustBurst();
  }

  /** Swaps {her} / {me} for whatever the crew is called right now. */
  fillNames(text) {
    return String(text)
      .replace(/\{her\}/g, (this.names.recipient || '').trim() || 'you')
      .replace(/\{me\}/g, (this.names.sender || '').trim() || 'me');
  }

  /** The Sun only shows up in the flight log once you've actually been there. */
  addSecretLogEntry() {
    if (document.getElementById('log-item-secret')) return;
    const stop = this.stops[this.secretIndex];
    if (!stop) return;

    const item = document.createElement('div');
    item.className = 'log-entry-item visited secret';
    item.id = 'log-item-secret';
    item.innerHTML = `
      <div class="log-entry-header">
        <span>✦ ${stop.name.toUpperCase()}</span>
        <span>${this.formatDistance(stop.distance)}</span>
      </div>
      <div class="log-entry-text">${stop.logEntry || stop.caption}</div>
    `;
    this.dom.flightLogList.appendChild(item);
  }

  goToSurprise() {
    if (this.secretIndex < 0 || this.isTransitioning) return;
    this.dom.sceneEnd.classList.remove('visible');
    this.setAutoPilot(false, true);
    if (window.spaceAudio) window.spaceAudio.playButtonTap();
    this.goToStop(this.secretIndex);
  }

  createStardustBurst() {
    const colors = ['#fbbf24', '#ffffff', '#38bdf8', '#f9a8d4', '#a5b4fc'];
    for (let i = 0; i < 54; i++) {
      const dot = document.createElement('div');
      const size = Math.random() * 5 + 2;
      Object.assign(dot.style, {
        position: 'fixed', width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        backgroundColor: colors[i % colors.length], zIndex: '99', pointerEvents: 'none'
      });
      dot.style.boxShadow = `0 0 12px ${dot.style.backgroundColor}`;

      const originX = window.innerWidth * 0.5;
      const originY = window.innerHeight * 0.5;
      dot.style.left = `${originX}px`;
      dot.style.top = `${originY}px`;
      document.body.appendChild(dot);

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 340 + 90;
      dot.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0.2)`, opacity: 0 }
      ], { duration: Math.random() * 1300 + 900, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' })
        .onfinish = () => dot.remove();
    }
  }

  /** Back to the very beginning — opening titles and all. */
  restartFromIntro() {
    this.clearAutoJump();
    this.clearIntroTimers();

    this.dom.sceneEnd.classList.remove('visible');
    this.dom.flightLogModal.classList.remove('active');
    this.dom.warpBanner.classList.remove('visible');
    this.dom.planetStoryCard.classList.remove('visible');
    this.dom.headerHud.classList.remove('visible');
    this.dom.footerHud.classList.remove('visible');
    this.dom.telemetry.classList.remove('visible');

    this.dom.introTextLine.textContent = '';
    this.dom.introTextLine.classList.remove('active');
    this.dom.btnStartTrip.classList.remove('visible');
    this.dom.crewEditor.classList.remove('visible');
    this.dom.sceneIntro.classList.remove('fade-out');
    this.dom.sceneIntro.style.display = 'flex';

    this.currentStopIndex = 0;
    this.currentDistance = 0;
    this.animateDistance(0, 0);
    this.setAutoPilot(this.autoConfig.enabled !== false, true);
    this.spaceScene.goToStop(0, true);

    this.runIntroSequence();
  }

  /* --------------------------------------------------------------- events */
  bindEvents() {
    // Two ways to travel: let it fly itself, or take the controls
    this.dom.btnStartTrip.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startJourney(true);
    });

    this.dom.btnStartManual.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startJourney(false);
    });

    this.dom.sceneIntro.addEventListener('click', (e) => {
      if (e.target.closest('button, input')) return;
      this.advanceIntro();
    });

    // Crew names — typed on the opening screen, remembered in the browser
    const nameFields = [
      [this.dom.inputRecipient, 'recipient'],
      [this.dom.inputSender, 'sender']
    ];
    nameFields.forEach(([field, key]) => {
      field.addEventListener('input', () => {
        this.names[key] = field.value;
        this.applyNames(true);
        this.saveNames();
      });
      field.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') this.startJourney(true);
      });
    });

    // …and editable again from the HUD at any time
    [[this.dom.crewNameA, 'recipient'], [this.dom.crewNameB, 'sender']].forEach(([el, key]) => {
      el.addEventListener('input', () => {
        this.names[key] = el.textContent.replace(/\s+/g, ' ').trim();
        if (this.dom.inputRecipient) this.dom.inputRecipient.value = this.names.recipient;
        if (this.dom.inputSender) this.dom.inputSender.value = this.names.sender;
        this.saveNames();
      });
      el.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
      });
      el.addEventListener('blur', () => this.applyNames());
    });

    // Autopilot toggle
    this.dom.btnAutopilot.addEventListener('click', () => {
      if (window.spaceAudio) window.spaceAudio.playButtonTap();
      this.setAutoPilot(!this.autoPilot);
    });

    this.dom.btnNavNext.addEventListener('click', () => {
      if (this.isTransitioning) return;
      this.takeManualControl();
      if (window.spaceAudio) window.spaceAudio.playButtonTap();
      if (this.currentStopIndex < this.lastRouteIndex) this.goToStop(this.currentStopIndex + 1);
      else this.showEndScene('end');
    });

    this.dom.btnNavPrev.addEventListener('click', () => {
      if (!this.isTransitioning && this.currentStopIndex > 0) {
        this.takeManualControl();
        if (window.spaceAudio) window.spaceAudio.playButtonTap();
        this.goToStop(this.currentStopIndex - 1);
      }
    });

    this.dom.btnSoundToggle.addEventListener('click', () => {
      if (!window.spaceAudio) return;
      const playing = window.spaceAudio.toggleMute();
      this.dom.audioVisualizer.classList.toggle('playing', playing);
    });

    this.dom.btnFlightLog.addEventListener('click', () => this.dom.flightLogModal.classList.add('active'));
    this.dom.btnCloseLog.addEventListener('click', () => this.dom.flightLogModal.classList.remove('active'));

    this.dom.btnSurprise.addEventListener('click', () => this.goToSurprise());

    this.dom.btnKeepDrifting.addEventListener('click', () => {
      this.dom.sceneEnd.classList.remove('visible');
      this.setAutoPilot(false);
    });

    // Both take you back to the opening titles
    this.dom.btnReplayTrip.addEventListener('click', () => this.restartFromIntro());

    this.dom.btnRestart.addEventListener('click', () => {
      if (window.spaceAudio) window.spaceAudio.playButtonTap();
      this.restartFromIntro();
    });

    window.addEventListener('keydown', (e) => {
      if (this.dom.sceneIntro.style.display !== 'none') return;
      if (e.key === 'Escape') {
        this.dom.flightLogModal.classList.remove('active');
        this.dom.sceneEnd.classList.remove('visible');
        return;
      }
      if (this.isTransitioning) return;
      if ((e.key === 'ArrowRight' || e.key === ' ') && this.currentStopIndex < this.lastRouteIndex) {
        this.takeManualControl();
        this.goToStop(this.currentStopIndex + 1);
      } else if (e.key === 'ArrowLeft' && this.currentStopIndex > 0) {
        this.takeManualControl();
        this.goToStop(this.currentStopIndex - 1);
      }
    });

    // Swipe navigation
    let sx = 0, sy = 0;
    window.addEventListener('touchstart', (e) => {
      sx = e.changedTouches[0].screenX;
      sy = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (this.dom.sceneIntro.style.display !== 'none') return;
      if (this.isTransitioning || this.dom.flightLogModal.classList.contains('active')) return;

      const dx = e.changedTouches[0].screenX - sx;
      const dy = e.changedTouches[0].screenY - sy;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      const forward = horizontal ? dx < -50 : dy < -60;
      const back = horizontal ? dx > 50 : dy > 60;

      if (forward && this.currentStopIndex < this.lastRouteIndex) {
        this.takeManualControl();
        this.goToStop(this.currentStopIndex + 1);
      } else if (back && this.currentStopIndex > 0) {
        this.takeManualControl();
        this.goToStop(this.currentStopIndex - 1);
      }
    }, { passive: true });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.spaceApp = new InterstellarJourney();
});
