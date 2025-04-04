
import p5 from "p5";
import { BaseEnemy } from "./BaseEnemy";
import { Bullet } from "../Bullet";
import { BulletType } from "../../types";

export class HeavyGunnerEnemy extends BaseEnemy {
  constructor(p: p5, x: number, y: number, r: number, speed: number) {
    super(p, x, y, r, speed, 4, false);
    this.health = 2;
    this.maxHealth = 2;
    this.fireRate = 3000;
  }

  shoot(): BulletType[] {
    const leftBullet = new Bullet(this.p, this.x - 10, this.y + this.r, -1, 5, false, 1);
    const centerBullet = new Bullet(this.p, this.x, this.y + this.r, 0, 5, false, 1);
    const rightBullet = new Bullet(this.p, this.x + 10, this.y + this.r, 1, 5, false, 1);
    return [leftBullet, centerBullet, rightBullet];
  }

  draw() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.rotationAngle);
    
    // Heavy gunner - large with multiple guns
    this.p.fill(90, 30, 90);
    this.p.stroke(140, 50, 140);
    this.p.strokeWeight(1.5);
    this.p.ellipse(0, 0, this.r * 2, this.r * 1.6);
    
    // Triple cannon
    this.p.fill(70, 20, 70);
    this.p.rect(-this.r * 0.8, this.r * 0.1, this.r * 0.4, this.r * 0.7, 2);
    this.p.rect(-this.r * 0.2, this.r * 0.1, this.r * 0.4, this.r * 0.9, 2);
    this.p.rect(this.r * 0.4, this.r * 0.1, this.r * 0.4, this.r * 0.7, 2);
    
    // Energy field
    this.p.noFill();
    this.p.stroke(200, 50, 200, 100 + this.pulseValue * 0.5);
    this.p.ellipse(0, 0, this.r * 2.4, this.r * 2.4);
    
    // Core
    this.p.fill(220, 100, 220, 100 + this.pulseValue);
    this.p.noStroke();
    this.p.ellipse(0, -this.r * 0.2, this.r * 0.6, this.r * 0.6);
    
    this.p.pop();
    
    this.drawHealthBar();
  }
}
