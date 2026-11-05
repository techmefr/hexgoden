import { civilizationPoints } from './civilization';
import { speciesTotal } from './life';
import type { World } from './world';

export const SPECIES_POINTS = 0.004;
export const VEGETATION_POINTS = 0.0002;

export const tickPoints = (world: World): number => {
  let living = 0;
  for (const s of world.species) if (speciesTotal(world, s.id) > 0.5) living++;
  let vegetated = 0;
  for (let tile = 0; tile < world.grid.count; tile++) if (world.vegetation[tile] > 0.3) vegetated++;
  return living * SPECIES_POINTS + vegetated * VEGETATION_POINTS + civilizationPoints(world);
};
