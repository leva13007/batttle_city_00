import { getMap } from './maps';
import './style.css';
import { Tank } from './tank';
import { TankEnemy } from './tankEnemy';


export type MoveVector = -1 | 0 | 1;
export type Direction = [MoveVector, MoveVector];

export type BulletType = 0 | 1 | 2;


export const config = {
  CELL_COUNT: 13 * 2,
  CELL_SIZE: 30,
  SPRITE_FRAME_SIZE: 16,
  SPRITE_FRAME_SIZE_HALF: 8,
  get GRID_SIZE() {
    return this.CELL_COUNT * this.CELL_SIZE
  },
  get CELL_HALF_SIZE() {
    return this.CELL_SIZE / 2
  },
  SPRITE_MOVING_ANIMATION_INTERVAL: 80, // move to the Tank class
  debug: true,
}

export const tankDirections: Record<string, Direction> = {
  UP: [0, -1],
  DOWN: [0, 1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
}

const directionMap: Record<string, Direction> = {
  ArrowUp: tankDirections.UP,
  ArrowDown: tankDirections.DOWN,
  ArrowLeft: tankDirections.LEFT,
  ArrowRight: tankDirections.RIGHT,
}

const keyMap: Record<string, any> = {
  Space: "makeFire",
}

const tileTypes = {
  EMPTY: 0,
  BRICK: 1,
  STONE: 2,
  WATER: 3,
  BUSH: 4,
  ICE: 5,

  BRICK_RIGHT: 6,
  BRICK_DOWN: 7,
  BRICK_LEFT: 8,
  BRICK_TOP: 9,

  BASE_LT: 10, // Base Left Top
  BASE_RT: 11, // Base Right Top
  BASE_LB: 12, // Base Left Bottom
  BASE_RB: 13, // Base Right Bottom

  BASE_D_LT: 14,
  BASE_D_RT: 15,
  BASE_D_LB: 16,
  BASE_D_RB: 17,
} as const;

const tileSpritePosition = {
  0: [0, 0],
  1: [16, 4],
  2: [16, 4.5],
  3: [16, 5],
  4: [16.5, 4.5],
  5: [17, 4.5],

  6: [16.5, 4],
  7: [17, 4],
  8: [17.5, 4],
  9: [18, 4],

  10: [19, 2],
  11: [19.5, 2],
  12: [19, 2.5],
  13: [19.5, 2.5],

  14: [20, 2],
  15: [20.5, 2],
  16: [20, 2.5],
  17: [20.5, 2.5],
} as const;

export type TileType = typeof tileTypes[keyof typeof tileTypes]

export class Map {
  private map: TileType[][];

  constructor(map: TileType[][]) {
    this.map = map;
  }

  get length() {
    return this.map.length;
  }

  getMapArray() {
    return this.map;
  }

  drawBottomLayer(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    for (let r = 0; r < this.map.length; r++) {
      for (let c = 0; c < this.map[r].length; c++) {
        const tile = this.map[r][c];
        // skip if the tile is Bush
        if (tile === tileTypes.BUSH) continue;
        if (tile !== tileTypes.EMPTY) {
          const gridX = c * config.CELL_SIZE + config.CELL_SIZE * 2;
          const gridY = r * config.CELL_SIZE + config.CELL_SIZE * 2;
          const [spriteX, spriteY] = tileSpritePosition[tile]
          ctx!.drawImage(
            img,
            spriteX * config.SPRITE_FRAME_SIZE, spriteY * config.SPRITE_FRAME_SIZE, config.SPRITE_FRAME_SIZE_HALF, config.SPRITE_FRAME_SIZE_HALF, // add tank level 2sd * level
            gridX, gridY, config.CELL_SIZE, config.CELL_SIZE
          );
        }
      }
    }
  }

  drawTopLayer(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    for (let r = 0; r < this.map.length; r++) {
      for (let c = 0; c < this.map[r].length; c++) {
        const tile = this.map[r][c];
        // skip if the tile is Bush
        if (tile === tileTypes.BUSH) {
          const gridX = c * config.CELL_SIZE + config.CELL_SIZE * 2;
          const gridY = r * config.CELL_SIZE + config.CELL_SIZE * 2;
          const [spriteX, spriteY] = tileSpritePosition[tile]
          ctx!.drawImage(
            img,
            spriteX * config.SPRITE_FRAME_SIZE, spriteY * config.SPRITE_FRAME_SIZE, config.SPRITE_FRAME_SIZE_HALF, config.SPRITE_FRAME_SIZE_HALF, // add tank level 2sd * level
            gridX, gridY, config.CELL_SIZE, config.CELL_SIZE
          );
        }
      }
    }
  }

  isWalkable(x: number, y: number): boolean {
    const c = Math.floor(x / config.CELL_SIZE) - 2;
    const r = Math.floor(y / config.CELL_SIZE) - 2;
    const tile = this.map?.[r]?.[c];
    if (!tile) return true;
    console.log({
      r, c
    })
    return ([tileTypes.EMPTY, tileTypes.BUSH, tileTypes.ICE] as TileType[]).includes(tile)
  }

  isFlyable(x: number, y: number): boolean {
    const c = Math.floor(x / config.CELL_SIZE) - 2;
    const r = Math.floor(y / config.CELL_SIZE) - 2;
    const tile = this.map?.[r]?.[c];
    if (!tile) return true;
    console.log({
      r, c
    })
    return ([tileTypes.EMPTY, tileTypes.BUSH, tileTypes.ICE, tileTypes.WATER] as TileType[]).includes(tile)
  }

  doCollision(bullet: Bullet) {
    const corners = bullet.getFrontCorners(); // 
    const bulletType = bullet.getBulletType();

    if (!corners) return;
    for (const corner of corners) {
      const [x, y] = corner;
      const c = Math.floor(x / config.CELL_SIZE) - 2;
      const r = Math.floor(y / config.CELL_SIZE) - 2;
      const tile = this.map?.[r]?.[c];

      if (tile) {
        if (bulletType === 0 || bulletType === 1) {
          if (([tileTypes.BRICK_DOWN, tileTypes.BRICK_LEFT, tileTypes.BRICK_RIGHT, tileTypes.BRICK_TOP] as TileType[]).includes(tile)) {
            this.map[r][c] = 0;
          } else if (tileTypes.BRICK === tile) {
            const dir = bullet.directonToString();

            switch (dir) {
              case "0,-1": // up
                this.map[r][c] = 9; // BRICK_TOP: 9,
                break;
              case "-1,0": // left
                this.map[r][c] = 8; // BRICK_LEFT: 8,
                break;
              case "0,1": // down
                this.map[r][c] = 7; // BRICK_DOWN: 7,
                break;
              case "1,0": // right
                this.map[r][c] = 6; // BRICK_RIGHT: 6,
                break;
            }
          }
        } else if (bulletType === 2 && ([tileTypes.STONE, tileTypes.BRICK, tileTypes.BRICK_DOWN, tileTypes.BRICK_LEFT, tileTypes.BRICK_RIGHT, tileTypes.BRICK_TOP] as TileType[]).includes(tile)) {
          this.map[r][c] = 0;
        }
      }
    }
  }
}

type HostEnemy = 1;
type HostDefender = 0;

type BelongsTo = number;

// [sx_on_Sprite,sy_on_Sprite, x_display_correction, y_display_correction]
const bulletWithDirection = {
  0: [0, 0,], // UP
  1: [0, 32,], // DOWN
  2: [0, 48,], // LEFT
  3: [0, 16,], // RIGHT
}

const tileBulletPossition = {
  0: [22, 0], // Standart bullet
}

type ExplosionFrames = 0 | 1 | 2;


const x1 = 12 * config.CELL_SIZE + config.CELL_SIZE * 2;
const y1 = 24 * config.CELL_SIZE + config.CELL_SIZE * 2;

const x2 = 11 * config.CELL_SIZE + config.CELL_SIZE * 2;
const y2 = 23 * config.CELL_SIZE + config.CELL_SIZE * 2;

const s1 = config.CELL_SIZE * 2;
const s2 = config.CELL_SIZE * 4;

const d1 = config.SPRITE_FRAME_SIZE;
const d2 = config.SPRITE_FRAME_SIZE * 2;

const base = {
  x: x1,
  y: y1,
  size: s1
}

class ExplosionBase {
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

class Explosion {
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

// type BounusType = "GUN" | "TANK" | "STAR" | "BOMB" | "SHOVEL" | "TIME" | "HELMET"

// const tileBonusPossition = {
//   0: [16, 7], // "HELMET"
//   1: [16, 8], // "TIME"
//   2: [16, 9], // "SHOVEL"
//   3: [16, 10], // "STAR"
//   4: [16, 11], // "BOMB"
//   5: [16, 12], // "TANK"
//   6: [16, 13], // "GUN"
// }

const tileBonusPossition = {
  HELMET: [16, 7], // "HELMET"
  TIME: [17, 7], // "TIME"
  SHOVEL: [18, 7], // "SHOVEL"
  STAR: [19, 7], // "STAR"
  BOMB: [20, 7], // "BOMB"
  TANK: [21, 7], // "TANK"
  GUN: [22, 7], // "GUN"
}

type BounusType = keyof typeof tileBonusPossition;

class Bonus {
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



export class Bullet {
  private bulletVelosity = .3; //px per Msecond
  private x = 0;
  private y = 0;
  private direction: Direction; // [dX, dY]
  private belongTo: BelongsTo;
  private bulletType: BulletType;

  private size = config.CELL_SIZE * 2;
  private bulletDirrectionMap: Record<string, number> = {
    "0,-1": 0, // up
    "-1,0": 2, // left
    "0,1": 1, // down
    "1,0": 3, // right
  }

  constructor(x: number, y: number, direction: Direction, belongTo: BelongsTo, bulletType: BulletType = 0) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.belongTo = belongTo;
    this.bulletType = bulletType;
    this.bulletVelosity += bulletType * 0.45
  }

  getBelongsTo() {
    return this.belongTo;
  }

  getCoordinates() {
    return { x: this.x, y: this.y }
  }

  getHitbox() {
    return [this.size, this.size]; // [width, height]
  }

  getStringDirecrtion() {
    return this.bulletDirrectionMap[`${this.direction[0]},${this.direction[1]}`] as keyof typeof bulletWithDirection;
  }

  directonToString() {
    return `${this.direction[0]},${this.direction[1]}`
  }

  draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    const indOfDir = this.getStringDirecrtion();
    const aa = bulletWithDirection[indOfDir];
    ctx!.drawImage(
      img,
      tileBulletPossition[0][0] * config.SPRITE_FRAME_SIZE + aa[0], tileBulletPossition[0][1] * config.SPRITE_FRAME_SIZE + aa[1],
      config.SPRITE_FRAME_SIZE, config.SPRITE_FRAME_SIZE, // CONST
      this.x, this.y,
      this.size, this.size// CONST
    );

    if (config.debug) {
      const hitBox = this.getHitbox();
      ctx.strokeStyle = "green";
      ctx.strokeRect(this.x, this.y, hitBox[0], hitBox[1]);
    }
  }

  // get the other bullets and all tanks
  move(deltaTime: number, map: Map): {
    explode: boolean;
    point: { x: number; y: number } | null
  } {
    const distance = this.bulletVelosity * deltaTime;

    const newX = this.x + distance * this.direction[0];
    const newY = this.y + distance * this.direction[1];

    this.x = newX;
    this.y = newY;

    // check collision and if got it - explode & return data

    // check if it outs of the Grid
    const hitBox = this.getHitbox();
    if (
      this.x < config.CELL_SIZE * 2 ||
      this.y < config.CELL_SIZE * 2 ||
      this.x + hitBox[0] > config.GRID_SIZE + config.CELL_SIZE * 2 ||
      this.y + hitBox[1] > config.GRID_SIZE + config.CELL_SIZE * 2
    ) {
      return {
        explode: true,
        point: {
          x: newX,
          y: newY
        },
      };
    }

    // check if it got collision with the Map element
    {
      const corners = [
        [newX, newY],                                   // LEFT-TOP
        [newX + hitBox[0] / 2, newY],                   // RIGHT-TOP
        [newX, newY + hitBox[1] / 2],                  // LEFT-BOTTOM
        [newX + hitBox[0] / 2, newY + hitBox[1] / 2], // RIGHT-BOTTOM
      ];

      for (const [x, y] of corners) {
        if (!map.isFlyable(x, y)) return {
          explode: true,
          point: {
            x: newX,
            y: newY
          },
        };
      }
    }


    return {
      explode: false,
      point: null,
    };
  }

  getHitboxCoordinates() {
    return [
      [this.x, this.y], // left-top
      [this.x + this.size / 2, this.y], // right-top
      [this.x + this.size / 2, this.y + this.size / 2], // right-bottom
      [this.x, this.y + this.size / 2], // left-bottom
    ]
  }

  getFrontCorners() {
    const dir = this.directonToString();

    switch (dir) {
      case "0,-1": // up
        return [
          [this.x, this.y], // left-top
          [this.x + this.size / 2, this.y], // right-top
        ];
      case "-1,0": // left
        return [
          [this.x, this.y], // left-top
          [this.x, this.y + this.size / 2], // left-bottom
        ];
      case "0,1": // down
        return [
          [this.x + this.size / 2, this.y + this.size / 2], // right-bottom
          [this.x, this.y + this.size / 2], // left-bottom
        ];
      case "1,0": // right
        return [
          [this.x + this.size / 2, this.y], // right-top
          [this.x + this.size / 2, this.y + this.size / 2], // right-bottom
        ];
    }
  }

  getDirection() {
    return this.direction;
  }

  getBulletType() {
    return this.bulletType;
  }
}



class AssetLoader {
  static async loadSprite(src: string): Promise<HTMLImageElement> {
    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => res(img);
      img.onerror = () => rej(new Error('Failed to load image'));
    });
  }
}

