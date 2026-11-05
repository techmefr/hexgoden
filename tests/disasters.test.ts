import { describe, expect, it } from "vitest";
import { GRACE_TICKS, triggerDisaster, type DisasterKind } from "../src/sim/disasters";
import { applyPower } from "../src/sim/powers";
import { newWorld } from "../src/sim/start";
import { run } from "../src/sim/tick";
import { speciesTotal } from "../src/sim/life";
import { SEA_LEVEL, SPECIES_CAP, type World } from "../src/sim/world";

const landTile = (world: World): number => [...Array(world.grid.count).keys()].find((t) => world.altitude[t] >= SEA_LEVEL && world.altitude[t] < 0.4) ?? 0;

const populate = (world: World, tile: number): void => {
  world.pop[tile * SPECIES_CAP] = 3;
  world.vegetation[tile] = 0.8;
};

describe("disasters", () => {
  it("strikes nothing during the grace period", () => {
    const world = newWorld(42, true);
    run(world, GRACE_TICKS - 1);
    expect(world.lastEvent).toBeNull();
  });

  it("is off unless enabled", () => {
    const world = newWorld(42, false);
    run(world, GRACE_TICKS + 3000);
    expect(world.lastEvent).toBeNull();
  });

  it("produces several kinds over twenty minutes and is deterministic", () => {
    const kinds = new Set<DisasterKind>();
    const world = newWorld(7, true);
    let last = -1;
    for (let i = 0; i < 4800; i++) {
      run(world, 1);
      if (world.lastEvent && world.lastEvent.tick !== last) {
        last = world.lastEvent.tick;
        kinds.add(world.lastEvent.kind);
      }
    }
    expect(kinds.size).toBeGreaterThanOrEqual(3);
    const again = newWorld(7, true);
    run(again, 4800);
    expect(again.lastEvent).toEqual(world.lastEvent);
  });

  it("makes a meteorite wipe life and enrich the ground", () => {
    const world = newWorld(42, true);
    const tile = landTile(world);
    populate(world, tile);
    const fertility = world.fertility[tile];
    triggerDisaster(world, "meteorite", tile);
    expect(world.vegetation[tile]).toBe(0);
    expect(speciesTotal(world, 0)).toBeLessThan(0.2);
    expect(world.fertility[tile]).toBeGreaterThan(fertility);
    expect(world.lastEvent?.kind).toBe("meteorite");
  });

  it("dries land in a drought and lets rain undo it", () => {
    const world = newWorld(42, true);
    const tile = landTile(world);
    world.baseHumidity[tile] = 0.6;
    const before = world.baseHumidity[tile];
    triggerDisaster(world, "drought", tile);
    expect(world.baseHumidity[tile]).toBeLessThan(before);
    const dried = world.baseHumidity[tile];
    applyPower(world, tile, "rain");
    expect(world.baseHumidity[tile]).toBeGreaterThan(dried);
  });

  it("floods, erupts and chills with local effects", () => {
    const world = newWorld(42, true);
    const tile = landTile(world);
    const water = world.water[tile];
    triggerDisaster(world, "flood", tile);
    expect(world.water[tile]).toBeGreaterThan(water);
    const altitude = world.altitude[tile];
    triggerDisaster(world, "volcano", tile);
    expect(world.altitude[tile]).toBeGreaterThan(altitude);
    expect(world.ash[tile]).toBeGreaterThan(0);
    const temperature = world.temperature[tile];
    triggerDisaster(world, "coldsnap", tile);
    expect(world.temperature[tile]).toBeLessThan(temperature);
  });
});
