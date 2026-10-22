/**
 * Interstellar Journey — Texture Library
 * Real NASA-style planetary maps, embedded as data URIs (assets/textures.data.js)
 * so everything works offline, over file:// as well as http.
 */

class TextureLibrary {
  constructor() {
    this.cache = {};
    this.loader = new THREE.TextureLoader();
    this.anisotropy = 4;
  }

  setRenderer(renderer) {
    this.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    Object.values(this.cache).forEach(t => {
      if (t.isTexture) { t.anisotropy = this.anisotropy; t.needsUpdate = true; }
    });
  }

  /** Loads a planetary map by key from the embedded data pack. */
  map(key, { srgb = true, repeatX = 1 } = {}) {
    const cacheKey = `${key}:${repeatX}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const src = (window.PLANET_TEXTURE_DATA || {})[key];
    const tex = src ? this.loader.load(src) : this.fallback(key);

    if (srgb && THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = this.anisotropy;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    if (repeatX !== 1) tex.repeat.x = repeatX;

    this.cache[cacheKey] = tex;
    return tex;
  }

  /** Flat colour stand-in if a map is missing, so the scene never breaks. */
  fallback(key) {
    const c = document.createElement('canvas');
    c.width = c.height = 8;
    const ctx = c.getContext('2d');
    ctx.fillStyle = { earth: '#2a6ea8', moon: '#8d8d8d', venus: '#d9a441', mars: '#a8482a',
                      jupiter: '#c99b6b', saturn: '#d8c08a', neptune: '#2f5fd0', sun: '#ffb347' }[key] || '#7c8794';
    ctx.fillRect(0, 0, 8, 8);
    return new THREE.CanvasTexture(c);
  }

  /** Radial sprite with a smooth power falloff — no visible disc edge. */
  radial(cacheKey, coreAlpha, falloff, size = 128, tint = '255,255,255') {
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const h = size / 2;
    const g = ctx.createRadialGradient(h, h, 0, h, h, h);

    // alpha(r) = coreAlpha * (1 - r)^falloff keeps the tail asymptotic to zero
    for (let i = 0; i <= 24; i++) {
      const r = i / 24;
      const a = coreAlpha * Math.pow(1 - r, falloff);
      g.addColorStop(r, `rgba(${tint}, ${a.toFixed(4)})`);
    }

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    this.cache[cacheKey] = tex;
    return tex;
  }

  /** Soft glow used for star points, planet bloom and dust. */
  glow(inner, mid, size = 128) {
    return this.radial(`glow:${size}`, 1, 3.2, size);
  }

  /** A star's corona: hot core, long soft tail. */
  corona(size = 256) {
    return this.radial('corona', 0.92, 4.6, size, '255,238,210');
  }

  /** Vertical gradient strip used for engine plumes. */
  plume() {
    if (this.cache.plume) return this.cache.plume;
    const c = document.createElement('canvas');
    c.width = 64; c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.18, 'rgba(186,230,253,0.75)');
    g.addColorStop(0.55, 'rgba(56,189,248,0.28)');
    g.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 128);
    const tex = new THREE.CanvasTexture(c);
    this.cache.plume = tex;
    return tex;
  }
}

window.planetTextures = new TextureLibrary();
