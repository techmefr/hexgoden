import { BufferAttribute, BufferGeometry, Color } from 'three';
import type { Grid } from '../sim/grid';
import type { Snapshot } from '../worker/protocol';
import { tileColor } from './palette';

const BASE_RADIUS = 0.94;
const SEA_RADIUS = 1;

export const tileRadius = (altitude: number): number => (altitude < 0 ? SEA_RADIUS : SEA_RADIUS + 0.012 + 0.07 * altitude);

export const triangleCount = (grid: Grid): number => grid.corners.reduce((sum, c) => sum + (c.length / 3) * 3, 0);

export const createGeometry = (grid: Grid): BufferGeometry => {
  const vertices = triangleCount(grid) * 3;
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices * 3), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(vertices * 3), 3));
  return geometry;
};

export const updateGeometry = (geometry: BufferGeometry, grid: Grid, snapshot: Snapshot): void => {
  const position = geometry.getAttribute('position') as BufferAttribute;
  const color = geometry.getAttribute('color') as BufferAttribute;
  const pos = position.array as Float32Array;
  const col = color.array as Float32Array;
  const top = new Color();
  const side = new Color();
  let v = 0;
  const push = (x: number, y: number, z: number, c: Color): void => {
    pos[v * 3] = x; pos[v * 3 + 1] = y; pos[v * 3 + 2] = z;
    col[v * 3] = c.r; col[v * 3 + 1] = c.g; col[v * 3 + 2] = c.b;
    v++;
  };
  for (let tile = 0; tile < grid.count; tile++) {
    const r = tileRadius(snapshot.altitude[tile]);
    tileColor(top, snapshot.biome[tile], tile, snapshot.altitude[tile], snapshot.ash[tile], snapshot.burn[tile], snapshot.tension[tile]);
    side.copy(top).multiplyScalar(0.72);
    const cx = grid.centers[tile * 3] * r;
    const cy = grid.centers[tile * 3 + 1] * r;
    const cz = grid.centers[tile * 3 + 2] * r;
    const ring = grid.corners[tile];
    const n = ring.length / 3;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const ax = ring[i * 3] * r, ay = ring[i * 3 + 1] * r, az = ring[i * 3 + 2] * r;
      const bx = ring[j * 3] * r, by = ring[j * 3 + 1] * r, bz = ring[j * 3 + 2] * r;
      push(cx, cy, cz, top); push(ax, ay, az, top); push(bx, by, bz, top);
      const sx = BASE_RADIUS / r;
      push(ax, ay, az, side); push(ax * sx, ay * sx, az * sx, side); push(bx, by, bz, side);
      push(bx, by, bz, side); push(ax * sx, ay * sx, az * sx, side); push(bx * sx, by * sx, bz * sx, side);
    }
  }
  position.needsUpdate = true;
  color.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
};
