import { chance, clamp, nextFloat, nextRange } from "./rng";
import { SEA_LEVEL, SPECIES_CAP, type World } from "./world";

export type DisasterKind = "meteorite" | "drought" | "flood" | "volcano" | "coldsnap";

export interface WorldEvent {
  kind: DisasterKind;
  tile: number;
  tick: number;
}

export const GRACE_TICKS = 1200;
export const EVENT_CHANCE = 0.002;

const WEIGHTS: [DisasterKind, number][] = [
  ["meteorite", 0.2],
  ["drought", 0.25],
  ["flood", 0.2],
  ["volcano", 0.1],
  ["coldsnap", 0.25],
];

export const ring = (world: World, tile: number, radius: number): number[] => {
  const seen = new Set<number>([tile]);
  let edge = [tile];
  for (let step = 0; step < radius; step++) {
    const next: number[] = [];
    for (const t of edge) for (const n of world.grid.neighbors[t]) if (!seen.has(n)) { seen.add(n); next.push(n); }
    edge = next;
  }
  return [...seen];
};

const scale = (world: World, tile: number, factor: number): void => {
  for (let s = 0; s < SPECIES_CAP; s++) world.pop[tile * SPECIES_CAP + s] *= factor;
  world.settlement[tile] *= Math.min(1, factor * 1.5);
};

const meteorite = (world: World, tile: number): void => {
  const inner = new Set(ring(world, tile, 1));
  for (const t of ring(world, tile, 3)) {
    const core = inner.has(t);
    world.vegetation[t] = 0;
    scale(world, t, core ? 0.02 : 0.2);
    world.ash[t] = 60;
    world.fertility[t] = clamp(world.fertility[t] + 0.35, 0, 1);
    if (core) world.burn[t] = 4;
    else world.altitude[t] = clamp(world.altitude[t] + 0.08, -0.6, 1.1);
  }
  world.altitude[tile] = clamp(world.altitude[tile] - 0.3, -0.6, 1.1);
  world.tension[tile] = clamp(world.tension[tile] + 0.3, 0, 1);
};

const drought = (world: World, tile: number): void => {
  for (const t of ring(world, tile, 4)) {
    world.humidity[t] = clamp(world.humidity[t] - 0.3, 0, 1);
    world.baseHumidity[t] = clamp(world.baseHumidity[t] - 0.25, 0.05, 0.98);
    world.water[t] = clamp(world.water[t] - 0.3, 0, 1);
    world.temperature[t] = clamp(world.temperature[t] + 0.1, 0, 1);
  }
};

const flood = (world: World, tile: number): void => {
  for (const t of ring(world, tile, 2)) {
    if (world.altitude[t] < SEA_LEVEL) continue;
    world.water[t] = clamp(world.water[t] + 0.6, 0, 1);
    world.humidity[t] = clamp(world.humidity[t] + 0.3, 0, 1);
    world.fertility[t] = clamp(world.fertility[t] + 0.15, 0, 1);
    scale(world, t, 0.6);
  }
};

const volcano = (world: World, tile: number): void => {
  world.altitude[tile] = clamp(world.altitude[tile] + 0.25, -0.6, 1.1);
  world.tension[tile] = 0;
  for (const t of ring(world, tile, 2)) {
    world.vegetation[t] = 0;
    scale(world, t, 0.1);
    world.ash[t] = 60;
    world.burn[t] = 3;
    world.fertility[t] = clamp(world.fertility[t] + 0.45, 0, 1);
    world.temperature[t] = clamp(world.temperature[t] + 0.15, 0, 1);
  }
};

const coldsnap = (world: World, tile: number): void => {
  for (const t of ring(world, tile, 5)) {
    world.temperature[t] = clamp(world.temperature[t] - 0.2, 0, 1);
    world.vegetation[t] *= 0.7;
    scale(world, t, 0.75);
  }
};

const EFFECTS: Record<DisasterKind, (world: World, tile: number) => void> = { meteorite, drought, flood, volcano, coldsnap };

const pickKind = (world: World): DisasterKind => {
  let roll = nextFloat(world.rng);
  for (const [kind, weight] of WEIGHTS) {
    if (roll < weight) return kind;
    roll -= weight;
  }
  return "coldsnap";
};

const pickTile = (world: World, kind: DisasterKind): number => {
  const count = world.grid.count;
  for (let attempt = 0; attempt < 40; attempt++) {
    const tile = Math.floor(nextRange(world.rng, 0, count));
    const land = world.altitude[tile] >= SEA_LEVEL;
    if (kind === "volcano" ? world.altitude[tile] > 0.4 : kind === "meteorite" ? true : land) return tile;
  }
  return Math.floor(nextRange(world.rng, 0, count));
};

export const triggerDisaster = (world: World, kind: DisasterKind, tile: number): void => {
  EFFECTS[kind](world, tile);
  world.lastEvent = { kind, tile, tick: world.tick };
};

export const stepDisasters = (world: World): void => {
  if (!world.disasters || world.tick < GRACE_TICKS || !chance(world.rng, EVENT_CHANCE)) return;
  const kind = pickKind(world);
  triggerDisaster(world, kind, pickTile(world, kind));
};
