import p5 from "p5";
import { EnemyType } from "../types";
import { Bullet } from "./Bullet";

export class Enemy implements EnemyType {
  x: number;
  y: number;
  r: number;
  speed: number;
  health: number;
  type: number;
  rotationAngle: number;
  pulseValue: number;
  private p: p5;

  constructor(p: p5, x: number, y: number, r: number, speed: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.r = r;
    this.speed = speed;
    this.health = 1;
    this.type = this.p.floor(this.p.random(3)); // Enemy type (for visual variety)
    this.rotationAngle = 0;
    this.pulseValue = 0;
  }

  update() {
    this.y += this.speed;
    this.rotationAngle += 0.01;
    this.pulseValue = (Math.sin(this.p.frameCount * 0.1) + 1) * 30;
    
    // Return true if the enemy should shoot
    return this.p.random() < 0.005;
  }

  shoot() {
    return new Bullet(this.p, this.x, this.y + this.r, 0, 6, false);
  }

  draw() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.rotationAngle);
    
    if (this.type === 0) {
      // Type 0: Triangle enemy with glowing core
      this.p.fill(180, 30, 30);
      this.p.stroke(255, 80, 80);
      this.p.strokeWeight(1.5);
      this.p.triangle(
        0, -this.r,           // Top vertex
        -this.r, this.r,      // Bottom-left vertex
        this.r, this.r        // Bottom-right vertex
      );
      
      // Glowing core
      this.p.fill(255, 100, 100, 150 + this.pulseValue);
      this.p.noStroke();
      this.p.ellipse(0, 0, this.r * 0.6, this.r * 0.6);
      
    } else if (this.type === 1) {
      // Type 1: Circular enemy with radial segments
      this.p.fill(200, 30, 60);
      this.p.stroke(255, 100, 100);
      this.p.strokeWeight(1.5);
      this.p.ellipse(0, 0, this.r * 2, this.r * 2);
      
      // Radial segments
      this.p.stroke(255, 60, 80);
      for (let i = 0; i < 4; i++) {
        let angle = i * this.p.PI / 2;
        this.p.line(0, 0, Math.cos(angle) * this.r, Math.sin(angle) * this.r);
      }
      
      // Center
      this.p.fill(255, 180, 180, 150 + this.pulseValue);
      this.p.noStroke();
      this.p.ellipse(0, 0, this.r * 0.8, this.r * 0.8);
      
    } else {
      // Type 2: Diamond enemy with pulsing elements
      this.p.fill(150, 20, 30);
      this.p.stroke(255, 60, 60);
      this.p.strokeWeight(1.5);
      this.p.beginShape();
      this.p.vertex(0, -this.r);        // Top
      this.p.vertex(this.r, 0);         // Right
      this.p.vertex(0, this.r);         // Bottom
      this.p.vertex(-this.r, 0);        // Left
      this.p.endShape(this.p.CLOSE);
      
      // Pulsing elements
      this.p.fill(255, 50, 50, 100 + this.pulseValue);
      this.p.noStroke();
      this.p.ellipse(0, 0, this.r, this.r);
    }
    
    this.p.pop();
  }
}
