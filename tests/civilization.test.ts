import { describe, expect, it } from "vitest";
import { EMERGENCE_TICK, ERAS, eraIndex, settlementMass, stepCivilization } from "../src/sim/civilization";
import { triggerDisaster } from "../src/sim/disasters";
import { newWorld } from "../src/sim/start";
import { run } from "../src/sim/tick";
import { SEA_LEVEL, SPECIES_CAP, type World } from "../src/sim/world";

const lushLand = (world: World): number => {
  const tile = [...Array(world.grid.count).keys()].find((t) => world.altitude[t] >= SEA_LEVEL && world.altitude[t] < 0.4) ?? 0;
  world.humidity[tile] = 0.6;
  world.temperature[tile] = 0.6;
  world.water[tile] = 0;
  world.vegetation[tile] = 0.9;
  world.pop[tile * SPECIES_CAP] = 3;
  return tile;
};

describe("civilization", () => {
  it("is off unless enabled", () => {
    const world = newWorld(42, false);
    world.settlement[3] = 0.5;
    stepCivilization(world);
    expect(world.settlement[3]).toBe(0.5);
  });

  it("grows on lush land and spreads to neighbors", () => {
    const world = newWorld(42, true);
    const tile = lushLand(world);
    for (const n of world.grid.neighbors[tile]) {
      world.humidity[n] = 0.6;
      world.temperature[n] = 0.6;
      world.vegetation[n] = 0.9;
      world.water[n] = 0;
      world.altitude[n] = 0.2;
    }
    world.settlement[tile] = 0.6;
    for (let i = 0; i < 600; i++) stepCivilization(world);
    expect(world.settlement[tile]).toBeGreaterThan(0.6);
    expect(world.grid.neighbors[tile].some((n) => world.settlement[n] > 0)).toBe(true);
  });

  it("fades on dry land and survives a meteorite only in part", () => {
    const world = newWorld(42, true);
    const tile = lushLand(world);
    world.settlement[tile] = 0.8;
    world.humidity[tile] = 0.05;
    for (let i = 0; i < 100; i++) stepCivilization(world);
    expect(world.settlement[tile]).toBe(0);
    world.settlement[tile] = 0.8;
    triggerDisaster(world, "meteorite", tile);
    expect(world.settlement[tile]).toBeLessThan(0.1);
  });

  it("emerges by itself only after the emergence tick", () => {
    const world = newWorld(42, true);
    lushLand(world);
    run(world, EMERGENCE_TICK - 100);
    expect(settlementMass(world)).toBe(0);
  });

  it("names eras by total settlement", () => {
    expect(eraIndex(0)).toBe(0);
    expect(eraIndex(12)).toBe(2);
    expect(eraIndex(99)).toBe(ERAS.length - 1);
  });
});
