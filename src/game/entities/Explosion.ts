
import p5 from "p5";
import { ExplosionType, ParticleType } from "../types";
import { Particle } from "./Particle";

export class Explosion implements ExplosionType {
  x: number;
  y: number;
  size: number;
  color: p5.Color;
  particles: ParticleType[];
  life: number;
  private p: p5;

  constructor(p: p5, x: number, y: number, size: number, color: p5.Color) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.particles = [];
    this.life = 40;
    
    // Create explosion particles
    for (let i = 0; i < 20; i++) {
      let angle = this.p.random(this.p.TWO_PI);
      let speed = this.p.random(1, 3);
      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed;
      
      let particle = new Particle(
        this.p,
        this.x, 
        this.y, 
        vx, 
        vy,
        this.color,
        this.p.random(5, 15),
        this.p.random(20, 40)
      );
      this.particles.push(particle);
    }
  }
  
  update() {
    this.life--;
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  draw() {
    for (let particle of this.particles) {
      particle.draw();
    }
  }
  
  isDead() {
    return this.life <= 0;
  }
}
