import { godById, type GodId } from '../sim/gods';
import { POWERS, type Power } from '../sim/powers';

export interface Progress {
  version: 1;
  points: number;
  earned: number;
  unlocked: GodId[];
  owned: Power[];
  rentals: Partial<Record<Power, number>>;
  tutorial: number;
}

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const STORAGE_KEY = 'hexgoden.progress';

export const freshProgress = (): Progress => ({ version: 1, points: 0, earned: 0, unlocked: ['water'], owned: [], rentals: {}, tutorial: 0 });

const isPower = (value: unknown): value is Power => POWERS.includes(value as Power);

const isGodId = (value: unknown): value is GodId => value === 'water' || value === 'wind' || value === 'stone';

export const parseProgress = (raw: string | null): Progress => {
  if (!raw) return freshProgress();
  try {
    const data = JSON.parse(raw) as Partial<Progress>;
    const valid = data.version === 1 && typeof data.points === 'number' && Number.isFinite(data.points) && data.points >= 0 && Array.isArray(data.unlocked);
    if (!valid) return freshProgress();
    const unlocked = [...new Set<GodId>(['water', ...(data.unlocked as unknown[]).filter(isGodId)])];
    const earned = typeof data.earned === 'number' && Number.isFinite(data.earned) && data.earned >= data.points! ? data.earned : (data.points as number);
    const owned = Array.isArray(data.owned) ? [...new Set(data.owned.filter(isPower))] : [];
    const rentals: Progress['rentals'] = {};
    for (const [power, until] of Object.entries(data.rentals ?? {})) if (isPower(power) && typeof until === 'number' && Number.isFinite(until)) rentals[power] = until;
    const tutorial = typeof data.tutorial === 'number' && Number.isInteger(data.tutorial) && data.tutorial >= 0 ? data.tutorial : 0;
    return { version: 1, points: data.points as number, earned, unlocked, owned, rentals, tutorial };
  } catch {
    return freshProgress();
  }
};

export const loadProgress = (storage: KeyValueStorage | null): Progress => {
  try {
    return parseProgress(storage?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return freshProgress();
  }
};

export const saveProgress = (storage: KeyValueStorage | null, progress: Progress): void => {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    return;
  }
};

export const addPoints = (progress: Progress, amount: number): Progress => (amount > 0 ? { ...progress, points: progress.points + amount, earned: progress.earned + amount } : progress);

export const canUnlock = (progress: Progress, id: GodId): boolean => {
  const god = godById(id);
  return god.playable && !progress.unlocked.includes(id) && progress.points >= god.price;
};

export const unlockGod = (progress: Progress, id: GodId): Progress => {
  if (!canUnlock(progress, id)) return progress;
  return { ...progress, points: progress.points - godById(id).price, unlocked: [...progress.unlocked, id] };
};

export const missingPoints = (progress: Progress, id: GodId): number => Math.max(0, Math.ceil(godById(id).price - progress.points));
