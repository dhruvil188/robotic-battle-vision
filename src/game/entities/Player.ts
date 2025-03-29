
import p5 from "p5";
import { PlayerType } from "../types";
import { Bullet } from "./Bullet";
import { Particle } from "./Particle";

export class Player implements PlayerType {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  speed: number;
  health: number;
  shield: number;
  thrusterAnimation: number;
  animationFrame: number;
  private p: p5;

  constructor(p: p5, x: number, y: number, w: number, h: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.r = w / 2;
    this.speed = 7;
    this.health = 100;
    this.shield = 0;
    this.thrusterAnimation = 0;
    this.animationFrame = 0;
  }

  moveLeft() {
    this.x -= this.speed;
    if (this.x - this.w / 2 < 0) this.x = this.w / 2;
  }

  moveRight() {
    this.x += this.speed;
    if (this.x + this.w / 2 > this.p.width) this.x = this.p.width - this.w / 2;
  }

  shoot() {
    const bullet = new Bullet(this.p, this.x, this.y - this.h / 2, 0, -12, true);
    
    // Return the bullet and particles for the game engine to handle
    const particles = [];
    for (let i = 0; i < 5; i++) {
      particles.push(new Particle(
        this.p,
        this.x, 
        this.y - this.h / 2, 
        this.p.random(-1, 1), 
        this.p.random(-3, -1),
        this.p.color(30, 144, 255, 200),
        this.p.random(5, 10),
        this.p.random(10, 20)
      ));
    }
    
    return { bullet, particles };
  }

  draw() {
    this.animationFrame = (this.animationFrame + 0.2) % 6;
    
    // Draw shield if active
    if (this.shield > 0) {
      this.p.push();
      this.p.noFill();
      const shieldOpacity = this.p.map(this.shield, 0, 300, 0, 120);
      this.p.stroke(30, 144, 255, shieldOpacity);
      this.p.strokeWeight(3);
      this.p.ellipse(this.x, this.y, this.w * 2.2, this.h * 3);
      this.p.pop();
      
      this.shield--;
    }
    
    // Thruster animation
    this.thrusterAnimation = (this.thrusterAnimation + 0.2) % 2;
    
    this.p.push();
    
    // Draw thrusters/engines
    this.p.fill(255, 100, 0, 150);
    this.p.noStroke();
    let thrusterHeight = 15 + Math.sin(this.p.frameCount * 0.2) * 5;
    this.p.triangle(
      this.x - 15, this.y + this.h/2,
      this.x - 8, this.y + this.h/2 + thrusterHeight,
      this.x - 1, this.y + this.h/2
    );
    
    this.p.triangle(
      this.x + 15, this.y + this.h/2,
      this.x + 8, this.y + this.h/2 + thrusterHeight,
      this.x + 1, this.y + this.h/2
    );
    
    // Main ship body - sleek, futuristic design
    this.p.fill(20, 103, 194); // Deep blue
    this.p.stroke(120, 200, 255);
    this.p.strokeWeight(2);
    
    // Main body (sleek shape)
    this.p.beginShape();
    this.p.vertex(this.x, this.y - this.h/2 - 10); // Nose
    this.p.vertex(this.x + this.w/2, this.y);      // Right middle
    this.p.vertex(this.x + this.w/3, this.y + this.h/2); // Right back
    this.p.vertex(this.x - this.w/3, this.y + this.h/2); // Left back
    this.p.vertex(this.x - this.w/2, this.y);      // Left middle
    this.p.endShape(this.p.CLOSE);
    
    // Cockpit
    this.p.fill(200, 230, 255, 200);
    this.p.ellipse(this.x, this.y - this.h/6, this.w/3, this.h/3);
    
    // Weapon mounts
    this.p.fill(80, 80, 90);
    this.p.rect(this.x - this.w/2 - 5, this.y - this.h/6, 10, 20, 3);
    this.p.rect(this.x + this.w/2 - 5, this.y - this.h/6, 10, 20, 3);
    
    // Glowing elements
    let glowPulse = (Math.sin(this.p.frameCount * 0.1) + 1) * 50 + 150;
    this.p.fill(30, 144, 255, glowPulse);
    this.p.noStroke();
    this.p.ellipse(this.x - this.w/3, this.y, 8, 8);
    this.p.ellipse(this.x + this.w/3, this.y, 8, 8);
    
    this.p.pop();
  }
}
