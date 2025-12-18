import { config, matchNumbers, tankDirections } from './config';
import { TEAMS, type Bullet } from './bullet';
import { getMap } from './maps';
import './style.css';
import { Tank } from './tank';
import { TankEnemy } from './tankEnemy';

import { Map } from './map';
import { AssetLoader } from './assetLoader';
import { InputManager } from './inputManager';
import { Explosion } from './explosion';
import { Renderer } from './renderer';
import { Bonus } from './bonus';
import { base, ExplosionBase } from './explosionBase';

class Game {

  private renderer: Renderer;
  private inputManager: InputManager;
  private lastTimeStamp = 0;
  private spriteImg: HTMLImageElement;
  private map: Map;


  private player1: Tank;
  // private player2: Tank;
  private enemies: TankEnemy[] = [];

  private bullets: Bullet[] = [];
  private explosions: Explosion[] = [];
  private bonuses: Bonus[] = [];


  private explosionBase: ExplosionBase | undefined;
  private isGameOver = false;
  private isBaseDestroyed = false;

  private isShovelMode = false;
  private shovelModeTimer = 0;

  private enemyCount = 20;

  private gameLevel = 0;

  constructor() {
    this.spriteImg = new Image();
    this.player1 = new Tank(0, 1, (8 + 2 - 0) * config.CELL_SIZE, (24 + 2 - 0) * config.CELL_SIZE, tankDirections.UP, TEAMS.DEFENDER);
    this.renderer = new Renderer();
    this.inputManager = new InputManager();
    this.setInputCbs();
    this.map = new Map(getMap(this.gameLevel));

    // this.bonuses.push(new Bonus("HELMET", 270, 670));
    // this.bonuses.push(new Bonus("TANK", 270, 70));
    // this.bonuses.push(new Bonus("TIME", 470, 70));

    // this.bonuses.push(new Bonus("GUN", 70, 270));

    this.bonuses.push(new Bonus("HELMET", 270, 670));

    this.enemies = [
      new TankEnemy(1, 0, (0 + 2) * config.CELL_SIZE, (0 + 2) * config.CELL_SIZE, tankDirections.RIGHT, TEAMS.ENEMY),
      // new TankEnemy(2, 0, (12 + 2) * config.CELL_SIZE, (0 + 2) * config.CELL_SIZE, [0, 1], TEAMS.ENEMY),
      new TankEnemy(3, 0, (24 + 2) * config.CELL_SIZE, (0 + 2) * config.CELL_SIZE, tankDirections.LEFT, TEAMS.ENEMY),
    ];
  }

  setInputCbs() {
    this.inputManager.setChangeDirectionCb((dir) => this.isGameOver ? null : this.player1.setDirection(dir));
    this.inputManager.setToggleMovmentCb(moving => this.isGameOver ? null : this.player1.setMoving(moving));
    this.inputManager.setToggleFireCb(fire => this.isGameOver ? null : this.player1.setFire(fire)); 
  }

  async start() {
    try {
      this.spriteImg = await AssetLoader.loadSprite("image.png");
      this.animate(performance.now());
    } catch (e) {
      console.log(e)
    }
  }

