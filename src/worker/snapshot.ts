import { biomeIndex, biomeOf } from '../sim/terrain';
import { vitality } from '../sim/vitality';
import { speciesTotal } from '../sim/life';
import { SPECIES_CAP, type World } from '../sim/world';
import type { Snapshot, SpeciesInfo } from './protocol';

export const makeSnapshot = (world: World, previous: Map<number, number>, points: number): Snapshot => {
  const count = world.grid.count;
  const biome = new Uint8Array(count);
  const dominant = new Int16Array(count).fill(-1);
  const dominantPop = new Float32Array(count);
  for (let tile = 0; tile < count; tile++) {
    biome[tile] = biomeIndex(biomeOf(world, tile));
    for (const s of world.species) {
      const p = world.pop[tile * SPECIES_CAP + s.id];
      if (p > dominantPop[tile]) { dominantPop[tile] = p; dominant[tile] = s.id; }
    }
  }
  const species: SpeciesInfo[] = world.species
    .map((s): SpeciesInfo => {
      const total = speciesTotal(world, s.id);
      const before = previous.get(s.id) ?? total;
      const trend = total > before * 1.04 + 0.2 ? 'rising' : total < before * 0.96 - 0.2 ? 'falling' : 'stable';
      return { id: s.id, parent: s.parent, name: s.name, diet: s.diet, heat: s.heat, moist: s.moist, size: s.size, mobility: s.mobility, hue: s.hue, total, trend };
    })
    .filter((s) => s.total > 0.3);
  return {
    tick: world.tick,
    points,
    vitality: vitality(world),
    event: world.lastEvent,
    altitude: world.altitude.slice(),
    humidity: world.humidity.slice(),
    temperature: world.temperature.slice(),
    water: world.water.slice(),
    tension: world.tension.slice(),
    vegetation: world.vegetation.slice(),
    burn: world.burn.slice(),
    ash: world.ash.slice(),
    quake: world.quake.slice(),
    biome,
    dominant,
    dominantPop,
    species,
  };
};
