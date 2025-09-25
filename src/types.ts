import type { tileBonusPossition, tileTypes } from "./config";

export type MoveVector = -1 | 0 | 1;
export type Direction = [MoveVector, MoveVector];

export type BulletType = 0 | 1 | 2;

export type TileType = typeof tileTypes[keyof typeof tileTypes];

export type ExplosionFrames = 0 | 1 | 2;

export type BounusType = keyof typeof tileBonusPossition;