import { stars } from './planet.mjs';

const SYMBOLS = {
  drop: '<path d="M12 3c3.5 4.2 6 7.2 6 10.5a6 6 0 0 1-12 0C6 10.2 8.5 7.2 12 3z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  up: '<path d="M12 19V6M6 12l6-6 6 6"/>',
  down: '<path d="M12 5v13M6 12l6 6 6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  bolt: '<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',
  flame: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
  wave: '<path d="M3 9c3-3 6 3 9 0s6 3 9 0M3 15c3-3 6 3 9 0s6 3 9 0"/>',
  mountain: '<path d="M3 19l6-11 4 6 3-4 5 9z"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14zM5 19l7-7"/>',
  thermo: '<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/>',
  grid: '<path d="M12 3l7 4v8l-7 4-7-4V7z"/>',
  arrow: '<path d="M4 12h14M13 6l6 6-6 6"/>',
  home: '<path d="M4 11l8-7 8 7v9H4z"/>',
  wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3"/>',
  stone: '<path d="M4 18l3-9 6-3 6 5-2 7z"/>',
  fly: '<ellipse cx="12" cy="14" rx="3" ry="4"/><ellipse cx="7" cy="9" rx="4" ry="2"/><ellipse cx="17" cy="9" rx="4" ry="2"/>',
};

export const icon = (name, cls = 'icon') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;

const sprite = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${
  Object.entries(SYMBOLS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')
}</svg>`;

export const page = ({ title, file, style = '', body, cls = 'stage' }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="shared.css">
${style ? `<style>${style}</style>` : ''}
</head>
<body>
${sprite()}
<div class="${cls}" data-screen="${file}">
${body}
</div>
</body>
</html>
`;

export const topbar = (nav = true) => `<header class="topbar">
<a class="btn" href="index.html" aria-label="Gallery">${icon('home')}</a>
<div class="title"><h1>Nacre</h1><p>Early spring</p></div>
<button class="btn" type="button" aria-label="Settings">${icon('gear')}</button>
${nav ? `<nav class="examples" aria-label="Examples"><a class="btn" href="03-tile.html">Tile</a><a class="btn" href="04-species.html">Species</a></nav>` : ''}
</header>`;

const POWERS = [
  ['drop', 'Rain', 'Light rain'],
  ['sun', 'Sun', 'Gentle sun'],
  ['up', 'Raise land', 'Adds tension'],
  ['down', 'Lower land', 'Calms tension'],
];

export const powers = ({ selected = 'Rain', resting = null } = {}) => `<ul class="powers" aria-label="Powers">${
  POWERS.map(([ic, name, hint]) => {
    const on = name === selected;
    const rest = name === resting;
    const attrs = on ? ' aria-pressed="true"' : rest ? ' aria-disabled="true"' : ' aria-pressed="false"';
    const tail = rest ? '<span class="hint">Resting</span>' : `<span class="hint">${hint}</span>`;
    return `<li><button class="btn" type="button"${attrs}>${icon(ic)}<span>${name}</span>${on ? icon('check', 'icon check') : ''}${tail}</button></li>`;
  }).join('')
}</ul>`;

export const world = (svg, seed = 3) => `<main class="world">${stars(seed, 46, 400, 400)}${svg}</main>`;

export const shell = ({ svg, sidePanel = '', pw = powers(), nav = true, seed = 3 }) => `${topbar(nav)}
<aside class="rail" aria-label="Powers">${pw}</aside>
${world(svg, seed)}
${sidePanel ? `<section class="sheet" aria-label="Details"><span class="grip" aria-hidden="true"></span>${sidePanel}</section>
<aside class="panel" aria-label="Details">${sidePanel}</aside>` : ''}
<nav class="dock" aria-label="Powers">${pw}</nav>`;
