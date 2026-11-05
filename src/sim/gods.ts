import type { Power } from './powers';

export type GodId = 'water' | 'wind' | 'stone' | 'time';

export interface God {
  id: GodId;
  powers: Power[];
  price: number;
  playable: boolean;
  speeds: number[];
}

export const GODS: God[] = [
  { id: 'water', powers: ['rain', 'sun'], price: 0, playable: true, speeds: [1] },
  { id: 'wind', powers: ['gust', 'chill'], price: 150, playable: true, speeds: [1] },
  { id: 'stone', powers: ['raise', 'lower'], price: 400, playable: true, speeds: [1] },
  { id: 'time', powers: ['fog'], price: 800, playable: true, speeds: [1, 2, 4] },
];

export const godById = (id: GodId): God => GODS.find((god) => god.id === id) ?? GODS[0];
