import { stepClimate } from "./climate";
import { createWorld, GRID_FREQUENCY, type World } from "./world";

export const SETTLE_TICKS = 300;

export const newWorld = (seed: number, arid = false): World => {
  const world = createWorld(seed, GRID_FREQUENCY, arid);
  for (let i = 0; i < SETTLE_TICKS; i++) stepClimate(world);
  world.disasters = arid;
  world.civilizations = arid;
  return world;
};
