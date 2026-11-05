import {
  AmbientLight, BufferGeometry, Color, DirectionalLight, DoubleSide, Float32BufferAttribute, Group, Line, LineBasicMaterial,
  Mesh, MeshLambertMaterial, PerspectiveCamera, Points, PointsMaterial, Quaternion, Ray, Scene, Sphere, Vector3, WebGLRenderer,
} from 'three';
import { nearestTile, type Grid } from '../sim/grid';
import type { Snapshot } from '../worker/protocol';
import { Controls } from './controls';
import { Decor } from './decor';
import { COLORS } from './palette';
import { createGeometry, tileRadius, updateGeometry } from './mesh';

const MIN_DISTANCE = 1.7;
const MAX_DISTANCE = 5.4;

export class PlanetView {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(38, 1, 0.1, 50);
  private readonly planet = new Group();
  private readonly geometry: BufferGeometry;
  private readonly decor: Decor;
  private readonly controls: Controls;
  private readonly ring = new Line(new BufferGeometry(), new LineBasicMaterial({ color: COLORS.select }));
  private readonly halo = new Line(new BufferGeometry(), new LineBasicMaterial({ color: COLORS.accent }));
  private readonly observer: ResizeObserver;
  private frame = 0;
  private current: Snapshot | null = null;
  distance = 3.7;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly grid: Grid, private readonly onPick: (tile: number) => void) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(COLORS.space, 0);
    this.geometry = createGeometry(grid);
    this.planet.add(new Mesh(this.geometry, new MeshLambertMaterial({ vertexColors: true, flatShading: true, side: DoubleSide })));
    this.decor = new Decor(grid);
    this.planet.add(this.decor.trees, this.decor.peaks, this.decor.animals, this.ring, this.halo);
    this.ring.visible = false;
    this.halo.visible = false;
    this.scene.add(this.planet, new AmbientLight(new Color('#dfe6ff'), 1.7));
    const sun = new DirectionalLight(new Color('#fff4e0'), 1.2);
    sun.position.set(3, 2, 4);
    this.scene.add(sun, this.makeStars());
    this.camera.position.set(0, 0, this.distance);
    const self = this;
    this.controls = new Controls(canvas, {
      rotation: this.planet.quaternion as Quaternion,
      distance: this.distance,
      setDistance(d: number) { self.setDistance(d); this.distance = self.distance; },
    }, (x, y) => this.tap(x, y));
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas.parentElement ?? canvas);
    this.resize();
    this.loop();
  }

  private makeStars(): Points {
    const positions: number[] = [];
    let s = 1234567;
    const next = (): number => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    for (let i = 0; i < 260; i++) {
      const v = new Vector3(next() - 0.5, next() - 0.5, next() - 0.5).normalize().multiplyScalar(18);
      positions.push(v.x, v.y, v.z);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return new Points(geometry, new PointsMaterial({ color: COLORS.star, size: 0.05, transparent: true, opacity: 0.6 }));
  }

  private setDistance(d: number): void {
    this.distance = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, d));
    this.camera.position.set(0, 0, this.distance);
  }

  private resize(): void {
    const box = (this.canvas.parentElement ?? this.canvas).getBoundingClientRect();
    const w = Math.max(1, Math.floor(box.width));
    const h = Math.max(1, Math.floor(box.height));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private tap(clientX: number, clientY: number): void {
    const box = this.canvas.getBoundingClientRect();
    const ndcX = ((clientX - box.left) / box.width) * 2 - 1;
    const ndcY = -((clientY - box.top) / box.height) * 2 + 1;
    const origin = this.camera.position.clone();
    const direction = new Vector3(ndcX, ndcY, 0.5).unproject(this.camera).sub(origin).normalize();
    const hit = new Ray(origin, direction).intersectSphere(new Sphere(new Vector3(), 1.03), new Vector3());
    if (!hit) { this.select(-1); this.onPick(-1); return; }
    const local = this.planet.worldToLocal(hit).normalize();
    const tile = nearestTile(this.grid, local.x, local.y, local.z);
    this.select(tile);
    this.onPick(tile);
  }

  select(tile: number): void {
    this.ring.visible = tile >= 0;
    this.halo.visible = tile >= 0;
    if (tile < 0) return;
    const r = tileRadius(this.current?.altitude[tile] ?? 0);
    const ring = this.grid.corners[tile];
    const build = (scale: number): Float32BufferAttribute => {
      const pts: number[] = [];
      const n = ring.length / 3;
      for (let i = 0; i <= n; i++) pts.push(ring[(i % n) * 3] * r * scale, ring[(i % n) * 3 + 1] * r * scale, ring[(i % n) * 3 + 2] * r * scale);
      return new Float32BufferAttribute(pts, 3);
    };
    this.ring.geometry.setAttribute('position', build(1.004));
    this.halo.geometry.setAttribute('position', build(1.006));
  }

  private faceLand(snapshot: Snapshot): void {
    let best = 0;
    let bestScore = -1;
    for (let tile = 0; tile < this.grid.count; tile += 3) {
      if (snapshot.altitude[tile] < 0) continue;
      let score = 0;
      for (let other = 0; other < this.grid.count; other += 2) {
        if (snapshot.altitude[other] < 0) continue;
        const d = this.grid.centers[tile * 3] * this.grid.centers[other * 3] + this.grid.centers[tile * 3 + 1] * this.grid.centers[other * 3 + 1] + this.grid.centers[tile * 3 + 2] * this.grid.centers[other * 3 + 2];
        if (d > 0.6) score++;
      }
      if (score > bestScore) { bestScore = score; best = tile; }
    }
    const c = this.grid.centers;
    this.planet.quaternion.setFromUnitVectors(new Vector3(c[best * 3], c[best * 3 + 1], c[best * 3 + 2]), new Vector3(0, 0, 1));
  }

  update(snapshot: Snapshot, selected: number): void {
    if (!this.current) this.faceLand(snapshot);
    this.current = snapshot;
    updateGeometry(this.geometry, this.grid, snapshot);
    this.decor.update(snapshot);
    if (selected >= 0) this.select(selected);
  }

  private loop = (): void => {
    this.controls.tick();
    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.loop);
  };

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
  }
}
