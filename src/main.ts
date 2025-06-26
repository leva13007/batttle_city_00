import './style.css';


const CELL_COUNT = 13;
const CELL_SIZE = 30;

const GRID_SIZE = CELL_COUNT * CELL_SIZE;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="canvas" ></canvas>
`;

const canvas = document.getElementById("canvas")  as HTMLCanvasElement;

canvas.width = GRID_SIZE;
canvas.height = GRID_SIZE;

const ctx = canvas!.getContext("2d");

let tank1X = 0;
let tank1Y = 0;

if (ctx) {
  ctx.fillStyle = "yellow";
  ctx.fillRect(tank1X, tank1Y, CELL_SIZE, CELL_SIZE);
  ctx.fill();
}

let zero = 0;
const velosityTank1 = .75; //px per Msecond

type MoveVector = -1 | 0 | 1;
const vectorMove: [MoveVector,MoveVector] = [0,0]; // [dX, dY]

const animate = (timestamp: number): void => {
  // console.log("timestamp", timestamp);
  console.log("timestamp", timestamp, timestamp - zero);
  const dT = timestamp - zero;
  zero = timestamp;

  const distance = velosityTank1 * dT;

  tank1X += distance * vectorMove[0];
  tank1Y += distance * vectorMove[1];

  ctx!.clearRect(0, 0, GRID_SIZE, GRID_SIZE); // Clear the canvas
  ctx!.fillStyle = "yellow";
  ctx!.fillRect(tank1X, tank1Y, CELL_SIZE, CELL_SIZE);
  
  vectorMove[0] = 0;
  vectorMove[1] = 0;
  
  requestAnimationFrame(animate);
}

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowRight':
      vectorMove[0] = 1;
      break;
    case 'ArrowLeft':
      vectorMove[0] = -1;
      break;

    case 'ArrowUp':
      vectorMove[1] = -1;
      break;

    case 'ArrowDown':
      vectorMove[1] = 1;
      break;
  }
});

// Start the animation
setTimeout(() => {
  zero = performance.now();
  animate(performance.now())
}, 2000)