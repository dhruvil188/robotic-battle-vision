import p5 from "p5";
import { BulletType, ParticleType } from "../types";
import { Particle } from "./Particle";

export class Bullet implements BulletType {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  isPlayerBullet: boolean;
  damage: number;
  private p: p5;

  constructor(p: p5, x: number, y: number, vx: number, vy: number, isPlayerBullet: boolean = true, damage: number = 1) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.age = 0;
    this.isPlayerBullet = isPlayerBullet;
    this.damage = damage;
  }

  update(): ParticleType | null {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    
    // Adjust particle trails based on damage/weapon type
    if (this.isPlayerBullet) {
      // The higher the damage, the more impressive the trail
      const baseChance = this.damage / 50; // Higher damage = higher chance of particles
      const chanceMultiplier = Math.min(1, baseChance + 0.1); // Cap at 100% chance
      
      if (this.damage >= 40) {
        // Plasma cannon trail (constant trail)
        // Higher damage plasma creates additional particles
        if (this.damage >= 60) {
          // Level 4-5 plasma has extra energy crackles
          if (this.p.random() < 0.3) {
            const angle = this.p.random(this.p.TWO_PI);
            const dist = this.p.random(5, 10);
            
            return new Particle(
              this.p,
              this.x + Math.cos(angle) * dist,
              this.y + Math.sin(angle) * dist,
              Math.cos(angle) * this.p.random(0.5, 1.5),
              Math.sin(angle) * this.p.random(0.5, 1.5),
              this.p.color(100 + this.p.random(0, 155), 255, 200, 180),
              this.p.random(3, 6),
              this.p.random(5, 12)
            );
          }
        }
        
        // Standard plasma trail for all levels
        return new Particle(
          this.p,
          this.x + this.p.random(-8, 8),
          this.y + this.p.random(-2, 8),
          this.p.random(-1, 1),
          this.p.random(-0.5, 1),
          this.p.color(0, 255, 200, 150),
          this.p.random(5, 10),
          this.p.random(10, 20)
        );
      } else if (this.damage >= 20) {
        // Laser trail (constant trail)
        if (this.p.random() < 0.9) {  // Increased chance for lasers
          // More intense colors for higher damage (higher level) lasers
          let color = this.p.color(255, 0, 128, 150);
          
          if (this.damage >= 35) {
            // Level 4-5 laser has purple hue
            color = this.p.color(180 + this.p.random(0, 75), 0 + this.p.random(0, 50), 255, 180);
          } else if (this.damage >= 28) {
            // Level 3 laser has pinker hue
            color = this.p.color(255, 0 + this.p.random(0, 50), 180 + this.p.random(0, 75), 180);
          }
          
          return new Particle(
            this.p,
            this.x + this.p.random(-3, 3),
            this.y + this.p.random(0, 5),
            this.p.random(-0.5, 0.5),
            this.p.random(-0.2, 0.5),
            color,
            this.p.random(2, 6 + (this.damage - 20)/5), // Bigger particles for higher damage
            this.p.random(8, 16)
          );
        }
      } else if (this.damage < 10) {
        // Shotgun pellets (occasional trail)
        if (this.p.random() < 0.4 * chanceMultiplier) {
          let color = this.p.color(255, 160, 30, 150);
          
          // Higher level shotgun pellets have more orange/red color
          if (this.damage >= 8) {
            color = this.p.color(255, 100 + this.p.random(0, 60), 0, 170);
          }
          
          return new Particle(
            this.p,
            this.x,
            this.y,
            this.p.random(-0.5, 0.5),
            this.p.random(-0.2, 0.5),
            color,
            this.p.random(2, 4 + this.damage/5),
            this.p.random(5, 10)
          );
        }
      } else {
        // Standard bullet (occasional trail)
        if (this.p.random() < 0.3 * chanceMultiplier) {
          // Higher level standard bullet has more whitish-blue trail
          let color = this.p.color(30, 144, 255, 150);
          
          if (this.damage >= 16) {
            // Level 4-5 standard gun has bright blue-white trail
            color = this.p.color(100 + this.p.random(0, 155), 200, 255, 180);
          }
          
          return new Particle(
            this.p,
            this.x,
            this.y,
            this.p.random(-0.5, 0.5),
            this.p.random(-0.5, 0.5),
            color,
            this.p.random(2, 5 + this.damage/10),
            this.p.random(10, 20)
          );
        }
      }
    } else {
      // Enemy bullets
      const particleColor = this.p.color(255, 100, 100, 150);
      if (this.p.random() < 0.3) {
        return new Particle(
          this.p,
          this.x,
          this.y,
          this.p.random(-0.5, 0.5),
          this.p.random(-0.5, 0.5),
          particleColor,
          this.p.random(2, 5),
          this.p.random(10, 20)
        );
      }
    }
    
    return null;
  }

  draw() {
    this.p.push();
    
    if (this.isPlayerBullet) {
      // Differentiate bullet appearance based on damage/weapon type
      if (this.damage >= 40) {
        // Plasma cannon (large, glowing, pulsing sphere)
        // Level-based visual enhancements
        const pulseSize = 14 + Math.sin(this.age * 0.3) * 3;
        const levelBonus = Math.min(10, Math.max(0, (this.damage - 40) / 2)); // 0-10 bonus for levels
        
        // Outer glow
        const outerGlowSize = pulseSize + 10 + levelBonus;
        // More colorful for higher levels
        if (this.damage >= 60) {
          // Level 4-5: Multi-colored plasma
          const cycleColor = Math.sin(this.age * 0.1) * 100;
          this.p.fill(cycleColor, 255, 200 - cycleColor, 100);
        } else {
          // Level 1-3: Standard cyan
          this.p.fill(0, 255, 200, 100);
        }
        this.p.ellipse(this.x, this.y, outerGlowSize, outerGlowSize);
        
        // Inner glow
        const innerGlowSize = pulseSize + (levelBonus * 0.7);
        if (this.damage >= 60) {
          this.p.fill(150 + Math.sin(this.age * 0.2) * 50, 255, 200, 180);
        } else {
          this.p.fill(100, 255, 230, 180);
        }
        this.p.ellipse(this.x, this.y, innerGlowSize, innerGlowSize);
        
        // Core
        const coreSize = 6 + (levelBonus * 0.5);
        this.p.fill(255, 255, 255, 200);
        this.p.ellipse(this.x, this.y, coreSize, coreSize);
        
        // Energy crackles - more and longer at higher levels
        const crackleCount = 3 + Math.floor(levelBonus / 2);
        for (let i = 0; i < crackleCount; i++) {
          const angle = this.p.random(this.p.TWO_PI);
          const dist = this.p.random(5, 10 + levelBonus);
          if (this.damage >= 60) {
            const cycleColor = Math.sin(this.age * 0.1 + i) * 100;
            this.p.stroke(cycleColor, 255, 200 - cycleColor, 200);
          } else {
            this.p.stroke(0, 255, 200, 200);
          }
          this.p.strokeWeight(1.5);
          this.p.line(
            this.x, this.y,
            this.x + Math.cos(angle) * dist,
            this.y + Math.sin(angle) * dist
          );
        }
      } else if (this.damage >= 20) {
        // Laser (narrow, elongated beam with bright core)
        // Level-based visual enhancements
        const levelBonus = Math.min(10, Math.max(0, (this.damage - 20) / 2)); // 0-10 bonus for levels
        const beamWidth = 3 + (levelBonus * 0.3);
        const beamLength = 30 + (levelBonus * 2);
        
        // Beam color based on level
        let beamColor, coreColor;
        if (this.damage >= 35) {
          // Level 4-5: Purple beam
          beamColor = this.p.color(180, 30, 255, 180);
          coreColor = this.p.color(220, 180, 255, 255);
        } else if (this.damage >= 28) {
          // Level 3: Bright pink beam
          beamColor = this.p.color(255, 20, 170, 180);
          coreColor = this.p.color(255, 200, 240, 255);
        } else {
          // Level 1-2: Standard pink
          beamColor = this.p.color(255, 0, 128, 180);
          coreColor = this.p.color(255, 180, 230, 255);
        }
        
        // Outer beam
        this.p.fill(beamColor);
        this.p.noStroke();
        this.p.rect(this.x - beamWidth/2, this.y - beamLength, beamWidth, beamLength, 1);
        
        // Bright core
        const coreWidth = beamWidth * 0.4;
        this.p.fill(coreColor);
        this.p.rect(this.x - coreWidth/2, this.y - beamLength, coreWidth, beamLength);
        
        // Glow effect - more intense at higher levels
        const glowSize = 8 + (levelBonus * 0.6);
        this.p.fill(beamColor);
        this.p.ellipse(this.x, this.y, glowSize, glowSize);
        
        // Pulse at the front of the beam - bigger at higher levels
        const pulseSize = 4 + (levelBonus * 0.5) + Math.sin(this.age * 0.5) * 2;
        this.p.fill(coreColor);
        this.p.ellipse(this.x, this.y - beamLength, pulseSize, pulseSize);
        
        // Level 4-5 gets energy crackles at the beam tip
        if (this.damage >= 35) {
          const crackleCount = 3;
          for (let i = 0; i < crackleCount; i++) {
            const angle = this.p.random(this.p.TWO_PI);
            const dist = this.p.random(3, 8);
            this.p.stroke(220, 180, 255, 200);
            this.p.strokeWeight(1);
            this.p.line(
              this.x, this.y - beamLength + 2,
              this.x + Math.cos(angle) * dist,
              this.y - beamLength + 2 + Math.sin(angle) * dist
            );
          }
        }
      } else if (this.damage < 10) {
        // Shotgun pellets (small, fast)
        // Level-based visual enhancements
        const levelBonus = Math.min(5, Math.max(0, this.damage - 4)); // 0-5 bonus for levels
        const pelletSize = 4 + (levelBonus * 0.3);
        
        // Color based on level
        let pelletColor, glowColor;
        if (this.damage >= 8) {
          // Level 4-5: Bright orange-red
          pelletColor = this.p.color(255, 100, 0);
          glowColor = this.p.color(255, 100, 0, 100);
        } else if (this.damage >= 6) {
          // Level 2-3: Bright orange
          pelletColor = this.p.color(255, 130, 0);
          glowColor = this.p.color(255, 130, 0, 100);
        } else {
          // Level 1: Standard orange
          pelletColor = this.p.color(255, 160, 30);
          glowColor = this.p.color(255, 160, 30, 100);
        }
        
        // Pellet
        this.p.fill(pelletColor);
        this.p.noStroke();
        this.p.ellipse(this.x, this.y, pelletSize, pelletSize);
        
        // Glow - larger for higher levels
        const glowSize = 6 + (levelBonus * 0.5);
        this.p.fill(glowColor);
        this.p.ellipse(this.x, this.y, glowSize, glowSize);
        
        // Level 4-5 gets a small trail
        if (this.damage >= 8) {
          this.p.fill(pelletColor);
          this.p.ellipse(this.x, this.y + 2, pelletSize * 0.7, pelletSize * 0.7);
          this.p.fill(glowColor);
          this.p.ellipse(this.x, this.y + 4, pelletSize * 0.4, pelletSize * 0.4);
        }
      } else {
        // Standard bullet
        // Level-based visual enhancements
        const levelBonus = Math.min(8, Math.max(0, (this.damage - 10) / 2)); // 0-8 bonus for levels
        
        // Color based on level
        let bulletColor, glowColor, coreColor;
        if (this.damage >= 16) {
          // Level 4-5: Bright blue-white
          bulletColor = this.p.color(100, 180, 255);
          glowColor = this.p.color(100, 180, 255, 100);
          coreColor = this.p.color(255, 255, 255, 220);
        } else if (this.damage >= 13) {
          // Level 2-3: Brighter blue
          bulletColor = this.p.color(70, 160, 255);
          glowColor = this.p.color(70, 160, 255, 100);
          coreColor = this.p.color(240, 240, 255, 210);
        } else {
          // Level 1: Standard blue
          bulletColor = this.p.color(30, 144, 255);
          glowColor = this.p.color(30, 144, 255, 100);
          coreColor = this.p.color(255, 255, 255, 200);
        }
        
        // Main bullet shape
        this.p.fill(bulletColor);
        this.p.noStroke();
        const bulletWidth = 4 + (levelBonus * 0.3);
        const bulletLength = 12 + (levelBonus * 0.5);
        this.p.ellipse(this.x, this.y, bulletWidth, bulletLength);
        
        // Glow effect - pulsing and larger at higher levels
        const glowSize = 6 + (levelBonus * 0.5) + Math.sin(this.age * 0.3) * 2;
        this.p.fill(glowColor);
        this.p.ellipse(this.x, this.y, glowSize, glowSize + 10 + (levelBonus * 0.5));
        
        // Core - brighter and larger at higher levels
        const coreWidth = 2 + (levelBonus * 0.15);
        const coreLength = 6 + (levelBonus * 0.4);
        this.p.fill(coreColor);
        this.p.ellipse(this.x, this.y, coreWidth, coreLength);
        
        // Level 4-5 gets a small trail
        if (this.damage >= 16) {
          this.p.fill(bulletColor);
          this.p.ellipse(this.x, this.y + 5, bulletWidth * 0.7, bulletWidth * 0.7);
          this.p.fill(glowColor);
          this.p.ellipse(this.x, this.y + 7, bulletWidth * 0.4, bulletWidth * 0.4);
        }
      }
    } else {
      // Enemy bullets
      let bulletColor;
      
      // Different colors/effects based on damage
      if (this.damage >= 4) {
        // Boss heavy shot
        bulletColor = this.p.color(255, 50, 20);
        this.p.fill(bulletColor);
        this.p.ellipse(this.x, this.y, 12, 12);
        
        // Pulsing glow
        const pulseSize = 6 + Math.sin(this.age * 0.2) * 3;
        this.p.fill(255, 50, 20, 150);
        this.p.ellipse(this.x, this.y, pulseSize + 10, pulseSize + 10);
        
        // Inner core
        this.p.fill(255, 200, 100);
        this.p.ellipse(this.x, this.y, 5, 5);
      } else if (this.damage >= 2) {
        // Stronger enemy bullet
        bulletColor = this.p.color(255, 100, 50);
        this.p.fill(bulletColor);
        this.p.ellipse(this.x, this.y, 8, 8);
        
        // Glow
        this.p.fill(255, 100, 50, 150);
        this.p.ellipse(this.x, this.y, 12, 12);
      } else {
        // Standard enemy bullet
        bulletColor = this.p.color(255, 100, 100);
        this.p.fill(bulletColor);
        this.p.ellipse(this.x, this.y, 6, 6);
      }
    }
    
    this.p.pop();
  }
}
