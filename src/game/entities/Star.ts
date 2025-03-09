
import p5 from "p5";
import { StarType } from "../types";

export class Star implements StarType {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  blinkRate: number;
  private p: p5;

  constructor(p: p5) {
    this.p = p;
    this.x = this.p.random(this.p.width);
    this.y = this.p.random(this.p.height);
    this.size = this.p.random(1, 3);
    this.speed = this.p.random(0.2, 0.8);
    this.brightness = this.p.random(150, 255);
    this.blinkRate = this.p.random(0.01, 0.05);
  }
  
  update() {
    this.y += this.speed;
    if (this.y > this.p.height) {
      this.y = 0;
      this.x = this.p.random(this.p.width);
    }
    
    // Twinkle effect
    this.brightness = 150 + Math.sin(this.p.frameCount * this.blinkRate) * 105;
  }
  
  draw() {
    this.p.fill(255, 255, 255, this.brightness);
    this.p.noStroke();
    this.p.ellipse(this.x, this.y, this.size);
  }
}
