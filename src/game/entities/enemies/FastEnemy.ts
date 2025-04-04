
import p5 from "p5";
import { BaseEnemy } from "./BaseEnemy";
import { Bullet } from "../Bullet";
import { BulletType } from "../../types";

export class FastEnemy extends BaseEnemy {
  constructor(p: p5, x: number, y: number, r: number, speed: number) {
    super(p, x, y, r, speed, 2, false);
    this.health = 1;
    this.maxHealth = 1;
    this.fireRate = 2200;
    this.speed *= 1.5; // Faster movement
  }

  shoot(): BulletType {
    return new Bullet(this.p, this.x, this.y + this.r, 0, 8, false, 1);
  }

  draw() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.rotationAngle);
    
    // Fast enemy - sleek, arrow-like
    this.p.fill(220, 100, 30);
    this.p.stroke(255, 150, 50);
    this.p.strokeWeight(1.5);
    this.p.beginShape();
    this.p.vertex(0, -this.r * 1.5); // Sharp front
    this.p.vertex(-this.r * 0.8, this.r * 0.5);
    this.p.vertex(0, 0);
    this.p.vertex(this.r * 0.8, this.r * 0.5);
    this.p.endShape(this.p.CLOSE);
    
    // Thrusters
    this.p.fill(255, 150, 0, 150 + this.pulseValue);
    this.p.noStroke();
    const thrusterSize = 3 + Math.sin(this.p.frameCount * 0.3) * 2;
    this.p.ellipse(-this.r * 0.4, this.r * 0.3, thrusterSize, thrusterSize * 2);
    this.p.ellipse(this.r * 0.4, this.r * 0.3, thrusterSize, thrusterSize * 2);
    
    this.p.pop();
    
    this.drawHealthBar();
  }
}
