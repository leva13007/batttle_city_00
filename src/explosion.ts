import { config } from './config';
import type { ExplosionFrames } from './types';

export class Explosion {
  private x = 0;
  private y = 0;
  private frameCount = 3;
  private frame: ExplosionFrames = 0;
  private duration = 300;
  private frameInterval = this.duration / this.frameCount;
  private size = config.CELL_SIZE * 2;
  private isDone = false;
  private timer = 0;
  private explosionSpriteX = 21;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {

    ctx!.drawImage(
      img,
      this.explosionSpriteX * config.SPRITE_FRAME_SIZE, this.frame * config.SPRITE_FRAME_SIZE,
      config.SPRITE_FRAME_SIZE, config.SPRITE_FRAME_SIZE, // CONST
      this.x, this.y,
      this.size, this.size // CONST
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