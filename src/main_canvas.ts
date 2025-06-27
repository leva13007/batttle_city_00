import './style.css';
import { clamp } from "gamekit-utils";

const img = new Image();
img.src = "image.png";

const CELL_COUNT = 13;
const CELL_SIZE = 30;
const SPRITE_TANK_SIZE = 16; // Size of the tank sprite in pixels

const GRID_SIZE = CELL_COUNT * CELL_SIZE;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="canvas" ></canvas>
`;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

canvas.width = GRID_SIZE;
canvas.height = GRID_SIZE;

const ctx = canvas!.getContext("2d");

let tank1X = 0;
let tank1Y = 0;

// if (ctx) {
//   ctx.fillStyle = "yellow";
//   ctx.fillRect(tank1X, tank1Y, CELL_SIZE, CELL_SIZE);
//   ctx.fill();
// }

let zero = 0;
const velosityTank1 = .12; //px per Msecond

type MoveVector = -1 | 0 | 1;
const vectorMove: [MoveVector, MoveVector] = [0, 1]; // [dX, dY]
let isMovingTank1 = false;

let firstTime = true;

const tank1DirrectionMap: Record<string, number> = {
  "0,-1": 0, // up
  "-1,0": 2, // left
  "0,1": 4, // down
  "1,0": 6, // right
  
}

const animate = (timestamp: number): void => {
  // clear the canvas
  // if (!ctx) return;
  // ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE); // Clear the canvas

  // console.log("timestamp", timestamp);
  console.log("timestamp", timestamp, timestamp - zero);
  const dT = timestamp - zero;
  zero = timestamp;

  if (isMovingTank1) {
    const distance = velosityTank1 * dT;

    tank1X += distance * vectorMove[0];
    tank1Y += distance * vectorMove[1];

    tank1X = clamp(tank1X, 0, GRID_SIZE - CELL_SIZE);
    tank1Y = clamp(tank1Y, 0, GRID_SIZE - CELL_SIZE);
  }

  // ctx!.clearRect(0, 0, GRID_SIZE, GRID_SIZE); // Clear the canvas
  // ctx!.fillStyle = "yellow";
  // ctx!.fillRect(tank1X, tank1Y, CELL_SIZE, CELL_SIZE);
  if (firstTime || isMovingTank1) {
    const x = SPRITE_TANK_SIZE * tank1DirrectionMap[`${vectorMove[0]},${vectorMove[1]}`];
    ctx!.clearRect(0, 0, GRID_SIZE, GRID_SIZE); // Clear the canvas
    ctx!.drawImage(
      img,
      x, 0, 16, 16, // add tank level 2sd * level
      tank1X, tank1Y, CELL_SIZE, CELL_SIZE
    );
  }
  firstTime = false;
  requestAnimationFrame(animate);
}

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowRight':
      vectorMove[0] = 1;
      vectorMove[1] = 0;
      break;
    case 'ArrowLeft':
      vectorMove[0] = -1;
      vectorMove[1] = 0;
      break;

    case 'ArrowUp':
      vectorMove[0] = 0;
      vectorMove[1] = -1;
      break;

    case 'ArrowDown':
      vectorMove[0] = 0;
      vectorMove[1] = 1;
      break;
  }
  isMovingTank1 = true;
});

window.addEventListener('keyup', (e) => {
  // vectorMove[0] = 0;
  // vectorMove[1] = 0;
  isMovingTank1 = false;
})

img.onload = function () {
  // Only start animation after image has loaded
  animate(performance.now());
};
img.onerror = function () {
  console.error('Failed to load image');
};

// Start the animation
// setTimeout(() => {
//   zero = performance.now();
//   animate(performance.now())
// }, 2000)