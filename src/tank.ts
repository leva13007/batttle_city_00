import { config } from './config';
import { clamp } from "gamekit-utils";
import { Bullet, type Teams } from "./bullet";
import type { BulletType, Direction, MoveVector } from './types';

export type SpriteAnimationFrameIdex = 0 | 1;
export type TankLevel = 0 | 1 | 2 | 3;

export class Tank {
  private ID: number;
  protected isMovingTank = false;
  private tankVelosity = .1; //px per Msecond
  private multiplyTankVelosity = 2.2;
  private x;
  private y;
  private size = config.CELL_SIZE * 2;
  protected vectorMove: Direction = [0, 1]; // [dX, dY]
  protected tank1DirrectionMap: Record<string, number> = {
    "0,-1": 0, // up
    "-1,0": 2, // left
    "0,1": 4, // down
    "1,0": 6, // right
  }
  private spriteAnimationTimer: number = 0;
  private spriteAnimationFrameId: SpriteAnimationFrameIdex = 0;
  private level: TankLevel;
  private bulletType: BulletType = 0;
  private lives: number = 3;

  protected isHelmetMode: boolean = false;
  private helmetModeTimer: number = 0;
  private helmetSpriteIndex: number = 0;

  private team: Teams;

  constructor(tankID: number, level: TankLevel = 0, x: number = 0, y: number = 0, vector: Direction = [0, 1], team: Teams) {
    this.ID = tankID;
    this.level = level;
    this.x = x;
    this.y = y;
    this.vectorMove = vector;
    this.isHelmetMode = true;
    this.helmetModeTimer = 3000;
    this.team = team;
  }

  getTeam() {
    return this.team;
  }

  getID() {
    return this.ID;
  }

  getPosition() {
    return {
      x: this.x,
      y: this.y
    }
  }

  getLives() {
    return clamp(this.lives, 0, 9) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  }

  updateTankLives(dL: 1 | -1) {
    this.lives = clamp(this.lives + dL, 0, 9) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  }

  update(deltaTime: number) {
    // Update the tank's position, animation, etc.
    if (this.isHelmetMode) {
      this.helmetSpriteIndex++;
      this.helmetModeTimer -= deltaTime;
      if (this.helmetModeTimer <= 0) {
        this.isHelmetMode = false;
        this.helmetModeTimer = 0;
        this.helmetSpriteIndex = 0;
      }
    }
  }

  setHelmetMode() {
    this.isHelmetMode = true;
    this.helmetModeTimer = 10000;
    this.helmetSpriteIndex = 0;
  }

  updateTankLevel() {
    this.level = clamp(this.level + 1, 0, 3) as TankLevel;
    switch (this.level) {
      case 0:
        this.bulletType = 0;
        break;
      case 1:
      case 2:
        this.bulletType = 1;
        break;
      case 3:
        this.bulletType = 2;
        break;
    }
  }

  updateTankGun() {

  }

  getSpriteOffetY() {
    return (0) * config.SPRITE_FRAME_SIZE;
  }

  draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    ctx.imageSmoothingEnabled = false;
    const x = this.getSpriteOffetX();
    const y = this.getSpriteOffetY();
    ctx!.drawImage(
      img,
      x + (config.SPRITE_FRAME_SIZE * this.spriteAnimationFrameId), y + (config.SPRITE_FRAME_SIZE * this.level),
      config.SPRITE_FRAME_SIZE - 0, config.SPRITE_FRAME_SIZE - 0, // add tank level 2sd * level
      this.x, this.y, this.size, this.size
    );

    if (this.isHelmetMode) {
      ctx!.drawImage(
        img,
        16 * (16 + Math.floor(this.helmetSpriteIndex/4) % 2), 16 * 9,
        config.SPRITE_FRAME_SIZE - 0, config.SPRITE_FRAME_SIZE - 0, // add tank level 2sd * level
        this.x, this.y, this.size, this.size
      );
    }

    if (config.debug) {
      ctx.strokeStyle = "green";
      ctx.strokeRect(this.x, this.y, this.size, this.size);
    }
  }

  getSpriteOffetX() {
    return config.SPRITE_FRAME_SIZE * this.tank1DirrectionMap[`${this.vectorMove[0]},${this.vectorMove[1]}`];
  }

  getTankSpeed() {
    if (this.level === 1) return this.tankVelosity * this.multiplyTankVelosity;
    return this.tankVelosity;
  }

  tankWantsToMove(deltaTime: number): { x: number, y: number } {
    if (!this.isMovingTank) return {
      x: this.x,
      y: this.y
    };

    this.spriteAnimationTimer += deltaTime;
    if (this.spriteAnimationTimer >= config.SPRITE_MOVING_ANIMATION_INTERVAL) {
      this.spriteAnimationFrameId = Number(!this.spriteAnimationFrameId) as SpriteAnimationFrameIdex
      this.spriteAnimationTimer = 0;
    }

    const distance = this.getTankSpeed() * deltaTime;

    const newX = clamp(this.x + distance * this.vectorMove[0], config.CELL_SIZE * 2, config.GRID_SIZE - this.size + config.CELL_SIZE * 2);
    const newY = clamp(this.y + distance * this.vectorMove[1], config.CELL_SIZE * 2, config.GRID_SIZE - this.size + config.CELL_SIZE * 2);
    return {
      x: newX,
      y: newY
    }
  }

  doTankMove(newX: number, newY: number) {
    this.x = newX;
    this.y = newY;
  }

  setDirection(vector: [MoveVector, MoveVector]) {
    if (Math.abs(this.vectorMove[0]) !== Math.abs(vector[0]) && Math.abs(this.vectorMove[1]) !== Math.abs(vector[1])) {
      this.snapToGrid()
    }
    this.vectorMove = vector;
  }

  snapToGrid() {
    this.x = Math.round(this.x / config.CELL_SIZE) * config.CELL_SIZE;
    this.y = Math.round(this.y / config.CELL_SIZE) * config.CELL_SIZE;
  }

  setMoving(moving: boolean) {
    this.isMovingTank = moving;
  }

  fire(bullets: Bullet[]) {
    // check if the game has one more your bullet | Tank level 0,1 -> 1 bullet
    if ([0, 1].includes(this.level) && bullets.some(bullet => bullet.getBelongsTo() === this.ID)) return;
    // Tank level 2,3 -> 2 bullet
    if ([2, 3].includes(this.level) && bullets.filter(bullet => bullet.getBelongsTo() === this.ID).length >= 2) return;

    let x = this.x;
    let y = this.y;

    switch (`${this.vectorMove[0]},${this.vectorMove[1]}`) {
      case "-1,0": // LEFT
        x = this.x;
        y = this.y;
        break;
      case "1,0": // RIGHT
        x = this.x + config.CELL_HALF_SIZE;
        y = this.y;
        break;
      case "0,-1": // UP
        x = this.x
        y = this.y;
        break;
      case "0,1": // DOWN
        x = this.x
        y = this.y + config.CELL_HALF_SIZE * 2;
        break;

      default:
        break;
    }

    const newBullet = new Bullet(x, y, this.vectorMove, this.ID, this.bulletType, this.team); // 
    bullets.push(newBullet);
  }
}