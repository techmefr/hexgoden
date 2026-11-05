import { SEA_LEVEL, type World } from './world';

export const BIOMES = ['ocean', 'desert', 'grassland', 'forest', 'jungle', 'swamp', 'tundra', 'ice', 'mountain'] as const;
export type Biome = (typeof BIOMES)[number];

export const biomeOf = (world: World, tile: number): Biome => {
  const altitude = world.altitude[tile];
  const humidity = world.humidity[tile];
  const temperature = world.temperature[tile];
  if (altitude < SEA_LEVEL || world.water[tile] > 0.55) return 'ocean';
  if (temperature < 0.14) return 'ice';
  if (temperature < 0.3) return 'tundra';
  if (altitude > 0.7) return 'mountain';
  if (humidity < 0.3 && temperature > 0.4) return 'desert';
  if (humidity > 0.78 && altitude < 0.25) return 'swamp';
  if (temperature > 0.68 && humidity > 0.58) return 'jungle';
  if (humidity > 0.5) return 'forest';
  return 'grassland';
};

export const biomeIndex = (biome: Biome): number => BIOMES.indexOf(biome);
