import { config } from './config';

export class Renderer {
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