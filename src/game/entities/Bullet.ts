
import p5 from "p5";
import { BulletType } from "../types";
import { Particle } from "./Particle";

export class Bullet implements BulletType {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  isPlayerBullet: boolean;
  private p: p5;

  constructor(p: p5, x: number, y: number, vx: number, vy: number, isPlayerBullet: boolean = true) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.age = 0;
    this.isPlayerBullet = isPlayerBullet;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    
    // Return particle for trail if needed
    if (this.p.frameCount % 3 === 0) {
      if (this.isPlayerBullet) {
        return new Particle(
          this.p,
          this.x, 
          this.y + 6, 
          this.p.random(-0.5, 0.5), 
          this.p.random(0, 1),
          this.p.color(30, 144, 255, 150),
          this.p.random(3, 5),
          this.p.random(5, 10)
        );
      } else {
        return new Particle(
          this.p,
          this.x, 
          this.y - 5, 
          this.p.random(-0.5, 0.5), 
          this.p.random(-1, 0),
          this.p.color(255, 50, 50, 150),
          this.p.random(3, 5),
          this.p.random(5, 10)
        );
      }
    }
    return null;
  }

  draw() {
    this.p.push();
    
    if (this.isPlayerBullet) {
      // Player bullets - energy beam style
      this.p.noStroke();
      
      // Outer glow
      this.p.fill(30, 144, 255, 100);
      this.p.ellipse(this.x, this.y, 8, 14);
      
      // Core
      this.p.fill(200, 230, 255);
      this.p.ellipse(this.x, this.y, 3, 12);
    } else {
      // Enemy bullets - red laser style
      this.p.noStroke();
      
      // Outer glow
      this.p.fill(255, 50, 50, 100);
      this.p.ellipse(this.x, this.y, 6, 10);
      
      // Core
      this.p.fill(255, 200, 200);
      this.p.ellipse(this.x, this.y, 2, 8);
    }
    
    this.p.pop();
  }
}
