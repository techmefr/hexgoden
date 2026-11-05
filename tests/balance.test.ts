import { describe, expect, it } from "vitest";
import { applyPower } from "../src/sim/powers";
import { tickPoints } from "../src/sim/score";
import { newWorld } from "../src/sim/start";
import { biomeOf } from "../src/sim/terrain";
import { run, step } from "../src/sim/tick";
import type { World } from "../src/sim/world";

const countBiome = (world: World, biome: string): number => {
  let n = 0;
  for (let t = 0; t < world.grid.count; t++) if (biomeOf(world, t) === biome) n++;
  return n;
};

const heatForest = (world: World): number[] => {
  const forest = [...Array(world.grid.count).keys()].filter((t) => biomeOf(world, t) === "forest").slice(0, 30);
  for (const t of forest) for (let i = 0; i < 4; i++) applyPower(world, t, "sun");
  return forest;
};

describe("balance", () => {
  it("leaves an untouched world stable once settled", () => {
    const world = newWorld(42);
    run(world, 400);
    const before = countBiome(world, "forest") + countBiome(world, "swamp");
    run(world, 1500);
    const after = countBiome(world, "forest") + countBiome(world, "swamp");
    expect(Math.abs(after - before)).toBeLessThan(30);
  });

  it("makes the effect of strong sun last for minutes", () => {
    const world = newWorld(42);
    run(world, 400);
    const forests = countBiome(world, "forest");
    heatForest(world);
    run(world, 300);
    expect(countBiome(world, "forest")).toBeLessThan(forests - 15);
  });

  it("lets a dried forest catch fire", () => {
    const world = newWorld(5);
    run(world, 400);
    heatForest(world);
    let burned = 0;
    for (let i = 0; i < 300; i++) {
      run(world, 1);
      for (let t = 0; t < world.grid.count; t++) if (world.burn[t] > 0) burned++;
    }
    expect(burned).toBeGreaterThan(0);
  });

  it("earns about Wind price in a ten-minute run", () => {
    const world = newWorld(5);
    let points = 0;
    while (world.tick < 2400) { step(world); points += tickPoints(world); }
    expect(points).toBeGreaterThan(100);
    expect(points).toBeLessThan(260);
  });
});
