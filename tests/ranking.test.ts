import { describe, expect, it } from 'vitest';
import { addPoints, freshProgress, parseProgress, unlockGod } from '../src/meta/store';
import { board, standing, tierFor } from '../src/meta/ranking';

describe('ranking', () => {
  it('starts last with the first tier', () => {
    const s = standing(0);
    expect(s.position).toBe(13);
    expect(s.tier.id).toBe('sprout');
    expect(s.next?.id).toBe('wisp');
    expect(s.missing).toBe(100);
  });

  it('climbs as points grow and names the next tier', () => {
    expect(standing(500).position).toBeLessThan(standing(100).position);
    expect(tierFor(300).id).toBe('spring');
    expect(standing(3000).next).toBeNull();
    expect(standing(99999).position).toBe(1);
  });

  it('keeps the board sorted with the player inside', () => {
    const rows = board(275);
    expect(rows.filter((r) => r.name === null)).toHaveLength(1);
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].score).toBeGreaterThanOrEqual(rows[i].score);
    expect(rows.find((r) => r.name === null)?.position).toBe(standing(275).position);
  });

  it('never drops when points are spent', () => {
    const earned = addPoints(freshProgress(), 200);
    const spent = unlockGod(earned, 'wind');
    expect(spent.points).toBe(50);
    expect(spent.earned).toBe(200);
    expect(standing(spent.earned).position).toBe(standing(earned.earned).position);
  });

  it('reads older saves that have no earned total', () => {
    const old = parseProgress(JSON.stringify({ version: 1, points: 120, unlocked: ['water'] }));
    expect(old.earned).toBe(120);
  });
});
