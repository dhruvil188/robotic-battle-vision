
import p5 from "p5";
import { ParticleType } from "../types";

export class Particle implements ParticleType {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: p5.Color;
  size: number;
  life: number;
  maxLife: number;
  trail: boolean;
  glow: boolean;
  private p: p5;

  constructor(p: p5, x: number, y: number, vx: number, vy: number, color: p5.Color, size: number, life: number, trail: boolean = false, glow: boolean = false) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.trail = trail;
    this.glow = glow;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    
    // Add slight randomness to movement for more organic feel
    this.x += this.p.random(-0.3, 0.3);
    this.y += this.p.random(-0.3, 0.3);
    
    // Add gravity effect for some particles
    if (this.glow) {
      this.vy -= 0.03; // Make glowing particles float upward
    }
    
    // Add trail particles for designated particles
    if (this.trail && this.p.random() > 0.7) {
      return new Particle(
        this.p,
        this.x,
        this.y,
        this.vx * 0.1,
        this.vy * 0.1,
        this.color,
        this.size * 0.5,
        this.p.random(5, 10),
        false
      );
    }
    
    return null;
  }
  
  draw() {
    this.p.push();
    this.p.noStroke();
    
    // Fade out as life decreases
    let alpha = this.p.map(this.life, 0, this.maxLife, 0, 255);
    let currentColor = this.p.color(this.color);
    currentColor.setAlpha(alpha);
    
    // Add glow effect for designated particles
    if (this.glow) {
      const glowSize = this.size * 2;
      const glowColor = this.p.color(
        this.p.red(this.color),
        this.p.green(this.color),
        this.p.blue(this.color),
        alpha * 0.3
      );
      this.p.fill(glowColor);
      this.p.ellipse(this.x, this.y, glowSize * (this.life / this.maxLife));
    }
    
    // Draw the main particle
    this.p.fill(currentColor);
    this.p.ellipse(this.x, this.y, this.size * (this.life / this.maxLife));
    
    this.p.pop();
  }
  
  isDead() {
    return this.life <= 0;
  }
}
