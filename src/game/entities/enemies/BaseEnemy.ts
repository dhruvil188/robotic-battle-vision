import p5 from "p5";
import { EnemyType, BulletType } from "../../types";
import { Bullet } from "../Bullet";

export abstract class BaseEnemy implements EnemyType {
  x: number;
  y: number;
  r: number;
  speed: number;
  health: number;
  type: number;
  rotationAngle: number;
  pulseValue: number;
  isBoss: boolean;
  maxHealth: number;
  fireRate: number;
  lastShotTime: number;
  pattern: number;
  protected p: p5;

  constructor(p: p5, x: number, y: number, r: number, speed: number, type: number, isBoss: boolean = false) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.r = r;
    this.speed = speed;
    this.type = type;
    this.isBoss = isBoss;
    this.rotationAngle = 0;
    this.pulseValue = 0;
    this.lastShotTime = p.millis();
    
    // Default values, should be overridden by subclasses
    this.health = 1;
    this.maxHealth = 1;
    this.fireRate = 2000;
    this.pattern = 0;
  }

  update() {
    // Common update logic
    this.rotationAngle += this.isBoss ? 0.005 : 0.01;
    this.pulseValue = (Math.sin(this.p.frameCount * 0.1) + 1) * 30;
    
    // Movement logic, can be overridden by subclasses
    if (!this.isBoss) {
      this.y += this.speed;
    } else {
      // Boss hovers at the top with slight movement
      if (this.y < 100) {
        this.y += this.speed;
      } else {
        // Side-to-side movement for boss
        this.x += Math.sin(this.p.frameCount * 0.02) * 1.5;
        
        // Keep boss within screen bounds
        if (this.x < this.r) this.x = this.r;
        if (this.x > this.p.width - this.r) this.x = this.p.width - this.r;
      }
    }
    
    // Determine if enemy should shoot based on fire rate
    const currentTime = this.p.millis();
    const shouldShoot = currentTime - this.lastShotTime >= this.fireRate;
    
    if (shouldShoot) {
      this.lastShotTime = currentTime;
    }
    
    return shouldShoot;
  }

  // To be implemented by subclasses
  abstract shoot(): BulletType | BulletType[];
  abstract draw(): void;

  // Helper methods for draw implementations
  protected drawHealthBar() {
    if (this.health < this.maxHealth) {
      const healthPercent = this.health / this.maxHealth;
      
      if (this.isBoss) {
        // Boss health bar
        const barWidth = this.r * 5;
        const barHeight = 10;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.r * 3;
        
        this.p.fill(50, 50, 70);
        this.p.rect(barX, barY, barWidth, barHeight, 5);
        
        // Health fill
        const fillColor = this.p.lerpColor(
          this.p.color(255, 30, 30),
          this.p.color(30, 255, 100),
          healthPercent
        );
        this.p.fill(fillColor);
        this.p.rect(barX, barY, barWidth * healthPercent, barHeight, 5);
        
        // Health percentage
        this.p.fill(255);
        this.p.textSize(12);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.text(Math.round(healthPercent * 100) + "%", this.x, barY - 10);
      } else if (this.maxHealth > 1) {
        // Regular multi-hit enemy health bar
        const barWidth = this.r * 2;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.r * 1.5;
        
        // Health bar background
        this.p.fill(40, 40, 60, 180);
        this.p.rect(barX, barY, barWidth, barHeight, 2);
        
        // Health bar fill
        this.p.fill(255, 50, 50);
        this.p.rect(barX, barY, barWidth * healthPercent, barHeight, 2);
      }
    }
  }
}
