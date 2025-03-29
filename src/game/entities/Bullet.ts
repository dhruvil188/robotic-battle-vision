
import p5 from "p5";
import { BulletType, ParticleType } from "../types";
import { Particle } from "./Particle";

export class Bullet implements BulletType {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  isPlayerBullet: boolean;
  damage: number;
  private p: p5;

  constructor(p: p5, x: number, y: number, vx: number, vy: number, isPlayerBullet: boolean = true, damage: number = 1) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.age = 0;
    this.isPlayerBullet = isPlayerBullet;
    this.damage = damage;
  }

  update(): ParticleType | null {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    
    // Adjust particle trails based on damage/weapon type
    if (this.isPlayerBullet) {
      if (this.damage >= 40) {
        // Plasma cannon trail (constant trail)
        return new Particle(
          this.p,
          this.x + this.p.random(-8, 8),
          this.y + this.p.random(-2, 8),
          this.p.random(-1, 1),
          this.p.random(-0.5, 1),
          this.p.color(0, 255, 200, 150),
          this.p.random(5, 10),
          this.p.random(10, 20)
        );
      } else if (this.damage >= 20) {
        // Laser trail (constant trail)
        if (this.p.random() < 0.8) {
          return new Particle(
            this.p,
            this.x + this.p.random(-3, 3),
            this.y + this.p.random(0, 5),
            this.p.random(-0.5, 0.5),
            this.p.random(-0.2, 0.5),
            this.p.color(255, 0, 128, 150),
            this.p.random(2, 6),
            this.p.random(8, 16)
          );
        }
      } else if (this.damage < 10) {
        // Shotgun pellets (occasional trail)
        if (this.p.random() < 0.4) {
          return new Particle(
            this.p,
            this.x,
            this.y,
            this.p.random(-0.5, 0.5),
            this.p.random(-0.2, 0.5),
            this.p.color(255, 160, 30, 150),
            this.p.random(2, 4),
            this.p.random(5, 10)
          );
        }
      } else {
        // Standard bullet (occasional trail)
        if (this.p.random() < 0.3) {
          return new Particle(
            this.p,
            this.x,
            this.y,
            this.p.random(-0.5, 0.5),
            this.p.random(-0.5, 0.5),
            this.p.color(30, 144, 255, 150),
            this.p.random(2, 5),
            this.p.random(10, 20)
          );
        }
      }
    } else {
      // Enemy bullets
      const particleColor = this.p.color(255, 100, 100, 150);
      if (this.p.random() < 0.3) {
        return new Particle(
          this.p,
          this.x,
          this.y,
          this.p.random(-0.5, 0.5),
          this.p.random(-0.5, 0.5),
          particleColor,
          this.p.random(2, 5),
          this.p.random(10, 20)
        );
      }
    }
    
    return null;
  }

  draw() {
    this.p.push();
    
    if (this.isPlayerBullet) {
      // Differentiate bullet appearance based on damage/weapon type
      if (this.damage >= 40) {
        // Plasma cannon (large, glowing, pulsing sphere)
        const pulseSize = 14 + Math.sin(this.age * 0.3) * 3;
        
        // Outer glow
        this.p.fill(0, 255, 200, 100);
        this.p.ellipse(this.x, this.y, pulseSize + 10, pulseSize + 10);
        
        // Inner glow
        this.p.fill(100, 255, 230, 180);
        this.p.ellipse(this.x, this.y, pulseSize, pulseSize);
        
        // Core
        this.p.fill(255, 255, 255, 200);
        this.p.ellipse(this.x, this.y, 6, 6);
        
        // Energy crackles
        for (let i = 0; i < 3; i++) {
          const angle = this.p.random(this.p.TWO_PI);
          const dist = this.p.random(5, 10);
          this.p.stroke(0, 255, 200, 200);
          this.p.strokeWeight(1.5);
          this.p.line(
            this.x, this.y,
            this.x + Math.cos(angle) * dist,
            this.y + Math.sin(angle) * dist
          );
        }
      } else if (this.damage >= 20) {
        // Laser (narrow, elongated beam with bright core)
        this.p.fill(255, 0, 128, 180);
        this.p.noStroke();
        this.p.rect(this.x - 1.5, this.y - 15, 3, 30, 1);
        
        // Bright core
        this.p.fill(255, 180, 230, 255);
        this.p.rect(this.x - 0.5, this.y - 15, 1, 30);
        
        // Glow effect
        this.p.fill(255, 0, 128, 100);
        this.p.ellipse(this.x, this.y, 8, 8);
        
        // Pulse at the front of the beam
        const pulseSize = 4 + Math.sin(this.age * 0.5) * 2;
        this.p.fill(255, 180, 230, 200);
        this.p.ellipse(this.x, this.y - 15, pulseSize, pulseSize);
      } else if (this.damage < 10) {
        // Shotgun pellets (small, fast)
        this.p.fill(255, 160, 30);
        this.p.noStroke();
        this.p.ellipse(this.x, this.y, 4, 4);
        
        // Small glow
        this.p.fill(255, 160, 30, 100);
        this.p.ellipse(this.x, this.y, 6, 6);
      } else {
        // Standard bullet
        this.p.fill(30, 144, 255);
        this.p.noStroke();
        
        // Sleeker bullet shape
        this.p.ellipse(this.x, this.y, 4, 12);
        
        // Glow effect
        const glowSize = 6 + Math.sin(this.age * 0.3) * 2;
        this.p.fill(30, 144, 255, 100);
        this.p.ellipse(this.x, this.y, glowSize, glowSize + 10);
        
        // Core
        this.p.fill(255, 255, 255, 200);
        this.p.ellipse(this.x, this.y, 2, 6);
      }
    } else {
      // Enemy bullet
      let bulletColor;
      
      // Different colors/effects based on damage
      if (this.damage >= 4) {
        // Boss heavy shot
        bulletColor = this.p.color(255, 50, 20);
        this.p.fill(bulletColor);
        this.p.ellipse(this.x, this.y, 12, 12);
        
        // Pulsing glow
        const pulseSize = 6 + Math.sin(this.age * 0.2) * 3;
        this.p.fill(255, 50, 20, 150);
        this.p.ellipse(this.x, this.y, pulseSize + 10, pulseSize + 10);
        
        // Inner core
        this.p.fill(255, 200, 100);
        this.p.ellipse(this.x, this.y, 5, 5);
      } else if (this.damage >= 2) {
        // Stronger enemy bullet
        bulletColor = this.p.color(255, 100, 50);
        this.p.fill(bulletColor);
        this.p.ellipse(this.x, this.y, 8, 8);
        
        // Glow
        this.p.fill(255, 100, 50, 150);
        this.p.ellipse(this.x, this.y, 12, 12);
      } else {
        // Standard enemy bullet
        bulletColor = this.p.color(255, 100, 100);
        this.p.fill(bulletColor);
        this.p.ellipse(this.x, this.y, 6, 6);
      }
    }
    
    this.p.pop();
  }
}
