export interface Rng {
  state: number;
}

export const nextFloat = (rng: Rng): number => {
  rng.state = (rng.state + 0x6d2b79f5) >>> 0;
  let t = rng.state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const nextRange = (rng: Rng, min: number, max: number): number => min + (max - min) * nextFloat(rng);

export const chance = (rng: Rng, probability: number): boolean => nextFloat(rng) < probability;

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
