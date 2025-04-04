
import p5 from "p5";
import { BaseEnemy } from "./BaseEnemy";
import { Bullet } from "../Bullet";
import { BulletType } from "../../types";

export class TankyEnemy extends BaseEnemy {
  constructor(p: p5, x: number, y: number, r: number, speed: number) {
    super(p, x, y, r, speed, 1, false);
    this.health = 3;
    this.maxHealth = 3;
    this.fireRate = 2500;
  }

  shoot(): BulletType {
    return new Bullet(this.p, this.x, this.y + this.r, 0, 4, false, 2);
  }

  draw() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.rotationAngle);
    
    // Tanky enemy - larger, shield-like
    this.p.fill(90, 90, 150);
    this.p.stroke(150, 150, 220);
    this.p.strokeWeight(2);
    this.p.ellipse(0, 0, this.r * 2.2, this.r * 2.2);
    
    // Shield pattern
    this.p.noFill();
    this.p.stroke(150, 150, 220, 150);
    this.p.arc(0, 0, this.r * 1.8, this.r * 1.8, this.p.PI * 0.25, this.p.PI * 0.75);
    this.p.arc(0, 0, this.r * 1.8, this.r * 1.8, this.p.PI * 1.25, this.p.PI * 1.75);
    
    // Core
    this.p.fill(120, 120, 220, 150 + this.pulseValue);
    this.p.noStroke();
    this.p.ellipse(0, 0, this.r * 1, this.r * 1);
    
    this.p.pop();
    
    this.drawHealthBar();
  }
}
