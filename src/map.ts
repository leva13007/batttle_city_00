import { config, tileSpritePosition, tileTypes } from './config';
import type { Bullet } from "./bullet";
import type { TileType } from './types';


export class Map {
  private map: TileType[][];

  constructor(map: TileType[][]) {
    this.map = map;
  }

  get length() {
    return this.map.length;
  }

  getMapArray() {
    return this.map;
  }

  drawBottomLayer(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    for (let r = 0; r < this.map.length; r++) {
      for (let c = 0; c < this.map[r].length; c++) {
        const tile = this.map[r][c];
        // skip if the tile is Bush
        if (tile === tileTypes.BUSH) continue;
        if (tile !== tileTypes.EMPTY) {
          const gridX = c * config.CELL_SIZE + config.CELL_SIZE * 2; // 2 - offset for map border
          const gridY = r * config.CELL_SIZE + config.CELL_SIZE * 2; // 2 - offset for map border
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

  drawTopLayer(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    for (let r = 0; r < this.map.length; r++) {
      for (let c = 0; c < this.map[r].length; c++) {
        const tile = this.map[r][c];
        // skip if the tile is Bush
        if (tile === tileTypes.BUSH) {
          const gridX = c * config.CELL_SIZE + config.CELL_SIZE * 2;
          const gridY = r * config.CELL_SIZE + config.CELL_SIZE * 2;
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
    const c = Math.floor(x / config.CELL_SIZE) - 2;
    const r = Math.floor(y / config.CELL_SIZE) - 2;
    const tile = this.map?.[r]?.[c];
    if (!tile) return true;
    // console.log({
    //   r, c
    // })
    return ([tileTypes.EMPTY, tileTypes.BUSH, tileTypes.ICE] as TileType[]).includes(tile)
  }

  isFlyable(x: number, y: number): boolean {
    const c = Math.floor(x / config.CELL_SIZE) - 2;
    const r = Math.floor(y / config.CELL_SIZE) - 2;
    const tile = this.map?.[r]?.[c];
    if (!tile) return true;
    // console.log({
    //   r, c
    // })
    return ([tileTypes.EMPTY, tileTypes.BUSH, tileTypes.ICE, tileTypes.WATER] as TileType[]).includes(tile)
  }

  doCollision(bullet: Bullet) {
    const corners = bullet.getFrontCorners(); // return two Pints in front of the bullet
    const bulletType = bullet.getBulletType();

    if (!corners) return;

    const tile1 = this.getTileByCoordinates(corners[0] as [number, number]);
    const tile2 = this.getTileByCoordinates(corners[1] as [number, number]);
    if (bulletType === 0 || bulletType === 1) {

      if (tile1 && ([tileTypes.BRICK_DOWN, tileTypes.BRICK_LEFT, tileTypes.BRICK_RIGHT, tileTypes.BRICK_TOP] as TileType[]).includes(tile1.tile) && tile2 && tile2.tile === tileTypes.BRICK) {
        const dir = bullet.directionToString();
        const { r, c } = tile2;
        switch (dir) {
          case "0,-1": // up
            this.map[r][c] = 9; // BRICK_TOP: 9,
            break;
          case "-1,0": // left
            this.map[r][c] = 8; // BRICK_LEFT: 8,
            break;
          case "0,1": // down
            this.map[r][c] = 7; // BRICK_DOWN: 7,
            break;
          case "1,0": // right
            this.map[r][c] = 6; // BRICK_RIGHT: 6,
            break;
        }
      } else if (tile2 && ([tileTypes.BRICK_DOWN, tileTypes.BRICK_LEFT, tileTypes.BRICK_RIGHT, tileTypes.BRICK_TOP] as TileType[]).includes(tile2.tile) && tile1 && tile1.tile === tileTypes.BRICK) {
        const dir = bullet.directionToString();
        const { r, c } = tile1;
        switch (dir) {
          case "0,-1": // up
            this.map[r][c] = 9; // BRICK_TOP: 9,
            break;
          case "-1,0": // left
            this.map[r][c] = 8; // BRICK_LEFT: 8,
            break;
          case "0,1": // down
            this.map[r][c] = 7; // BRICK_DOWN: 7,
            break;
          case "1,0": // right
            this.map[r][c] = 6; // BRICK_RIGHT: 6,
            break;
        }
      } else if (tile1 && tile2 && ([tileTypes.BRICK_DOWN, tileTypes.BRICK_LEFT, tileTypes.BRICK_RIGHT, tileTypes.BRICK_TOP] as TileType[]).includes(tile2.tile) && ([tileTypes.BRICK_DOWN, tileTypes.BRICK_LEFT, tileTypes.BRICK_RIGHT, tileTypes.BRICK_TOP] as TileType[]).includes(tile1.tile)) {
        {
          const { r, c } = tile1;
          this.map[r][c] = 0;
        }
        {
          const { r, c } = tile2;
          this.map[r][c] = 0;
        }
      } else if (tile1 && tile2 && tile1.tile === tileTypes.BRICK && tile2.tile === tileTypes.BRICK) {
        {
          const { r, c } = tile1;
          this.map[r][c] = 0;
        }
        {
          const { r, c } = tile2;
          this.map[r][c] = 0;
        }
      } else if (tile1 && tile1.tile === tileTypes.BRICK) {
        const dir = bullet.directionToString();
        const { r, c } = tile1;
        switch (dir) {
          case "0,-1": // up
            this.map[r][c] = 9; // BRICK_TOP: 9,
            break;
          case "-1,0": // left
            this.map[r][c] = 8; // BRICK_LEFT: 8,
            break;
          case "0,1": // down
            this.map[r][c] = 7; // BRICK_DOWN: 7,
            break;
          case "1,0": // right
            this.map[r][c] = 6; // BRICK_RIGHT: 6,
            break;
        }
      } else if (tile2 && tile2.tile === tileTypes.BRICK) {
        const dir = bullet.directionToString();
        const { r, c } = tile2;
        switch (dir) {
          case "0,-1": // up
            this.map[r][c] = 9; // BRICK_TOP: 9,
            break;
          case "-1,0": // left
            this.map[r][c] = 8; // BRICK_LEFT: 8,
            break;
          case "0,1": // down
            this.map[r][c] = 7; // BRICK_DOWN: 7,
            break;
          case "1,0": // right
            this.map[r][c] = 6; // BRICK_RIGHT: 6,
            break;
        }
      } else if (tile1 && ([tileTypes.BRICK_DOWN, tileTypes.BRICK_LEFT, tileTypes.BRICK_RIGHT, tileTypes.BRICK_TOP] as TileType[]).includes(tile1.tile)) {
        const { r, c } = tile1;
        this.map[r][c] = 0;
      } else if (tile2 && ([tileTypes.BRICK_DOWN, tileTypes.BRICK_LEFT, tileTypes.BRICK_RIGHT, tileTypes.BRICK_TOP] as TileType[]).includes(tile2.tile)) {
        const { r, c } = tile2;
        this.map[r][c] = 0;
      }
    } else if (bulletType === 2) {
      if (tile1 && ([tileTypes.STONE, tileTypes.BRICK, tileTypes.BRICK_DOWN, tileTypes.BRICK_LEFT, tileTypes.BRICK_RIGHT, tileTypes.BRICK_TOP] as TileType[]).includes(tile1.tile)) {
        const { r, c } = tile1;
        this.map[r][c] = 0;
      }
      if (tile2 && ([tileTypes.STONE, tileTypes.BRICK, tileTypes.BRICK_DOWN, tileTypes.BRICK_LEFT, tileTypes.BRICK_RIGHT, tileTypes.BRICK_TOP] as TileType[]).includes(tile2.tile)) {
        const { r, c } = tile2;
        this.map[r][c] = 0;
      }
    }
  }

  getTileByCoordinates([x, y]: [number, number]): { tile: TileType, r: number, c: number } | null {
    const c = Math.floor(x / config.CELL_SIZE) - 2;
    const r = Math.floor(y / config.CELL_SIZE) - 2;
    const tile = this.map?.[r]?.[c];
    if (tile === undefined) return null;
    return { tile, r, c };
  }
}


