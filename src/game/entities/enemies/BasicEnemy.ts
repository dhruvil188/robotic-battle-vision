
import p5 from "p5";
import { BaseEnemy } from "./BaseEnemy";
import { Bullet } from "../Bullet";
import { BulletType } from "../../types";

export class BasicEnemy extends BaseEnemy {
  constructor(p: p5, x: number, y: number, r: number, speed: number) {
    super(p, x, y, r, speed, 0, false);
    this.health = 1;
    this.maxHealth = 1;
    this.fireRate = 2000;
  }

  shoot(): BulletType {
    return new Bullet(this.p, this.x, this.y + this.r, 0, 6, false, 1);
  }

  draw() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.rotationAngle);
    
    // Original triangle enemy
    this.p.fill(180, 30, 30);
    this.p.stroke(255, 80, 80);
    this.p.strokeWeight(1.5);
    this.p.triangle(
      0, -this.r,
      -this.r, this.r,
      this.r, this.r
    );
    
    // Glowing core
    this.p.fill(255, 100, 100, 150 + this.pulseValue);
    this.p.noStroke();
    this.p.ellipse(0, 0, this.r * 0.6, this.r * 0.6);
    
    this.p.pop();
    
    this.drawHealthBar();
  }
}
