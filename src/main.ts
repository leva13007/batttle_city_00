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
  SPRITE_MOVING_ANIMATION_INTERVAL: 80,
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

const tileTypes = {
  EMPTY: 0,
  BRICK: 1,
  STONE: 2,
  WATER: 3,
  BUSH: 4,
  ICE: 5,
} as const;

const tileSpritePosition = {
  0: [0, 0],
  1: [16, 4],
  2: [16, 4.5],
  3: [16, 5],
  4: [16.5, 4.5],
  5: [17, 4.5],
} as const;

type TileType = typeof tileTypes[keyof typeof tileTypes]

const map_01: TileType[][] = [
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
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
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
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

  draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    for (let r = 0; r < this.map.length; r++) {
      for (let c = 0; c < this.map[r].length; c++) {
        const tile = this.map[r][c];
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

  isWalkable(x: number, y: number): boolean {
    const c = Math.floor(x / config.CELL_SIZE);
    const r = Math.floor(y / config.CELL_SIZE);
    const tile = this.map[r][c];
    return ([tileTypes.EMPTY, tileTypes.BUSH, tileTypes.ICE] as TileType[]).includes(tile)
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
    if (config.debug){
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
    if (this.spriteAnimationTimer >= config.SPRITE_MOVING_ANIMATION_INTERVAL){
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
    const corners = [
      [newX, newY],
      [newX + this.size - 1, newY],
      [newX, newY + this.size  - 1],
      [newX + this.size  - 1, newY + this.size  - 1],
    ];

    for(const [x,y] of corners) {
      if(!map.isWalkable(x,y)) return false;
    }

    return true;
  }

  setDirection(vector: [MoveVector, MoveVector]) {    
    if (Math.abs(this.vectorMove[0]) !== Math.abs(vector[0]) &&  Math.abs(this.vectorMove[1]) !== Math.abs(vector[1])){
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

  constructor() {
    this.setupEventListeners();
  }

  setChangeDirectionCb(cb: (direction: Direction) => void) {
    this.changeDirection = cb;
  }

  setToggleMovmentCb(cb: (movement: boolean) => void) {
    this.toggleMovment = cb;
  }

  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent) {
    const direction = directionMap[e.key];

    if (direction) {
      this.changeDirection?.(direction);
      this.toggleMovment?.(true);
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

    this.player1.move(deltaTime, this.map)
    this.render()

    requestAnimationFrame(this.animate.bind(this));
  }

  render() {
    this.renderer.clear();
    this.map.draw(this.renderer.getContext(), this.spriteImg);
    this.player1.draw(this.renderer.getContext(), this.spriteImg);
  }
}


const game = new Game();
game.start();