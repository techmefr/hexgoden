import { Color } from 'three';
import { BIOMES } from '../sim/terrain';

const BASE: Record<string, string> = {
  ocean: '#7ec9e6', desert: '#eaddbe', grassland: '#a8d6a7', forest: '#7fbfa8', jungle: '#83b69b',
  swamp: '#a6b895', tundra: '#bac8c4', ice: '#ddebfb', mountain: '#c8b6e6',
};

export const COLORS = {
  oceanDeep: new Color('#5aa9d0'),
  fire: new Color('#ff9a5c'),
  ash: new Color('#5b5568'),
  glow: new Color('#ffb86b'),
  pine: new Color('#3f7f6b'),
  peak: new Color('#f2ecff'),
  select: new Color('#ffffff'),
  accent: new Color('#7ccfc3'),
  space: new Color('#0e1026'),
  star: new Color('#c4cdde'),
};

const biomeColors = BIOMES.map((name) => new Color(BASE[name]));

export const hash = (n: number): number => Math.abs(Math.sin(n * 127.1) * 43758.5453) % 1;

export const tileColor = (
  target: Color, biome: number, tile: number, altitude: number, ash: number, burn: number, tension: number,
): Color => {
  target.copy(biomeColors[biome]);
  const variation = 0.88 + hash(tile) * 0.22;
  target.multiplyScalar(variation);
  if (biome === 0) target.lerp(COLORS.oceanDeep, Math.min(1, Math.max(0, -altitude) * 0.9));
  if (ash > 0) target.lerp(COLORS.ash, Math.min(0.85, ash / 40));
  if (burn > 0) target.lerp(COLORS.fire, 0.8);
  if (tension > 0.55) target.lerp(COLORS.glow, Math.min(0.6, (tension - 0.55) * 1.6));
  return target;
};
