export interface RankTier {
  id: 'sprout' | 'wisp' | 'spring' | 'river' | 'tide' | 'aeon';
  from: number;
}

export const TIERS: RankTier[] = [
  { id: 'sprout', from: 0 },
  { id: 'wisp', from: 100 },
  { id: 'spring', from: 300 },
  { id: 'river', from: 700 },
  { id: 'tide', from: 1500 },
  { id: 'aeon', from: 3000 },
];

export interface RivalGod {
  name: string;
  score: number;
}

export const RIVALS: RivalGod[] = [
  { name: 'Brume', score: 40 },
  { name: 'Cairn', score: 90 },
  { name: 'Dune', score: 150 },
  { name: 'Eolia', score: 260 },
  { name: 'Fjord', score: 400 },
  { name: 'Gaia', score: 620 },
  { name: 'Hale', score: 900 },
  { name: 'Ilex', score: 1300 },
  { name: 'Jade', score: 1900 },
  { name: 'Kelp', score: 2800 },
  { name: 'Lumen', score: 4200 },
  { name: 'Myrrh', score: 6500 },
];

export interface Standing {
  position: number;
  total: number;
  tier: RankTier;
  next: RankTier | null;
  missing: number;
}

export const tierFor = (earned: number): RankTier => [...TIERS].reverse().find((tier) => earned >= tier.from) ?? TIERS[0];

export const standing = (earned: number): Standing => {
  const tier = tierFor(earned);
  const next = TIERS.find((candidate) => candidate.from > earned) ?? null;
  return {
    position: 1 + RIVALS.filter((rival) => rival.score > earned).length,
    total: RIVALS.length + 1,
    tier,
    next,
    missing: next ? Math.ceil(next.from - earned) : 0,
  };
};

export interface Entry {
  name: string | null;
  score: number;
  position: number;
}

export const board = (earned: number): Entry[] => {
  const rows = [...RIVALS.map((r) => ({ name: r.name as string | null, score: r.score })), { name: null, score: earned }];
  return rows.sort((a, b) => b.score - a.score || (a.name === null ? 1 : -1)).map((row, i) => ({ ...row, position: i + 1 }));
};
