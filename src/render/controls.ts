import { Quaternion, Vector3 } from 'three';

export interface ControlTarget {
  rotation: Quaternion;
  setDistance(distance: number): void;
  distance: number;
}

const AXIS_X = new Vector3(1, 0, 0);
const AXIS_Y = new Vector3(0, 1, 0);

export class Controls {
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private velocity = { x: 0, y: 0 };
  private moved = 0;
  private downAt = 0;
  private pinch = 0;
  private readonly reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly dq = new Quaternion();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly target: ControlTarget,
    private readonly onTap: (x: number, y: number) => void,
  ) {
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', this.down);
    canvas.addEventListener('pointermove', this.move);
    canvas.addEventListener('pointerup', this.up);
    canvas.addEventListener('pointercancel', this.up);
    canvas.addEventListener('wheel', this.wheel, { passive: false });
  }

  dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.down);
    this.canvas.removeEventListener('pointermove', this.move);
    this.canvas.removeEventListener('pointerup', this.up);
    this.canvas.removeEventListener('pointercancel', this.up);
    this.canvas.removeEventListener('wheel', this.wheel);
  }

  tick(): void {
    if (this.pointers.size > 0 || this.reduced) return;
    if (Math.abs(this.velocity.x) + Math.abs(this.velocity.y) < 1e-5) return;
    this.rotate(this.velocity.x, this.velocity.y);
    this.velocity.x *= 0.94;
    this.velocity.y *= 0.94;
  }

  private rotate(dx: number, dy: number): void {
    this.dq.setFromAxisAngle(AXIS_Y, dx).multiply(new Quaternion().setFromAxisAngle(AXIS_X, dy));
    this.target.rotation.premultiply(this.dq).normalize();
  }

  private readonly down = (event: PointerEvent): void => {
    this.canvas.setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.pointers.size === 1) { this.moved = 0; this.downAt = performance.now(); this.velocity = { x: 0, y: 0 }; }
    if (this.pointers.size === 2) this.pinch = this.spread();
  };

  private readonly move = (event: PointerEvent): void => {
    const last = this.pointers.get(event.pointerId);
    if (!last) return;
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.moved += Math.abs(dx) + Math.abs(dy);
    if (this.pointers.size === 2) {
      const spread = this.spread();
      if (this.pinch > 0) this.target.setDistance(this.target.distance * (this.pinch / spread));
      this.pinch = spread;
      return;
    }
    const k = 0.0045 * (this.target.distance / 3.2);
    this.velocity = { x: dx * k, y: dy * k };
    this.rotate(dx * k, dy * k);
  };

  private readonly up = (event: PointerEvent): void => {
    const wasSingle = this.pointers.size === 1;
    this.pointers.delete(event.pointerId);
    if (wasSingle && this.moved < 8 && performance.now() - this.downAt < 500) {
      this.velocity = { x: 0, y: 0 };
      this.onTap(event.clientX, event.clientY);
    }
  };

  private readonly wheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.target.setDistance(this.target.distance * (1 + Math.sign(event.deltaY) * 0.08));
  };

  private spread(): number {
    const [a, b] = [...this.pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
}
