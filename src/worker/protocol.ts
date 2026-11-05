import type { GodId } from '../sim/gods';
import type { Power } from '../sim/powers';

export interface SpeciesInfo {
  id: number;
  parent: number;
  name: string;
  diet: 'herb' | 'pred' | 'detri';
  heat: number;
  moist: number;
  size: number;
  mobility: number;
  hue: number;
  total: number;
  trend: 'rising' | 'stable' | 'falling';
}

export interface Snapshot {
  tick: number;
  points: number;
  altitude: Float32Array;
  humidity: Float32Array;
  temperature: Float32Array;
  water: Float32Array;
  tension: Float32Array;
  vegetation: Float32Array;
  burn: Uint8Array;
  ash: Uint8Array;
  quake: Uint8Array;
  biome: Uint8Array;
  dominant: Int16Array;
  dominantPop: Float32Array;
  species: SpeciesInfo[];
}

export type ToWorker =
  | { type: 'init'; seed: number; god: GodId }
  | { type: 'power'; tile: number; power: Power }
  | { type: 'visible'; visible: boolean };

export type FromWorker = { type: 'snapshot'; snapshot: Snapshot };
