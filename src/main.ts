import './style.css';
import { clamp } from "gamekit-utils";

type MoveVector = -1 | 0 | 1;
type Direction = [MoveVector, MoveVector];
type SpriteAnimationFrameIdex = 0 | 1;
type TankLevel = 0 | 1 | 2 | 3;

const config = {
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

const tankDirections: Record<string, Direction> = {
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
} as const;

type TileType = typeof tileTypes[keyof typeof tileTypes]

const map_01: TileType[][] = [
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 3, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 4, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 1, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
];

class Map {
  private map: TileType[][];

  constructor(map: TileType[][]) {
    this.map = map;
  }

  drawBottomLevel(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    for (let r = 0; r < this.map.length; r++) {
      for (let c = 0; c < this.map[r].length; c++) {
        const tile = this.map[r][c];
        // skip if the tile is Bush
        if (tile === tileTypes.BUSH) continue;
        if (tile !== tileTypes.EMPTY) {
          const gridX = c * config.CELL_SIZE;
          const gridY = r * config.CELL_SIZE;
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

  drawTopLevel(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    for (let r = 0; r < this.map.length; r++) {
      for (let c = 0; c < this.map[r].length; c++) {
        const tile = this.map[r][c];
        // skip if the tile is Bush
        if (tile === tileTypes.BUSH) {
          const gridX = c * config.CELL_SIZE;
          const gridY = r * config.CELL_SIZE;
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
    const c = Math.floor(x / config.CELL_SIZE);
    const r = Math.floor(y / config.CELL_SIZE);
    const tile = this.map?.[r]?.[c];
    if (!tile) return true;
    console.log({
      r, c
    })
    return ([tileTypes.EMPTY, tileTypes.BUSH, tileTypes.ICE] as TileType[]).includes(tile)
  }

  isFlyable(x: number, y: number): boolean {
    const c = Math.floor(x / config.CELL_SIZE);
    const r = Math.floor(y / config.CELL_SIZE);
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
      const c = Math.floor(x / config.CELL_SIZE);
      const r = Math.floor(y / config.CELL_SIZE);
      const tile = this.map?.[r]?.[c];

      if (tile) {
        if (bulletType === 0) {
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
        } else if (bulletType === 1 && ([tileTypes.BRICK, tileTypes.BRICK_DOWN, tileTypes.BRICK_LEFT, tileTypes.BRICK_RIGHT, tileTypes.BRICK_TOP] as TileType[]).includes(tile)) {
          this.map[r][c] = 0;
        } else if (bulletType === 2) {
          this.map[r][c] = 0;
        }

      }
    }
  }
}

type HostEnemy = 1;
type HostDefender = 0;

type BelongsTo = HostDefender | HostEnemy;

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

type BulletType = 0 | 1 | 2;

class Bullet {
  private bulletVelosity = .2; //px per Msecond
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
    // this.bulletVelosity += bulletType * 0.2
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
      this.x < 0 ||
      this.y < 0 ||
      this.x + hitBox[0] > config.GRID_SIZE ||
      this.y + hitBox[1] > config.GRID_SIZE
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

class Tank {
  private isMovingTank = false;
  private tankVelosity = .1; //px per Msecond
  private multiplyTankVelosity = 2.2;
  private x = 0;
  private y = 0;
  private size = config.CELL_SIZE * 2;
  private vectorMove: Direction = [0, 1]; // [dX, dY]
  private tank1DirrectionMap: Record<string, number> = {
    "0,-1": 0, // up
    "-1,0": 2, // left
    "0,1": 4, // down
    "1,0": 6, // right
  }
  private spriteAnimationTimer: number = 0;
  private spriteAnimationFrameId: SpriteAnimationFrameIdex = 0;
  private level: TankLevel;

  constructor(level: TankLevel = 0) {
    this.level = level;
  }

  draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    ctx.imageSmoothingEnabled = false;
    const x = this.getSpriteOffetX();
    ctx!.drawImage(
      img,
      x + (config.SPRITE_FRAME_SIZE * this.spriteAnimationFrameId), (config.SPRITE_FRAME_SIZE * this.level),
      config.SPRITE_FRAME_SIZE - 1, config.SPRITE_FRAME_SIZE - 1, // add tank level 2sd * level
      this.x, this.y, this.size, this.size
    );
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

  move(deltaTime: number, map: Map) {
    if (!this.isMovingTank) return;

    this.spriteAnimationTimer += deltaTime;
    if (this.spriteAnimationTimer >= config.SPRITE_MOVING_ANIMATION_INTERVAL) {
      this.spriteAnimationFrameId = Number(!this.spriteAnimationFrameId) as SpriteAnimationFrameIdex
      this.spriteAnimationTimer = 0;
    }

    const distance = this.getTankSpeed() * deltaTime;

    const newX = clamp(this.x + distance * this.vectorMove[0], 0, config.GRID_SIZE - this.size);
    const newY = clamp(this.y + distance * this.vectorMove[1], 0, config.GRID_SIZE - this.size);

    if (this.canMove(newX, newY, map)) {
      this.x = newX;
      this.y = newY;
    }
  }

  canMove(newX: number, newY: number, map: Map) {
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

    return true;
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
    console.log("-".repeat(20))
    console.log(this.x, this.y, this.vectorMove)

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

    const newBullet = new Bullet(x, y, this.vectorMove, 0, 0);
    bullets.push(newBullet);
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

  setup() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <canvas id="canvas" ></canvas>
    `;

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    canvas.width = this.gridSize();
    canvas.height = this.gridSize();

    this.ctx = canvas!.getContext("2d") as CanvasRenderingContext2D; // TODO fix it
  }

  clear() {
    this.ctx!.clearRect(0, 0, config.GRID_SIZE, config.GRID_SIZE);
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

class Game {

  private renderer: Renderer;
  private inputManager: InputManager;
  private lastTimeStamp = 0;
  private player1: Tank;
  private spriteImg: HTMLImageElement;
  private map: Map;
  private bullets: Bullet[] = [];
  private explosions: Explosion[] = [];

  constructor() {
    this.spriteImg = new Image();
    this.player1 = new Tank();
    this.renderer = new Renderer();
    this.inputManager = new InputManager();
    this.setInputCbs();
    this.map = new Map(map_01);
  }

  setInputCbs() {
    this.inputManager.setChangeDirectionCb((dir) => this.player1.setDirection(dir));
    this.inputManager.setToggleMovmentCb(moving => this.player1.setMoving(moving));
    this.inputManager.setMakeFire(() => this.player1.fire(this.bullets))
  }

  async start() {
    try {
      this.spriteImg = await AssetLoader.loadSprite("image.png");
      this.animate(performance.now());
    } catch (e) {
      console.log(e)
    }
  }

  private animate(timestamp: number): void {
    const deltaTime = timestamp - this.lastTimeStamp;
    this.lastTimeStamp = timestamp;

    this.player1.move(deltaTime, this.map);
    // loop through all bullets to move it
    const bulletsStatuses = this.bullets.map((bullet, i) => {
      return bullet.move(deltaTime, this.map);
    });

    this.bullets = this.bullets.filter((bullet, i) => {
      // if the bullet is exploded then create an Explosion
      if (bulletsStatuses[i].explode) {
        const { x, y } = bullet.getCoordinates();
        this.explosions.push(new Explosion(x, y));

        // call Map and check collision with it and use the bullet dirrection
        this.map.doCollision(bullet);
      }
      return !bulletsStatuses[i].explode;
    });

    // loop through explosions and check if it still explodes
    this.explosions = this.explosions.filter((explosion) => {
      explosion.update(deltaTime);
      return !explosion.isFinished();
    });

    this.render();

    requestAnimationFrame(this.animate.bind(this));
  }

  render() {
    this.renderer.clear();
    this.map.drawBottomLevel(this.renderer.getContext(), this.spriteImg);
    this.player1.draw(this.renderer.getContext(), this.spriteImg);

    // loop through all bullets to render it
    this.bullets.forEach((bullet) => {
      bullet.draw(this.renderer.getContext(), this.spriteImg)
    })

    this.explosions.forEach((explosion) => {
      explosion.draw(this.renderer.getContext(), this.spriteImg)
    });

    this.map.drawTopLevel(this.renderer.getContext(), this.spriteImg);
  }
}


const game = new Game();
game.start();