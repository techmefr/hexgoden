import { stepClimate } from "./climate";
import { createWorld, type World } from "./world";

export const SETTLE_TICKS = 300;

export const newWorld = (seed: number): World => {
  const world = createWorld(seed);
  for (let i = 0; i < SETTLE_TICKS; i++) stepClimate(world);
  return world;
};
