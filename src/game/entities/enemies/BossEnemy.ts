
import p5 from "p5";
import { BaseEnemy } from "./BaseEnemy";
import { Bullet } from "../Bullet";
import { BulletType } from "../../types";

export class BossEnemy extends BaseEnemy {
  constructor(p: p5, x: number, y: number, r: number, speed: number) {
    super(p, x, y, r, speed, 5, true);
    this.health = 100;
    this.maxHealth = 100;
    this.fireRate = 800;
    this.pattern = this.p.floor(this.p.random(3));
    this.speed = 0.5; // Slower movement
  }

  shoot(): BulletType | BulletType[] {
    switch(this.pattern) {
      case 0: // Spread shot
        const bullets = [];
        for (let i = -2; i <= 2; i++) {
          bullets.push(new Bullet(this.p, this.x + (i * 15), this.y + this.r, i * 1.5, 5, false, 2));
        }
        return bullets;
      
      case 1: // Heavy shots
        return new Bullet(this.p, this.x, this.y + this.r, 0, 4, false, 4);
        
      case 2: // Rapid double shot
        const leftBullet = new Bullet(this.p, this.x - 20, this.y + this.r, -0.5, 6, false, 2);
        const rightBullet = new Bullet(this.p, this.x + 20, this.y + this.r, 0.5, 6, false, 2);
        return [leftBullet, rightBullet];
        
      default:
        return new Bullet(this.p, this.x, this.y + this.r, 0, 6, false, 2);
    }
  }

  draw() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.rotationAngle);
    
    const bossScale = 2.5; // Boss is larger
    
    // Main body
    this.p.fill(150, 20, 60);
    this.p.stroke(255, 50, 80);
    this.p.strokeWeight(2);
    
    // Hexagonal shape for boss
    this.p.beginShape();
    for (let i = 0; i < 6; i++) {
      const angle = i * this.p.TWO_PI / 6;
      const px = Math.cos(angle) * this.r * bossScale;
      const py = Math.sin(angle) * this.r * bossScale;
      this.p.vertex(px, py);
    }
    this.p.endShape(this.p.CLOSE);
    
    // Boss core
    this.p.fill(255, 50, 100, 150 + this.pulseValue);
    this.p.ellipse(0, 0, this.r * 1.5, this.r * 1.5);
    
    // Weapon pods
    this.p.fill(100, 10, 30);
    this.p.ellipse(-this.r * 1.5, 0, this.r * 0.8, this.r * 0.8);
    this.p.ellipse(this.r * 1.5, 0, this.r * 0.8, this.r * 0.8);
    
    // Glowing elements
    this.p.fill(255, 100, 100, 100 + this.pulseValue);
    this.p.noStroke();
    for (let i = 0; i < 3; i++) {
      const angle = i * this.p.TWO_PI / 3 + this.p.frameCount * 0.02;
      const px = Math.cos(angle) * this.r;
      const py = Math.sin(angle) * this.r;
      this.p.ellipse(px, py, this.r * 0.4, this.r * 0.4);
    }
    
    this.p.pop();
    
    this.drawHealthBar();
  }
}
