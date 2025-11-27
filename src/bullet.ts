import { bulletWithDirection, config } from './config';
import { Map } from './map';
import type { BulletType, Direction } from './types';

type BelongsTo = number; // Tank ID

const tileBulletPossition = {
  0: [22, 0], // Standart bullet
}

export const TEAMS = {
  DEFENDER: 'defender',
  ENEMY: 'enemy',
} as const;

export type Teams = typeof TEAMS[keyof typeof TEAMS];

export class Bullet {
  public ID: number;
  private bulletVelosity = .3; //px per Msecond
  private x = 0;
  private y = 0;
  private direction: Direction; // [dX, dY]
  private belongTo: BelongsTo;
  private bulletType: BulletType;
  private belongToTeam: Teams;

  private size = config.CELL_SIZE * 2;
  private bulletDirrectionMap: Record<string, number> = {
    "0,-1": 0, // up
    "-1,0": 2, // left
    "0,1": 1, // down
    "1,0": 3, // right
  }

  constructor(x: number, y: number, direction: Direction, belongTo: BelongsTo, bulletType: BulletType = 0, belongToTeam: Teams) {
    this.ID = Math.floor(Math.random() * 1000000);
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.belongTo = belongTo;
    this.bulletType = bulletType;
    this.bulletVelosity += bulletType * 0.45
    this.belongToTeam = belongToTeam;
  }

  getTeam() {
    return this.belongToTeam;
  }

  getBelongsTo() {
    return this.belongTo;
  }

  getCoordinates() {
    return { x: this.x, y: this.y }
  }

  getHitbox() {
    return [this.size, this.size]; // [width, height]
  }

  getStringDirecrtion() {
    return this.bulletDirrectionMap[`${this.direction[0]},${this.direction[1]}`] as keyof typeof bulletWithDirection;
  }

  directionToString() {
    return `${this.direction[0]},${this.direction[1]}`
  }

  draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    const indOfDir = this.getStringDirecrtion();
    const aa = bulletWithDirection[indOfDir];
    ctx!.drawImage(
      img,
      tileBulletPossition[0][0] * config.SPRITE_FRAME_SIZE + aa[0], tileBulletPossition[0][1] * config.SPRITE_FRAME_SIZE + aa[1],
      config.SPRITE_FRAME_SIZE, config.SPRITE_FRAME_SIZE, // CONST
      this.x, this.y,
      this.size, this.size// CONST
    );

    if (config.debug) {
      const hitBox = this.getHitbox();
      ctx.strokeStyle = "green";
      ctx.strokeRect(this.x, this.y, hitBox[0], hitBox[1]);
    }
  }

  // get the other bullets and all tanks
  move(deltaTime: number, map: Map): {
    explode: boolean;
    point: { x: number; y: number } | null
  } {
    const distance = this.bulletVelosity * deltaTime;

    const newX = this.x + distance * this.direction[0];
    const newY = this.y + distance * this.direction[1];

    this.x = newX;
    this.y = newY;

    // check collision and if got it - explode & return data

    // check if it outs of the Grid
    const hitBox = this.getHitbox();
    if (
      this.x < config.CELL_SIZE * 2 ||
      this.y < config.CELL_SIZE * 2 ||
      this.x + hitBox[0] > config.GRID_SIZE + config.CELL_SIZE * 2 ||
      this.y + hitBox[1] > config.GRID_SIZE + config.CELL_SIZE * 2
    ) {
      return {
        explode: true,
        point: {
          x: newX,
          y: newY
        },
      };
    }

    // check if it got collision with the Map element
    {
      const corners = [
        [newX, newY],                                   // LEFT-TOP
        [newX + hitBox[0] / 2, newY],                   // RIGHT-TOP
        [newX, newY + hitBox[1] / 2],                  // LEFT-BOTTOM
        [newX + hitBox[0] / 2, newY + hitBox[1] / 2], // RIGHT-BOTTOM
      ];

      for (const [x, y] of corners) {
        if (!map.isFlyable(x, y)) return {
          explode: true,
          point: {
            x: newX,
            y: newY
          },
        };
      }
    }


    return {
      explode: false,
      point: null,
    };
  }

  wantsToMove(deltaTime: number) {
    const distance = this.bulletVelosity * deltaTime;

    const newX = this.x + distance * this.direction[0];
    const newY = this.y + distance * this.direction[1];

    this.x = newX;
    this.y = newY;

    return this
  }

  getHitboxCoordinates() {
    return [
      [this.x, this.y], // left-top
      [this.x + this.size / 2, this.y], // right-top
      [this.x + this.size / 2, this.y + this.size / 2], // right-bottom
      [this.x, this.y + this.size / 2], // left-bottom
    ]
  }

  getFrontCorners() {
    const dir = this.directionToString();

    switch (dir) {
      case "0,-1": // up
        return [
          [this.x, this.y], // left-top
          [this.x + this.size / 2, this.y], // right-top
        ];
      case "-1,0": // left
        return [
          [this.x, this.y], // left-top
          [this.x, this.y + this.size / 2], // left-bottom
        ];
      case "0,1": // down
        return [
          [this.x + this.size / 2, this.y + this.size / 2], // right-bottom
          [this.x, this.y + this.size / 2], // left-bottom
        ];
      case "1,0": // right
        return [
          [this.x + this.size / 2, this.y], // right-top
          [this.x + this.size / 2, this.y + this.size / 2], // right-bottom
        ];
    }
  }

  getDirection() {
    return this.direction;
  }

  getBulletType() {
    return this.bulletType;
  }
}