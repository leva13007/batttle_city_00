import { config } from './config';
import type { ExplosionFrames } from './types';

const x1 = 12 * config.CELL_SIZE + config.CELL_SIZE * 2;
const y1 = 24 * config.CELL_SIZE + config.CELL_SIZE * 2;

const x2 = 11 * config.CELL_SIZE + config.CELL_SIZE * 2;
const y2 = 23 * config.CELL_SIZE + config.CELL_SIZE * 2;

const s1 = config.CELL_SIZE * 2;
const s2 = config.CELL_SIZE * 4;

const d1 = config.SPRITE_FRAME_SIZE;
const d2 = config.SPRITE_FRAME_SIZE * 2;

export const base = {
  x: x1,
  y: y1,
  size: s1
}

export class ExplosionBase {
  private x = [x1, x1, x1, x2, x2, x2, x1, x1, x1];
  private y = [y1, y1, y1, y2, y2, y2, y1, y1, y1];
  private frameCount = 9; // todo 9
  private frame: ExplosionFrames = 0;
  private duration = 900; // todo 300
  private frameInterval = this.duration / this.frameCount;
  private size = [s1, s1, s1, s2, s2, s2, s1, s1, s1];
  private isDone = false;
  private timer = 0;
  private explosionSpriteX = [16, 17, 18, 19, 21, 19, 18, 17, 16];
  private d = [d1, d1, d1, d2, d2, d2, d1, d1, d1];

  constructor() { }
  draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    ctx!.drawImage(
      img,
      (this.explosionSpriteX[this.frame]) * config.SPRITE_FRAME_SIZE, 8 * config.SPRITE_FRAME_SIZE,
      this.d[this.frame], this.d[this.frame], // CONST
      this.x[this.frame], this.y[this.frame],
      this.size[this.frame], this.size[this.frame] // CONST
    );

    if (config.debug) { }
  }
  update(deltaTime: number) {
    this.timer += deltaTime;

    if (this.timer > this.duration) {
      this.isDone = true;
    } else {
      this.frame = Math.floor(this.timer / this.frameInterval) as ExplosionFrames
    }
  }

  isFinished() {
    return this.isDone;
  }
}