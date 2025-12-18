import { directionMap } from "./config";
import type { Direction } from "./types";

type Keys = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Space';

const keyMap: Record<string, any> = {
  Space: "makeFire",
}

export class InputManager {
  private changeDirection?: (direction: Direction) => void;
  private toggleMovment?: (movement: boolean) => void;
  private toggleFire?: (fire: boolean) => void;
  private pressedKeys: Set<Keys> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  setChangeDirectionCb(cb: (direction: Direction) => void) {
    this.changeDirection = cb;
  }

  setToggleMovmentCb(cb: (movement: boolean) => void) {
    this.toggleMovment = cb;
  }

  setToggleFireCb(cb: (fire: boolean) => void) {
    this.toggleFire = cb;
  }

  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent) {
    const hasMovement = (new Set([...Object.keys(directionMap)])).intersection(this.pressedKeys).size;
    this.pressedKeys.add(e.code as Keys);

    if (!(e.code in directionMap && hasMovement)) {
      // We just started pressing a movement key
      const direction = directionMap[e.key];

      // if player press movement button
      if (direction) {
        this.changeDirection?.(direction);
        this.toggleMovment?.(true);
      }
    }

    const keyEvent = keyMap[e.code as Keys];
    if (keyEvent === "makeFire" || this.pressedKeys.has("Space")) {
      // togle Fire
      this.toggleFire?.(true);
    }
  }
  private handleKeyUp(e: KeyboardEvent) {
    this.pressedKeys.delete(e.code as Keys);
    const hasMovement = (new Set([...Object.keys(directionMap)])).intersection(this.pressedKeys).size;
    if (e.code in directionMap && !hasMovement) this.toggleMovment?.(false);
    if (e.code === "Space") this.toggleFire?.(false);
  }
}