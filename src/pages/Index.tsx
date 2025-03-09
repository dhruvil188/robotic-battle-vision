
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import p5 from "p5";

const Index = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let myP5: p5;
    
    if (p5ContainerRef.current) {
      myP5 = new p5(sketch, p5ContainerRef.current);
    }
    
    return () => {
      myP5?.remove();
    };
  }, []);

  const sketch = (p: p5) => {
    // Global variables
    let player;
    let enemies = [];
    let bullets = [];
    let enemyBullets = [];
    let score = 0;
    let lastShotTime = 0;
    let shootDelay = 300; // Reduced shooting cooldown for better gameplay
    let lastEnemySpawnTime = 0;
    let enemySpawnInterval = 1500; // Slightly faster enemy spawn rate
    let hitFlash = 0; // Visual effect for when player is hit
    let backgroundParticles = [];
    let gameStarted = false;
    let gameOver = false;
    let stars = [];
    let explosions = [];
    let gameFont;
    let shieldOpacity = 0;
    let powerUps = [];
    let powerUpLastSpawnTime = 0;
    let powerUpSpawnInterval = 10000; // Power-up spawn interval in ms
    let playerImg, enemyImg, bulletImg, enemyBulletImg, particleImg, powerUpImg;
    let gameOverSound, shootSound, enemyHitSound, playerHitSound, powerUpSound;
    let parallaxLayers = [];
    
    // Preload assets
    p.preload = () => {
      // Load font
      gameFont = p.loadFont('https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4i1UA.ttf');
    };

    // Player class representing the controllable robot
    class Player {
      constructor(x, y, w, h) {
        this.x = x;           // X-coordinate (center)
        this.y = y;           // Y-coordinate (center)
        this.w = w;           // Width
        this.h = h;           // Height
        this.r = w / 2;       // Radius for collision detection
        this.speed = 7;       // Movement speed
        this.health = 100;    // Player health
        this.shield = 0;      // Shield value
        this.thrusterAnimation = 0;
        this.animationFrame = 0;
      }

      moveLeft() {
        this.x -= this.speed;
        if (this.x - this.w / 2 < 0) this.x = this.w / 2; // Keep within left boundary
      }

      moveRight() {
        this.x += this.speed;
        if (this.x + this.w / 2 > p.width) this.x = p.width - this.w / 2; // Keep within right boundary
      }

      shoot() {
        let bullet = new Bullet(this.x, this.y - this.h / 2, 0, -12);
        bullets.push(bullet);
        // Add muzzle flash particles
        for (let i = 0; i < 5; i++) {
          let particle = new Particle(
            this.x, 
            this.y - this.h / 2, 
            p.random(-1, 1), 
            p.random(-3, -1),
            p.color(30, 144, 255, 200),
            p.random(5, 10),
            p.random(10, 20)
          );
          backgroundParticles.push(particle);
        }
        
        // Play shoot sound
        if (shootSound) shootSound.play();
      }

      draw() {
        this.animationFrame = (this.animationFrame + 0.2) % 6;
        
        // Draw shield if active
        if (this.shield > 0) {
          p.push();
          p.noFill();
          p.stroke(30, 144, 255, shieldOpacity);
          p.strokeWeight(3);
          p.ellipse(this.x, this.y, this.w * 2.2, this.h * 3);
          p.pop();
          
          this.shield--;
          shieldOpacity = p.map(this.shield, 0, 300, 0, 120);
        }
        
        // Thruster animation
        this.thrusterAnimation = (this.thrusterAnimation + 0.2) % 2;
        
        p.push();
        
        // Draw thrusters/engines
        p.fill(255, 100, 0, 150);
        p.noStroke();
        let thrusterHeight = 15 + Math.sin(p.frameCount * 0.2) * 5;
        p.triangle(
          this.x - 15, this.y + this.h/2,
          this.x - 8, this.y + this.h/2 + thrusterHeight,
          this.x - 1, this.y + this.h/2
        );
        
        p.triangle(
          this.x + 15, this.y + this.h/2,
          this.x + 8, this.y + this.h/2 + thrusterHeight,
          this.x + 1, this.y + this.h/2
        );
        
        // Main ship body - sleek, futuristic design
        p.fill(20, 103, 194); // Deep blue
        p.stroke(120, 200, 255);
        p.strokeWeight(2);
        
        // Main body (sleek shape)
        p.beginShape();
        p.vertex(this.x, this.y - this.h/2 - 10); // Nose
        p.vertex(this.x + this.w/2, this.y);      // Right middle
        p.vertex(this.x + this.w/3, this.y + this.h/2); // Right back
        p.vertex(this.x - this.w/3, this.y + this.h/2); // Left back
        p.vertex(this.x - this.w/2, this.y);      // Left middle
        p.endShape(p.CLOSE);
        
        // Cockpit
        p.fill(200, 230, 255, 200);
        p.ellipse(this.x, this.y - this.h/6, this.w/3, this.h/3);
        
        // Weapon mounts
        p.fill(80, 80, 90);
        p.rect(this.x - this.w/2 - 5, this.y - this.h/6, 10, 20, 3);
        p.rect(this.x + this.w/2 - 5, this.y - this.h/6, 10, 20, 3);
        
        // Glowing elements
        let glowPulse = (Math.sin(p.frameCount * 0.1) + 1) * 50 + 150;
        p.fill(30, 144, 255, glowPulse);
        p.noStroke();
        p.ellipse(this.x - this.w/3, this.y, 8, 8);
        p.ellipse(this.x + this.w/3, this.y, 8, 8);
        
        p.pop();
      }
    }

    // Enemy class representing AI robot enemies
    class Enemy {
      constructor(x, y, r, speed) {
        this.x = x;           // X-coordinate (center)
        this.y = y;           // Y-coordinate (center)
        this.r = r;           // Radius
        this.speed = speed;   // Downward speed
        this.health = 1;      // Enemy health
        this.type = p.floor(p.random(3)); // Enemy type (for visual variety)
        this.rotationAngle = 0;
        this.pulseValue = 0;
      }

      update() {
        this.y += this.speed;
        this.rotationAngle += 0.01;
        this.pulseValue = (Math.sin(p.frameCount * 0.1) + 1) * 30;
        
        // Random chance to shoot (0.5% per frame)
        if (p.random() < 0.005) {
          this.shoot();
        }
      }

      shoot() {
        let bullet = new Bullet(this.x, this.y + this.r, 0, 6);
        enemyBullets.push(bullet);
      }

      draw() {
        p.push();
        p.translate(this.x, this.y);
        p.rotate(this.rotationAngle);
        
        if (this.type === 0) {
          // Type 0: Triangle enemy with glowing core
          p.fill(180, 30, 30);
          p.stroke(255, 80, 80);
          p.strokeWeight(1.5);
          p.triangle(
            0, -this.r,           // Top vertex
            -this.r, this.r,      // Bottom-left vertex
            this.r, this.r        // Bottom-right vertex
          );
          
          // Glowing core
          p.fill(255, 100, 100, 150 + this.pulseValue);
          p.noStroke();
          p.ellipse(0, 0, this.r * 0.6, this.r * 0.6);
          
        } else if (this.type === 1) {
          // Type 1: Circular enemy with radial segments
          p.fill(200, 30, 60);
          p.stroke(255, 100, 100);
          p.strokeWeight(1.5);
          p.ellipse(0, 0, this.r * 2, this.r * 2);
          
          // Radial segments
          p.stroke(255, 60, 80);
          for (let i = 0; i < 4; i++) {
            let angle = i * p.PI / 2;
            p.line(0, 0, Math.cos(angle) * this.r, Math.sin(angle) * this.r);
          }
          
          // Center
          p.fill(255, 180, 180, 150 + this.pulseValue);
          p.noStroke();
          p.ellipse(0, 0, this.r * 0.8, this.r * 0.8);
          
        } else {
          // Type 2: Diamond enemy with pulsing elements
          p.fill(150, 20, 30);
          p.stroke(255, 60, 60);
          p.strokeWeight(1.5);
          p.beginShape();
          p.vertex(0, -this.r);        // Top
          p.vertex(this.r, 0);         // Right
          p.vertex(0, this.r);         // Bottom
          p.vertex(-this.r, 0);        // Left
          p.endShape(p.CLOSE);
          
          // Pulsing elements
          p.fill(255, 50, 50, 100 + this.pulseValue);
          p.noStroke();
          p.ellipse(0, 0, this.r, this.r);
        }
        
        p.pop();
      }
    }

    // Bullet class for both player and enemy projectiles
    class Bullet {
      constructor(x, y, vx, vy) {
        this.x = x;    // X-coordinate
        this.y = y;    // Y-coordinate
        this.vx = vx;  // X-velocity
        this.vy = vy;  // Y-velocity
        this.age = 0;  // Bullet age for fading effects
        this.isPlayerBullet = vy < 0; // True if moving upward (player bullet)
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
      }

      draw() {
        p.push();
        
        if (this.isPlayerBullet) {
          // Player bullets - energy beam style
          p.noStroke();
          
          // Outer glow
          p.fill(30, 144, 255, 100);
          p.ellipse(this.x, this.y, 8, 14);
          
          // Core
          p.fill(200, 230, 255);
          p.ellipse(this.x, this.y, 3, 12);
          
          // Particle trail
          if (p.frameCount % 3 === 0) {
            let particle = new Particle(
              this.x, 
              this.y + 6, 
              p.random(-0.5, 0.5), 
              p.random(0, 1),
              p.color(30, 144, 255, 150),
              p.random(3, 5),
              p.random(5, 10)
            );
            backgroundParticles.push(particle);
          }
        } else {
          // Enemy bullets - red laser style
          p.noStroke();
          
          // Outer glow
          p.fill(255, 50, 50, 100);
          p.ellipse(this.x, this.y, 6, 10);
          
          // Core
          p.fill(255, 200, 200);
          p.ellipse(this.x, this.y, 2, 8);
          
          // Particle trail
          if (p.frameCount % 3 === 0) {
            let particle = new Particle(
              this.x, 
              this.y - 5, 
              p.random(-0.5, 0.5), 
              p.random(-1, 0),
              p.color(255, 50, 50, 150),
              p.random(3, 5),
              p.random(5, 10)
            );
            backgroundParticles.push(particle);
          }
        }
        
        p.pop();
      }
    }

    // Particle class for visual effects
    class Particle {
      constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        
        // Add slight randomness to movement
        this.x += p.random(-0.3, 0.3);
        this.y += p.random(-0.3, 0.3);
      }
      
      draw() {
        p.push();
        p.noStroke();
        
        // Fade out as life decreases
        let alpha = p.map(this.life, 0, this.maxLife, 0, 255);
        let currentColor = p.color(this.color);
        currentColor.setAlpha(alpha);
        p.fill(currentColor);
        
        // Draw as a circle
        p.ellipse(this.x, this.y, this.size * (this.life / this.maxLife));
        
        p.pop();
      }
      
      isDead() {
        return this.life <= 0;
      }
    }
    
    // Explosion class for destruction effects
    class Explosion {
      constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.particles = [];
        this.life = 40;
        
        // Create explosion particles
        for (let i = 0; i < 20; i++) {
          let angle = p.random(p.TWO_PI);
          let speed = p.random(1, 3);
          let vx = Math.cos(angle) * speed;
          let vy = Math.sin(angle) * speed;
          
          let particle = new Particle(
            this.x, 
            this.y, 
            vx, 
            vy,
            this.color,
            p.random(5, 15),
            p.random(20, 40)
          );
          this.particles.push(particle);
        }
      }
      
      update() {
        this.life--;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
          this.particles[i].update();
          if (this.particles[i].isDead()) {
            this.particles.splice(i, 1);
          }
        }
      }
      
      draw() {
        for (let particle of this.particles) {
          particle.draw();
        }
      }
      
      isDead() {
        return this.life <= 0;
      }
    }
    
    // PowerUp class for in-game bonuses
    class PowerUp {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 15;
        this.speed = 1.5;
        this.rotationAngle = 0;
        this.type = p.floor(p.random(3)); // 0: health, 1: shield, 2: rapid fire
      }
      
      update() {
        this.y += this.speed;
        this.rotationAngle += 0.03;
      }
      
      draw() {
        p.push();
        p.translate(this.x, this.y);
        p.rotate(this.rotationAngle);
        
        // Outer glow
        p.noFill();
        p.strokeWeight(2);
        
        if (this.type === 0) { // Health (green)
          p.stroke(0, 255, 120, 150 + Math.sin(p.frameCount * 0.1) * 50);
          p.fill(0, 180, 70, 100);
        } else if (this.type === 1) { // Shield (blue)
          p.stroke(30, 144, 255, 150 + Math.sin(p.frameCount * 0.1) * 50);
          p.fill(30, 120, 200, 100);
        } else { // Rapid fire (yellow)
          p.stroke(255, 220, 0, 150 + Math.sin(p.frameCount * 0.1) * 50);
          p.fill(220, 180, 0, 100);
        }
        
        p.ellipse(0, 0, this.r * 2, this.r * 2);
        
        // Inner symbol
        p.strokeWeight(2);
        if (this.type === 0) { // Health - plus sign
          p.line(0, -7, 0, 7);
          p.line(-7, 0, 7, 0);
        } else if (this.type === 1) { // Shield - shield shape
          p.arc(0, 0, this.r * 1.6, this.r * 1.6, p.PI, p.TWO_PI);
          p.line(-this.r * 0.8, 0, this.r * 0.8, 0);
        } else { // Rapid fire - lightning bolt
          p.beginShape();
          p.vertex(-3, -8);
          p.vertex(2, -2);
          p.vertex(-1, 0);
          p.vertex(3, 8);
          p.vertex(0, 2);
          p.vertex(3, 0);
          p.endShape();
        }
        
        p.pop();
      }
    }

    // Star class for background
    class Star {
      constructor() {
        this.x = p.random(p.width);
        this.y = p.random(p.height);
        this.size = p.random(1, 3);
        this.speed = p.random(0.2, 0.8);
        this.brightness = p.random(150, 255);
        this.blinkRate = p.random(0.01, 0.05);
      }
      
      update() {
        this.y += this.speed;
        if (this.y > p.height) {
          this.y = 0;
          this.x = p.random(p.width);
        }
        
        // Twinkle effect
        this.brightness = 150 + Math.sin(p.frameCount * this.blinkRate) * 105;
      }
      
      draw() {
        p.fill(255, 255, 255, this.brightness);
        p.noStroke();
        p.ellipse(this.x, this.y, this.size);
      }
    }
    
    // ParallaxLayer class for depth in background
    class ParallaxLayer {
      constructor(img, speed, y, scale) {
        this.img = img;
        this.speed = speed;
        this.y = y;
        this.scale = scale;
      }
      
      update() {
        this.y += this.speed;
        if (this.y > p.height) {
          this.y = -this.img.height * this.scale;
        }
      }
      
      draw() {
        p.image(this.img, 0, this.y, p.width, this.img.height * this.scale);
      }
    }

    // Setup function to initialize the game
    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight);
      player = new Player(p.width / 2, p.height - 100, 60, 40);
      
      // Create stars
      for (let i = 0; i < 150; i++) {
        stars.push(new Star());
      }
      
      // Toast notification
      toast.success("Game loaded! Press ENTER to start", {
        position: "bottom-center",
        duration: 3000,
      });
      
      // Set font
      p.textFont(gameFont);
      
      // Initialize sounds
      shootSound = new p.SoundFile("data:audio/wav;base64,UklGRpQEAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YXAEAABt7XDtgO2X7bLtzO3o7QHuGe4v7kXuWu5v7oLule6m7rjuyO7X7ufu9e4C7w7vGe8k7y3vNe877z/vQu9E70XvRO9C70HvPO857zPvLO8l7xzvE+8I7//u9O7p7tzu0e7E7rjuq+6d7o/ufu5w7mDuT+4+7izuGu4I7vXt4u3O7brtpu2R7X3taO1T7T7tKe0U7f/s6uzV7MHsrOyX7ILsb+xb7EfsM+wg7A7s/OvL6+3rAewV7CnsP+xV7GvsgeyX7K7sxezc7PPsCu0h7TjtT+1m7X3tle2r7cLt2O3v7Qbu3e0W7k7uh+7B7vru8+4s72XvnO/T7wLwA/AK8ynzXfOX88bztuLwEfE38VzxgfGm8cnx6/EL8irySPJm8oPyoPK78tbyzPG98djx8vEN8ib+NfNA80zzWPNi827zePOC847zmfOj86zzs/O5877zwvPG88jzyvPK88rzyfPI88bzw/PCYMsnyXzJy8kXynDKu8oEy0zLksvZyxrMV8yCzKbMxczdzO3M980HzQ/NFc0Z5M/NJc8zz0DPTc9Zz2TPbs93z3/Phc+Kz47Pkc+Sz5LPkc+Pz4zPiM+Ez3/Pes91z2/PaM9hz1nPUM9Gz0DPXeDHH8k9yVrJdMmOyabJvcnTyenJ/skSyiXKNspGylLKXcpoyoZ3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKPY/Njv2OLo9ej42PvI/qjxmQSJB3kKaQ1JD9KNeQN+BZ4HngmOC24NXg9+Kh4VLhM+EV4fngy+hn4kvCZMp4yozKoMqzysbK2crryv3KD8sgyzLKPMq6ysvK28ogy4nLmcupy7jLx8vWy+TL8sv/yyvJYsyNzLnM5Mpb79/vLvIw8vnyXPNA8+DzfPQZ9bb1VPbI9kH3u/c0+K74Jvmf+Rj6kfp0+3777/yp/WL+Hf/Y/2kAHAG0AYkCSgMNBNMEngVlBi4H9wfCCIwJVwoiC+4LugyGDVQOIg/xD7/QQfD/8Ijy/PJn87nzB/RT9J/06/Q19YD1y/UV9l72p/bw9jn3gffJ9xL4WviT+dX5DPpJ+oH6uvry+ir7YvuZ+9H7CPw//HX8q/zi/Bn9T/2F/bn95/0b/k/+g/63/uv+H/9S/4X/uP/r/x0AUACCALQAGQBbAAEBMgFjAZMBwgHxASACTwJ9AqsCKAKFAusCEAM0A1cDeQOaA7oDVwKXArUCGQMUBFAEpwT9BE8FoQXyBUMGlAbkBjQHgwfTBxcIYAiqCPIIOwmCCcgJDgpTCpcK2wo="); // Placeholder sound base64
      if (shootSound) {
        shootSound.setVolume(0.2);
      }
    };

    // Draw function for the game loop
    p.draw = () => {
      // Draw space background
      p.background(10, 15, 30); // Deep space color
      
      // Render stars (parallax effect)
      for (let star of stars) {
        star.update();
        star.draw();
      }
      
      // Draw futuristic grid background (subtler)
      p.stroke(30, 40, 80, 50); // Subtle blue grid
      p.strokeWeight(0.5);
      let gridSpacing = 40;
      
      // Vertical lines with perspective effect
      for (let i = 0; i < p.width; i += gridSpacing) {
        let opacity = p.map(i, 0, p.width, 30, 10);
        p.stroke(30, 60, 120, opacity);
        p.line(i, 0, i, p.height);
      }
      
      // Horizontal lines with perspective effect
      for (let j = 0; j < p.height; j += gridSpacing) {
        let progress = j / p.height;
        let spacing = gridSpacing * (1 + progress * 0.5);
        let opacity = p.map(j, 0, p.height, 10, 30);
        p.stroke(30, 60, 120, opacity);
        p.line(0, j, p.width, j);
      }
      
      // Game state management
      if (!gameStarted) {
        // Title screen
        p.textAlign(p.CENTER, p.CENTER);
        
        // Game title with glow effect
        p.fill(30, 144, 255, 100 + Math.sin(p.frameCount * 0.05) * 50);
        p.textSize(72);
        p.text("ROBOTIC BATTLE", p.width / 2, p.height / 2 - 100);
        
        // Subtitle
        p.fill(200, 220, 255);
        p.textSize(24);
        p.text("A FUTURISTIC SPACE COMBAT EXPERIENCE", p.width / 2, p.height / 2 - 40);
        
        // Instructions
        p.fill(180, 200, 220);
        p.textSize(18);
        p.text("Use ARROW KEYS to move and SPACE to shoot", p.width / 2, p.height / 2 + 40);
        p.text("Destroy enemy ships and collect power-ups to survive", p.width / 2, p.height / 2 + 70);
        
        // Start prompt with pulsing effect
        let promptAlpha = 150 + Math.sin(p.frameCount * 0.1) * 105;
        p.fill(255, 255, 255, promptAlpha);
        p.textSize(28);
        p.text("PRESS ENTER TO START", p.width / 2, p.height / 2 + 150);
        
        // Listen for Enter key
        if (p.keyIsDown(13)) { // 13 is Enter key
          gameStarted = true;
          toast.info("Game started! Good luck!", {
            position: "bottom-center",
            duration: 2000,
          });
        }
        
        return; // Skip the rest of the draw function
      }
      
      if (gameOver) {
        // Game over screen
        p.textAlign(p.CENTER, p.CENTER);
        
        // Game over text with red glow
        p.fill(255, 50, 50, 100 + Math.sin(p.frameCount * 0.05) * 50);
        p.textSize(72);
        p.text("GAME OVER", p.width / 2, p.height / 2 - 60);
        
        // Score display
        p.fill(200, 200, 255);
        p.textSize(42);
        p.text("FINAL SCORE: " + score, p.width / 2, p.height / 2 + 20);
        
        // Restart prompt
        let promptAlpha = 150 + Math.sin(p.frameCount * 0.1) * 105;
        p.fill(255, 255, 255, promptAlpha);
        p.textSize(28);
        p.text("PRESS ENTER TO RESTART", p.width / 2, p.height / 2 + 120);
        
        // Listen for Enter key to restart
        if (p.keyIsDown(13)) { // 13 is Enter key
          // Reset game variables
          player = new Player(p.width / 2, p.height - 100, 60, 40);
          enemies = [];
          bullets = [];
          enemyBullets = [];
          explosions = [];
          powerUps = [];
          score = 0;
          lastShotTime = 0;
          lastEnemySpawnTime = 0;
          lastPowerUpSpawnTime = 0;
          hitFlash = 0;
          gameOver = false;
          
          toast.success("Game restarted! Good luck!", {
            position: "bottom-center",
            duration: 2000,
          });
        }
        
        return; // Skip the rest of the game logic
      }
      
      p.noStroke();
      
      // Player movement
      if (p.keyIsDown(37)) { // Left arrow
        player.moveLeft();
      }
      if (p.keyIsDown(39)) { // Right arrow
        player.moveRight();
      }

      // Player shooting with cooldown
      if (p.keyIsDown(32) && p.millis() - lastShotTime > shootDelay) { // 32 is spacebar
        player.shoot();
        lastShotTime = p.millis();
      }

      // Spawn enemies periodically
      if (p.millis() - lastEnemySpawnTime > enemySpawnInterval) {
        let enemy = new Enemy(p.random(p.width), -30, 20, p.random(1.5, 3));
        enemies.push(enemy);
        lastEnemySpawnTime = p.millis();
        
        // Gradually increase difficulty
        if (enemySpawnInterval > 800) {
          enemySpawnInterval *= 0.995; // Slowly decrease spawn interval
        }
      }
      
      // Spawn power-ups periodically
      if (p.millis() - powerUpLastSpawnTime > powerUpSpawnInterval) {
        let powerUp = new PowerUp(p.random(p.width * 0.1, p.width * 0.9), -30);
        powerUps.push(powerUp);
        powerUpLastSpawnTime = p.millis();
      }

      // Update and draw background particles
      for (let i = backgroundParticles.length - 1; i >= 0; i--) {
        backgroundParticles[i].update();
        backgroundParticles[i].draw();
        
        if (backgroundParticles[i].isDead()) {
          backgroundParticles.splice(i, 1);
        }
      }
      
      // Update and draw explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update();
        explosions[i].draw();
        
        if (explosions[i].isDead()) {
          explosions.splice(i, 1);
        }
      }

      // Update and draw player bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        if (bullets[i].y < 0) {
          bullets.splice(i, 1); // Remove bullets that go off-screen
        } else {
          bullets[i].draw();
        }
      }

      // Update and draw enemy bullets
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].update();
        if (enemyBullets[i].y > p.height) {
          enemyBullets.splice(i, 1); // Remove bullets that go off-screen
        } else {
          enemyBullets[i].draw();
        }
      }

      // Update and draw enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        if (enemies[i].y > p.height) {
          enemies.splice(i, 1); // Remove enemies that go off-screen
        } else {
          enemies[i].draw();
        }
      }
      
      // Update and draw power-ups
      for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].update();
        if (powerUps[i].y > p.height) {
          powerUps.splice(i, 1); // Remove power-ups that go off-screen
        } else {
          powerUps[i].draw();
        }
      }

      // Draw player
      player.draw();

      // Collision detection: player bullets vs enemies
      for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
          let d = p.dist(bullets[i].x, bullets[i].y, enemies[j].x, enemies[j].y);
          if (d < enemies[j].r + 5) {
            // Create explosion at enemy position
            let explosion = new Explosion(
              enemies[j].x,
              enemies[j].y,
              enemies[j].r * 1.5,
              p.color(255, 100, 50, 200)
            );
            explosions.push(explosion);
            
            bullets.splice(i, 1); // Remove bullet
            enemies.splice(j, 1); // Remove enemy
            score++;              // Increase score
            
            // Play sound
            if (enemyHitSound) enemyHitSound.play();
            
            break;                // Exit inner loop after hit
          }
        }
      }
      
      // Collision detection: player vs power-ups
      for (let i = powerUps.length - 1; i >= 0; i--) {
        let d = p.dist(powerUps[i].x, powerUps[i].y, player.x, player.y);
        if (d < player.r + powerUps[i].r) {
          // Apply power-up effect
          if (powerUps[i].type === 0) { // Health
            player.health = Math.min(100, player.health + 20);
            toast.success("Health restored!", {
              position: "bottom-center",
              duration: 1500,
            });
          } else if (powerUps[i].type === 1) { // Shield
            player.shield = 300; // Shield duration
            toast.info("Shield activated!", {
              position: "bottom-center",
              duration: 1500,
            });
          } else { // Rapid fire
            shootDelay = 150; // Temporarily reduce cooldown
            setTimeout(() => {
              shootDelay = 300; // Reset after 5 seconds
            }, 5000);
            toast.info("Rapid fire activated!", {
              position: "bottom-center",
              duration: 1500,
            });
          }
          
          // Create particles at power-up position
          for (let j = 0; j < 15; j++) {
            let color;
            if (powerUps[i].type === 0) color = p.color(0, 255, 100, 200);
            else if (powerUps[i].type === 1) color = p.color(30, 144, 255, 200);
            else color = p.color(255, 220, 0, 200);
            
            let particle = new Particle(
              powerUps[i].x,
              powerUps[i].y,
              p.random(-2, 2),
              p.random(-2, 2),
              color,
              p.random(5, 10),
              p.random(20, 40)
            );
            backgroundParticles.push(particle);
          }
          
          // Play sound
          if (powerUpSound) powerUpSound.play();
          
          powerUps.splice(i, 1); // Remove power-up
        }
      }

      // Collision detection: enemy bullets vs player
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let d = p.dist(enemyBullets[i].x, enemyBullets[i].y, player.x, player.y);
        if (d < player.r + 5) {
          enemyBullets.splice(i, 1); // Remove bullet
          
          // Shield absorbs damage
          if (player.shield > 0) {
            // Reduced shield effect
            player.shield -= 50;
          } else {
            player.health -= 10;       // Decrease health
            hitFlash = 5;              // Trigger hit flash effect
            
            // Play sound
            if (playerHitSound) playerHitSound.play();
            
            // Create hit particles
            for (let j = 0; j < 10; j++) {
              let particle = new Particle(
                player.x,
                player.y,
                p.random(-2, 2),
                p.random(-2, 0),
                p.color(255, 100, 100, 200),
                p.random(5, 10),
                p.random(10, 20)
              );
              backgroundParticles.push(particle);
            }
            
            if (player.health <= 0) {
              // Create large explosion at player position
              let explosion = new Explosion(
                player.x,
                player.y,
                player.r * 3,
                p.color(30, 144, 255, 200)
              );
              explosions.push(explosion);
              
              gameOver = true;      // Game over state
              
              // Play game over sound
              if (gameOverSound) gameOverSound.play();
            }
          }
        }
      }
      
      // Collision detection: enemies vs player (direct collision)
      for (let i = enemies.length - 1; i >= 0; i--) {
        let d = p.dist(enemies[i].x, enemies[i].y, player.x, player.y);
        if (d < player.r + enemies[i].r) {
          // Create explosion
          let explosion = new Explosion(
            enemies[i].x,
            enemies[i].y,
            enemies[i].r * 2,
            p.color(255, 100, 50, 200)
          );
          explosions.push(explosion);
          
          enemies.splice(i, 1); // Remove enemy
          
          // Shield absorbs some damage
          if (player.shield > 0) {
            player.shield -= 100;
          } else {
            player.health -= 20;      // More damage for direct collision
            hitFlash = 10;             // Stronger hit flash
            
            if (player.health <= 0) {
              // Create large explosion at player position
              let explosion = new Explosion(
                player.x,
                player.y,
                player.r * 3,
                p.color(30, 144, 255, 200)
              );
              explosions.push(explosion);
              
              gameOver = true;      // Game over state
              
              // Play game over sound
              if (gameOverSound) gameOverSound.play();
            }
          }
        }
      }

      // Display interface panel
      p.push();
      
      // Semi-transparent HUD background
      p.fill(10, 20, 40, 180);
      p.rect(10, 10, 200, 90, 10);
      
      // Score display with glow
      p.textAlign(p.LEFT, p.TOP);
      p.fill(30, 144, 255);
      p.textSize(16);
      p.text("SCORE", 20, 20);
      p.fill(255);
      p.textSize(28);
      p.text(score, 20, 40);
      
      // Health bar
      p.textSize(16);
      p.fill(30, 144, 255);
      p.text("HEALTH", 100, 20);
      
      // Health bar background
      p.fill(40, 40, 60);
      p.rect(100, 45, 100, 15, 7);
      
      // Health bar fill
      let healthGradient;
      if (player.health > 60) {
        healthGradient = p.lerpColor(p.color(30, 200, 200), p.color(30, 255, 100), (player.health - 60) / 40);
      } else if (player.health > 30) {
        healthGradient = p.lerpColor(p.color(255, 200, 0), p.color(30, 200, 200), (player.health - 30) / 30);
      } else {
        healthGradient = p.lerpColor(p.color(255, 30, 30), p.color(255, 200, 0), player.health / 30);
      }
      
      p.fill(healthGradient);
      let healthWidth = p.map(player.health, 0, 100, 0, 100);
      p.rect(100, 45, healthWidth, 15, 7);
      
      // Shield indicator
      if (player.shield > 0) {
        let shieldWidth = p.map(player.shield, 0, 300, 0, 100);
        p.fill(30, 144, 255, 150);
        p.rect(100, 65, shieldWidth, 8, 4);
      }
      
      p.pop();

      // Draw hit flash effect
      if (hitFlash > 0) {
        p.fill(255, 0, 0, hitFlash * 20); // Semi-transparent red
        p.rect(0, 0, p.width, p.height);
        hitFlash--;
      }
    };
    
    // Window resize handler
    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
    };
    
    // Key released handler for shooting with spacebar
    p.keyReleased = () => {
      if (p.keyCode === 32) { // Spacebar
        if (gameStarted && !gameOver && p.millis() - lastShotTime > shootDelay) {
          player.shoot();
          lastShotTime = p.millis();
        }
        return false; // Prevent default
      }
    };
  };

  return (
    <motion.div 
      className="w-full min-h-screen bg-black flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div ref={gameContainerRef} className="w-full h-screen overflow-hidden">
        <div ref={p5ContainerRef} className="w-full h-full" />
      </div>
    </motion.div>
  );
};

export default Index;
