import { biomeOf } from './terrain';
import { chance, clamp, nextRange } from './rng';
import { fitness, speciesName, type Diet, type Species } from './species';
import { SEA_LEVEL, SPECIES_CAP, type World } from './world';

const at = (tile: number, s: number): number => tile * SPECIES_CAP + s;

const gauss = (value: number, optimum: number, sigma: number): number => Math.exp(-(((value - optimum) / sigma) ** 2));

const plantSuitability = (world: World, tile: number): number => {
  if (world.altitude[tile] < SEA_LEVEL || world.water[tile] > 0.6 || world.burn[tile] > 0) return 0;
  return gauss(world.temperature[tile], 0.55, 0.3) * gauss(world.humidity[tile], 0.65, 0.35);
};

const growVegetation = (world: World): void => {
  const { grid, vegetation, fertility } = world;
  for (let tile = 0; tile < grid.count; tile++) {
    const suitability = plantSuitability(world, tile);
    if (suitability === 0) { vegetation[tile] = 0; continue; }
    let seedSource = 0;
    for (const n of grid.neighbors[tile]) seedSource = Math.max(seedSource, vegetation[n]);
    const capacity = suitability * (0.6 + fertility[tile] * 0.4);
    const raw = 0.06 * vegetation[tile] * (1 - vegetation[tile] / Math.max(capacity, 0.05));
    const growth = (raw < 0 ? Math.max(raw, -0.012 * vegetation[tile]) : raw) + 0.006 * seedSource * suitability;
    vegetation[tile] = clamp(vegetation[tile] + growth, 0, 1);
    fertility[tile] = clamp(fertility[tile] - 0.0004, 0.1, 1);
  }
};

const foodFor = (world: World, tile: number, diet: Diet): number => {
  if (diet === 'herb') return world.vegetation[tile];
  if (diet === 'detri') return 0.25 + 0.5 * world.humidity[tile] * world.temperature[tile] + world.fertility[tile] * 0.3;
  let herbs = 0;
  for (const s of world.species) if (s.diet === 'herb') herbs += world.pop[at(tile, s.id)];
  return Math.min(1, herbs / 2);
};

const dynamics = (world: World): void => {
  const { grid, species, pop, vegetation } = world;
  const next = new Float32Array(pop.length);
  for (let tile = 0; tile < grid.count; tile++) {
    if (world.altitude[tile] < SEA_LEVEL) continue;
    const totals: Record<Diet, number> = { herb: 0, pred: 0, detri: 0 };
    for (const s of species) totals[s.diet] += pop[at(tile, s.id)];
    for (const s of species) {
      const p = pop[at(tile, s.id)];
      if (p <= 0) continue;
      const fit = fitness(s, world.temperature[tile], world.humidity[tile]);
      const food = foodFor(world, tile, s.diet);
      const capacity = s.diet === 'pred' ? 0.5 * totals.herb + 0.1 : 3 * food + 0.1;
      const crowd = 1 - totals[s.diet] / capacity;
      const death = s.diet === 'pred' ? 0.1 : 0.05;
      let grown = p + p * (s.repro * fit * food * crowd - death);
      if (s.diet === 'herb') vegetation[tile] = clamp(vegetation[tile] - 0.01 * p, 0, 1);
      if (s.diet === 'herb' && totals.pred > 0) grown -= 0.08 * totals.pred * (p / totals.herb);
      grown = Math.max(0, grown);
      const leaving = grown * s.mobility * 0.03;
      next[at(tile, s.id)] += grown - leaving;
      const targets = grid.neighbors[tile].filter((n) => world.altitude[n] >= SEA_LEVEL);
      for (const n of targets) next[at(n, s.id)] += leaving / targets.length;
    }
  }
  for (let i = 0; i < pop.length; i++) pop[i] = next[i] < 0.01 ? 0 : Math.min(next[i], 6);
};

const tilePop = (world: World, tile: number, diet: Diet): number => {
  let total = 0;
  for (const s of world.species) if (s.diet === diet) total += world.pop[at(tile, s.id)];
  return total;
};

const colonize = (world: World): void => {
  for (let tile = 0; tile < world.grid.count; tile++) {
    if (world.altitude[tile] < SEA_LEVEL || world.burn[tile] > 0) continue;
    const humidity = world.humidity[tile];
    const temperature = world.temperature[tile];
    if (world.vegetation[tile] > 0.3 && tilePop(world, tile, 'herb') === 0 && chance(world.rng, 0.004)) world.pop[at(tile, 0)] = 0.3;
    if (tilePop(world, tile, 'herb') > 0.8 && tilePop(world, tile, 'pred') === 0 && chance(world.rng, 0.01)) world.pop[at(tile, 1)] = 0.3;
    if (humidity > 0.45 && temperature > 0.45 && tilePop(world, tile, 'detri') === 0 && chance(world.rng, 0.003)) world.pop[at(tile, 2)] = 0.3;
  }
};

const freeSlot = (world: World): number => {
  if (world.species.length < SPECIES_CAP) return world.species.length;
  const parents = new Set(world.species.map((s) => s.parent));
  for (const s of world.species) {
    if (s.id < 3 || parents.has(s.id)) continue;
    if (speciesTotal(world, s.id) < 0.01) {
      for (let t = 0; t < world.grid.count; t++) world.pop[at(t, s.id)] = 0;
      return s.id;
    }
  }
  return -1;
};

const mutate = (world: World, parent: Species, tile: number): void => {
  const slot = freeSlot(world);
  if (slot < 0) return;
  const rng = world.rng;
  const pull = 0.5;
  const child: Species = {
    id: slot,
    parent: parent.id,
    name: speciesName(parent.diet, biomeOf(world, tile), new Set(world.species.map((s) => s.name))),
    diet: parent.diet,
    heat: clamp(parent.heat + (world.temperature[tile] - parent.heat) * pull + nextRange(rng, -0.08, 0.08), 0.02, 1),
    moist: clamp(parent.moist + (world.humidity[tile] - parent.moist) * pull + nextRange(rng, -0.08, 0.08), 0.02, 1),
    repro: clamp(parent.repro + nextRange(rng, -0.05, 0.06), 0.2, 1),
    size: Math.max(1, parent.size * nextRange(rng, 0.85, 1.2)),
    mobility: clamp(parent.mobility + nextRange(rng, -0.08, 0.08), 0.05, 1),
    born: world.tick,
    hue: (parent.hue + nextRange(rng, -30, 30) + 360) % 360,
  };
  if (slot === world.species.length) world.species.push(child);
  else world.species[slot] = child;
  const moved = world.pop[at(tile, parent.id)] * 0.3;
  world.pop[at(tile, parent.id)] -= moved;
  world.pop[at(tile, child.id)] += moved;
};

const evolve = (world: World): void => {
  for (let tile = 0; tile < world.grid.count; tile++) {
    for (const s of [...world.species]) {
      const p = world.pop[at(tile, s.id)];
      if (p > 1 && chance(world.rng, 0.0015 * p)) mutate(world, s, tile);
    }
  }
};

export const stepLife = (world: World): void => {
  growVegetation(world);
  dynamics(world);
  colonize(world);
  evolve(world);
};

export const speciesTotal = (world: World, id: number): number => {
  let total = 0;
  for (let tile = 0; tile < world.grid.count; tile++) total += world.pop[at(tile, id)];
  return total;
};
