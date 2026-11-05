import { baseTemperature, SEA_LEVEL, type World } from './world';
import { clamp } from './rng';

export const stepClimate = (world: World): void => {
  const { grid, altitude, humidity, temperature, water } = world;
  const nextHumidity = new Float32Array(grid.count);
  const nextTemperature = new Float32Array(grid.count);
  const nextWater = new Float32Array(grid.count);
  for (let tile = 0; tile < grid.count; tile++) {
    const around = grid.neighbors[tile];
    let sumHumidity = 0;
    let sumTemperature = 0;
    let windward = 0;
    for (const n of around) {
      sumHumidity += humidity[n];
      sumTemperature += temperature[n];
      windward = Math.max(windward, altitude[n] - altitude[tile]);
    }
    const ocean = altitude[tile] < SEA_LEVEL;
    let h = humidity[tile] + 0.15 * (sumHumidity / around.length - humidity[tile]);
    if (ocean) h += 0.08 * (0.9 - h);
    h -= 0.004 * temperature[tile];
    h += water[tile] * 0.06 * (1 - h);
    h -= windward > 0.35 ? 0.01 : 0;
    nextHumidity[tile] = clamp(h, 0, 1);
    const latitude = world.grid.centers[tile * 3 + 1];
    const target = baseTemperature(latitude) - Math.max(0, altitude[tile]) * 0.3;
    nextTemperature[tile] = clamp(temperature[tile] + 0.1 * (sumTemperature / around.length - temperature[tile]) + 0.015 * (target - temperature[tile]), 0, 1);
  }
  for (let tile = 0; tile < grid.count; tile++) {
    if (altitude[tile] < SEA_LEVEL) { continue; }
    let amount = water[tile];
    if (nextHumidity[tile] > 0.85) amount += 0.02;
    amount -= 0.008 * nextTemperature[tile] + 0.002;
    if (amount <= 0) continue;
    let lowest = tile;
    let lowestLevel = altitude[tile] + water[tile] * 0.2;
    for (const n of grid.neighbors[tile]) {
      const level = altitude[n] + water[n] * 0.2;
      if (level < lowestLevel) { lowestLevel = level; lowest = n; }
    }
    if (lowest === tile) nextWater[tile] += amount;
    else {
      nextWater[tile] += amount * 0.7;
      nextWater[lowest] += amount * 0.3;
    }
  }
  humidity.set(nextHumidity);
  temperature.set(nextTemperature);
  for (let tile = 0; tile < grid.count; tile++) water[tile] = altitude[tile] < SEA_LEVEL ? 0 : clamp(nextWater[tile], 0, 1);
};
