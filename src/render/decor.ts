import { Color, ConeGeometry, DynamicDrawUsage, IcosahedronGeometry, InstancedMesh, MeshLambertMaterial, Object3D, Quaternion, Vector3 } from 'three';
import type { Grid } from '../sim/grid';
import type { Snapshot } from '../worker/protocol';
import { COLORS } from './palette';
import { tileRadius } from './mesh';

const FOREST = 3;
const JUNGLE = 4;
const MOUNTAIN = 8;
const UP = new Vector3(0, 1, 0);

export class Decor {
  readonly trees: InstancedMesh;
  readonly peaks: InstancedMesh;
  readonly animals: InstancedMesh;
  private readonly dummy = new Object3D();
  private readonly normal = new Vector3();
  private readonly quat = new Quaternion();
  private readonly color = new Color();

  constructor(private readonly grid: Grid) {
    const make = (geometry: ConeGeometry | IcosahedronGeometry, color: Color): InstancedMesh => {
      const mesh = new InstancedMesh(geometry, new MeshLambertMaterial({ color, flatShading: true }), grid.count);
      mesh.instanceMatrix.setUsage(DynamicDrawUsage);
      mesh.frustumCulled = false;
      return mesh;
    };
    this.trees = make(new ConeGeometry(0.011, 0.04, 5), COLORS.pine);
    this.peaks = make(new ConeGeometry(0.02, 0.05, 4), COLORS.peak);
    this.animals = make(new IcosahedronGeometry(0.011, 0), new Color('#ffffff'));
  }

  private place(mesh: InstancedMesh, slot: number, tile: number, lift: number, scale: number, offset: number): void {
    const c = this.grid.centers;
    this.normal.set(c[tile * 3], c[tile * 3 + 1], c[tile * 3 + 2]);
    this.quat.setFromUnitVectors(UP, this.normal);
    const ring = this.grid.corners[tile];
    const k = offset;
    this.dummy.position.set(
      this.normal.x + (ring[0] - this.normal.x) * k,
      this.normal.y + (ring[1] - this.normal.y) * k,
      this.normal.z + (ring[2] - this.normal.z) * k,
    ).normalize().multiplyScalar(lift);
    this.dummy.quaternion.copy(this.quat);
    this.dummy.scale.setScalar(scale);
    this.dummy.updateMatrix();
    mesh.setMatrixAt(slot, this.dummy.matrix);
  }

  update(snapshot: Snapshot): void {
    let trees = 0;
    let peaks = 0;
    let animals = 0;
    for (let tile = 0; tile < this.grid.count; tile++) {
      const r = tileRadius(snapshot.altitude[tile]);
      const biome = snapshot.biome[tile];
      if ((biome === FOREST || biome === JUNGLE) && snapshot.vegetation[tile] > 0.2 && snapshot.burn[tile] === 0) {
        this.place(this.trees, trees++, tile, r + 0.02, 0.6 + snapshot.vegetation[tile], 0.1);
      }
      if (biome === MOUNTAIN) this.place(this.peaks, peaks++, tile, r + 0.022, 1, 0);
      if (snapshot.dominantPop[tile] > 0.5 && snapshot.biome[tile] !== 0) {
        this.place(this.animals, animals, tile, r + 0.012, 0.8 + Math.min(1, snapshot.dominantPop[tile] / 3), 0.55);
        const info = snapshot.species.find((s) => s.id === snapshot.dominant[tile]);
        this.animals.setColorAt(animals++, this.color.setHSL((info?.hue ?? 0) / 360, 0.45, 0.78));
      }
    }
    for (const [mesh, count] of [[this.trees, trees], [this.peaks, peaks], [this.animals, animals]] as const) {
      mesh.count = count;
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (this.animals.instanceColor) this.animals.instanceColor.needsUpdate = true;
  }
}

