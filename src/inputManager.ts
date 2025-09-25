import { directionMap } from "./config";
import type { Direction } from "./types";

const keyMap: Record<string, any> = {
  Space: "makeFire",
}

export class InputManager {
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