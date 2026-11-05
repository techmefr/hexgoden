import { stepClimate } from './climate';
import { stepCivilization } from './civilization';
import { stepDisasters } from './disasters';
import { stepEvents } from './events';
import { stepLife } from './life';
import type { World } from './world';

export const step = (world: World): void => {
  stepClimate(world);
  stepEvents(world);
  stepDisasters(world);
  stepCivilization(world);
  stepLife(world);
  world.tick++;
};

export const run = (world: World, ticks: number): void => {
  for (let i = 0; i < ticks; i++) step(world);
};
