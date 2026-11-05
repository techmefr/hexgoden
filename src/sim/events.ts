import { chance, clamp, nextRange } from './rng';
import { SEA_LEVEL, SPECIES_CAP, type World } from './world';

const BURN_TICKS = 4;
const ASH_TICKS = 60;
const QUAKE_TICKS = 6;

const scalePopulations = (world: World, tile: number, factor: number): void => {
  for (let s = 0; s < SPECIES_CAP; s++) world.pop[tile * SPECIES_CAP + s] *= factor;
};

const shake = (world: World, tile: number): void => {
  const around = world.grid.neighbors[tile];
  const share = (world.tension[tile] * 0.8) / around.length;
  world.tension[tile] *= 0.2;
  world.quake[tile] = QUAKE_TICKS;
  for (const n of around) {
    world.altitude[n] = clamp(world.altitude[n] + nextRange(world.rng, -0.1, 0.1), -0.6, 1.1);
    world.tension[n] = clamp(world.tension[n] + share, 0, 1);
    world.vegetation[n] *= 0.6;
    world.quake[n] = QUAKE_TICKS;
    scalePopulations(world, n, 0.7);
  }
};

const ignite = (world: World, tile: number): void => {
  world.burn[tile] = BURN_TICKS;
  scalePopulations(world, tile, 0.2);
};

export const stepEvents = (world: World): void => {
  const { grid, tension, vegetation, humidity, temperature, water, burn, ash, quake, fertility, altitude } = world;
  const burning: number[] = [];
  for (let tile = 0; tile < grid.count; tile++) {
    tension[tile] = Math.max(0, tension[tile] - 0.002);
    if (quake[tile] > 0) quake[tile]--;
    if (ash[tile] > 0) ash[tile]--;
    if (burn[tile] > 0) burning.push(tile);
  }
  for (let tile = 0; tile < grid.count; tile++) {
    if (tension[tile] > 0.85 && chance(world.rng, 0.25)) shake(world, tile);
    if (altitude[tile] >= SEA_LEVEL && water[tile] > 0.7) {
      vegetation[tile] *= 0.85;
      scalePopulations(world, tile, 0.92);
    }
    const dry = vegetation[tile] > 0.3 && humidity[tile] < 0.3 && temperature[tile] > 0.6;
    if (dry && burn[tile] === 0 && chance(world.rng, 0.006)) ignite(world, tile);
  }
  for (const tile of burning) {
    vegetation[tile] = 0;
    fertility[tile] = clamp(fertility[tile] + 0.15, 0, 1);
    ash[tile] = ASH_TICKS;
    burn[tile]--;
    for (const n of grid.neighbors[tile]) {
      const fuel = vegetation[n] > 0.3 && humidity[n] < 0.4 && temperature[n] > 0.5;
      if (fuel && burn[n] === 0 && chance(world.rng, 0.14)) ignite(world, n);
    }
  }
};
