
import p5 from "p5";
import { EnemyType, BulletType } from "../types";
import { BasicEnemy } from "./enemies/BasicEnemy";
import { TankyEnemy } from "./enemies/TankyEnemy";
import { FastEnemy } from "./enemies/FastEnemy";
import { RapidFireEnemy } from "./enemies/RapidFireEnemy";
import { HeavyGunnerEnemy } from "./enemies/HeavyGunnerEnemy";
import { BossEnemy } from "./enemies/BossEnemy";

// Factory class to create different enemy types
export class Enemy implements EnemyType {
  x: number;
  y: number;
  r: number;
  speed: number;
  health: number;
  type: number;
  rotationAngle: number;
  pulseValue: number;
  isBoss: boolean;
  maxHealth: number;
  fireRate: number;
  lastShotTime: number;
  pattern: number;
  private p: p5;
  private enemy: EnemyType;

  constructor(p: p5, x: number, y: number, r: number, speed: number, type?: number, isBoss: boolean = false) {
    this.p = p;
    
    // Determine enemy type if not specified
    const enemyType = type !== undefined ? type : p.floor(p.random(5));
    
    // Create the appropriate enemy type
    if (isBoss) {
      this.enemy = new BossEnemy(p, x, y, r, speed);
    } else {
      switch(enemyType) {
        case 0:
          this.enemy = new BasicEnemy(p, x, y, r, speed);
          break;
        case 1:
          this.enemy = new TankyEnemy(p, x, y, r, speed);
          break;
        case 2:
          this.enemy = new FastEnemy(p, x, y, r, speed);
          break;
        case 3:
          this.enemy = new RapidFireEnemy(p, x, y, r, speed);
          break;
        case 4:
          this.enemy = new HeavyGunnerEnemy(p, x, y, r, speed);
          break;
        default:
          this.enemy = new BasicEnemy(p, x, y, r, speed);
      }
    }
    
    // Set required properties for EnemyType interface
    this.x = this.enemy.x;
    this.y = this.enemy.y;
    this.r = this.enemy.r;
    this.speed = this.enemy.speed;
    this.health = this.enemy.health;
    this.type = this.enemy.type;
    this.rotationAngle = this.enemy.rotationAngle;
    this.pulseValue = this.enemy.pulseValue;
    this.isBoss = this.enemy.isBoss;
    this.maxHealth = this.enemy.maxHealth;
    this.fireRate = this.enemy.fireRate;
    this.lastShotTime = this.enemy.lastShotTime;
    this.pattern = this.enemy.pattern;
  }

  update() {
    const shouldShoot = this.enemy.update();
    
    // Update the proxy properties
    this.x = this.enemy.x;
    this.y = this.enemy.y;
    this.health = this.enemy.health;
    this.rotationAngle = this.enemy.rotationAngle;
    this.pulseValue = this.enemy.pulseValue;
    
    return shouldShoot;
  }

  shoot() {
    return this.enemy.shoot();
  }

  draw() {
    this.enemy.draw();
  }
}
