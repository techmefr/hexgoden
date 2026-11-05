import type { WorldEvent } from './disasters';
import { buildGrid, type Grid } from './grid';
import { clamp, nextRange, type Rng } from './rng';
import { ancestors, type Species } from './species';

export const SPECIES_CAP = 48;
export const SEA_LEVEL = 0;
export const GRID_FREQUENCY = 8;

export interface World {
  seed: number;
  tick: number;
  grid: Grid;
  rng: Rng;
  altitude: Float32Array;
  humidity: Float32Array;
  baseHumidity: Float32Array;
  temperature: Float32Array;
  water: Float32Array;
  tension: Float32Array;
  vegetation: Float32Array;
  fertility: Float32Array;
  burn: Uint8Array;
  ash: Uint8Array;
  quake: Uint8Array;
  species: Species[];
  pop: Float32Array;
  settlement: Float32Array;
  civilizations: boolean;
  disasters: boolean;
  lastEvent: WorldEvent | null;
}

export const baseTemperature = (y: number): number => 0.92 - 0.85 * Math.abs(y) ** 1.4;

const smoothNoise = (rng: Rng, x: number, y: number, z: number, phases: number[]): number => {
  let value = 0;
  let amplitude = 1;
  let frequency = 1.6;
  for (let octave = 0; octave < 4; octave++) {
    const p = phases.slice(octave * 3, octave * 3 + 3);
    value += amplitude * Math.sin(x * frequency + p[0]) * Math.cos(y * frequency * 1.3 + p[1]) * Math.sin(z * frequency * 0.9 + p[2]);
    amplitude *= 0.55;
    frequency *= 2.1;
  }
  void rng;
  return value;
};

export const createWorld = (seed: number, frequency = GRID_FREQUENCY, arid = false): World => {
  const grid = buildGrid(frequency);
  const rng: Rng = { state: seed >>> 0 };
  const phases = Array.from({ length: 24 }, () => nextRange(rng, 0, Math.PI * 2));
  const wetPhases = Array.from({ length: 24 }, () => nextRange(rng, 0, Math.PI * 2));
  const world: World = {
    seed,
    tick: 0,
    grid,
    rng,
    altitude: new Float32Array(grid.count),
    humidity: new Float32Array(grid.count),
    baseHumidity: new Float32Array(grid.count),
    temperature: new Float32Array(grid.count),
    water: new Float32Array(grid.count),
    tension: new Float32Array(grid.count),
    vegetation: new Float32Array(grid.count),
    fertility: new Float32Array(grid.count),
    burn: new Uint8Array(grid.count),
    ash: new Uint8Array(grid.count),
    quake: new Uint8Array(grid.count),
    species: ancestors(),
    pop: new Float32Array(grid.count * SPECIES_CAP),
    settlement: new Float32Array(grid.count),
    civilizations: false,
    disasters: false,
    lastEvent: null,
  };
  for (let tile = 0; tile < grid.count; tile++) {
    const x = grid.centers[tile * 3];
    const y = grid.centers[tile * 3 + 1];
    const z = grid.centers[tile * 3 + 2];
    const altitude = smoothNoise(rng, x, y, z, phases) * 0.55 + (arid ? 0.3 : 0.05);
    world.altitude[tile] = clamp(altitude, -0.6, 1.1);
    const wet = smoothNoise(rng, x, y, z, wetPhases);
    world.humidity[tile] = arid ? clamp(0.06 + wet * 0.05, 0.02, 0.15) : clamp(0.5 + wet * 0.35, 0.1, 0.95);
    world.baseHumidity[tile] = world.humidity[tile];
    world.temperature[tile] = clamp(baseTemperature(y) + (arid ? 0.2 : 0) - Math.max(0, altitude) * 0.3, 0, 1);
    world.fertility[tile] = 0.2;
    world.vegetation[tile] = altitude > SEA_LEVEL ? (arid ? 0.02 : 0.05) : 0;
  }
  return world;
};

export const isOcean = (world: World, tile: number): boolean => world.altitude[tile] < SEA_LEVEL;
