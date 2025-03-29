
import p5 from "p5";
import { PowerUpType } from "../types";

export class PowerUp implements PowerUpType {
  x: number;
  y: number;
  r: number;
  speed: number;
  rotationAngle: number;
  type: number;
  private p: p5;

  constructor(p: p5, x: number, y: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.r = 15;
    this.speed = 1.5;
    this.rotationAngle = 0;
    // 0: health, 1: shield, 2: rapid fire, 3: triple shot, 4: bomb, 5: speed boost
    this.type = this.p.floor(this.p.random(6)); 
  }
  
  update() {
    this.y += this.speed;
    this.rotationAngle += 0.03;
  }
  
  draw() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.rotationAngle);
    
    // Outer glow
    this.p.noFill();
    this.p.strokeWeight(2);
    
    if (this.type === 0) { // Health (green)
      this.p.stroke(0, 255, 120, 150 + Math.sin(this.p.frameCount * 0.1) * 50);
      this.p.fill(0, 180, 70, 100);
    } else if (this.type === 1) { // Shield (blue)
      this.p.stroke(30, 144, 255, 150 + Math.sin(this.p.frameCount * 0.1) * 50);
      this.p.fill(30, 120, 200, 100);
    } else if (this.type === 2) { // Rapid fire (yellow)
      this.p.stroke(255, 220, 0, 150 + Math.sin(this.p.frameCount * 0.1) * 50);
      this.p.fill(220, 180, 0, 100);
    } else if (this.type === 3) { // Triple shot (purple)
      this.p.stroke(180, 90, 255, 150 + Math.sin(this.p.frameCount * 0.1) * 50);
      this.p.fill(140, 60, 190, 100);
    } else if (this.type === 4) { // Bomb (orange/red)
      this.p.stroke(255, 100, 30, 150 + Math.sin(this.p.frameCount * 0.1) * 50);
      this.p.fill(220, 80, 10, 100);
    } else { // Speed boost (cyan)
      this.p.stroke(0, 220, 220, 150 + Math.sin(this.p.frameCount * 0.1) * 50);
      this.p.fill(0, 180, 180, 100);
    }
    
    this.p.ellipse(0, 0, this.r * 2, this.r * 2);
    
    // Inner symbol
    this.p.strokeWeight(2);
    if (this.type === 0) { // Health - plus sign
      this.p.line(0, -7, 0, 7);
      this.p.line(-7, 0, 7, 0);
    } else if (this.type === 1) { // Shield - shield shape
      this.p.arc(0, 0, this.r * 1.6, this.r * 1.6, this.p.PI, this.p.TWO_PI);
      this.p.line(-this.r * 0.8, 0, this.r * 0.8, 0);
    } else if (this.type === 2) { // Rapid fire - lightning bolt
      this.p.beginShape();
      this.p.vertex(-3, -8);
      this.p.vertex(2, -2);
      this.p.vertex(-1, 0);
      this.p.vertex(3, 8);
      this.p.vertex(0, 2);
      this.p.vertex(3, 0);
      this.p.endShape();
    } else if (this.type === 3) { // Triple shot - three parallel lines
      this.p.line(-5, -7, -5, 7);
      this.p.line(0, -7, 0, 7);
      this.p.line(5, -7, 5, 7);
    } else if (this.type === 4) { // Bomb - explosion symbol
      this.p.ellipse(0, 0, 10, 10);
      this.p.line(-7, -7, -4, -4);
      this.p.line(7, -7, 4, -4);
      this.p.line(-7, 7, -4, 4);
      this.p.line(7, 7, 4, 4);
    } else { // Speed boost - fast forward symbol
      this.p.triangle(-7, -5, -7, 5, 0, 0);
      this.p.triangle(0, -5, 0, 5, 7, 0);
    }
    
    this.p.pop();
  }
}
