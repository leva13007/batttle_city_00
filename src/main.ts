import './style.css';
import { clamp } from "gamekit-utils";

type MoveVector = -1 | 0 | 1;
type Direction = [MoveVector, MoveVector];

const config = {
  CELL_COUNT: 13,
  CELL_SIZE: 30,
  SPRITE_TANK_SIZE: 16,
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
      x, 0, config.SPRITE_TANK_SIZE, config.SPRITE_TANK_SIZE, // add tank level 2sd * level
      this.x, this.y, config.CELL_SIZE, config.CELL_SIZE
    );
  }

  getSpriteOffetX() {
    return config.SPRITE_TANK_SIZE * this.tank1DirrectionMap[`${this.vectorMove[0]},${this.vectorMove[1]}`];
  }

  move(deltaTime: number) {
    if (!this.isMovingTank) return;
    const distance = this.tankVelosity * deltaTime;

    this.x += distance * this.vectorMove[0];
    this.y += distance * this.vectorMove[1];

    this.x = clamp(this.x, 0, config.GRID_SIZE - config.CELL_SIZE);
    this.y = clamp(this.y, 0, config.GRID_SIZE - config.CELL_SIZE);
  }

  setDirection(vector: [MoveVector, MoveVector]){
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

  constructor(){
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

    if(direction) {
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
  public spriteImg: HTMLImageElement;

  constructor() {
    this.spriteImg = new Image();
    this.player1 = new Tank();
    this.renderer = new Renderer();
    this.inputManager = new InputManager();
    this.setInputCbs();
  }

  setInputCbs(){
    this.inputManager.setChangeDirectionCb((dir) => this.player1.setDirection(dir));
    this.inputManager.setToggleMovmentCb(moving => this.player1.setMoving(moving));
  }

  async start() {
    try{
      this.spriteImg = await AssetLoader.loadSprite("image.png");
      this.animate(performance.now());
    } catch (e) {
      console.log(e)
    }
  }

  private animate(timestamp: number): void {
    const deltaTime = timestamp - this.lastTimeStamp;
    this.lastTimeStamp = timestamp;

    this.player1.move(deltaTime)
    this.render()

    requestAnimationFrame(this.animate.bind(this));
  }

  render() {
    this.renderer.clear();
    this.player1.draw(this.renderer.getContext(), this.spriteImg);
  }
}


const game = new Game();
game.start();