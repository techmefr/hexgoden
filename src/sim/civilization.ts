import { chance, clamp } from "./rng";
import { SEA_LEVEL, SPECIES_CAP, type World } from "./world";

export const EMERGENCE_TICK = 2000;
export const EMERGENCE_CHANCE = 0.002;
export const SEED_SIZE = 0.1;
export const CIVILIZATION_POINTS = 0.0006;

export interface Era {
  id: "tribes" | "villages" | "towns" | "cities";
  from: number;
}

export const ERAS: Era[] = [
  { id: "tribes", from: 0 },
  { id: "villages", from: 3 },
  { id: "towns", from: 10 },
  { id: "cities", from: 25 },
];

const herbivores = (world: World, tile: number): number => {
  let total = 0;
  for (const s of world.species) if (s.diet === "herb") total += world.pop[tile * SPECIES_CAP + s.id];
  return total;
};

const habitability = (world: World, tile: number): number => {
  if (world.altitude[tile] < SEA_LEVEL || world.water[tile] > 0.5 || world.burn[tile] > 0) return 0;
  const humidity = world.humidity[tile];
  const temperature = world.temperature[tile];
  if (humidity < 0.25 || humidity > 0.9 || temperature < 0.3 || temperature > 0.85) return 0;
  return clamp(world.vegetation[tile] * 0.6 + Math.min(1, herbivores(world, tile) / 2) * 0.4, 0, 1);
};

export const settlementMass = (world: World): number => {
  let total = 0;
  for (let tile = 0; tile < world.grid.count; tile++) total += world.settlement[tile];
  return total;
};

export const eraIndex = (mass: number): number => {
  let index = 0;
  for (let i = 0; i < ERAS.length; i++) if (mass >= ERAS[i].from) index = i;
  return index;
};

export const civilizationPoints = (world: World): number => settlementMass(world) * CIVILIZATION_POINTS;

export const stepCivilization = (world: World): void => {
  if (!world.civilizations) return;
  const { grid, settlement } = world;
  const next = Float32Array.from(settlement);
  for (let tile = 0; tile < grid.count; tile++) {
    const size = settlement[tile];
    const home = habitability(world, tile);
    if (size === 0) {
      if (world.tick >= EMERGENCE_TICK && home > 0.3 && herbivores(world, tile) > 0.5 && chance(world.rng, EMERGENCE_CHANCE)) next[tile] = SEED_SIZE;
      continue;
    }
    if (home === 0) {
      next[tile] = size * 0.94 < 0.02 ? 0 : size * 0.94;
      continue;
    }
    const grown = size + 0.012 * size * (1 - size / Math.max(home, 0.1));
    next[tile] = clamp(Math.min(1, grown), 0, 1);
    if (size > 0.5 && chance(world.rng, 0.01)) {
      const options = grid.neighbors[tile].filter((n) => settlement[n] === 0 && next[n] === 0 && habitability(world, n) > 0.4);
      if (options.length > 0) next[options[Math.floor(world.rng.state % options.length)]] = SEED_SIZE;
    }
  }
  settlement.set(next);
};