  canBulletMove(bullet: Bullet, map: Map) {
    const hitBox = bullet.getHitbox();
    const { x, y } = bullet.getCoordinates();
    if (
      x < config.CELL_SIZE * 2 ||
      y < config.CELL_SIZE * 2 ||
      x + hitBox[0] > config.GRID_SIZE + config.CELL_SIZE * 2 ||
      y + hitBox[1] > config.GRID_SIZE + config.CELL_SIZE * 2
    ) {
      return false;
    }

    // check if it got collision with the Map element
    {
      const corners = [
        [x, y],                                   // LEFT-TOP
        [x + hitBox[0] / 2, y],                   // RIGHT-TOP
        [x, y + hitBox[1] / 2],                  // LEFT-BOTTOM
        [x + hitBox[0] / 2, y + hitBox[1] / 2], // RIGHT-BOTTOM
      ];

      for (const [x, y] of corners) {
        if (!map.isFlyable(x, y)) return false;
      }
    }


    // check collision with other Bullets and if has collision then both bullets explode
    for (const otherBullet of this.bullets) {
      if (
        otherBullet === bullet // same bullet
        || otherBullet.getTeam() === bullet.getTeam() // same team
      ) continue;
      const { x: xB, y: yB } = otherBullet.getCoordinates();
      const otherHitBox = otherBullet.getHitbox();
      // We're using half size of the bullet hitbox because we want to prevent bullets passing close each other
      if (
        x < xB + otherHitBox[0] / 2 &&
        x + hitBox[0] / 2 > xB &&
        y < yB + otherHitBox[1] / 2 &&
        y + hitBox[1] / 2 > yB
      ) {
        // both bullets explode
        this.explosions.push(new Explosion(xB, yB));
        this.bullets = this.bullets.filter(b => b.ID !== otherBullet.ID && b.ID !== bullet.ID);
        return false;
      }
    }

    // check collision with other Tanks -> 1. remove from list the owner of the bullet 2. loop through all tanks and check collision
    const list = [...this.enemies, this.player1]
      .filter(eT => eT.getID() !== bullet.getBelongsTo())
      .filter(t => {
        if (
          (bullet.getTeam() === TEAMS.ENEMY && t.getTeam() === TEAMS.DEFENDER)
          || (bullet.getTeam() === TEAMS.DEFENDER && t.getTeam() === TEAMS.ENEMY)) {
          return true;
        }
        return false;
        //t.getTeam() === TEAMS.DEFENDER
      });
    for (const enemy of list) {

      const { x: xE, y: yE } = enemy.getPosition();
      if (
        x < xE + this.size &&
        x + this.size > xE &&
        y < yE + this.size &&
        y + this.size > yE
      ) {
        // set for this tank status DIE
        // 
        this.explosions.push(new Explosion(xE, yE));
        this.enemies = this.enemies.filter(eT => eT.getID() !== enemy.getID())
        return false;
      }
    }

    return true;
  }

  // Method for Player 1
  private size = config.CELL_SIZE * 2;
  canTankMove(newX: number, newY: number, map: Map, tank: Tank) {
    // change to the Hit Box getter
    const corners = [
      [newX, newY],
      [newX + this.size - 1, newY],
      [newX, newY + this.size - 1],
      [newX + this.size - 1, newY + this.size - 1],
    ];

    for (const [x, y] of corners) {
      if (!map.isWalkable(x, y)) return false;
    }
    // check collision with other Tanks
    for (const enemy of [...this.enemies, this.player1]) {
      if (enemy === tank) continue;
      const { x, y } = enemy.getPosition();
      if (
        newX < x + this.size &&
        newX + this.size > x &&
        newY < y + this.size &&
        newY + this.size > y
      ) return false;
    }

    return true;
  }