class Renderer {
  private ctx!: CanvasRenderingContext2D;

  constructor() {
    this.setup();
  }

  gridSize() {
    return config.CELL_COUNT * config.CELL_SIZE;
  }

  getWidth() {
    return this.gridSize() + config.CELL_SIZE * 6;
  }

  getHeight() {
    return this.gridSize() + config.CELL_SIZE * 4;
  }

  setup() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <canvas id="canvas" ></canvas>
    `;

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    canvas.width = this.getWidth();
    canvas.height = this.getHeight();

    this.ctx = canvas!.getContext("2d") as CanvasRenderingContext2D; // TODO fix it
  }

  clear() {
    this.ctx!.clearRect(0, 0, this.getWidth(), this.getHeight());
  }

  getContext() {
    return this.ctx;
  }
}

class InputManager {
  private changeDirection?: (direction: Direction) => void;
  private toggleMovment?: (movement: boolean) => void;
  private makeFire?: () => void;

  constructor() {
    this.setupEventListeners();
  }

  setChangeDirectionCb(cb: (direction: Direction) => void) {
    this.changeDirection = cb;
  }

  setToggleMovmentCb(cb: (movement: boolean) => void) {
    this.toggleMovment = cb;
  }

  setMakeFire(cb: () => void) {
    this.makeFire = cb;
  }

  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent) {
    const direction = directionMap[e.key];

    // if player press movement button
    if (direction) {
      this.changeDirection?.(direction);
      this.toggleMovment?.(true);
    }

    const keyEvent = keyMap[e.code];

    if (keyEvent) {
      if (keyEvent === "makeFire") {
        this.makeFire?.()
      }
    }
  }
  private handleKeyUp() {
    this.toggleMovment?.(false);
  }
}

const matchNumbers = {
  0: [20.5, 11.5],
  1: [21, 11.5],
  2: [21.5, 11.5],
  3: [22, 11.5],
  4: [22.5, 11.5],
  5: [20.5, 12],
  6: [21, 12],
  7: [21.5, 12],
  8: [22, 12],
  9: [22.5, 12],
}

class Game {

  private renderer: Renderer;
  private inputManager: InputManager;
  private lastTimeStamp = 0;
  private spriteImg: HTMLImageElement;
  private map: Map;


  private player1: Tank;
  // private player2: Tank;
  private enemies: TankEnemy[] = [];

  private bullets: Bullet[] = [];
  private explosions: Explosion[] = [];
  private bonuses: Bonus[] = [];


  private explosionBase: ExplosionBase | undefined;
  private isGameOver = false;
  private isBaseDestroyed = false;

  private isShovelMode = false;
  private shovelModeTimer = 0;

  private enemyCount = 20;

  private gameLevel = 0;

  constructor() {
    this.spriteImg = new Image();
    this.player1 = new Tank(0, 1, (8 + 2 - 6) * config.CELL_SIZE, (24 + 2 - 22) * config.CELL_SIZE, tankDirections.UP);
    this.renderer = new Renderer();
    this.inputManager = new InputManager();
    this.setInputCbs();
    this.map = new Map(getMap(this.gameLevel));

    // this.bonuses.push(new Bonus("HELMET", 270, 670));
    // this.bonuses.push(new Bonus("TANK", 270, 70));
    // this.bonuses.push(new Bonus("TIME", 470, 70));

    // this.bonuses.push(new Bonus("GUN", 70, 270));

    this.bonuses.push(new Bonus("HELMET", 270, 670));

    this.enemies = [
      new TankEnemy(1, 0, (0 + 2) * config.CELL_SIZE, (0 + 2) * config.CELL_SIZE, tankDirections.RIGHT),
      new TankEnemy(2, 0, (12 + 2) * config.CELL_SIZE, (0 + 2) * config.CELL_SIZE, [0, 1]),
      new TankEnemy(3, 0, (24 + 2) * config.CELL_SIZE, (0 + 2) * config.CELL_SIZE, tankDirections.LEFT),
    ];
  }

  setInputCbs() {
    this.inputManager.setChangeDirectionCb((dir) => this.isGameOver ? null : this.player1.setDirection(dir));
    this.inputManager.setToggleMovmentCb(moving => this.isGameOver ? null : this.player1.setMoving(moving));
    this.inputManager.setMakeFire(() => this.isGameOver ? null : this.player1.fire(this.bullets))
  }

  async start() {
    try {
      this.spriteImg = await AssetLoader.loadSprite("image.png");
      this.animate(performance.now());
    } catch (e) {
      console.log(e)
    }
  }

  // Method for Player 1
  private size = config.CELL_SIZE * 2;
  canTankMove(newX: number, newY: number, map: Map, tank: Tank) {
    // change to the Hit Box getter
    const corners = [
      [newX, newY],
      [newX + this.size - 1, newY],
      [newX, newY + this.size - 1],
      [newX + this.size - 1, newY + this.size - 1],
    ];

    for (const [x, y] of corners) {
      if (!map.isWalkable(x, y)) return false;
    }
    // check collision with other Tanks
    for (const enemy of [ ...this.enemies, this.player1]) {
      if (enemy === tank) continue;
      const { x, y } = enemy.getPosition();
      if (
        newX < x + this.size &&
        newX + this.size > x &&
        newY < y + this.size &&
        newY + this.size > y
      ) return false;
    }

    return true;
  }

  private animate(timestamp: number): void {
    const deltaTime = timestamp - this.lastTimeStamp;
    this.lastTimeStamp = timestamp;

    let tank1Coordinates = null;
    const potentialTank1Coordinates = this.player1.tankWantsToMove(deltaTime);
    if (potentialTank1Coordinates && this.canTankMove(potentialTank1Coordinates.x, potentialTank1Coordinates.y, this.map, this.player1)) {
      tank1Coordinates = potentialTank1Coordinates;
      this.player1.doTankMove(potentialTank1Coordinates.x, potentialTank1Coordinates.y);
    }
    this.enemies.forEach(enemy => {
      const potentialEnemyCoordinates = enemy.tankWantsToMove(deltaTime);
      if (potentialEnemyCoordinates && this.canTankMove(potentialEnemyCoordinates.x, potentialEnemyCoordinates.y, this.map, enemy)) {
        enemy.doTankMove(potentialEnemyCoordinates.x, potentialEnemyCoordinates.y);
      }
    });

    this.bonuses = this.bonuses.filter((bonus) => {
      // if has collision with the tank do bonus and return false
      const res = bonus.hasCollision(tank1Coordinates);
      if (res) {
        switch (bonus.getType()) {
          case "STAR":
            this.player1.updateTankLevel();
            break;
          case "GUN":
            this.player1.updateTankGun();
            break;
          case "TANK":
            this.player1.updateTankLives(1);
            break;
          case "SHOVEL":
            this.isShovelMode = true;
            this.shovelModeTimer = 5000 * 4; // 4 when it picked up by defenders and 1 when it picked up by attackers
            break;
          case "HELMET":
            this.player1.setHelmetMode();
            break;

          case "BOMB":
            break;
          case "TIME":
            break;
          
        }
      }

      return !res;
    });

    if (this.shovelModeTimer <= 0 && this.isShovelMode) {
      this.isShovelMode = false;
      this.shovelModeTimer = 0;

      this.map.getMapArray()[this.map.length - 3][11] = 1;
      this.map.getMapArray()[this.map.length - 3][12] = 1;
      this.map.getMapArray()[this.map.length - 3][13] = 1;
      this.map.getMapArray()[this.map.length - 3][14] = 1;

      this.map.getMapArray()[this.map.length - 2][11] = 1;
      this.map.getMapArray()[this.map.length - 2][14] = 1;
      this.map.getMapArray()[this.map.length - 1][11] = 1;
      this.map.getMapArray()[this.map.length - 1][14] = 1;
    }

    if (this.isShovelMode) {
      this.shovelModeTimer -= deltaTime;
      // who picked up the bonus? if defenders then set walls to stone
      this.map.getMapArray()[this.map.length - 3][11] = 2;
      this.map.getMapArray()[this.map.length - 3][12] = 2;
      this.map.getMapArray()[this.map.length - 3][13] = 2;
      this.map.getMapArray()[this.map.length - 3][14] = 2;

      this.map.getMapArray()[this.map.length - 2][11] = 2;
      this.map.getMapArray()[this.map.length - 2][14] = 2;
      this.map.getMapArray()[this.map.length - 1][11] = 2;
      this.map.getMapArray()[this.map.length - 1][14] = 2;
    }

    // loop through all bullets to move it
    const bulletsStatuses = this.bullets.map((bullet, i) => {
      return bullet.move(deltaTime, this.map);
    });

    this.bullets = this.bullets.filter((bullet, i) => {
      // if the bullet is exploded then create an Explosion
      if (bulletsStatuses[i].explode) {
        const { x, y } = bullet.getCoordinates();
        this.explosions.push(new Explosion(x, y));

        if (
          x < base.x + base.size &&
          x + bullet.getHitbox()[0] / 2 >= base.x
          && y + bullet.getHitbox()[0] / 2 >= base.y
        ) {
          this.isBaseDestroyed = true;
          this.isGameOver = true;
          this.map.getMapArray()[this.map.length - 2][12] = 14;
          this.map.getMapArray()[this.map.length - 2][13] = 15;
          this.map.getMapArray()[this.map.length - 1][12] = 16;
          this.map.getMapArray()[this.map.length - 1][13] = 17;
          this.explosionBase = new ExplosionBase();
        }

        // call Map and check collision with it and use the bullet dirrection
        this.map.doCollision(bullet);
      }
      return !bulletsStatuses[i].explode;
    });

    // loop through the tanks to call update it
    this.player1.update(deltaTime);
    // this.player2.update(deltaTime);
    this.enemies.forEach((enemy) => enemy.update(deltaTime));

    // loop through explosions and check if it still explodes
    this.explosions = this.explosions.filter((explosion) => {
      explosion.update(deltaTime);
      return !explosion.isFinished();
    });

    this.explosionBase?.update(deltaTime)

    this.render();

    requestAnimationFrame(this.animate.bind(this));
  }

  render() {
    this.renderer.clear();

    this.renderer.getContext()!.fillStyle = "#636363";
    this.renderer.getContext()!.fillRect(0, 0, this.renderer.getWidth(), this.renderer.getHeight());

    this.renderer.getContext()!.fillStyle = "black";
    this.renderer.getContext()!.fillRect(config.CELL_SIZE * 2, config.CELL_SIZE * 2, this.renderer.gridSize(), this.renderer.gridSize());

    this.map.drawBottomLayer(this.renderer.getContext(), this.spriteImg);

    this.player1.draw(this.renderer.getContext(), this.spriteImg);
    this.enemies.forEach(enemy => enemy.draw(this.renderer.getContext(), this.spriteImg));

    // loop through all bullets to render it
    this.bullets.forEach((bullet) => {
      bullet.draw(this.renderer.getContext(), this.spriteImg)
    })

    this.explosions.forEach((explosion) => {
      explosion.draw(this.renderer.getContext(), this.spriteImg)
    });

    this.bonuses.forEach((bonus) => {
      bonus.draw(this.renderer.getContext(), this.spriteImg);
    });

    if (this.explosionBase) {
      this.explosionBase.isFinished() ? null : this.explosionBase.draw(this.renderer.getContext(), this.spriteImg)
    }

    this.map.drawTopLayer(this.renderer.getContext(), this.spriteImg);

    // display enemys at the meta field
    for (let i = 0; i < this.enemyCount; i++) {
      this.renderer.getContext()!.drawImage(
        this.spriteImg,
        (config.SPRITE_FRAME_SIZE) * 20, (config.SPRITE_FRAME_SIZE) * 12,
        config.SPRITE_FRAME_SIZE / 2, config.SPRITE_FRAME_SIZE / 2, // add tank level 2sd * level

        (config.CELL_SIZE * (26 + 2 + 1)) + (config.CELL_SIZE * (i % 2)), (config.CELL_SIZE * (3)) + (config.CELL_SIZE * Math.floor(i / 2)),

        config.CELL_SIZE, config.CELL_SIZE,
      );
    }

    // display 1st player lives
    this.renderer.getContext()!.drawImage(
      this.spriteImg,
      (config.SPRITE_FRAME_SIZE) * 23.5, (config.SPRITE_FRAME_SIZE) * 8.5,
      config.SPRITE_FRAME_SIZE / 1, config.SPRITE_FRAME_SIZE / 1, // add tank level 2sd * level
      (config.CELL_SIZE * (26 + 2 + 1)), (config.CELL_SIZE * (3 + 13)),
      config.CELL_SIZE * 2, config.CELL_SIZE * 2,
    );
    this.renderer.getContext()!.drawImage(
      this.spriteImg,
      (config.SPRITE_FRAME_SIZE) * matchNumbers[this.player1.getLives()][0], (config.SPRITE_FRAME_SIZE) * matchNumbers[this.player1.getLives()][1],
      config.SPRITE_FRAME_SIZE / 2, config.SPRITE_FRAME_SIZE / 2, // add tank level 2sd * level
      (config.CELL_SIZE * (26 + 2 + 2)), (config.CELL_SIZE * (3 + 14)),
      config.CELL_SIZE, config.CELL_SIZE,
    );

    if (config.debug) {
      // The hitbox of The Base
      this.renderer.getContext().lineWidth = 2;
      this.renderer.getContext().strokeStyle = "yellow";
      this.renderer.getContext().strokeRect(base.x, base.y, base.size, base.size);

      //   this.renderer.getContext().lineWidth = 2;
      //   this.renderer.getContext().strokeStyle = "yellow";
      //   this.renderer.getContext().strokeRect(360, 720, base.size, base.size);


      //   this.renderer.getContext().lineWidth = 2;
      //   this.renderer.getContext().strokeStyle = "red";
      //   this.renderer.getContext().strokeRect(333, 720, base.size, base.size);
    }
  }
}


const game = new Game();
game.start();