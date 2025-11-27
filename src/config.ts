import type { Direction } from "./types"

export const config = {
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

export const tankDirections: Record<string, Direction> = {
  UP: [0, -1],
  DOWN: [0, 1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
}

export const directionMap: Record<string, Direction> = {
  ArrowUp: tankDirections.UP,
  ArrowDown: tankDirections.DOWN,
  ArrowLeft: tankDirections.LEFT,
  ArrowRight: tankDirections.RIGHT,
}

export const tileTypes = {
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

  BASE_LT: 10, // Base Left Top
  BASE_RT: 11, // Base Right Top
  BASE_LB: 12, // Base Left Bottom
  BASE_RB: 13, // Base Right Bottom

  BASE_D_LT: 14,
  BASE_D_RT: 15,
  BASE_D_LB: 16,
  BASE_D_RB: 17,
} as const;

export const tileSpritePosition = {
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

  10: [19, 2],
  11: [19.5, 2],
  12: [19, 2.5],
  13: [19.5, 2.5],

  14: [20, 2],
  15: [20.5, 2],
  16: [20, 2.5],
  17: [20.5, 2.5],
} as const;

// [sx_on_Sprite,sy_on_Sprite, x_display_correction, y_display_correction]
export const bulletWithDirection = {
  0: [0, 0,], // UP
  1: [0, 32,], // DOWN
  2: [0, 48,], // LEFT
  3: [0, 16,], // RIGHT
}

export const matchNumbers = {
  0: [20.5, 11.5],
  1: [21, 11.5],
  2: [21.5, 11.5],
  3: [22, 11.5],
  4: [22.5, 11.5],
  5: [20.5, 12],
  6: [21, 12],
  7: [21.5, 12],
  8: [22, 12],
  9: [22.5, 12],
}

export const tileBonusPossition = {
  HELMET: [16, 7], // "HELMET"
  TIME: [17, 7], // "TIME"
  SHOVEL: [18, 7], // "SHOVEL"
  STAR: [19, 7], // "STAR"
  BOMB: [20, 7], // "BOMB"
  TANK: [21, 7], // "TANK"
  GUN: [22, 7], // "GUN"
}