  private animate(timestamp: number): void {
    const deltaTime = timestamp - this.lastTimeStamp;
    this.lastTimeStamp = timestamp;

    let tank1Coordinates = null;
    const potentialTank1Coordinates = this.player1.tankWantsToMove(deltaTime);
    if (potentialTank1Coordinates && this.canTankMove(potentialTank1Coordinates.x, potentialTank1Coordinates.y, this.map, this.player1)) {
      tank1Coordinates = potentialTank1Coordinates;
      this.player1.doTankMove(potentialTank1Coordinates.x, potentialTank1Coordinates.y);
    }
    this.player1.fire(this.bullets);
    this.enemies.forEach(enemy => {

      enemy.fire(this.bullets);

      // TODO: enable enemy movement
      // const potentialEnemyCoordinates = enemy.tankWantsToMove(deltaTime);
      // if (potentialEnemyCoordinates && this.canTankMove(potentialEnemyCoordinates.x, potentialEnemyCoordinates.y, this.map, enemy)) {
      //   enemy.doTankMove(potentialEnemyCoordinates.x, potentialEnemyCoordinates.y);
      // }
    });

    this.bonuses = this.bonuses.filter((bonus) => {
      // if has collision with the tank do bonus and return false
      const res = bonus.hasCollision(tank1Coordinates);
      if (res) {
        switch (bonus.getType()) {
          case "STAR":
            this.player1.updateTankLevel();
            break;
          case "GUN":
            this.player1.updateTankGun();
            break;
          case "TANK":
            this.player1.updateTankLives(1);
            break;
          case "SHOVEL":
            this.isShovelMode = true;
            this.shovelModeTimer = 5000 * 4; // 4 when it picked up by defenders and 1 when it picked up by attackers
            break;
          case "HELMET":
            this.player1.setHelmetMode();
            break;

          case "BOMB":
            break;
          case "TIME":
            break;

        }
      }

      return !res;
    });

    if (this.shovelModeTimer <= 0 && this.isShovelMode) {
      this.isShovelMode = false;
      this.shovelModeTimer = 0;

      this.map.getMapArray()[this.map.length - 3][11] = 1;
      this.map.getMapArray()[this.map.length - 3][12] = 1;
      this.map.getMapArray()[this.map.length - 3][13] = 1;
      this.map.getMapArray()[this.map.length - 3][14] = 1;

      this.map.getMapArray()[this.map.length - 2][11] = 1;
      this.map.getMapArray()[this.map.length - 2][14] = 1;
      this.map.getMapArray()[this.map.length - 1][11] = 1;
      this.map.getMapArray()[this.map.length - 1][14] = 1;
    }

    if (this.isShovelMode) {
      this.shovelModeTimer -= deltaTime;
      // who picked up the bonus? if defenders then set walls to stone
      this.map.getMapArray()[this.map.length - 3][11] = 2;
      this.map.getMapArray()[this.map.length - 3][12] = 2;
      this.map.getMapArray()[this.map.length - 3][13] = 2;
      this.map.getMapArray()[this.map.length - 3][14] = 2;

      this.map.getMapArray()[this.map.length - 2][11] = 2;
      this.map.getMapArray()[this.map.length - 2][14] = 2;
      this.map.getMapArray()[this.map.length - 1][11] = 2;
      this.map.getMapArray()[this.map.length - 1][14] = 2;
    }

    // loop through all bullets to move it
    // const bulletsStatuses = this.bullets.map((bullet, i) => {
    //   return bullet.move(deltaTime, this.map);
    // });

    const bulletsStatuses = this.bullets.map((bullet, i) => {
      // return bullet.move(deltaTime, this.map);

      if (!this.canBulletMove(bullet.wantsToMove(deltaTime), this.map)) {
        const { x, y } = bullet.getCoordinates();
        return {
          explode: true,
          point: {
            x,
            y
          }
        }
      }
      return {
        explode: null,
      };
    });


    this.bullets = this.bullets.filter((bullet, i) => {
      // if the bullet is exploded then create an Explosion
      if (bulletsStatuses[i].explode) {
        const { x, y } = bullet.getCoordinates();
        this.explosions.push(new Explosion(x, y));

        if (
          x < base.x + base.size &&
          x + bullet.getHitbox()[0] / 2 >= base.x
          && y + bullet.getHitbox()[0] / 2 >= base.y
        ) {
          this.isBaseDestroyed = true;
          this.isGameOver = true;
          this.map.getMapArray()[this.map.length - 2][12] = 14;
          this.map.getMapArray()[this.map.length - 2][13] = 15;
          this.map.getMapArray()[this.map.length - 1][12] = 16;
          this.map.getMapArray()[this.map.length - 1][13] = 17;
          this.explosionBase = new ExplosionBase();
        }

        // call Map and check collision with it and use the bullet dirrection
        this.map.doCollision(bullet);
      }
      return !bulletsStatuses[i].explode;
    });

    // loop through the tanks to call update it
    this.player1.update(deltaTime);
    // this.player2.update(deltaTime);
    this.enemies.forEach((enemy) => enemy.update(deltaTime));

    // loop through explosions and check if it still explodes
    this.explosions = this.explosions.filter((explosion) => {
      explosion.update(deltaTime);
      return !explosion.isFinished();
    });

    this.explosionBase?.update(deltaTime)

    this.render();

    requestAnimationFrame(this.animate.bind(this));
  }

