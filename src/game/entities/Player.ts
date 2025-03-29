
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
  currentWeapon: number; // 0 = standard, 1 = shotgun, 2 = laser, 3 = plasma
  private p: p5;
  private weaponLevels: number[]; // Store the weapon levels

  constructor(p: p5, x: number, y: number, w: number, h: number, weaponLevels?: number[]) {
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
    this.currentWeapon = 0;
    this.weaponLevels = weaponLevels || [0, 0, 0, 0]; // Default to level 0 for all weapons
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
    // Get current weapon level for damage calculations
    const currentLevel = this.weaponLevels[this.currentWeapon];
    // Calculate bonus damage based on weapon level (20% increase per level)
    const levelMultiplier = 1 + (currentLevel * 0.2);

    if (this.currentWeapon === 0) {
      // Standard single bullet - simple but reliable
      const bullet = new Bullet(this.p, this.x, this.y - this.h / 2, 0, -12, true);
      // Apply level-based damage
      bullet.damage = Math.round(10 * levelMultiplier);
      
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
    } else if (this.currentWeapon === 1) {
      // Shotgun - improved spread pattern with more bullets
      const centerBullet = new Bullet(this.p, this.x, this.y - this.h / 2, 0, -11, true);
      const leftBullet1 = new Bullet(this.p, this.x - 5, this.y - this.h / 2, -2, -9, true);
      const rightBullet1 = new Bullet(this.p, this.x + 5, this.y - this.h / 2, 2, -9, true);
      const leftBullet2 = new Bullet(this.p, this.x - 10, this.y - this.h / 2, -3.5, -7, true);
      const rightBullet2 = new Bullet(this.p, this.x + 10, this.y - this.h / 2, 3.5, -7, true);
      
      // Set damage - each bullet does less damage individually, but combined they're powerful
      centerBullet.damage = Math.round(7 * levelMultiplier);
      leftBullet1.damage = Math.round(6 * levelMultiplier);
      rightBullet1.damage = Math.round(6 * levelMultiplier);
      leftBullet2.damage = Math.round(5 * levelMultiplier);
      rightBullet2.damage = Math.round(5 * levelMultiplier);
      
      // Create particles for shotgun blast
      const particles = [];
      for (let i = 0; i < 15; i++) {
        particles.push(new Particle(
          this.p,
          this.x + this.p.random(-15, 15), 
          this.y - this.h / 2, 
          this.p.random(-3, 3), 
          this.p.random(-5, -1),
          this.p.color(255, 200, 100, 200),
          this.p.random(4, 8),
          this.p.random(8, 15)
        ));
      }
      
      return { 
        bullet: centerBullet, 
        extraBullets: [leftBullet1, rightBullet1, leftBullet2, rightBullet2],
        particles 
      };
    } else if (this.currentWeapon === 2) {
      // Laser - much more powerful, piercing beam with higher damage
      const bullet = new Bullet(this.p, this.x, this.y - this.h / 2, 0, -25, true);
      bullet.damage = Math.round(25 * levelMultiplier); // Significant damage increase
      
      // Create laser beam particles - more intense
      const particles = [];
      for (let i = 0; i < 20; i++) {
        const distance = i * 7;
        particles.push(new Particle(
          this.p,
          this.x + this.p.random(-2, 2), 
          this.y - this.h / 2 - distance, 
          this.p.random(-0.5, 0.5), 
          this.p.random(-8, -4),
          this.p.color(255, 0, 128, this.p.random(150, 250)),
          this.p.random(3, 8),
          this.p.random(10, 20)
        ));
        
        // Add side particles for a more impressive beam
        if (i % 3 === 0) {
          particles.push(new Particle(
            this.p,
            this.x + this.p.random(-8, 8), 
            this.y - this.h / 2 - distance, 
            this.p.random(-2, 2), 
            this.p.random(-3, -1),
            this.p.color(255, 100, 200, 150),
            this.p.random(2, 4),
            this.p.random(5, 15)
          ));
        }
      }
      
      return { bullet, particles };
    } else if (this.currentWeapon === 3) {
      // Plasma - Extremely powerful but slower, massive splash damage
      const bullet = new Bullet(this.p, this.x, this.y - this.h / 2, 0, -6, true); // Slower but devastating
      bullet.damage = Math.round(50 * levelMultiplier); // Massive damage, scaled by level
      
      // Create plasma particles - more impressive and energetic
      const particles = [];
      
      // Outer energy ring
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * this.p.TWO_PI;
        const radius = 12;
        particles.push(new Particle(
          this.p,
          this.x + Math.cos(angle) * radius, 
          this.y - this.h / 2 + Math.sin(angle) * radius, 
          Math.cos(angle) * this.p.random(0.5, 1.5), 
          Math.sin(angle) * this.p.random(0.5, 1.5) - 2,
          this.p.color(0, 255, 200, this.p.random(150, 250)),
          this.p.random(6, 12),
          this.p.random(15, 30)
        ));
      }
      
      // Core particles
      for (let i = 0; i < 10; i++) {
        particles.push(new Particle(
          this.p,
          this.x + this.p.random(-5, 5), 
          this.y - this.h / 2, 
          this.p.random(-1, 1), 
          this.p.random(-3, -1),
          this.p.color(100, 255, 230, 255),
          this.p.random(8, 15),
          this.p.random(20, 35)
        ));
      }
      
      // Trail particles
      for (let i = 0; i < 8; i++) {
        particles.push(new Particle(
          this.p,
          this.x + this.p.random(-3, 3), 
          this.y - this.h / 2 + this.p.random(0, 10), 
          this.p.random(-0.5, 0.5), 
          this.p.random(-0.5, 1),
          this.p.color(0, 200, 180, 150),
          this.p.random(5, 10),
          this.p.random(15, 25)
        ));
      }
      
      return { bullet, particles };
    }
    
    // Default case
    const bullet = new Bullet(this.p, this.x, this.y - this.h / 2, 0, -12, true);
    return { 
      bullet, 
      particles: [] 
    };
  }

  switchWeapon() {
    // Only cycle through weapons that have been purchased
    // This will be used by the shop system
    this.currentWeapon = (this.currentWeapon + 1) % 4;
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
    
    // Current weapon indicator
    if (this.currentWeapon === 0) {
      // Standard weapon indicator (blue)
      this.p.fill(30, 144, 255);
      this.p.rect(this.x - 15, this.y + this.h/4, 30, 5, 2);
    } else if (this.currentWeapon === 1) {
      // Shotgun indicator (orange)
      this.p.fill(255, 150, 50);
      this.p.rect(this.x - 15, this.y + this.h/4, 30, 5, 2);
      
      // Extra bars for shotgun
      this.p.rect(this.x - 20, this.y + this.h/4 - 3, 5, 11, 1);
      this.p.rect(this.x + 15, this.y + this.h/4 - 3, 5, 11, 1);
    } else if (this.currentWeapon === 2) {
      // Laser indicator (pink)
      this.p.fill(255, 0, 128);
      this.p.rect(this.x - 15, this.y + this.h/4, 30, 5, 2);
      
      // Laser emitter tips
      this.p.ellipse(this.x, this.y - this.h/3, 6, 6);
    } else if (this.currentWeapon === 3) {
      // Plasma indicator (cyan)
      this.p.fill(0, 255, 200);
      this.p.rect(this.x - 15, this.y + this.h/4, 30, 5, 2);
      
      // Plasma emitter
      this.p.ellipse(this.x, this.y - this.h/3, 8, 8);
      this.p.ellipse(this.x, this.y - this.h/3, 12, 12);
    }
    
    // Glowing elements
    let glowPulse = (Math.sin(this.p.frameCount * 0.1) + 1) * 50 + 150;
    this.p.fill(30, 144, 255, glowPulse);
    this.p.noStroke();
    this.p.ellipse(this.x - this.w/3, this.y, 8, 8);
    this.p.ellipse(this.x + this.w/3, this.y, 8, 8);
    
    this.p.pop();
  }
}
