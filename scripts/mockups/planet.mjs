const SQ3 = Math.sqrt(3);

export const rand = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const hash = (i, j) => Math.abs(Math.sin(i * 127.1 + j * 311.7) * 43758.5453) % 1;
const fix = (n) => n.toFixed(1);

const project = ([x, y]) => {
  const r = Math.hypot(x, y);
  if (r < 1e-6) return [x, y];
  const k = Math.sin(Math.min(r, 1) * Math.PI / 2) / r;
  return [x * k, y * k];
};

const biomeAt = (x, y, mode) => {
  const e = Math.sin(x * 3.1 + 1.3) * Math.cos(y * 2.7) + 0.5 * Math.sin(x * 6.2 + y * 4.1 + 0.7);
  const h = 0.5 + 0.5 * Math.sin(x * 2.3 - y * 3.1 + 2);
  const t = 1 - Math.abs(y) * 0.9 + 0.1 * e;
  let b = 'grassland';
  if (e < -0.2) b = 'ocean';
  else if (Math.abs(y) > 0.78) b = 'ice';
  else if (Math.abs(y) > 0.62) b = 'tundra';
  else if (e > 0.85) b = 'mountain';
  else if (t > 0.65 && h < 0.4) b = 'desert';
  else if (h > 0.72 && e < 0.1) b = 'swamp';
  else if (t > 0.7 && h > 0.55) b = 'jungle';
  else if (h > 0.5) b = 'forest';
  if (mode === 'bare' && (b === 'forest' || b === 'jungle' || b === 'grassland')) b = t > 0.55 ? 'desert' : 'tundra';
  return b;
};

const facets = (v, c) => {
  const pts = (a, b) => `${fix(c[0])},${fix(c[1])} ${v[a].map(fix)} ${v[b].map(fix)}`;
  return `<polygon class="facet-light" points="${pts(4, 5)}"/><polygon class="facet-dark" points="${pts(1, 2)}"/>`;
};

const decor = (b, c, i, j, mode, scale) => {
  const [x, y] = c;
  const u = 3.4 * scale;
  if ((b === 'forest' || b === 'jungle') && mode !== 'bare') {
    return `<polygon class="tree-dark" points="${fix(x - u)},${fix(y + u)} ${fix(x)},${fix(y - u * 1.6)} ${fix(x + u)},${fix(y + u)}"/>`
      + `<polygon class="tree" points="${fix(x - u * 0.7)},${fix(y + u * 0.2)} ${fix(x)},${fix(y - u * 2)} ${fix(x + u * 0.7)},${fix(y + u * 0.2)}"/>`;
  }
  if (b === 'mountain') {
    return `<polygon class="peak" points="${fix(x - u)},${fix(y + u)} ${fix(x)},${fix(y - u * 1.4)} ${fix(x + u)},${fix(y + u)}"/>`;
  }
  if (mode === 'flies' && hash(i + 7, j + 3) > 0.62 && b !== 'ocean' && b !== 'ice') {
    return `<g class="fly"><ellipse cx="${fix(x)}" cy="${fix(y)}" rx="${fix(u * 0.5)}" ry="${fix(u * 0.35)}"/>`
      + `<ellipse cx="${fix(x - u * 0.5)}" cy="${fix(y - u * 0.5)}" rx="${fix(u * 0.5)}" ry="${fix(u * 0.25)}"/>`
      + `<ellipse cx="${fix(x + u * 0.5)}" cy="${fix(y - u * 0.5)}" rx="${fix(u * 0.5)}" ry="${fix(u * 0.25)}"/></g>`;
  }
  return '';
};

export const stars = (seed, count, w, h) => {
  const r = rand(seed);
  const dots = Array.from({ length: count }, () => {
    const rad = (0.5 + r() * 0.9).toFixed(1);
    return `<circle cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" r="${rad}" opacity="${(0.25 + r() * 0.45).toFixed(2)}"/>`;
  });
  return `<svg class="stars" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" style="fill: var(--star)">${dots.join('')}</svg>`;
};

export const globe = ({ title, desc, uid = 'g', mode = 'life', select = null, tiles = 11 }) => {
  const s = 2 / (tiles * SQ3);
  const out = [];
  let ring = '';
  let bestD = Infinity;
  for (let j = -tiles; j <= tiles; j++) {
    for (let i = -tiles; i <= tiles; i++) {
      const cx = s * SQ3 * (i + j / 2);
      const cy = s * 1.5 * j;
      if (Math.hypot(cx, cy) > 0.97) continue;
      const b = biomeAt(cx, cy, mode);
      const v = [0, 1, 2, 3, 4, 5].map((k) => {
        const a = Math.PI / 180 * (60 * k - 30);
        return project([cx + s * Math.cos(a), cy + s * Math.sin(a)]);
      });
      const c = project([cx, cy]);
      const variant = 1 + Math.floor(hash(i, j) * 3);
      const sc = Math.max(0.35, 1 - Math.hypot(cx, cy) * 0.7);
      const pts = v.map((p) => `${fix(p[0] * 90 + 100)},${fix(p[1] * 90 + 100)}`).join(' ');
      const cc = [c[0] * 90 + 100, c[1] * 90 + 100];
      const vv = v.map((p) => [p[0] * 90 + 100, p[1] * 90 + 100]);
      out.push(`<polygon class="hex ${b}-${variant}" points="${pts}"/>${facets(vv, cc)}${decor(b, cc, i, j, mode, sc)}`);
      if (select) {
        const d = Math.hypot(cx - select[0], cy - select[1]);
        if (d < bestD) { bestD = d; ring = pts; }
      }
    }
  }
  const sel = ring ? `<polygon class="select-ring-glow" points="${ring}"/><polygon class="select-ring" points="${ring}"/>` : '';
  return `<svg viewBox="0 0 200 200" role="img" aria-labelledby="${uid}t ${uid}d"><title id="${uid}t">${title}</title><desc id="${uid}d">${desc}</desc>`
    + `<circle class="atmo" cx="100" cy="100" r="94"/><g>${out.join('')}</g>${sel}</svg>`;
};
