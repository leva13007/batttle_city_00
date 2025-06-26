import './style.css';


const CELL_COUNT = 13;
const CELL_SIZE = 30;

const GRID_SIZE = CELL_COUNT * CELL_SIZE;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="grid" style="height: ${GRID_SIZE}px; width: ${GRID_SIZE}px;">
    <div id="tank1" class="tank" style="height: ${CELL_SIZE}px; width: ${CELL_SIZE}px;"></div>
  </div>
`;

let zero = 0;
console.log("zero", zero);
const tank1 = document.querySelector<HTMLDivElement>('#tank1');
console.log(tank1);

const velosityTank1 = .75; //px per Msecond

let tank1X = 0;
let tank1Y = 0;

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
  
  // const shift = Math.min(.1 * dT, 800-24);
  // tank1!.style.transform = `translateX(${tank1X}px)`;
  // tank1!.style.transform = `translateY(${tank1Y}px)`;
  tank1!.style.transform = `translate(${tank1X}px, ${tank1Y}px)`;
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
  
    default:
      break;
  }
})

// requestAnimationFrame(animate);
// animate(performance.now())
setTimeout(() => {
  zero = performance.now();
  animate(performance.now())
}, 2000)