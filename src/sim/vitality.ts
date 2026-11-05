import { speciesTotal } from "./life";
import type { Power } from "./powers";
import { SEA_LEVEL, type World } from "./world";

export interface Stage {
  id: "barren" | "lichen" | "meadow" | "forest" | "teeming";
  from: number;
  power: Power | null;
}

export const STAGES: Stage[] = [
  { id: "barren", from: 0, power: null },
  { id: "lichen", from: 0.15, power: "fog" },
  { id: "meadow", from: 0.3, power: "storm" },
  { id: "forest", from: 0.5, power: "monsoon" },
  { id: "teeming", from: 0.75, power: "warmwind" },
];

export const vitality = (world: World): number => {
  let land = 0;
  let green = 0;
  for (let tile = 0; tile < world.grid.count; tile++) {
    if (world.altitude[tile] < SEA_LEVEL) continue;
    land++;
    if (world.vegetation[tile] > 0.3) green++;
  }
  let living = 0;
  for (const s of world.species) if (speciesTotal(world, s.id) > 0.5) living++;
  const cover = land > 0 ? Math.min(1, green / land / 0.5) : 0;
  return Math.min(1, 0.7 * cover + 0.3 * Math.min(1, living / 10));
};

export const stageIndex = (value: number): number => {
  let index = 0;
  for (let i = 0; i < STAGES.length; i++) if (value >= STAGES[i].from) index = i;
  return index;
};
