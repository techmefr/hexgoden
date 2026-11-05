const SQ3 = Math.sqrt(3);
const S = 11;
const COLS = 9;
const ROWS = 8;
const fix = (n) => n.toFixed(1);

const center = (i, j) => [14 + S * SQ3 * (i + (j % 2) / 2), 14 + S * 1.5 * j];

const corners = ([cx, cy], dy = 0) => [0, 1, 2, 3, 4, 5].map((k) => {
  const a = Math.PI / 180 * (60 * k - 30);
  return [cx + S * Math.cos(a), cy + S * Math.sin(a) + dy];
});

const base = (i, j, scenario) => {
  if (scenario === 'fire') return i + j < 8 ? 'forest' : 'desert';
  if (scenario === 'flood') return j < 4 ? 'grassland' : 'ocean';
  if (scenario === 'quake') return (i + j) % 5 === 0 ? 'mountain' : 'grassland';
  return (i * 3 + j) % 7 === 0 ? 'mountain' : 'desert';
};

const flame = ([x, y]) => `<polygon class="flame" points="${fix(x - 4)},${fix(y + 4)} ${fix(x - 1)},${fix(y - 5)} ${fix(x + 1)},${fix(y - 1)} ${fix(x + 3)},${fix(y - 6)} ${fix(x + 5)},${fix(y + 4)}"/>`
  + `<polygon class="flame-core" points="${fix(x - 2)},${fix(y + 4)} ${fix(x)},${fix(y - 2)} ${fix(x + 2)},${fix(y + 4)}"/>`;

const waves = ([x, y]) => `<path class="flood-wave" d="M${fix(x - 6)} ${fix(y - 2)} q3 -3 6 0 t6 0 M${fix(x - 6)} ${fix(y + 3)} q3 -3 6 0 t6 0"/>`;

const tile = (i, j, scenario) => {
  const c = center(i, j);
  let b = base(i, j, scenario);
  let dy = 0;
  let over = '';
  if (scenario === 'quake' && i >= 4) dy = j % 2 ? 3 : 4;
  const pts = corners(c, dy).map((p) => `${fix(p[0])},${fix(p[1])}`).join(' ');
  if (scenario === 'fire') {
    const front = i + j;
    if (front < 6) over = `<polygon class="burnt" points="${pts}"/>`;
    else if (front === 6 || front === 7) over = flame([c[0], c[1]]);
  }
  if (scenario === 'flood' && j >= 3 && j < 5) {
    over = `<polygon class="flood-fill" points="${pts}"/>${waves(c)}`;
    b = 'grassland';
  }
  const v = 1 + ((i * 5 + j * 3) % 3);
  const tri = (b === 'mountain') ? `<polygon class="peak" points="${fix(c[0] - 4)},${fix(c[1] + 4 + dy)} ${fix(c[0])},${fix(c[1] - 5 + dy)} ${fix(c[0] + 4)},${fix(c[1] + 4 + dy)}"/>` : '';
  return `<polygon class="hex ${b}-${v}" points="${pts}"/>${tri}${over}`;
};

const path = (pts) => pts.map((p, k) => `${k ? 'L' : 'M'}${fix(p[0])} ${fix(p[1])}`).join(' ');

const extras = (scenario) => {
  if (scenario === 'tension') {
    const d = path([[60, 14], [66, 34], [58, 50], [70, 66], [62, 84], [72, 108]]);
    return `<path class="fault-glow" d="${d}"/><path class="fault" d="${d}"/>`
      + `<path class="fault-glow" d="${path([[66, 34], [84, 40], [90, 52]])}"/><path class="fault" d="${path([[66, 34], [84, 40], [90, 52]])}"/>`;
  }
  if (scenario === 'quake') {
    const d = path([[86, 12], [90, 34], [84, 52], [90, 72], [86, 94], [90, 118]]);
    return `<path class="fault-glow" d="${d}"/><path class="fault" d="${d}"/>`;
  }
  if (scenario === 'fire') {
    return `<path class="front-line" d="${path([[96, 12], [66, 44], [40, 70], [20, 90]])}"/>`;
  }
  return '';
};

export const patch = ({ scenario, title, desc, uid }) => {
  const tiles = [];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) tiles.push(tile(i, j, scenario));
  return `<svg viewBox="0 0 190 142" role="img" aria-labelledby="${uid}t ${uid}d"><title id="${uid}t">${title}</title><desc id="${uid}d">${desc}</desc>`
    + `<g>${tiles.join('')}</g>${extras(scenario)}</svg>`;
};
