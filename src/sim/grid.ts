export interface Grid {
  count: number;
  centers: Float32Array;
  neighbors: number[][];
  corners: Float32Array[];
}

const GOLDEN = (1 + Math.sqrt(5)) / 2;

const ICO_VERTICES: [number, number, number][] = [
  [-1, GOLDEN, 0], [1, GOLDEN, 0], [-1, -GOLDEN, 0], [1, -GOLDEN, 0],
  [0, -1, GOLDEN], [0, 1, GOLDEN], [0, -1, -GOLDEN], [0, 1, -GOLDEN],
  [GOLDEN, 0, -1], [GOLDEN, 0, 1], [-GOLDEN, 0, -1], [-GOLDEN, 0, 1],
];

const ICO_FACES: [number, number, number][] = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

type Vec3 = [number, number, number];

const normalize = ([x, y, z]: Vec3): Vec3 => {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
};

const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const subdivide = (frequency: number): { vertices: Vec3[]; triangles: [number, number, number][] } => {
  const vertices: Vec3[] = [];
  const index = new Map<string, number>();
  const vertexAt = (point: Vec3): number => {
    const key = point.map((n) => Math.round(n * 1e5)).join(',');
    const known = index.get(key);
    if (known !== undefined) return known;
    vertices.push(point);
    index.set(key, vertices.length - 1);
    return vertices.length - 1;
  };
  const triangles: [number, number, number][] = [];
  for (const [fa, fb, fc] of ICO_FACES) {
    const a = normalize(ICO_VERTICES[fa]);
    const b = normalize(ICO_VERTICES[fb]);
    const c = normalize(ICO_VERTICES[fc]);
    const row: number[][] = [];
    for (let i = 0; i <= frequency; i++) {
      row.push([]);
      for (let j = 0; j <= frequency - i; j++) {
        const p = normalize([
          a[0] + ((b[0] - a[0]) * i + (c[0] - a[0]) * j) / frequency,
          a[1] + ((b[1] - a[1]) * i + (c[1] - a[1]) * j) / frequency,
          a[2] + ((b[2] - a[2]) * i + (c[2] - a[2]) * j) / frequency,
        ]);
        row[i].push(vertexAt(p));
      }
    }
    for (let i = 0; i < frequency; i++) {
      for (let j = 0; j < frequency - i; j++) {
        triangles.push([row[i][j], row[i + 1][j], row[i][j + 1]]);
        if (j < frequency - i - 1) triangles.push([row[i + 1][j], row[i + 1][j + 1], row[i][j + 1]]);
      }
    }
  }
  return { vertices, triangles };
};

const orderAround = (center: Vec3, points: Vec3[]): Vec3[] => {
  const helper: Vec3 = Math.abs(center[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = normalize(cross(center, helper));
  const v = cross(center, u);
  return points
    .map((p) => ({ p, angle: Math.atan2(dot(p, v), dot(p, u)) }))
    .sort((a, b) => a.angle - b.angle)
    .map((entry) => entry.p);
};

export const buildGrid = (frequency: number): Grid => {
  const { vertices, triangles } = subdivide(frequency);
  const count = vertices.length;
  const neighborSets: Set<number>[] = Array.from({ length: count }, () => new Set());
  const incident: Vec3[][] = Array.from({ length: count }, () => []);
  for (const [a, b, c] of triangles) {
    const centroid = normalize([
      vertices[a][0] + vertices[b][0] + vertices[c][0],
      vertices[a][1] + vertices[b][1] + vertices[c][1],
      vertices[a][2] + vertices[b][2] + vertices[c][2],
    ]);
    for (const [from, to] of [[a, b], [b, c], [c, a]]) {
      neighborSets[from].add(to);
      neighborSets[to].add(from);
    }
    incident[a].push(centroid);
    incident[b].push(centroid);
    incident[c].push(centroid);
  }
  const centers = new Float32Array(count * 3);
  const corners = incident.map((points, tile) => {
    centers.set(vertices[tile], tile * 3);
    return new Float32Array(orderAround(vertices[tile], points).flat());
  });
  return { count, centers, neighbors: neighborSets.map((set) => [...set]), corners };
};

export const nearestTile = (grid: Grid, x: number, y: number, z: number): number => {
  let best = 0;
  let bestDot = -Infinity;
  for (let tile = 0; tile < grid.count; tile++) {
    const d = grid.centers[tile * 3] * x + grid.centers[tile * 3 + 1] * y + grid.centers[tile * 3 + 2] * z;
    if (d > bestDot) { bestDot = d; best = tile; }
  }
  return best;
};
