import { godById, type GodId } from '../sim/gods';
import { applyPower } from '../sim/powers';
import { tickPoints } from '../sim/score';
import { step } from '../sim/tick';
import { createWorld, type World } from '../sim/world';
import type { FromWorker, Snapshot, ToWorker } from './protocol';
import { makeSnapshot } from './snapshot';

const TICK_MS = 250;
const TREND_EVERY = 20;

let world: World | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let previous = new Map<number, number>();
let god: GodId = 'water';
let points = 0;

const post = (snapshot: Snapshot): void => {
  const message: FromWorker = { type: 'snapshot', snapshot };
  (self as unknown as Worker).postMessage(message, [
    snapshot.altitude.buffer, snapshot.humidity.buffer, snapshot.temperature.buffer, snapshot.water.buffer,
    snapshot.tension.buffer, snapshot.vegetation.buffer, snapshot.burn.buffer, snapshot.ash.buffer,
    snapshot.quake.buffer, snapshot.biome.buffer, snapshot.dominant.buffer, snapshot.dominantPop.buffer,
  ]);
};

const publish = (): void => {
  if (!world) return;
  const snapshot = makeSnapshot(world, previous, points);
  if (world.tick % TREND_EVERY === 0) previous = new Map(snapshot.species.map((s) => [s.id, s.total]));
  post(snapshot);
};

const start = (): void => {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (!world) return;
    step(world);
    points += tickPoints(world);
    publish();
  }, TICK_MS);
};

self.onmessage = (event: MessageEvent<ToWorker>): void => {
  const message = event.data;
  if (message.type === 'init') {
    world = createWorld(message.seed);
    god = message.god;
    points = 0;
    previous = new Map();
    publish();
    start();
  } else if (message.type === 'power' && world && godById(god).powers.includes(message.power)) {
    applyPower(world, message.tile, message.power);
    publish();
  } else if (message.type === 'visible') {
    if (message.visible) start();
    else if (timer) { clearInterval(timer); timer = null; }
  }
};