  render() {
    this.renderer.clear();

    this.renderer.getContext()!.fillStyle = "#636363";
    this.renderer.getContext()!.fillRect(0, 0, this.renderer.getWidth(), this.renderer.getHeight());

    this.renderer.getContext()!.fillStyle = "black";
    this.renderer.getContext()!.fillRect(config.CELL_SIZE * 2, config.CELL_SIZE * 2, this.renderer.gridSize(), this.renderer.gridSize());

    this.map.drawBottomLayer(this.renderer.getContext(), this.spriteImg);

    this.player1.draw(this.renderer.getContext(), this.spriteImg);
    this.enemies.forEach(enemy => enemy.draw(this.renderer.getContext(), this.spriteImg));

    // loop through all bullets to render it
    this.bullets.forEach((bullet) => {
      bullet.draw(this.renderer.getContext(), this.spriteImg)
    })

    this.explosions.forEach((explosion) => {
      explosion.draw(this.renderer.getContext(), this.spriteImg)
    });

    this.bonuses.forEach((bonus) => {
      bonus.draw(this.renderer.getContext(), this.spriteImg);
    });

    if (this.explosionBase) {
      this.explosionBase.isFinished() ? null : this.explosionBase.draw(this.renderer.getContext(), this.spriteImg)
    }

    this.map.drawTopLayer(this.renderer.getContext(), this.spriteImg);

    // display enemys at the meta field
    for (let i = 0; i < this.enemyCount; i++) {
      this.renderer.getContext()!.drawImage(
        this.spriteImg,
        (config.SPRITE_FRAME_SIZE) * 20, (config.SPRITE_FRAME_SIZE) * 12,
        config.SPRITE_FRAME_SIZE / 2, config.SPRITE_FRAME_SIZE / 2, // add tank level 2sd * level

        (config.CELL_SIZE * (26 + 2 + 1)) + (config.CELL_SIZE * (i % 2)), (config.CELL_SIZE * (3)) + (config.CELL_SIZE * Math.floor(i / 2)),

        config.CELL_SIZE, config.CELL_SIZE,
      );
    }

    // display 1st player lives
    this.renderer.getContext()!.drawImage(
      this.spriteImg,
      (config.SPRITE_FRAME_SIZE) * 23.5, (config.SPRITE_FRAME_SIZE) * 8.5,
      config.SPRITE_FRAME_SIZE / 1, config.SPRITE_FRAME_SIZE / 1, // add tank level 2sd * level
      (config.CELL_SIZE * (26 + 2 + 1)), (config.CELL_SIZE * (3 + 13)),
      config.CELL_SIZE * 2, config.CELL_SIZE * 2,
    );
    this.renderer.getContext()!.drawImage(
      this.spriteImg,
      (config.SPRITE_FRAME_SIZE) * matchNumbers[this.player1.getLives()][0], (config.SPRITE_FRAME_SIZE) * matchNumbers[this.player1.getLives()][1],
      config.SPRITE_FRAME_SIZE / 2, config.SPRITE_FRAME_SIZE / 2, // add tank level 2sd * level
      (config.CELL_SIZE * (26 + 2 + 2)), (config.CELL_SIZE * (3 + 14)),
      config.CELL_SIZE, config.CELL_SIZE,
    );

    if (config.debug) {
      // The hitbox of The Base
      this.renderer.getContext().lineWidth = 2;
      this.renderer.getContext().strokeStyle = "yellow";
      this.renderer.getContext().strokeRect(base.x, base.y, base.size, base.size);

      //   this.renderer.getContext().lineWidth = 2;
      //   this.renderer.getContext().strokeStyle = "yellow";
      //   this.renderer.getContext().strokeRect(360, 720, base.size, base.size);


      //   this.renderer.getContext().lineWidth = 2;
      //   this.renderer.getContext().strokeStyle = "red";
      //   this.renderer.getContext().strokeRect(333, 720, base.size, base.size);
    }
  }
}


const game = new Game();
game.start();