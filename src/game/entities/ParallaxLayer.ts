
import p5 from "p5";
import { ParallaxLayerType } from "../types";

export class ParallaxLayer implements ParallaxLayerType {
  img: p5.Image;
  speed: number;
  y: number;
  scale: number;
  private p: p5;

  constructor(p: p5, img: p5.Image, speed: number, y: number, scale: number) {
    this.p = p;
    this.img = img;
    this.speed = speed;
    this.y = y;
    this.scale = scale;
  }
  
  update() {
    this.y += this.speed;
    if (this.y > this.p.height) {
      this.y = -this.img.height * this.scale;
    }
  }
  
  draw() {
    this.p.image(this.img, 0, this.y, this.p.width, this.img.height * this.scale);
  }
}
