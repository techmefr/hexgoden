import { clamp } from './rng';
import type { World } from './world';

export type Power = 'rain' | 'sun' | 'raise' | 'lower' | 'gust' | 'chill' | 'fog' | 'storm' | 'monsoon' | 'warmwind';
export const POWERS: Power[] = ['rain', 'sun', 'raise', 'lower', 'gust', 'chill', 'fog', 'storm', 'monsoon', 'warmwind'];

const touch = (world: World, tile: number, apply: (target: number, weight: number) => void): void => {
  apply(tile, 1);
  for (const neighbor of world.grid.neighbors[tile]) apply(neighbor, 0.4);
};

export const applyPower = (world: World, tile: number, power: Power): void => {
  if (tile < 0 || tile >= world.grid.count) return;
  const { humidity, baseHumidity, temperature, water, altitude, tension } = world;
  switch (power) {
    case 'rain':
      touch(world, tile, (t, w) => {
        humidity[t] = clamp(humidity[t] + 0.35 * w, 0, 1);
        baseHumidity[t] = clamp(baseHumidity[t] + 0.12 * w, 0.05, 0.98);
        if (altitude[t] >= 0) water[t] = clamp(water[t] + 0.22 * w, 0, 1);
        temperature[t] = clamp(temperature[t] - 0.05 * w, 0, 1);
      });
      break;
    case 'sun':
      touch(world, tile, (t, w) => {
        temperature[t] = clamp(temperature[t] + 0.22 * w, 0, 1);
        humidity[t] = clamp(humidity[t] - 0.18 * w, 0, 1);
        baseHumidity[t] = clamp(baseHumidity[t] - 0.1 * w, 0.05, 0.98);
        water[t] = clamp(water[t] - 0.15 * w, 0, 1);
      });
      break;
    case 'raise':
      touch(world, tile, (t, w) => {
        altitude[t] = clamp(altitude[t] + 0.14 * w, -0.6, 1.1);
        tension[t] = clamp(tension[t] + 0.3 * w, 0, 1);
      });
      break;
    case 'gust': {
      const group = [tile, ...world.grid.neighbors[tile]];
      const meanHumidity = group.reduce((sum, t) => sum + humidity[t], 0) / group.length;
      const meanTemperature = group.reduce((sum, t) => sum + temperature[t], 0) / group.length;
      for (const t of group) {
        humidity[t] += (meanHumidity - humidity[t]) * 0.7;
        temperature[t] += (meanTemperature - temperature[t]) * 0.7;
        for (const n of world.grid.neighbors[t]) world.vegetation[n] = clamp(world.vegetation[n] + 0.04 * world.vegetation[t], 0, 1);
      }
      break;
    }
    case 'fog':
      touch(world, tile, (t, w) => {
        humidity[t] = clamp(humidity[t] + 0.25 * w, 0, 1);
        baseHumidity[t] = clamp(baseHumidity[t] + 0.05 * w, 0.05, 0.98);
        temperature[t] = clamp(temperature[t] - 0.03 * w, 0, 1);
      });
      break;
    case 'storm':
      touch(world, tile, (t, w) => {
        humidity[t] = clamp(humidity[t] + 0.5 * w, 0, 1);
        baseHumidity[t] = clamp(baseHumidity[t] + 0.18 * w, 0.05, 0.98);
        if (altitude[t] >= 0) water[t] = clamp(water[t] + 0.3 * w, 0, 1);
        temperature[t] = clamp(temperature[t] - 0.1 * w, 0, 1);
        if (w === 1) world.burn[t] = 0;
      });
      break;
    case 'monsoon': {
      const reach = new Set<number>([tile]);
      for (const n of world.grid.neighbors[tile]) { reach.add(n); for (const m of world.grid.neighbors[n]) reach.add(m); }
      for (const t of reach) {
        humidity[t] = clamp(humidity[t] + 0.3, 0, 1);
        baseHumidity[t] = clamp(baseHumidity[t] + 0.1, 0.05, 0.98);
      }
      break;
    }
    case 'warmwind': {
      const group = [tile, ...world.grid.neighbors[tile]];
      const meanHumidity = group.reduce((sum, t) => sum + humidity[t], 0) / group.length;
      for (const t of group) {
        humidity[t] += (meanHumidity - humidity[t]) * 0.7;
        temperature[t] = clamp(temperature[t] + 0.12, 0, 1);
        for (const n of world.grid.neighbors[t]) world.vegetation[n] = clamp(world.vegetation[n] + 0.04 * world.vegetation[t], 0, 1);
      }
      break;
    }
    case 'chill':
      touch(world, tile, (t, w) => {
        temperature[t] = clamp(temperature[t] - 0.22 * w, 0, 1);
        humidity[t] = clamp(humidity[t] + 0.04 * w, 0, 1);
      });
      break;
    case 'lower':
      touch(world, tile, (t, w) => {
        altitude[t] = clamp(altitude[t] - 0.14 * w, -0.6, 1.1);
        tension[t] = clamp(tension[t] - 0.12 * w, 0, 1);
      });
      break;
  }
};
