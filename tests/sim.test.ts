import { describe, expect, it } from 'vitest';
import { buildGrid } from '../src/sim/grid';
import { applyPower } from '../src/sim/powers';
import { run } from '../src/sim/tick';
import { biomeOf } from '../src/sim/terrain';
import { speciesTotal } from '../src/sim/life';
import { createWorld, SEA_LEVEL, type World } from '../src/sim/world';

const landTile = (world: World, wanted = 0): number => {
  const tiles = [...Array(world.grid.count).keys()].filter((t) => world.altitude[t] > 0.1 && world.altitude[t] < 0.6);
  return tiles[wanted % tiles.length];
};

describe('grid', () => {
  const grid = buildGrid(8);
  it('has 642 tiles with 12 pentagons', () => {
    expect(grid.count).toBe(642);
    expect(grid.neighbors.filter((n) => n.length === 5)).toHaveLength(12);
    expect(grid.neighbors.filter((n) => n.length === 6)).toHaveLength(630);
  });
  it('has symmetric neighbours and matching corner counts', () => {
    for (let t = 0; t < grid.count; t++) {
      expect(grid.corners[t].length / 3).toBe(grid.neighbors[t].length);
      for (const n of grid.neighbors[t]) expect(grid.neighbors[n]).toContain(t);
    }
  });
});

describe('powers', () => {
  it('rain raises humidity and sun raises temperature while drying', () => {
    const world = createWorld(7);
    const tile = landTile(world);
    const humidity = world.humidity[tile];
    const temperature = world.temperature[tile];
    applyPower(world, tile, 'rain');
    expect(world.humidity[tile]).toBeGreaterThan(humidity);
    const wet = world.humidity[tile];
    applyPower(world, tile, 'sun');
    expect(world.temperature[tile]).toBeGreaterThan(temperature - 0.06);
    expect(world.humidity[tile]).toBeLessThan(wet);
  });
  it('raising land adds altitude and tension', () => {
    const world = createWorld(7);
    const tile = landTile(world);
    const altitude = world.altitude[tile];
    applyPower(world, tile, 'raise');
    expect(world.altitude[tile]).toBeGreaterThan(altitude);
    expect(world.tension[tile]).toBeGreaterThan(0);
  });
  it('too much sun makes a desert', () => {
    const world = createWorld(7);
    const tile = landTile(world, 3);
    for (let i = 0; i < 6; i++) applyPower(world, tile, 'sun');
    expect(['desert', 'tundra', 'ice']).toContain(biomeOf(world, tile));
    expect(biomeOf(world, tile)).toBe('desert');
  });
});

describe('events', () => {
  it('piling up land triggers an earthquake', () => {
    const world = createWorld(11);
    const tile = landTile(world, 5);
    for (let i = 0; i < 4; i++) applyPower(world, tile, 'raise');
    let quaked = false;
    for (let i = 0; i < 40 && !quaked; i++) {
      run(world, 1);
      quaked = world.quake[tile] > 0;
    }
    expect(quaked).toBe(true);
  });
});

describe('determinism', () => {
  it('replays the same planet from a seed and actions', () => {
    const play = (): World => {
      const world = createWorld(42);
      applyPower(world, landTile(world, 2), 'rain');
      run(world, 60);
      applyPower(world, landTile(world, 9), 'raise');
      run(world, 60);
      return world;
    };
    const a = play();
    const b = play();
    expect(Array.from(a.humidity)).toEqual(Array.from(b.humidity));
    expect(Array.from(a.pop)).toEqual(Array.from(b.pop));
    expect(a.species.map((s) => s.name)).toEqual(b.species.map((s) => s.name));
  });
});

describe('life', () => {
  it('emerges on its own and never controls itself from the player', () => {
    const world = createWorld(5);
    run(world, 400);
    expect([0, 1, 2].some((id) => speciesTotal(world, id) > 0)).toBe(true);
    for (let t = 0; t < world.grid.count; t++) if (world.altitude[t] < SEA_LEVEL) expect(world.vegetation[t]).toBe(0);
  });
  it('produces new species from mutation over a long run', () => {
    const world = createWorld(5);
    run(world, 1500);
    expect(world.species.length).toBeGreaterThan(3);
  });
});
