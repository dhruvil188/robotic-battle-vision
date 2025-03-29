
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
      
      // Level-based particle effects
      const particles = [];
      const particleCount = 5 + (currentLevel * 2); // More particles at higher levels
      
      for (let i = 0; i < particleCount; i++) {
        // Color becomes more intense with level
        const baseColor = this.p.color(30, 144, 255, 200);
        if (currentLevel >= 3) {
          // Add white core for higher levels
          particles.push(new Particle(
            this.p,
            this.x, 
            this.y - this.h / 2, 
            this.p.random(-0.5, 0.5), 
            this.p.random(-4, -2),
            this.p.color(200, 220, 255, 230),
            this.p.random(3, 6),
            this.p.random(8, 15)
          ));
        }
        
        particles.push(new Particle(
          this.p,
          this.x, 
          this.y - this.h / 2, 
          this.p.random(-1, 1), 
          this.p.random(-3, -1),
          baseColor,
          this.p.random(4 + currentLevel, 8 + currentLevel), // Bigger particles at higher levels
          this.p.random(10, 20)
        ));
      }
      
      return { bullet, particles };
    } else if (this.currentWeapon === 1) {
      // Shotgun - spread pattern improves with level
      // Base bullets
      const centerBullet = new Bullet(this.p, this.x, this.y - this.h / 2, 0, -11, true);
      const extraBullets = [];
      
      // Apply level-based damage
      const baseDamage = Math.round(7 * levelMultiplier);
      centerBullet.damage = baseDamage;
      
      // Level 1-2: 3 bullets, Level 3-4: 5 bullets, Level 5: 7 bullets
      if (currentLevel < 3) {
        // Level 1-2: Basic 3-bullet spread
        const leftBullet = new Bullet(this.p, this.x - 5, this.y - this.h / 2, -2, -10, true);
        const rightBullet = new Bullet(this.p, this.x + 5, this.y - this.h / 2, 2, -10, true);
        leftBullet.damage = Math.round(baseDamage * 0.9);
        rightBullet.damage = Math.round(baseDamage * 0.9);
        extraBullets.push(leftBullet, rightBullet);
      } else if (currentLevel < 5) {
        // Level 3-4: 5-bullet spread with better pattern
        const leftBullet1 = new Bullet(this.p, this.x - 5, this.y - this.h / 2, -2, -10, true);
        const rightBullet1 = new Bullet(this.p, this.x + 5, this.y - this.h / 2, 2, -10, true);
        const leftBullet2 = new Bullet(this.p, this.x - 12, this.y - this.h / 2, -3.5, -9, true);
        const rightBullet2 = new Bullet(this.p, this.x + 12, this.y - this.h / 2, 3.5, -9, true);
        
        leftBullet1.damage = Math.round(baseDamage * 0.9);
        rightBullet1.damage = Math.round(baseDamage * 0.9);
        leftBullet2.damage = Math.round(baseDamage * 0.8);
        rightBullet2.damage = Math.round(baseDamage * 0.8);
        
        extraBullets.push(leftBullet1, rightBullet1, leftBullet2, rightBullet2);
      } else {
        // Level 5: 7-bullet spread with maximum damage and coverage
        const leftBullet1 = new Bullet(this.p, this.x - 5, this.y - this.h / 2, -1.5, -11, true);
        const rightBullet1 = new Bullet(this.p, this.x + 5, this.y - this.h / 2, 1.5, -11, true);
        const leftBullet2 = new Bullet(this.p, this.x - 12, this.y - this.h / 2, -3, -10, true);
        const rightBullet2 = new Bullet(this.p, this.x + 12, this.y - this.h / 2, 3, -10, true);
        const leftBullet3 = new Bullet(this.p, this.x - 18, this.y - this.h / 2, -4.5, -9, true);
        const rightBullet3 = new Bullet(this.p, this.x + 18, this.y - this.h / 2, 4.5, -9, true);
        
        leftBullet1.damage = Math.round(baseDamage * 0.95);
        rightBullet1.damage = Math.round(baseDamage * 0.95);
        leftBullet2.damage = Math.round(baseDamage * 0.9);
        rightBullet2.damage = Math.round(baseDamage * 0.9);
        leftBullet3.damage = Math.round(baseDamage * 0.85);
        rightBullet3.damage = Math.round(baseDamage * 0.85);
        
        extraBullets.push(leftBullet1, rightBullet1, leftBullet2, rightBullet2, leftBullet3, rightBullet3);
      }
      
      // Create particles for shotgun blast - more intense with level
      const particles = [];
      const particleCount = 10 + (currentLevel * 3);
      const spreadRange = 10 + (currentLevel * 2);
      
      for (let i = 0; i < particleCount; i++) {
        // Higher level shotguns have more impressive particle effects
        const particleColor = currentLevel >= 4 
          ? this.p.color(255, 100 + this.p.random(0, 100), 0, this.p.random(150, 250))
          : this.p.color(255, 200, 100, this.p.random(150, 220));
        
        particles.push(new Particle(
          this.p,
          this.x + this.p.random(-spreadRange, spreadRange), 
          this.y - this.h / 2, 
          this.p.random(-3, 3), 
          this.p.random(-5, -1),
          particleColor,
          this.p.random(3 + currentLevel, 6 + currentLevel),
          this.p.random(8, 15)
        ));
      }
      
      return { 
        bullet: centerBullet, 
        extraBullets: extraBullets,
        particles 
      };
    } else if (this.currentWeapon === 2) {
      // Laser - much more powerful and visually impressive with levels
      const bullet = new Bullet(this.p, this.x, this.y - this.h / 2, 0, -25 - (currentLevel * 2), true);
      bullet.damage = Math.round(25 * levelMultiplier); 
      
      // More particles for higher levels
      const particles = [];
      const beamLength = 100 + (currentLevel * 20); // Longer beam trail with higher levels
      const beamSegments = 15 + (currentLevel * 2);
      const segmentLength = beamLength / beamSegments;
      
      // Create beam segments
      for (let i = 0; i < beamSegments; i++) {
        const distance = i * segmentLength;
        
        // Determine beam color based on level
        let beamColor;
        if (currentLevel >= 4) {
          // Level 5: Purple-white beam 
          beamColor = this.p.color(180 + this.p.random(0, 75), 50 + this.p.random(0, 50), 255, this.p.random(150, 250));
        } else if (currentLevel >= 2) {
          // Level 3-4: Brighter pink-purple beam
          beamColor = this.p.color(255, 50 + this.p.random(0, 50), 200 + this.p.random(0, 55), this.p.random(150, 250));
        } else {
          // Level 1-2: Basic pink beam
          beamColor = this.p.color(255, 0, 128, this.p.random(150, 250));
        }
        
        // Main beam particles
        particles.push(new Particle(
          this.p,
          this.x + this.p.random(-1 - currentLevel, 1 + currentLevel), 
          this.y - this.h / 2 - distance, 
          this.p.random(-0.5, 0.5), 
          this.p.random(-8, -4),
          beamColor,
          this.p.random(3 + currentLevel * 0.5, 8 + currentLevel * 0.5),
          this.p.random(10, 20)
        ));
        
        // Side particles for a more impressive beam
        if (i % 2 === 0 || currentLevel >= 3) {
          // Higher levels have more side particles
          const sideParticleCount = currentLevel >= 3 ? 2 : 1;
          
          for (let j = 0; j < sideParticleCount; j++) {
            particles.push(new Particle(
              this.p,
              this.x + this.p.random(-8 - currentLevel * 0.5, 8 + currentLevel * 0.5), 
              this.y - this.h / 2 - distance, 
              this.p.random(-2, 2), 
              this.p.random(-3, -1),
              this.p.color(255, 100, 200, 150),
              this.p.random(2, 4),
              this.p.random(5, 15)
            ));
          }
        }
        
        // Level 5 gets special crackling energy effects
        if (currentLevel >= 4 && i % 3 === 0) {
          for (let j = 0; j < 3; j++) {
            const angle = this.p.random(this.p.TWO_PI);
            const dist = this.p.random(5, 15);
            
            particles.push(new Particle(
              this.p,
              this.x + Math.cos(angle) * dist, 
              this.y - this.h / 2 - distance, 
              Math.cos(angle) * this.p.random(1, 2), 
              Math.sin(angle) * this.p.random(1, 2) - 5,
              this.p.color(200, 150, 255, 200),
              this.p.random(2, 5),
              this.p.random(5, 10)
            ));
          }
        }
      }
      
      return { bullet, particles };
    } else if (this.currentWeapon === 3) {
      // Plasma - Extremely powerful but slower, massive splash damage
      // Higher levels have faster velocity
      const baseVelocity = -6 - (currentLevel * 0.5); // Faster at higher levels
      const bullet = new Bullet(this.p, this.x, this.y - this.h / 2, 0, baseVelocity, true); 
      bullet.damage = Math.round(50 * levelMultiplier); // Massive damage, scaled by level
      
      // Create plasma particles - more impressive and energetic at higher levels
      const particles = [];
      
      // Outer energy ring - more rings at higher levels
      const ringCount = 1 + Math.min(currentLevel, 3);
      for (let r = 0; r < ringCount; r++) {
        const ringSegments = 16 + (currentLevel * 2);
        const ringRadius = 8 + (r * 4) + (currentLevel * 1.5);
        
        for (let i = 0; i < ringSegments; i++) {
          const angle = (i / ringSegments) * this.p.TWO_PI;
          
          // Level-specific colors
          let ringColor;
          if (currentLevel >= 4) {
            // Level 5: Multi-colored plasma
            const hue = (i / ringSegments) * 255;
            ringColor = this.p.color(this.p.random(100, 200), 200 + this.p.random(0, 55), 150 + this.p.random(0, 105), this.p.random(150, 250));
          } else if (currentLevel >= 2) {
            // Level 3-4: Brighter cyan-green
            ringColor = this.p.color(0, 230 + this.p.random(0, 25), 170 + this.p.random(0, 85), this.p.random(150, 250));
          } else {
            // Level 1-2: Basic cyan
            ringColor = this.p.color(0, 255, 200, this.p.random(150, 250));
          }
          
          particles.push(new Particle(
            this.p,
            this.x + Math.cos(angle) * ringRadius, 
            this.y - this.h / 2 + Math.sin(angle) * ringRadius, 
            Math.cos(angle) * this.p.random(0.5, 1.5), 
            Math.sin(angle) * this.p.random(0.5, 1.5) - 2,
            ringColor,
            this.p.random(4 + currentLevel, 10 + currentLevel),
            this.p.random(15, 30)
          ));
        }
      }
      
      // Core particles - brighter and more at higher levels
      const coreParticleCount = 8 + (currentLevel * 2);
      for (let i = 0; i < coreParticleCount; i++) {
        // Core gets more white/bright at higher levels
        const coreColor = currentLevel >= 4
          ? this.p.color(180 + this.p.random(0, 75), 255, 230, 255)
          : this.p.color(100, 255, 230, 255);
        
        particles.push(new Particle(
          this.p,
          this.x + this.p.random(-5, 5), 
          this.y - this.h / 2, 
          this.p.random(-1, 1), 
          this.p.random(-3, -1),
          coreColor,
          this.p.random(8, 15),
          this.p.random(20, 35)
        ));
      }
      
      // Trail particles
      const trailParticleCount = 6 + currentLevel;
      for (let i = 0; i < trailParticleCount; i++) {
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
      
      // Level 4-5 gets energy crackles
      if (currentLevel >= 3) {
        for (let i = 0; i < currentLevel * 2; i++) {
          const angle = this.p.random(this.p.TWO_PI);
          const dist = this.p.random(10, 20 + currentLevel * 2);
          
          particles.push(new Particle(
            this.p,
            this.x + Math.cos(angle) * dist, 
            this.y - this.h / 2 + Math.sin(angle) * dist, 
            Math.cos(angle) * this.p.random(1, 3), 
            Math.sin(angle) * this.p.random(1, 3) - 2,
            this.p.color(100 + this.p.random(0, 155), 255, 200, 180),
            this.p.random(3, 6),
            this.p.random(10, 20)
          ));
        }
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
