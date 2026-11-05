import { describe, expect, it } from 'vitest';
import { addPoints, canUnlock, freshProgress, loadProgress, missingPoints, parseProgress, saveProgress, unlockGod, type KeyValueStorage } from '../src/meta/store';
import { godById } from '../src/sim/gods';
import { applyPower } from '../src/sim/powers';
import { tickPoints } from '../src/sim/score';
import { run } from '../src/sim/tick';
import { createWorld } from '../src/sim/world';

const memory = (): KeyValueStorage => {
  const data = new Map<string, string>();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
};

describe('points', () => {
  it('grow with life and are never negative', () => {
    const world = createWorld(5);
    const early = tickPoints(world);
    run(world, 400);
    expect(tickPoints(world)).toBeGreaterThan(early);
    expect(early).toBeGreaterThanOrEqual(0);
  });
});

describe('unlocks', () => {
  it('refuses without enough points and changes nothing', () => {
    const progress = addPoints(freshProgress(), 100);
    expect(canUnlock(progress, 'wind')).toBe(false);
    expect(unlockGod(progress, 'wind')).toBe(progress);
    expect(missingPoints(progress, 'wind')).toBe(50);
  });
  it('spends the price once', () => {
    const unlocked = unlockGod(addPoints(freshProgress(), 200), 'wind');
    expect(unlocked.points).toBe(50);
    expect(unlocked.unlocked).toContain('wind');
    expect(unlockGod(unlocked, 'wind')).toBe(unlocked);
  });
  it('keeps stone locked', () => {
    expect(canUnlock(addPoints(freshProgress(), 9999), 'stone')).toBe(false);
  });
  it('ignores negative gains', () => {
    const progress = freshProgress();
    expect(addPoints(progress, -5)).toBe(progress);
  });
});

describe('persistence', () => {
  it('round trips and survives corrupt or missing storage', () => {
    const storage = memory();
    saveProgress(storage, unlockGod(addPoints(freshProgress(), 300), 'wind'));
    expect(loadProgress(storage).unlocked).toContain('wind');
    expect(parseProgress('{nope')).toEqual(freshProgress());
    expect(parseProgress(JSON.stringify({ version: 1, points: -3, unlocked: [] }))).toEqual(freshProgress());
    expect(loadProgress(null)).toEqual(freshProgress());
  });
});

describe('wind god', () => {
  it('offers only gust and chill', () => {
    expect(godById('wind').powers).toEqual(['gust', 'chill']);
  });
  it('gust smooths humidity around a tile and chill cools it', () => {
    const world = createWorld(7);
    const tile = 100;
    world.humidity[tile] = 1;
    const group = [tile, ...world.grid.neighbors[tile]];
    const spread = (): number => Math.max(...group.map((t) => world.humidity[t])) - Math.min(...group.map((t) => world.humidity[t]));
    const before = spread();
    applyPower(world, tile, 'gust');
    expect(spread()).toBeLessThan(before);
    const temperature = world.temperature[tile];
    applyPower(world, tile, 'chill');
    expect(world.temperature[tile]).toBeLessThan(temperature);
  });
});
