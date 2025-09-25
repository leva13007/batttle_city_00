import { config, tileBonusPossition } from './config';
import type { BounusType } from './types';

export class Bonus {
  private type: BounusType;
  private x = 0;
  private y = 0;
  private size = config.CELL_SIZE * 2;

  constructor(type: BounusType, x: number, y: number) {
    this.type = type;
    this.x = x;
    this.y = y;
  }

  applyBonus(cb: () => void) {
    cb();
  }

  draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    const { 0: x, 1: y } = tileBonusPossition[this.type]
    ctx!.drawImage(
      img,
      x * config.SPRITE_FRAME_SIZE, y * config.SPRITE_FRAME_SIZE,
      config.SPRITE_FRAME_SIZE, config.SPRITE_FRAME_SIZE, // CONST
      this.x, this.y,
      this.size, this.size// CONST
    );
  }

  hasCollision(coor: { x: number, y: number } | null) {
    if (!coor) return false;
    const { x, y } = coor;
    if (
      this.x < x + this.size &&
      this.x + this.size > x &&
      this.y < y + this.size &&
      this.y + this.size > y
    ) return true;
    return false;
  }

  getType() {
    return this.type;
  }
}