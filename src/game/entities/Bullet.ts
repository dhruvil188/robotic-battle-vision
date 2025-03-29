
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
    
    // Occasional particle trail
    if (this.p.random() < 0.3) {
      const particleColor = this.isPlayerBullet 
        ? this.p.color(30, 144, 255, 150) 
        : this.p.color(255, 100, 100, 150);
      
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
    
    return null;
  }

  draw() {
    this.p.push();
    
    if (this.isPlayerBullet) {
      // Player bullet
      this.p.fill(30, 144, 255);
      this.p.noStroke();
      
      // Create elongated bullet shape with glow based on damage
      this.p.ellipse(this.x, this.y, 4, 12);
      
      // Glow effect
      const glowSize = 6 + Math.sin(this.age * 0.3) * 2;
      this.p.fill(30, 144, 255, 100);
      this.p.ellipse(this.x, this.y, glowSize, glowSize + 10);
      
      // Higher damage bullets have additional effects
      if (this.damage > 1) {
        this.p.fill(255, 255, 255, 200);
        this.p.ellipse(this.x, this.y, 2, 6);
        
        // For powerful bullets, add extra glow
        if (this.damage >= 3) {
          this.p.fill(255, 255, 100, 100);
          this.p.ellipse(this.x, this.y, glowSize + 4, glowSize + 14);
        }
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
