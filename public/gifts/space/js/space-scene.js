/**
 * Interstellar Journey — 3D Engine (Three.js)
 * A ship you can see, real planetary maps, warp jumps between worlds,
 * a sun that fades as you travel outward, drifting dust and streaking stars.
 */

const WARP_MS = 2800;
const PLANET_ANCHOR = { x: 0, y: -1.6, z: -78 };

class SpaceScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.currentStopIndex = -1;
    this.isTransitioning = false;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.planets = {};
    this.activePlanetGroup = null;
    this.warp = null;          // active jump state
    this.warpAmount = 0;       // 0..1 visual intensity
    this.thrust = 0.25;        // engine output 0..1
    this.clock = new THREE.Clock();
    this.elapsed = 0;

    // Optional hooks used by the UI layer
    this.onWarpStart = null;
    this.onWarpArrive = null;

    this.init();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    if (THREE.sRGBEncoding) this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    window.planetTextures.setRenderer(this.renderer);

    this.scene = new THREE.Scene();

    this.baseFov = 45;
    this.camera = new THREE.PerspectiveCamera(this.baseFov, window.innerWidth / window.innerHeight, 0.1, 4000);
    this.camera.position.set(0, 0.6, 32);
    this.camera.lookAt(0, 0.4, -20);

    this.setupLighting();
    this.setupStarfield();
    this.setupSun();
    this.setupHeartConstellation();
    this.setupWarpField();
    this.setupDust();
    this.setupShip();
    this.setupShootingStars();

    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => this.onDeviceOrientation(e));
    }

    this.onResize();
    this.animate();
  }

  /* ======================================================================
     LIGHTING
     ====================================================================== */
  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0x1b2436, 0.55);
    this.scene.add(this.ambientLight);

    // Key light coming from the sun's direction
    this.sunLight = new THREE.DirectionalLight(0xfff4e2, 2.6);
    this.sunLight.position.set(-70, 26, 40);
    this.scene.add(this.sunLight);

    // Cool rim light that picks up the current planet's colour
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    this.rimLight.position.set(52, -14, -26);
    this.scene.add(this.rimLight);

    // Small warm bounce so the ship never goes fully black
    this.fillLight = new THREE.PointLight(0x93c5fd, 0.5, 90);
    this.fillLight.position.set(6, 4, 26);
    this.scene.add(this.fillLight);
  }

  /* ======================================================================
     STARS, NEBULA, SUN
     ====================================================================== */
  setupStarfield() {
    const starCount = 3600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = ['#ffffff', '#e0f2fe', '#fef3c7', '#fed7aa', '#bfdbfe'].map(c => new THREE.Color(c));

    for (let i = 0; i < starCount; i++) {
      const radius = 320 + Math.random() * 1100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      const b = 0.55 + Math.random() * 0.45;
      colors[i * 3] = c.r * b;
      colors[i * 3 + 1] = c.g * b;
      colors[i * 3 + 2] = c.b * b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.6,
      sizeAttenuation: true,
      vertexColors: true,
      map: window.planetTextures.glow('rgba(255,255,255,1)', 'rgba(220,240,255,0.5)', 64),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  setupNebula() {
    const count = 12;
    const tex = window.planetTextures.corona();
    this.nebulaGroup = new THREE.Group();

    for (let i = 0; i < count; i++) {
      const warm = Math.random() > 0.55;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        color: warm ? 0x6d3f8f : 0x1b4a86,
        transparent: true,
        opacity: 0.05 + Math.random() * 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set((Math.random() - 0.5) * 1400, (Math.random() - 0.5) * 700, -900 - Math.random() * 900);
      const s = 700 + Math.random() * 900;
      sprite.scale.set(s, s, 1);
      this.nebulaGroup.add(sprite);
    }
    this.scene.add(this.nebulaGroup);
  }

  setupSun() {
    this.sunGroup = new THREE.Group();
    this.sunGroup.position.set(-620, 190, -1500);

    const sunTex = window.planetTextures.map('sun');
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(30, 48, 48),
      new THREE.MeshBasicMaterial({ map: sunTex, color: 0xfff1d6 })
    );
    this.sunGroup.add(sunMesh);
    this.sunMesh = sunMesh;

    // Layered corona
    const coronaSpecs = [
      { size: 190, color: 0xfff4e0, opacity: 0.9 },
      { size: 2400, color: 0xffb265, opacity: 0.05 }
    ];
    this.coronas = coronaSpecs.map(spec => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: window.planetTextures.corona(),
        color: spec.color,
        transparent: true,
        opacity: spec.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      sprite.scale.set(spec.size, spec.size, 1);
      sprite.userData.baseOpacity = spec.opacity;
      this.sunGroup.add(sprite);
      return sprite;
    });

    this.scene.add(this.sunGroup);
  }

  /** The sun shrinks and cools as the journey heads outward. */
  updateSunForStop(index, total) {
    const t = total > 1 ? index / (total - 1) : 0;
    const scale = 1 - t * 0.62;
    this.sunGroup.scale.setScalar(scale);
    this.sunLight.intensity = 2.7 - t * 1.5;
    this.coronas.forEach(s => { s.material.opacity = s.userData.baseOpacity * (1 - t * 0.45); });
    this.ambientLight.intensity = 0.55 - t * 0.18;
  }

  setupHeartConstellation() {
    const points = [];
    for (let i = 0; i <= 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(a), 3);
      const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
      points.push(new THREE.Vector3(x * 0.9, y * 0.9, 0));
    }

    const curve = new THREE.CatmullRomCurve3(points, true);
    this.heartMaterial = new THREE.MeshBasicMaterial({
      color: 0xfff1f5,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.heartConstellation = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 220, 0.34, 8, true),
      this.heartMaterial
    );

    // Idles as a faint constellation off in the background…
    this.heartHome = { position: new THREE.Vector3(150, 95, -430), scale: 1.5, opacity: 0.12 };
    this.heartTarget = {
      position: this.heartHome.position.clone(),
      scale: this.heartHome.scale,
      opacity: this.heartHome.opacity,
      beat: false
    };
    this.heartScale = this.heartHome.scale;

    this.heartConstellation.position.copy(this.heartHome.position);
    this.heartConstellation.scale.setScalar(this.heartHome.scale);
    this.scene.add(this.heartConstellation);
  }

  /** …and comes forward, glowing and beating, at the secret stop. */
  setHeartFocus(on) {
    if (!this.heartTarget) return;

    if (on) {
      const z = (this.anchorZ || -118) + 44;
      this.heartTarget.position.set(PLANET_ANCHOR.x, PLANET_ANCHOR.y + 1.5, z);
      this.heartTarget.scale = 0.44;
      this.heartTarget.opacity = 1;
      this.heartTarget.beat = true;
    } else {
      this.heartTarget.position.copy(this.heartHome.position);
      this.heartTarget.scale = this.heartHome.scale;
      this.heartTarget.opacity = this.heartHome.opacity;
      this.heartTarget.beat = false;
    }
  }

  glowHeartConstellation() {
    if (this.heartTarget && !this.heartTarget.beat) this.heartTarget.opacity = 0.42;
  }

  updateHeart(delta) {
    if (!this.heartConstellation) return;
    const k = Math.min(1, delta * 1.6);

    this.heartConstellation.position.lerp(this.heartTarget.position, k);
    this.heartScale += (this.heartTarget.scale - this.heartScale) * k;
    this.heartMaterial.opacity += (this.heartTarget.opacity - this.heartMaterial.opacity) * k;

    // Two-thump heartbeat once it is on show
    let pulse = 1;
    if (this.heartTarget.beat) {
      const p = (this.elapsed % 1.25) / 1.25;
      pulse = 1 + Math.exp(-18 * p) * 0.14 + Math.exp(-18 * Math.max(0, p - 0.24)) * 0.09;
      this.heartConstellation.rotation.y = Math.sin(this.elapsed * 0.35) * 0.12;
    }
    this.heartConstellation.scale.setScalar(this.heartScale * pulse);
  }

  /* ======================================================================
     WARP STREAKS & DUST
     ====================================================================== */
  setupWarpField() {
    this.warpCount = 900;
    const positions = new Float32Array(this.warpCount * 6);
    this.warpSeeds = [];

    for (let i = 0; i < this.warpCount; i++) {
      const r = 5 + Math.pow(Math.random(), 0.75) * 95;
      const a = Math.random() * Math.PI * 2;
      const seed = { x: Math.cos(a) * r, y: Math.sin(a) * r, z: -420 + Math.random() * 460 };
      this.warpSeeds.push(seed);
      positions[i * 6] = seed.x; positions[i * 6 + 1] = seed.y; positions[i * 6 + 2] = seed.z;
      positions[i * 6 + 3] = seed.x; positions[i * 6 + 4] = seed.y; positions[i * 6 + 5] = seed.z - 1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.warpMaterial = new THREE.LineBasicMaterial({
      color: 0xcfe8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
    });
    this.warpLines = new THREE.LineSegments(geo, this.warpMaterial);
    this.warpLines.visible = false;
    this.scene.add(this.warpLines);
  }

  updateWarpField(delta) {
    const w = this.warpAmount;
    this.warpLines.visible = w > 0.015;
    if (!this.warpLines.visible) return;

    this.warpMaterial.opacity = Math.min(1, w * 1.15);
    const speed = 70 + w * 2100;
    const length = 4 + w * w * 110;
    const pos = this.warpLines.geometry.attributes.position.array;

    for (let i = 0; i < this.warpCount; i++) {
      const s = this.warpSeeds[i];
      s.z += speed * delta;
      if (s.z > 34) s.z -= 460;
      pos[i * 6] = s.x; pos[i * 6 + 1] = s.y; pos[i * 6 + 2] = s.z;
      pos[i * 6 + 3] = s.x; pos[i * 6 + 4] = s.y; pos[i * 6 + 5] = s.z - length;
    }
    this.warpLines.geometry.attributes.position.needsUpdate = true;
  }

  setupDust() {
    const count = 420;
    const positions = new Float32Array(count * 3);
    this.dustCount = count;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 2] = -260 + Math.random() * 300;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.dust = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.55,
      map: window.planetTextures.glow('rgba(255,255,255,0.9)', 'rgba(190,220,255,0.3)', 64),
      color: 0xbcd8ff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    this.scene.add(this.dust);
  }

  updateDust(delta) {
    const pos = this.dust.geometry.attributes.position.array;
    const speed = 12 + this.warpAmount * 900;
    for (let i = 0; i < this.dustCount; i++) {
      pos[i * 3 + 2] += speed * delta;
      if (pos[i * 3 + 2] > 36) {
        pos[i * 3 + 2] -= 300;
        pos[i * 3] = (Math.random() - 0.5) * 150;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 90;
      }
    }
    this.dust.geometry.attributes.position.needsUpdate = true;
  }

  setupShootingStars() {
    this.shootingStars = [];
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending
      }));
      line.visible = false;
      this.scene.add(line);
      this.shootingStars.push({ line, active: false, dir: new THREE.Vector3(), speed: 0, life: 0, maxLife: 0, next: Math.random() * 5 + 3 });
    }
  }

  updateShootingStars(delta) {
    this.shootingStars.forEach(star => {
      if (!star.active) {
        star.next -= delta;
        if (star.next <= 0 && this.warpAmount < 0.05) {
          const x = (Math.random() - 0.5) * 220;
          const y = 45 + Math.random() * 70;
          const z = -120 - Math.random() * 160;
          const a = Math.PI * (1.08 + Math.random() * 0.34);
          star.dir.set(Math.cos(a), Math.sin(a), 0.15).normalize();
          star.speed = 180 + Math.random() * 140;
          star.life = 0;
          star.maxLife = 0.7 + Math.random() * 0.5;
          star.active = true;
          const p = star.line.geometry.attributes.position.array;
          p[0] = x; p[1] = y; p[2] = z; p[3] = x; p[4] = y; p[5] = z;
          star.line.visible = true;
        }
        return;
      }

      star.life += delta;
      const p = star.line.geometry.attributes.position.array;
      p[0] += star.dir.x * star.speed * delta;
      p[1] += star.dir.y * star.speed * delta;
      p[2] += star.dir.z * star.speed * delta;
      const tail = 26;
      p[3] = p[0] - star.dir.x * tail;
      p[4] = p[1] - star.dir.y * tail;
      p[5] = p[2] - star.dir.z * tail;
      star.line.geometry.attributes.position.needsUpdate = true;
      star.line.material.opacity = Math.sin((star.life / star.maxLife) * Math.PI) * 0.9;

      if (star.life >= star.maxLife) {
        star.active = false;
        star.line.visible = false;
        star.next = Math.random() * 7 + 5;
      }
    });
  }

  /* ======================================================================
     THE SHIP
     ====================================================================== */
  setupShip() {
    const ship = new THREE.Group();

    const hullMat = new THREE.MeshStandardMaterial({ color: 0x5b6675, metalness: 0.85, roughness: 0.36 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x161d28, metalness: 0.7, roughness: 0.5 });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x0b3a52, emissive: 0x38bdf8, emissiveIntensity: 2.2, roughness: 0.3, metalness: 0.2
    });

    // Slender arrowhead fuselage, flattened top-to-bottom
    const profile = [
      [0.00, -2.45], [0.46, -2.32], [0.60, -1.70], [0.62, -0.70],
      [0.56, 0.35], [0.42, 1.35], [0.20, 2.15], [0.00, 2.62]
    ].map(p => new THREE.Vector2(p[0], p[1]));
    const fuselage = new THREE.Mesh(new THREE.LatheGeometry(profile, 40), hullMat);
    fuselage.rotation.x = -Math.PI / 2;
    fuselage.scale.set(1, 0.66, 1);
    ship.add(fuselage);

    // Dark belly panel
    const belly = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 3.4), darkMat);
    belly.position.set(0, -0.38, 0.1);
    ship.add(belly);

    // Dorsal light strips
    [0.22, -0.22].forEach(x => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 2.2), trimMat);
      strip.position.set(x, 0.38, 0.3);
      ship.add(strip);
    });

    // Canopy
    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({
        color: 0x08182b, metalness: 0.4, roughness: 0.05,
        emissive: 0x0ea5e9, emissiveIntensity: 0.5, transparent: true, opacity: 0.92
      })
    );
    canopy.scale.set(0.95, 0.5, 1.9);
    canopy.position.set(0, 0.24, -0.75);
    ship.add(canopy);

    // Hard-raked wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0.95);
    wingShape.lineTo(1.85, -1.55);
    wingShape.lineTo(2.05, -2.35);
    wingShape.lineTo(0.24, -1.95);
    wingShape.lineTo(0, 0.95);
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.03, bevelSegments: 2 });
    wingGeo.rotateX(Math.PI / 2);

    this.plumes = [];
    this.engineGlows = [];
    const plumeGeo = new THREE.ConeGeometry(0.3, 1, 20, 1, true);
    plumeGeo.translate(0, -0.5, 0);
    plumeGeo.rotateX(Math.PI / 2);

    [1, -1].forEach(side => {
      const wing = new THREE.Mesh(wingGeo, hullMat);
      wing.scale.x = side;
      wing.position.set(side * 0.45, -0.06, 0.2);
      wing.rotation.z = side * 0.1;
      ship.add(wing);

      // Glowing leading-edge trim
      const trim = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.05, 0.1), trimMat);
      trim.position.set(side * 1.0, 0.06, -0.32);
      trim.rotation.y = side * 0.72;
      ship.add(trim);

      // Rear-mounted engine block
      const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 1.5, 22), darkMat);
      nacelle.rotation.x = Math.PI / 2;
      nacelle.position.set(side * 0.6, -0.04, 1.75);
      ship.add(nacelle);

      const exhaust = new THREE.Mesh(new THREE.CircleGeometry(0.3, 22), new THREE.MeshBasicMaterial({ color: 0xdff4ff }));
      exhaust.position.set(side * 0.6, -0.04, 2.51);
      ship.add(exhaust);

      // Plume cone
      const plume = new THREE.Mesh(plumeGeo, new THREE.MeshBasicMaterial({
        map: window.planetTextures.plume(), color: 0x9fdcff,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, opacity: 0.8
      }));
      plume.position.set(side * 0.6, -0.04, 2.5);
      ship.add(plume);
      this.plumes.push(plume);

      // Engine core glow
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: window.planetTextures.glow('rgba(255,255,255,1)', 'rgba(125,211,252,0.55)', 128),
        color: 0x8fdcff, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      glow.position.set(side * 0.6, -0.04, 2.6);
      glow.scale.set(2.4, 2.4, 1);
      ship.add(glow);
      this.engineGlows.push(glow);

      // Navigation light
      const nav = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 10, 10),
        new THREE.MeshBasicMaterial({ color: side > 0 ? 0x22c55e : 0xef4444, transparent: true })
      );
      nav.position.set(side * 2.0, 0.06, 1.5);
      ship.add(nav);
      if (side > 0) this.navLightA = nav; else this.navLightB = nav;
    });

    this.engineLight = new THREE.PointLight(0x38bdf8, 1.6, 26);
    this.engineLight.position.set(0, 0, 3);
    ship.add(this.engineLight);

    this.shipGroup = ship;
    this.shipBase = new THREE.Vector3(-6.0, -3.8, 9);
    ship.position.copy(this.shipBase);
    ship.rotation.y = 0.42;
    ship.scale.setScalar(0.92);
    this.scene.add(ship);
  }

  updateShip(delta) {
    const s = this.shipGroup;
    const t = this.elapsed;
    const w = this.warpAmount;

    // Target thrust: idle cruise, full burn during a jump
    const targetThrust = 0.28 + w * 0.72;
    this.thrust += (targetThrust - this.thrust) * Math.min(1, delta * 6);

    // Idle drift + parallax response + warp surge
    const bobY = Math.sin(t * 0.9) * 0.16 + Math.sin(t * 2.3) * 0.04;
    const bobX = Math.cos(t * 0.62) * 0.22;
    s.position.x = this.shipBase.x + bobX + this.mouse.x * 1.4;
    s.position.y = this.shipBase.y + bobY - this.mouse.y * 0.9 + w * 0.9;
    s.position.z = this.shipBase.z + Math.sin(t * 0.5) * 0.3 - w * 3.2;

    s.rotation.z = -0.14 + Math.sin(t * 0.55) * 0.05 - this.mouse.x * 0.28 - w * 0.16;
    s.rotation.x = 0.14 + Math.sin(t * 0.7) * 0.02 + this.mouse.y * 0.06 - w * 0.10;
    s.rotation.y = 0.42 + this.mouse.x * 0.12;

    // Engines react to thrust
    const flicker = 0.9 + Math.sin(t * 26) * 0.06 + Math.sin(t * 41) * 0.04;
    this.plumes.forEach(p => {
      const len = (1.6 + this.thrust * 9) * flicker;
      p.scale.set(0.8 + this.thrust * 0.5, 0.8 + this.thrust * 0.5, len);
      p.material.opacity = (0.3 + this.thrust * 0.55) * flicker;
    });
    this.engineGlows.forEach(g => {
      const k = (1.3 + this.thrust * 2.2) * flicker;
      g.scale.set(k, k, 1);
      g.material.opacity = 0.75 + this.thrust * 0.25;
    });
    this.engineLight.intensity = 1.1 + this.thrust * 3.4;

    // Blinking navigation lights
    const blink = (Math.sin(t * 3.2) > 0.75) ? 1 : 0.12;
    if (this.navLightA) this.navLightA.material.color.setScalar(1);
    if (this.navLightA) this.navLightA.material.opacity = blink;
    if (this.navLightB) this.navLightB.material.opacity = blink;
  }

  /* ======================================================================
     PLANETS
     ====================================================================== */
  getOrCreatePlanet(stop) {
    if (this.planets[stop.id]) return this.planets[stop.id];
    if (stop.type === 'sun') return this.createStar(stop);

    const group = new THREE.Group();
    group.name = stop.id;

    const radius = 15 * (stop.scale || 1);
    const geo = new THREE.SphereGeometry(radius, 96, 96);
    const tex = window.planetTextures.map(stop.type);

    const surfaceSettings = {
      earth:   { roughness: 0.72, metalness: 0.02 },
      moon:    { roughness: 0.95, metalness: 0.0 },
      venus:   { roughness: 0.85, metalness: 0.0 },
      mars:    { roughness: 0.9,  metalness: 0.0 },
      jupiter: { roughness: 0.78, metalness: 0.0 },
      saturn:  { roughness: 0.76, metalness: 0.0 },
      neptune: { roughness: 0.7,  metalness: 0.0 }
    }[stop.type] || { roughness: 0.85, metalness: 0.0 };

    const mainMesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      map: tex,
      bumpMap: tex,
      bumpScale: stop.type === 'moon' || stop.type === 'mars' ? 0.55 : 0.15,
      ...surfaceSettings
    }));
    mainMesh.rotation.z = 0.22; // slight axial tilt for a more natural read
    group.add(mainMesh);
    group.userData.mainMesh = mainMesh;

    // Earth cloud deck
    if (stop.type === 'earth') {
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.012, 64, 64),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          alphaMap: window.planetTextures.map('earth-clouds', { srgb: false }),
          transparent: true, opacity: 0.92, roughness: 1, metalness: 0, depthWrite: false
        })
      );
      clouds.rotation.z = 0.22;
      group.add(clouds);
      group.userData.cloudMesh = clouds;
    }

    // Atmospheric fresnel halo
    const atmoPower = stop.type === 'moon' ? 5.0 : 4.1;
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.11, 64, 64),
      this.createAtmosphereMaterial(stop.atmosphereHue || '#38bdf8', atmoPower, stop.type === 'moon' ? 0.6 : 1.05)
    );
    group.add(atmo);

    // Wide soft bloom behind the planet
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: window.planetTextures.glow('rgba(255,255,255,0.55)', 'rgba(255,255,255,0.16)', 256),
      color: new THREE.Color(stop.atmosphereHue || '#38bdf8'),
      transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    halo.scale.set(radius * 3.1, radius * 3.1, 1);
    halo.position.z = -radius * 1.6;
    group.add(halo);

    if (stop.hasRings) group.add(this.createRings(radius, group));

    group.userData.rotationSpeed = stop.rotationSpeed || 0.002;
    this.planets[stop.id] = group;
    return group;
  }

  /** The star itself: unlit, self-glowing, with a breathing corona. */
  createStar(stop) {
    const group = new THREE.Group();
    const radius = 15 * (stop.scale || 1);

    const star = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 96, 96),
      new THREE.MeshBasicMaterial({ map: window.planetTextures.map('sun'), color: 0xfff0d2 })
    );
    group.add(star);
    group.userData.mainMesh = star;

    const coronas = [
      { size: radius * 3.0, color: 0xfff1d4, opacity: 0.8 },
      { size: radius * 7.5, color: 0xffb45e, opacity: 0.35 },
      { size: radius * 18, color: 0xff8a3d, opacity: 0.12 }
    ].map(spec => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: window.planetTextures.corona(),
        color: spec.color,
        transparent: true,
        opacity: spec.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      sprite.scale.set(spec.size, spec.size, 1);
      sprite.userData.baseOpacity = spec.opacity;
      group.add(sprite);
      return sprite;
    });
    group.userData.coronas = coronas;

    // Everything nearby is lit by it, the ship included
    const light = new THREE.PointLight(0xffb066, 4.5, 600, 1.4);
    group.add(light);

    group.userData.rotationSpeed = stop.rotationSpeed || 0.0006;
    this.planets[stop.id] = group;
    return group;
  }

  createRings(radius, group) {
    const inner = radius * 1.36;
    const outer = radius * 2.42;
    const geo = new THREE.RingGeometry(inner, outer, 160, 4);

    // Remap UVs radially so the ring strip wraps as concentric bands
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const d = Math.sqrt(pos.getX(i) ** 2 + pos.getY(i) ** 2);
      uv.setXY(i, (d - inner) / (outer - inner), 0.5);
    }

    const ringTex = window.planetTextures.map('saturn-ring');
    const rings = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
      roughness: 1.0,
      metalness: 0.0,
      emissive: 0xd9c49a,
      emissiveIntensity: 0.28,
      emissiveMap: ringTex,
      depthWrite: false
    }));
    rings.rotation.x = Math.PI * 0.5 - 0.62;
    rings.rotation.y = -0.24;
    group.userData.ringsMesh = rings;
    return rings;
  }

  createAtmosphereMaterial(colorHex, power = 3.0, multiplier = 1.8) {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(colorHex) },
        p: { value: power },
        m: { value: multiplier }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vPosition = mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float p;
        uniform float m;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float intensity = pow(max(0.0, 0.72 - dot(vNormal, viewDir)), p) * m;
          gl_FragColor = vec4(glowColor, intensity * 0.95);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
  }

  /* ======================================================================
     TRAVELLING BETWEEN WORLDS
     ====================================================================== */
  goToStop(stopIndex, immediate = false) {
    const stops = window.SPACE_DATE_CONFIG.planetStops;
    if (stopIndex < 0 || stopIndex >= stops.length) return;

    const stop = stops[stopIndex];
    this.anchorZ = PLANET_ANCHOR.z - Math.max(0, (stop.scale || 1) - 0.95) * 62 - (stop.hasRings ? 26 : 0);
    const previousIndex = this.currentStopIndex;
    this.currentStopIndex = stopIndex;

    const oldPlanet = this.activePlanetGroup;
    const newPlanet = this.getOrCreatePlanet(stop);

    this.updateSunForStop(stopIndex, stops.length);
    this.updateLightingForStop(stop);
    this.sunGroup.visible = stop.type !== 'sun';

    if (immediate) {
      if (oldPlanet && oldPlanet !== newPlanet) this.scene.remove(oldPlanet);
      this.scene.add(newPlanet);
      this.activePlanetGroup = newPlanet;
      newPlanet.position.set(PLANET_ANCHOR.x, PLANET_ANCHOR.y, this.anchorZ);
      newPlanet.scale.setScalar(1);
      this.warp = null;
      this.warpAmount = 0;
      this.isTransitioning = false;
      return;
    }

    if (window.spaceAudio) window.spaceAudio.playPlanetWhoosh();
    if (this.onWarpStart) this.onWarpStart(stop, previousIndex, stopIndex);

    // Departing world flies past the camera, on the side we are turning away from
    const side = stopIndex > previousIndex ? 1 : -1;
    this.scene.add(newPlanet);
    newPlanet.position.set(PLANET_ANCHOR.x, PLANET_ANCHOR.y, -1400);
    newPlanet.scale.setScalar(1);

    this.warp = {
      t: 0,
      arrived: false,
      side,
      oldPlanet: oldPlanet && oldPlanet !== newPlanet ? oldPlanet : null,
      oldStart: oldPlanet ? oldPlanet.position.clone() : null,
      newPlanet
    };
    this.activePlanetGroup = newPlanet;
    this.isTransitioning = true;
  }

  updateWarpState(delta) {
    if (!this.warp) {
      this.warpAmount += (0 - this.warpAmount) * Math.min(1, delta * 3.5);
      return;
    }

    const w = this.warp;
    w.t = Math.min(1, w.t + (delta * 1000) / WARP_MS);
    const t = w.t;

    // Intensity curve: quick spool-up, long tail as we decelerate
    this.warpAmount = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.02)), 1.3);

    // Departing planet accelerates past the camera
    if (w.oldPlanet) {
      const p = Math.min(1, t / 0.55);
      const ease = p * p;
      w.oldPlanet.position.z = w.oldStart.z + ease * 240;
      w.oldPlanet.position.x = w.oldStart.x + ease * 90 * w.side;
      w.oldPlanet.position.y = w.oldStart.y - ease * 26;
      if (t >= 0.6) {
        this.scene.remove(w.oldPlanet);
        w.oldPlanet = null;
      }
    }

    // Arriving planet emerges from the distance
    const arrive = Math.max(0, (t - 0.42) / 0.58);
    if (arrive > 0) {
      const ease = 1 - Math.pow(1 - Math.min(1, arrive), 3.4);
      w.newPlanet.position.z = -1400 + (this.anchorZ + 1400) * ease;
      w.newPlanet.position.x = PLANET_ANCHOR.x + (1 - ease) * 34 * -w.side;
      w.newPlanet.position.y = PLANET_ANCHOR.y + (1 - ease) * 12;
      if (!w.arrived && arrive > 0.12) {
        w.arrived = true;
        if (this.onWarpArrive) this.onWarpArrive();
      }
    }

    if (t >= 1) {
      w.newPlanet.position.set(PLANET_ANCHOR.x, PLANET_ANCHOR.y, this.anchorZ);
      this.warp = null;
      this.isTransitioning = false;
    }
  }

  updateLightingForStop(stop) {
    if (stop.accentColor) this.rimLight.color.lerp(new THREE.Color(stop.accentColor), 0.85);

    const atStar = stop.type === 'sun';
    this.fillLight.color.set(atStar ? 0xffb066 : 0x93c5fd);
    this.fillLight.intensity = atStar ? 1.6 : 0.5;
    this.ambientLight.intensity = atStar ? 0.7 : this.ambientLight.intensity;
  }

  /* ======================================================================
     INPUT & LOOP
     ====================================================================== */
  onMouseMove(e) {
    this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  onDeviceOrientation(e) {
    if (e.gamma !== null && e.beta !== null) {
      this.mouse.targetX = Math.max(-1, Math.min(1, e.gamma / 25));
      this.mouse.targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
    }
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w < 768;

    this.camera.aspect = w / h;
    this.baseFov = isMobile ? 58 : 45;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Tuck the ship lower and nearer the centre on narrow screens
    if (this.shipGroup) {
      this.shipBase.set(isMobile ? -2.6 : -6.0, isMobile ? -5.0 : -3.8, isMobile ? 11 : 9);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(0.05, this.clock.getDelta());
    this.elapsed += delta;

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.updateWarpState(delta);
    this.updateWarpField(delta);
    this.updateDust(delta);
    this.updateShip(delta);
    this.updateShootingStars(delta);
    this.updateHeart(delta);

    // Camera: gentle parallax plus a hard push during the jump
    const shake = this.warpAmount * 0.28;
    this.camera.position.x = this.mouse.x * 2.4 + Math.sin(this.elapsed * 31) * shake;
    this.camera.position.y = 0.6 - this.mouse.y * 1.5 + Math.cos(this.elapsed * 27) * shake;
    this.camera.lookAt(0, 0.4 + this.warpAmount * 0.6, -20);

    const fov = this.baseFov + this.warpAmount * 24;
    if (Math.abs(this.camera.fov - fov) > 0.01) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }

    if (this.stars) {
      this.stars.rotation.y += 0.00012;
      this.stars.rotation.x += 0.00006;
    }

    if (this.activePlanetGroup) {
      const speed = this.activePlanetGroup.userData.rotationSpeed || 0.002;
      const u = this.activePlanetGroup.userData;
      if (u.mainMesh) u.mainMesh.rotation.y += speed;
      if (u.cloudMesh) u.cloudMesh.rotation.y += speed * 1.3;
      if (u.ringsMesh) u.ringsMesh.rotation.z += speed * 0.12;
    }

    if (this.sunMesh) this.sunMesh.rotation.y += 0.0004;

    // The star we are orbiting breathes
    const activeCoronas = this.activePlanetGroup && this.activePlanetGroup.userData.coronas;
    if (activeCoronas) {
      const breathe = 1 + Math.sin(this.elapsed * 0.7) * 0.05;
      activeCoronas.forEach((sprite, i) => {
        sprite.material.opacity = sprite.userData.baseOpacity * (1 + Math.sin(this.elapsed * (0.5 + i * 0.2)) * 0.12);
        const base = sprite.scale.x;
        sprite.scale.set(base, base, 1);
      });
      if (this.activePlanetGroup.userData.mainMesh) {
        this.activePlanetGroup.userData.mainMesh.scale.setScalar(breathe * 0.5 + 0.5);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.SpaceScene = SpaceScene;
window.WARP_MS = WARP_MS;
