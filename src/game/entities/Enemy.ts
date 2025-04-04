
import p5 from "p5";
import { EnemyType, BulletType } from "../types";
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
  isBoss: boolean;
  maxHealth: number;
  fireRate: number;
  lastShotTime: number;
  pattern: number;
  private p: p5;

  constructor(p: p5, x: number, y: number, r: number, speed: number, type?: number, isBoss: boolean = false, difficultyMultiplier: number = 1) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.r = r;
    this.speed = speed;
    
    // Determine enemy type if not specified
    this.type = type !== undefined ? type : this.p.floor(this.p.random(5)); // More enemy types (0-4)
    
    // Set properties based on enemy type
    this.isBoss = isBoss;
    
    if (this.isBoss) {
      // Boss properties - now affected by difficulty multiplier
      this.health = 100 * difficultyMultiplier;
      this.maxHealth = 100 * difficultyMultiplier;
      this.fireRate = Math.max(300, 800 / difficultyMultiplier); // Lower means faster firing, but min 300ms
      this.pattern = this.p.floor(this.p.random(3)); // Different attack patterns
      this.speed = 0.5 * difficultyMultiplier; // Faster movement with higher difficulty
    } else {
      // Regular enemy properties based on type - affected by difficulty multiplier
      switch(this.type) {
        case 0: // Basic enemy (original)
          this.health = Math.ceil(2 * difficultyMultiplier); // Increased from 1, now scales with difficulty
          this.fireRate = Math.max(500, 2000 / difficultyMultiplier);
          break;
        case 1: // Tanky enemy
          this.health = Math.ceil(4 * difficultyMultiplier); // Increased from 3, now scales with difficulty
          this.fireRate = Math.max(600, 2500 / difficultyMultiplier);
          break;
        case 2: // Fast enemy
          this.health = Math.ceil(2 * difficultyMultiplier); // Increased from 1, now scales with difficulty
          this.speed *= 1.5 * Math.min(difficultyMultiplier, 1.5); // Cap speed multiplier to prevent too fast enemies
          this.fireRate = Math.max(500, 2200 / difficultyMultiplier);
          break;
        case 3: // Rapid fire enemy
          this.health = Math.ceil(2 * difficultyMultiplier); // Increased from 1, now scales with difficulty
          this.fireRate = Math.max(400, 1500 / difficultyMultiplier);
          break;
        case 4: // Heavy gunner
          this.health = Math.ceil(3 * difficultyMultiplier); // Increased from 2, now scales with difficulty
          this.fireRate = Math.max(800, 3000 / difficultyMultiplier);
          break;
        default:
          this.health = Math.ceil(2 * difficultyMultiplier);
          this.fireRate = Math.max(500, 2000 / difficultyMultiplier);
      }
      this.maxHealth = this.health;
    }
    
    this.rotationAngle = 0;
    this.pulseValue = 0;
    this.lastShotTime = p.millis();
  }

  update() {
    // Boss stays at top of screen, regular enemies move down
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
    
    this.rotationAngle += this.isBoss ? 0.005 : 0.01;
    this.pulseValue = (Math.sin(this.p.frameCount * 0.1) + 1) * 30;
    
    // Determine if enemy should shoot based on fire rate
    const currentTime = this.p.millis();
    const shouldShoot = currentTime - this.lastShotTime >= this.fireRate;
    
    if (shouldShoot) {
      this.lastShotTime = currentTime;
    }
    
    return shouldShoot;
  }

  shoot() {
    if (this.isBoss) {
      // Boss shooting patterns
      switch(this.pattern) {
        case 0: // Spread shot
          const bullets = [];
          for (let i = -2; i <= 2; i++) {
            bullets.push(new Bullet(this.p, this.x + (i * 15), this.y + this.r, i * 1.5, 5, false, 2));
          }
          return bullets;
        
        case 1: // Heavy shots
          return new Bullet(this.p, this.x, this.y + this.r, 0, 4, false, 4);
          
        case 2: // Rapid double shot
          const leftBullet = new Bullet(this.p, this.x - 20, this.y + this.r, -0.5, 6, false, 2);
          const rightBullet = new Bullet(this.p, this.x + 20, this.y + this.r, 0.5, 6, false, 2);
          return [leftBullet, rightBullet];
          
        default:
          return new Bullet(this.p, this.x, this.y + this.r, 0, 6, false, 2);
      }
    } else {
      // Regular enemy shooting based on type
      switch(this.type) {
        case 1: // Tanky enemy - slower but stronger bullet
          return new Bullet(this.p, this.x, this.y + this.r, 0, 4, false, 2);
          
        case 2: // Fast enemy - fast bullet
          return new Bullet(this.p, this.x, this.y + this.r, 0, 8, false, 1);
          
        case 3: // Rapid fire - normal bullets
          return new Bullet(this.p, this.x, this.y + this.r, 0, 6, false, 1);
          
        case 4: // Heavy gunner - spread shot
          const leftBullet = new Bullet(this.p, this.x - 10, this.y + this.r, -1, 5, false, 1);
          const centerBullet = new Bullet(this.p, this.x, this.y + this.r, 0, 5, false, 1);
          const rightBullet = new Bullet(this.p, this.x + 10, this.y + this.r, 1, 5, false, 1);
          return [leftBullet, centerBullet, rightBullet];
          
        default: // Basic enemy - standard bullet
          return new Bullet(this.p, this.x, this.y + this.r, 0, 6, false, 1);
      }
    }
  }

  draw() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.rotationAngle);
    
    if (this.isBoss) {
      // Boss enemy design
      const healthPercent = this.health / this.maxHealth;
      const bossScale = 2.5; // Boss is larger
      
      // Main body
      this.p.fill(150, 20, 60);
      this.p.stroke(255, 50, 80);
      this.p.strokeWeight(2);
      
      // Hexagonal shape for boss
      this.p.beginShape();
      for (let i = 0; i < 6; i++) {
        const angle = i * this.p.TWO_PI / 6;
        const px = Math.cos(angle) * this.r * bossScale;
        const py = Math.sin(angle) * this.r * bossScale;
        this.p.vertex(px, py);
      }
      this.p.endShape(this.p.CLOSE);
      
      // Boss core
      this.p.fill(255, 50, 100, 150 + this.pulseValue);
      this.p.ellipse(0, 0, this.r * 1.5, this.r * 1.5);
      
      // Weapon pods
      this.p.fill(100, 10, 30);
      this.p.ellipse(-this.r * 1.5, 0, this.r * 0.8, this.r * 0.8);
      this.p.ellipse(this.r * 1.5, 0, this.r * 0.8, this.r * 0.8);
      
      // Glowing elements
      this.p.fill(255, 100, 100, 100 + this.pulseValue);
      this.p.noStroke();
      for (let i = 0; i < 3; i++) {
        const angle = i * this.p.TWO_PI / 3 + this.p.frameCount * 0.02;
        const px = Math.cos(angle) * this.r;
        const py = Math.sin(angle) * this.r;
        this.p.ellipse(px, py, this.r * 0.4, this.r * 0.4);
      }
      
      // Draw health bar above boss
      this.p.pop(); // Reset transformation for health bar positioning
      
      // Health bar container
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
      
    } else {
      // Regular enemy designs based on type
      switch(this.type) {
        case 0: // Original triangle enemy
          this.p.fill(180, 30, 30);
          this.p.stroke(255, 80, 80);
          this.p.strokeWeight(1.5);
          this.p.triangle(
            0, -this.r,
            -this.r, this.r,
            this.r, this.r
          );
          
          // Glowing core
          this.p.fill(255, 100, 100, 150 + this.pulseValue);
          this.p.noStroke();
          this.p.ellipse(0, 0, this.r * 0.6, this.r * 0.6);
          break;
          
        case 1: // Tanky enemy - larger, shield-like
          this.p.fill(90, 90, 150);
          this.p.stroke(150, 150, 220);
          this.p.strokeWeight(2);
          this.p.ellipse(0, 0, this.r * 2.2, this.r * 2.2);
          
          // Shield pattern
          this.p.noFill();
          this.p.stroke(150, 150, 220, 150);
          this.p.arc(0, 0, this.r * 1.8, this.r * 1.8, this.p.PI * 0.25, this.p.PI * 0.75);
          this.p.arc(0, 0, this.r * 1.8, this.r * 1.8, this.p.PI * 1.25, this.p.PI * 1.75);
          
          // Core
          this.p.fill(120, 120, 220, 150 + this.pulseValue);
          this.p.noStroke();
          this.p.ellipse(0, 0, this.r * 1, this.r * 1);
          break;
          
        case 2: // Fast enemy - sleek, arrow-like
          this.p.fill(220, 100, 30);
          this.p.stroke(255, 150, 50);
          this.p.strokeWeight(1.5);
          this.p.beginShape();
          this.p.vertex(0, -this.r * 1.5); // Sharp front
          this.p.vertex(-this.r * 0.8, this.r * 0.5);
          this.p.vertex(0, 0);
          this.p.vertex(this.r * 0.8, this.r * 0.5);
          this.p.endShape(this.p.CLOSE);
          
          // Thrusters
          this.p.fill(255, 150, 0, 150 + this.pulseValue);
          this.p.noStroke();
          const thrusterSize = 3 + Math.sin(this.p.frameCount * 0.3) * 2;
          this.p.ellipse(-this.r * 0.4, this.r * 0.3, thrusterSize, thrusterSize * 2);
          this.p.ellipse(this.r * 0.4, this.r * 0.3, thrusterSize, thrusterSize * 2);
          break;
          
        case 3: // Rapid fire enemy - twin-cannon
          this.p.fill(30, 120, 30);
          this.p.stroke(50, 180, 50);
          this.p.strokeWeight(1.5);
          this.p.rect(-this.r, -this.r, this.r * 2, this.r * 2, 5);
          
          // Gun barrels
          this.p.fill(20, 80, 20);
          this.p.rect(-this.r * 0.6, 0, this.r * 0.3, this.r, 2);
          this.p.rect(this.r * 0.3, 0, this.r * 0.3, this.r, 2);
          
          // Energy core
          this.p.fill(80, 255, 80, 100 + this.pulseValue);
          this.p.noStroke();
          this.p.ellipse(0, -this.r * 0.3, this.r * 0.7, this.r * 0.7);
          break;
          
        case 4: // Heavy gunner - large with multiple guns
          this.p.fill(90, 30, 90);
          this.p.stroke(140, 50, 140);
          this.p.strokeWeight(1.5);
          this.p.ellipse(0, 0, this.r * 2, this.r * 1.6);
          
          // Triple cannon
          this.p.fill(70, 20, 70);
          this.p.rect(-this.r * 0.8, this.r * 0.1, this.r * 0.4, this.r * 0.7, 2);
          this.p.rect(-this.r * 0.2, this.r * 0.1, this.r * 0.4, this.r * 0.9, 2);
          this.p.rect(this.r * 0.4, this.r * 0.1, this.r * 0.4, this.r * 0.7, 2);
          
          // Energy field
          this.p.noFill();
          this.p.stroke(200, 50, 200, 100 + this.pulseValue * 0.5);
          this.p.ellipse(0, 0, this.r * 2.4, this.r * 2.4);
          
          // Core
          this.p.fill(220, 100, 220, 100 + this.pulseValue);
          this.p.noStroke();
          this.p.ellipse(0, -this.r * 0.2, this.r * 0.6, this.r * 0.6);
          break;
          
        default:
          // Fallback simple enemy design
          this.p.fill(150, 30, 30);
          this.p.stroke(220, 80, 80);
          this.p.ellipse(0, 0, this.r * 2, this.r * 2);
          break;
      }
      
      // If enemy is damaged, show a health indicator for multi-hit enemies
      if (this.health < this.maxHealth && this.maxHealth > 1) {
        this.p.pop(); // Reset transformation
        
        const healthPercent = this.health / this.maxHealth;
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
      } else {
        this.p.pop();
      }
    }
  }
}
