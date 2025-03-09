
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
  private p: p5;

  constructor(p: p5, x: number, y: number, vx: number, vy: number, color: p5.Color, size: number, life: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    
    // Add slight randomness to movement
    this.x += this.p.random(-0.3, 0.3);
    this.y += this.p.random(-0.3, 0.3);
  }
  
  draw() {
    this.p.push();
    this.p.noStroke();
    
    // Fade out as life decreases
    let alpha = this.p.map(this.life, 0, this.maxLife, 0, 255);
    let currentColor = this.p.color(this.color);
    currentColor.setAlpha(alpha);
    this.p.fill(currentColor);
    
    // Draw as a circle
    this.p.ellipse(this.x, this.y, this.size * (this.life / this.maxLife));
    
    this.p.pop();
  }
  
  isDead() {
    return this.life <= 0;
  }
}
