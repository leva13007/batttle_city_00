import './style.css';
import { clamp } from "gamekit-utils";

type MoveVector = -1 | 0 | 1;
type Direction = [MoveVector, MoveVector];

const config = {
  CELL_COUNT: 13,
  CELL_SIZE: 60,
  SPRITE_FRAME_SIZE: 16,
  get GRID_SIZE() {
    return this.CELL_COUNT * this.CELL_SIZE
  }
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
  1: [16, 0],
  2: [16, 1],
  3: [16, 2],
  4: [17, 2],
  5: [18, 2],
} as const;

type TileType = typeof tileTypes[keyof typeof tileTypes]

const map_01: TileType[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0, 0,],
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
            spriteX * config.SPRITE_FRAME_SIZE, spriteY * config.SPRITE_FRAME_SIZE, config.SPRITE_FRAME_SIZE, config.SPRITE_FRAME_SIZE, // add tank level 2sd * level
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
  private tankVelosity = .12; //px per Msecond
  private x = 0;
  private y = 0;
  private vectorMove: Direction = [0, 1]; // [dX, dY]
  private tank1DirrectionMap: Record<string, number> = {
    "0,-1": 0, // up
    "-1,0": 2, // left
    "0,1": 4, // down
    "1,0": 6, // right
  }

  constructor() { }

  draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    const x = this.getSpriteOffetX();
    ctx!.drawImage(
      img,
      x, 0, config.SPRITE_FRAME_SIZE, config.SPRITE_FRAME_SIZE, // add tank level 2sd * level
      this.x, this.y, config.CELL_SIZE, config.CELL_SIZE
    );
  }

  getSpriteOffetX() {
    return config.SPRITE_FRAME_SIZE * this.tank1DirrectionMap[`${this.vectorMove[0]},${this.vectorMove[1]}`];
  }

  move(deltaTime: number, map: Map) {
    if (!this.isMovingTank) return;
    const distance = this.tankVelosity * deltaTime;

    const newX = this.x + distance * this.vectorMove[0];
    const newY = this.y + distance * this.vectorMove[1];

    if (map.isWalkable(newX, newY)) {
      this.x = newX;
      this.y = newY;
    }

    this.x = clamp(this.x, 0, config.GRID_SIZE - config.CELL_SIZE);
    this.y = clamp(this.y, 0, config.GRID_SIZE - config.CELL_SIZE);
  }

  setDirection(vector: [MoveVector, MoveVector]) {
    this.vectorMove = vector;
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