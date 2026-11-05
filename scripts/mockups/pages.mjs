import { globe } from './planet.mjs';
import { patch } from './patch.mjs';
import { icon, page, shell, topbar, powers, world } from './components.mjs';

const tileFacts = `<div class="sheet-head"><h2>Tile</h2><span class="chip up">${icon('leaf')}Grassland</span></div>
<dl class="dl">
<dt>${icon('grid')}Biome</dt><dd>Grassland</dd>
<dt>${icon('mountain')}Altitude</dt><dd>120 m</dd>
<dt>${icon('drop')}Humidity</dt><dd>62%</dd>
<dt>${icon('thermo')}Temperature</dt><dd>12 °C</dd>
<dt>${icon('bolt')}Tension</dt><dd>Low (0.18)</dd>
<dt>${icon('fly')}Life</dt><dd>Marsh fly</dd>
</dl>
<p class="note">Scales: 0 to 1</p>`;

const spark = (d) => `<svg class="spark" viewBox="0 0 96 28" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
const SPECIES = [
  { name: 'Dune fly', from: null, size: '4 mm', diet: 'Detritivore', move: 'Flies', clim: 'Warm, dry', pop: '1.2 k', trend: 'Rising', line: 'M2 22 L20 18 L40 20 L60 10 L80 8 L94 3', open: true },
  { name: 'Marsh fly', from: 'Dune fly', size: '5 mm', diet: 'Detritivore', move: 'Flies', clim: 'Mild, wet', pop: '640', trend: 'Stable', line: 'M2 14 L24 16 L48 13 L70 15 L94 14', open: false },
];
const speciesList = `<div class="sheet-head"><h2>Species</h2></div>
<ul class="species">${SPECIES.map((s) => `<li><details${s.open ? ' open' : ''}>
<summary><span>${s.name}${s.from ? `<span class="lineage">From: ${s.from}</span>` : ''}</span><span class="chip ${s.trend === 'Rising' ? 'up' : ''}">${s.trend}</span>${spark(s.line)}</summary>
<dl class="dl"><dt>Size</dt><dd>${s.size}</dd><dt>Diet</dt><dd>${s.diet}</dd><dt>Mobility</dt><dd>${s.move}</dd><dt>Climate</dt><dd>${s.clim}</dd><dt>Population</dt><dd>${s.pop}</dd></dl>
</details></li>`).join('')}</ul>
<h2 style="margin-top: var(--space-4)">Lineage</h2>
<ol class="lineage-row" aria-label="Lineage"><li>Dune fly</li><li aria-hidden="true">${icon('arrow')}</li><li>Marsh fly</li></ol>
<p class="note">Observe only</p>`;

const powersPanel = `<div class="sheet-head"><h2>Powers</h2></div>
<fieldset class="field seg-wrap"><legend>Magnitude</legend>
<div class="seg"><label><input type="radio" name="mag" checked><span>Light</span></label><label><input type="radio" name="mag"><span>Steady</span></label><label><input type="radio" name="mag"><span>Heavy</span></label></div></fieldset>
<div class="field"><label for="rest">Sun is resting</label><progress id="rest" max="100" value="40">40%</progress></div>
<p class="note">Rest: a short pause</p>`;

const globeA = (extra = {}) => globe({ title: 'Nacre', desc: 'A low-poly planet of hexagonal tiles: blue oceans, green forests, sand deserts and lilac mountains.', ...extra });

export const SCREENS = [
  ['01-planet', 'Planet view', () => page({
    title: 'HexGoden: Planet view', file: '01-planet', cls: 'stage no-panel',
    body: shell({ svg: globeA({ uid: 'a' }) }),
  })],
  ['02-powers', 'Powers', () => page({
    title: 'HexGoden: Powers', file: '02-powers',
    body: shell({ svg: globeA({ uid: 'a' }), sidePanel: powersPanel, pw: powers({ selected: 'Rain', resting: 'Sun' }) }),
  })],
  ['03-tile', 'Tile inspector', () => page({
    title: 'HexGoden: Tile inspector', file: '03-tile',
    body: shell({ svg: globeA({ uid: 'a', select: [-0.15, 0.2] }), sidePanel: tileFacts }),
  })],
  ['04-species', 'Species', () => page({
    title: 'HexGoden: Species', file: '04-species',
    body: shell({ svg: globeA({ uid: 'a', mode: 'flies' }), sidePanel: speciesList }),
  })],
  ['05-consequences', 'Consequences', () => page({
    title: 'HexGoden: Consequences', file: '05-consequences', cls: 'scroll-page',
    body: `${topbar(false)}<main class="specimens">${[
      ['tension', 'Tension rising', 'bolt', 'Fault strain', 'Cracks glow first', 'Glowing cracks run across dry hexagons.'],
      ['quake', 'Earthquake', 'mountain', 'Ground shifted', 'Right side sank', 'Tiles on the right sit lower than the left, split by a crack.'],
      ['fire', 'Spreading fire', 'flame', 'Dry ground', 'Dashed line: front', 'Ash behind a dashed front, flames on the edge, dry tiles ahead.'],
      ['flood', 'Flood', 'wave', 'Water rising', 'Low tiles submerged', 'A band of low tiles is covered by water with wave lines.'],
    ].map(([k, h, ic, chip, line, desc]) => `<article class="card"><h2>${h}</h2>${patch({ scenario: k, title: h, desc, uid: k })}<p class="note"><span class="chip warn">${icon(ic)}${chip}</span></p><p class="note">${line}</p></article>`).join('')}</main>`,
  })],
  ['06-start', 'Run start', () => page({
    title: 'HexGoden: Run start', file: '06-start', cls: 'scroll-page',
    body: `${topbar(false)}<main class="specimens split"><div class="card preview">${globeA({ uid: 'a', tiles: 8 })}</div>
<form class="card" onsubmit="return false"><h2>New run</h2>
<fieldset class="field"><legend>God</legend>
<button class="btn is-selected" type="button" aria-pressed="true">${icon('drop')}Water${icon('check', 'icon check')}<span class="hint">Available</span></button>
<button class="btn" type="button" aria-disabled="true">${icon('wind')}Wind${icon('lock')}<span class="hint">Locked</span></button>
<button class="btn" type="button" aria-disabled="true">${icon('stone')}Stone${icon('lock')}<span class="hint">Locked</span></button></fieldset>
<div class="field"><label for="type">Planet type</label><select id="type"><option>Temperate</option><option>Arid</option><option>Ocean</option></select></div>
<div class="field"><label for="seed">Seed</label><input id="seed" type="text" value="784201" inputmode="numeric"><p class="note">Visual example only</p></div>
<a class="btn primary" href="01-planet.html">Begin</a></form></main>`,
  })],
  ['07-quiet', 'Quiet worlds', () => page({
    title: 'HexGoden: Quiet worlds', file: '07-quiet', cls: 'scroll-page',
    body: `${topbar(false)}<main class="specimens split">
<figure class="card"><div class="planet-wrap">${globeA({ uid: 'a', mode: 'bare', tiles: 9 })}</div><figcaption><h2>Bare world</h2><span class="chip">No life yet</span><p class="note">Calm and quiet</p></figcaption></figure>
<figure class="card"><div class="planet-wrap">${globeA({ uid: 'b', mode: 'flies', tiles: 9 })}</div><figcaption><h2>World of flies</h2><span class="chip up">${icon('fly')}3 species</span><p class="note">Flies fill the air</p></figcaption></figure></main>`,
  })],
];
