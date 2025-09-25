import { config } from './config';
import { Tank, type TankLevel } from "./tank";
import type { Teams } from "./bullet";
import type { Direction } from './types';

export class TankEnemy extends Tank {
  protected isMovingTank = true;
  protected vectorMove: Direction; // [dX, dY]
  protected tank1DirrectionMap: Record<string, number> = {
    "0,-1": 0, // up
    "-1,0": 2, // left
    "0,1": 4, // down
    "1,0": 6, // right
  }
  protected isHelmetMode: boolean = false;

  private enemySingleDirectionMoveTimer: number = 100;

  constructor(tankID: number, level: TankLevel = 0, x: number = 0, y: number = 0, vector: Direction = [0, 1], team: Teams) {
    super(tankID, level, x, y, vector, team);
    // this.ID = tankID;
    // this.level = level;
    // this.x = x;
    // this.y = y;
    this.vectorMove = vector;
    this.isHelmetMode = false;
    // this.helmetModeTimer = 3000;
  }

  getSpriteOffetX() {
    return (8 * config.SPRITE_FRAME_SIZE) + config.SPRITE_FRAME_SIZE * this.tank1DirrectionMap[`${this.vectorMove[0]},${this.vectorMove[1]}`];
  }

  getSpriteOffetY() {
    return (4) * config.SPRITE_FRAME_SIZE; // 4
  }

  update(deltaTime: number) {
    // Update the tank's position, animation, etc.
    if (this.enemySingleDirectionMoveTimer > 0) {
      this.enemySingleDirectionMoveTimer -= deltaTime;
    } else {
      this.setDirection(this.getRandomDirection());
      this.enemySingleDirectionMoveTimer = 1000 + Math.random() * 2000;
    }
  }

  getRandomDirection(): Direction {
    const directions: Direction[] = [
      [0, -1], // up
      [0, 1],  // down
      [-1, 0], // left
      [1, 0],  // right
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  }
}