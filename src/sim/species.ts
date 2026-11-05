export type Diet = 'herb' | 'pred' | 'detri';

export interface Species {
  id: number;
  parent: number;
  name: string;
  diet: Diet;
  heat: number;
  moist: number;
  repro: number;
  size: number;
  mobility: number;
  born: number;
  hue: number;
}

export const ancestors = (): Species[] => [
  { id: 0, parent: -1, name: 'Grazer', diet: 'herb', heat: 0.55, moist: 0.55, repro: 0.9, size: 12, mobility: 0.4, born: 0, hue: 120 },
  { id: 1, parent: -1, name: 'Hunter', diet: 'pred', heat: 0.55, moist: 0.5, repro: 0.6, size: 30, mobility: 0.6, born: 0, hue: 20 },
  { id: 2, parent: -1, name: 'Fly', diet: 'detri', heat: 0.6, moist: 0.6, repro: 0.7, size: 4, mobility: 0.9, born: 0, hue: 280 },
];

export const fitness = (species: Species, temperature: number, humidity: number): number => {
  const dt = (temperature - species.heat) / 0.3;
  const dh = (humidity - species.moist) / 0.35;
  return Math.exp(-(dt * dt + dh * dh));
};

const ADJECTIVES: Record<string, string> = {
  desert: 'Dune', swamp: 'Marsh', forest: 'Moss', jungle: 'Vine', grassland: 'Reed', tundra: 'Frost', mountain: 'Crag', ice: 'Rime', ocean: 'Reef',
};

const NOUNS: Record<Diet, string> = { herb: 'grazer', pred: 'hunter', detri: 'fly' };

export const speciesName = (diet: Diet, biome: string, taken: Set<string>): string => {
  const base = `${ADJECTIVES[biome] ?? 'Wild'} ${NOUNS[diet]}`;
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base} ${n}`)) n++;
  return `${base} ${n}`;
};
