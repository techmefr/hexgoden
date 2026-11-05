import type { Power } from './powers';

export type GodId = 'water' | 'wind' | 'stone';

export interface God {
  id: GodId;
  powers: Power[];
  price: number;
  playable: boolean;
}

export const GODS: God[] = [
  { id: 'water', powers: ['rain', 'sun'], price: 0, playable: true },
  { id: 'wind', powers: ['gust', 'chill'], price: 150, playable: true },
  { id: 'stone', powers: ['raise', 'lower'], price: 400, playable: true },
];

export const godById = (id: GodId): God => GODS.find((god) => god.id === id) ?? GODS[0];
