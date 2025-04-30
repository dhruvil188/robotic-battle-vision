
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
  explosionType: number;
  private p: p5;

  constructor(p: p5, x: number, y: number, size: number, color: p5.Color, explosionType: number = 0) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.particles = [];
    this.life = 40;
    this.explosionType = explosionType;
    
    // Create explosion particles with different patterns based on type
    const particleCount = explosionType === 1 ? 40 : explosionType === 2 ? 60 : 20;
    
    for (let i = 0; i < particleCount; i++) {
      let angle = this.p.random(this.p.TWO_PI);
      let speed = this.p.random(1, 3);
      
      // Special patterns for different explosion types
      if (explosionType === 1) {
        // Ring explosion
        angle = (i / particleCount) * this.p.TWO_PI;
        speed = this.p.random(2, 4);
      } else if (explosionType === 2) {
        // Spiral explosion
        angle = (i / particleCount) * this.p.TWO_PI * 3;
        speed = 1.5 + (i / particleCount) * 3;
      }
      
      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed;
      
      // Create varying sized and colored particles
      const particleColor = explosionType === 1 ? 
        this.p.lerpColor(this.color, this.p.color(255, 255, 200), this.p.random()) : 
        explosionType === 2 ? 
        this.p.lerpColor(this.color, this.p.color(50, 50, 255), this.p.random()) : 
        this.color;
      
      let particle = new Particle(
        this.p,
        this.x, 
        this.y, 
        vx, 
        vy,
        particleColor,
        this.p.random(5, explosionType === 2 ? 20 : 15),
        this.p.random(20, explosionType === 1 ? 50 : 40)
      );
      this.particles.push(particle);
    }
    
    // Add special effect particles for big explosions
    if (explosionType === 2) {
      // Add shockwave particles
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * this.p.TWO_PI;
        const shockwaveParticle = new Particle(
          this.p,
          this.x,
          this.y,
          Math.cos(angle) * 0.5,
          Math.sin(angle) * 0.5,
          this.p.color(255, 255, 255, 150),
          size * 2,
          30
        );
        this.particles.push(shockwaveParticle);
      }
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
