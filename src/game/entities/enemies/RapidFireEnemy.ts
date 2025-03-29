
import p5 from "p5";
import { BaseEnemy } from "./BaseEnemy";
import { Bullet } from "../Bullet";
import { BulletType } from "../../types";

export class RapidFireEnemy extends BaseEnemy {
  constructor(p: p5, x: number, y: number, r: number, speed: number) {
    super(p, x, y, r, speed, 3, false);
    this.health = 1;
    this.maxHealth = 1;
    this.fireRate = 1500; // Shoots faster
  }

  shoot(): BulletType {
    return new Bullet(this.p, this.x, this.y + this.r, 0, 6, false, 1);
  }

  draw() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.rotationAngle);
    
    // Rapid fire enemy - twin-cannon
    this.p.fill(30, 120, 30);
    this.p.stroke(50, 180, 50);
    this.p.strokeWeight(1.5);
    this.p.rect(-this.r, -this.r, this.r * 2, this.r * 2, 5);
    
    // Gun barrels
    this.p.fill(20, 80, 20);
    this.p.rect(-this.r * 0.6, 0, this.r * 0.3, this.r, 2);
    this.p.rect(this.r * 0.3, 0, this.r * 0.3, this.r, 2);
    
    // Energy core
    this.p.fill(80, 255, 80, 100 + this.pulseValue);
    this.p.noStroke();
    this.p.ellipse(0, -this.r * 0.3, this.r * 0.7, this.r * 0.7);
    
    this.p.pop();
    
    this.drawHealthBar();
  }
}
