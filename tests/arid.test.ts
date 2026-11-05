import { describe, expect, it } from "vitest";
import { applyPower } from "../src/sim/powers";
import { newWorld } from "../src/sim/start";
import { biomeOf } from "../src/sim/terrain";
import { run } from "../src/sim/tick";
import { STAGES, stageIndex, vitality } from "../src/sim/vitality";
import { runPowers } from "../src/meta/market";
import { freshProgress } from "../src/meta/store";
import { SEA_LEVEL, type World } from "../src/sim/world";

const stats = (world: World) => {
  let land = 0, dry = 0, green = 0;
  for (let t = 0; t < world.grid.count; t++) {
    if (world.altitude[t] < SEA_LEVEL) continue;
    land++;
    const b = biomeOf(world, t);
    if (b === "desert" || b === "tundra") dry++;
    if (world.vegetation[t] > 0.1) green++;
  }
  return { dry: dry / land, green: green / land };
};

describe("arid start", () => {
  it("starts mostly desert with almost no vegetation for several seeds", () => {
    for (const seed of [1, 7, 42, 99]) {
      const { dry, green } = stats(newWorld(seed, true));
      expect(dry).toBeGreaterThan(0.6);
      expect(green).toBeLessThan(0.05);
    }
  });

  it("wakes up when it rains", () => {
    const world = newWorld(42, true);
    const before = stats(world).green;
    const land = [...Array(world.grid.count).keys()].filter((t) => world.altitude[t] >= SEA_LEVEL).slice(0, 40);
    for (let i = 0; i < 600; i++) {
      if (i % 20 === 0) for (const t of land) applyPower(world, t, "rain");
      run(world, 1);
    }
    expect(stats(world).green).toBeGreaterThan(before + 0.01);
  });

  it("stays at barren without actions", () => {
    for (const seed of [1, 7, 42, 99]) {
      const world = newWorld(seed, true);
      run(world, 600);
      expect(stageIndex(vitality(world))).toBe(0);
    }
  });

  it("reaches the lichen stage with steady rain", () => {
    const world = newWorld(42, true);
    const land = [...Array(world.grid.count).keys()].filter((t) => world.altitude[t] >= SEA_LEVEL).slice(0, 60);
    for (let i = 0; i < 1200; i++) {
      if (i % 20 === 0) for (const t of land) applyPower(world, t, "rain");
      run(world, 1);
    }
    expect(stageIndex(vitality(world))).toBeGreaterThanOrEqual(1);
  });
});

describe("stages", () => {
  it("rise with thresholds and grant one power each", () => {
    expect(stageIndex(0)).toBe(0);
    expect(stageIndex(0.16)).toBe(1);
    expect(stageIndex(0.76)).toBe(4);
    expect(STAGES.filter((s) => s.power).length).toBe(4);
  });

  it("adds stage powers to a run and keeps the water god weather only", () => {
    expect(runPowers(freshProgress(), "water", 0, 0)).toEqual(["rain", "sun"]);
    expect(runPowers(freshProgress(), "water", 0, 2)).toEqual(["rain", "sun", "fog", "storm"]);
  });
});
