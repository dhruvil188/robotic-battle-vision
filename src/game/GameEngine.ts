
import p5 from "p5";
import { toast } from "sonner";
import { GameState, GameAssets } from "./types";
import { Player } from "./entities/Player";
import { Enemy } from "./entities/Enemy";
import { Bullet } from "./entities/Bullet";
import { Particle } from "./entities/Particle";
import { Explosion } from "./entities/Explosion";
import { PowerUp } from "./entities/PowerUp";
import { Star } from "./entities/Star";
import { ParallaxLayer } from "./entities/ParallaxLayer";

export class GameEngine {
  private p: p5;
  private state: GameState;
  private assets: GameAssets;
  
  constructor(p: p5) {
    this.p = p;
    this.assets = {};
    
    // Initialize game state
    this.state = {
      player: null,
      enemies: [],
      bullets: [],
      enemyBullets: [],
      score: 0,
      lastShotTime: 0,
      shootDelay: 300,
      lastEnemySpawnTime: 0,
      enemySpawnInterval: 1500,
      hitFlash: 0,
      backgroundParticles: [],
      gameStarted: false,
      gameOver: false,
      stars: [],
      explosions: [],
      shieldOpacity: 0,
      powerUps: [],
      powerUpLastSpawnTime: 0,
      powerUpSpawnInterval: 10000,
      parallaxLayers: []
    };
  }
  
  preload() {
    // Load font
    this.assets.gameFont = this.p.loadFont('https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4i1UA.ttf');
    
    // Initialize sounds
    this.assets.shootSound = new this.p.SoundFile("data:audio/wav;base64,UklGRpQEAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YXAEAABt7XDtgO2X7bLtzO3o7QHuGe4v7kXuWu5v7oLule6m7rjuyO7X7ufu9e4C7w7vGe8k7y3vNe877z/vQu9E70XvRO9C70HvPO857zPvLO8l7xzvE+8I7//u9O7p7tzu0e7E7rjuq+6d7o/ufu5w7mDuT+4+7izuGu4I7vXt4u3O7brtpu2R7X3taO1T7T7tKe0U7f/s6uzV7MHsrOyX7ILsb+xb7EfsM+wg7A7s/OvL6+3rAewV7CnsP+xV7GvsgeyX7K7sxezc7PPsCu0h7TjtT+1m7X3tle2r7cLt2O3v7Qbu3e0W7k7uh+7B7vru8+4s72XvnO/T7wLwA/AK8ynzXfOX88bztuLwEfE38VzxgfGm8cnx6/EL8irySPJm8oPyoPK78tbyzPG98djx8vEN8ib+NfNA80zzWPNi823zePOC844zmfOj86zzs/O5877zwvPG88jzyvPK88rzyfPI88bzw/PCYMsnyXzJy8kXynDKu8oEy0zLksvZyxrMV8yCzKbMxczdzO3M980HzQ/NFc0Z5M/NJc8zz0DPTc9Zz2TPbs93z3/Phc+Kz47Pkc+Sz5LPkc+Pz4zPiM+Ez3/Pes91z2/PaM9hz1nPUM9Gz0DPXeDHH8k9yVrJdMmOyabJvcnTyenJ/skSyiXKNspGylLKXcpoyoZ3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKPY/Njv2OLo9ej42PvI/qjxmQSJB3kKaQ1JD9KNeQN+BZ4HngmOC24NXg9+Kh4VLhM+EV4fngy+hn4kvCZMp4yozKoMqzysbK2crryv3KD8sgyzLKPMq6ysvK28ogy4nLmcupy7jLx8vWy+TL8sv/yyvJYsyNzLnM5Mpb79/vLvIw8vnyXPNA8+DzfPQZ9bb1VPbI9kH3u/c0+K74Jvmf+Rj6kfp0+3377/yp/WL+Hf/Y/2kAHAG0AYkCSgMNBNMEngVlBi4H9wfCCIwJVwoiC+4LugyGDVQOIg/xD7/QQfD/8Ijy/PJn87nzB/RT9J/06/Q19YD1y/UV9l72p/bw9jn3gffJ9xL4WviT+dX5DPpJ+oH6uvry+ir7YvuZ+9H7CPw//HX8q/zi/Bn9T/2F/bn95/0b/k/+g/63/uv+H/9S/4X/uP/r/x0AUACCALQAGQBbAAEBMgFjAZMBwgHxASACTwJ9AqsCKAKFAusCEAM0A1cDeQOaA7oDVwKXArUCGQMUBFAEpwT9BE8FoQXyBUMGlAbkBjQHgwfTBxcIYAiqCPIIOwmCCcgJDgpTCpcK2wo=");
    
    if (this.assets.shootSound) {
      this.assets.shootSound.setVolume(0.2);
    }
  }
  
  setup() {
    // Create the player
    this.state.player = new Player(this.p, this.p.width / 2, this.p.height - 100, 60, 40);
    
    // Create stars
    for (let i = 0; i < 150; i++) {
      this.state.stars.push(new Star(this.p));
    }
    
    // Set font
    if (this.assets.gameFont) {
      this.p.textFont(this.assets.gameFont);
    }
    
    // Toast notification
    toast.success("Game loaded! Press ENTER to start", {
      position: "bottom-center",
      duration: 3000,
    });
  }
  
  handleInput() {
    // Player movement
    if (this.p.keyIsDown(37)) { // Left arrow
      this.state.player.moveLeft();
    }
    if (this.p.keyIsDown(39)) { // Right arrow
      this.state.player.moveRight();
    }

    // Player shooting with cooldown
    if (this.p.keyIsDown(32) && this.p.millis() - this.state.lastShotTime > this.state.shootDelay) { // 32 is spacebar
      const { bullet, particles } = this.state.player.shoot();
      this.state.bullets.push(bullet);
      this.state.backgroundParticles.push(...particles);
      this.state.lastShotTime = this.p.millis();
      
      // Play shoot sound
      if (this.assets.shootSound) this.assets.shootSound.play();
    }
  }
  
  spawnEnemies() {
    if (this.p.millis() - this.state.lastEnemySpawnTime > this.state.enemySpawnInterval) {
      const enemy = new Enemy(this.p, this.p.random(this.p.width), -30, 20, this.p.random(1.5, 3));
      this.state.enemies.push(enemy);
      this.state.lastEnemySpawnTime = this.p.millis();
      
      // Gradually increase difficulty
      if (this.state.enemySpawnInterval > 800) {
        this.state.enemySpawnInterval *= 0.995; // Slowly decrease spawn interval
      }
    }
  }
  
  spawnPowerUps() {
    if (this.p.millis() - this.state.powerUpLastSpawnTime > this.state.powerUpSpawnInterval) {
      const powerUp = new PowerUp(
        this.p, 
        this.p.random(this.p.width * 0.1, this.p.width * 0.9), 
        -30
      );
      this.state.powerUps.push(powerUp);
      this.state.powerUpLastSpawnTime = this.p.millis();
    }
  }
  
  updateEntities() {
    // Update stars
    for (let star of this.state.stars) {
      star.update();
    }
    
    // Update background particles
    for (let i = this.state.backgroundParticles.length - 1; i >= 0; i--) {
      this.state.backgroundParticles[i].update();
      if (this.state.backgroundParticles[i].isDead()) {
        this.state.backgroundParticles.splice(i, 1);
      }
    }
    
    // Update explosions
    for (let i = this.state.explosions.length - 1; i >= 0; i--) {
      this.state.explosions[i].update();
      if (this.state.explosions[i].isDead()) {
        this.state.explosions.splice(i, 1);
      }
    }
    
    // Update player bullets
    for (let i = this.state.bullets.length - 1; i >= 0; i--) {
      const particle = this.state.bullets[i].update();
      if (particle) {
        this.state.backgroundParticles.push(particle);
      }
      
      if (this.state.bullets[i].y < 0) {
        this.state.bullets.splice(i, 1); // Remove bullets that go off-screen
      }
    }
    
    // Update enemy bullets
    for (let i = this.state.enemyBullets.length - 1; i >= 0; i--) {
      const particle = this.state.enemyBullets[i].update();
      if (particle) {
        this.state.backgroundParticles.push(particle);
      }
      
      if (this.state.enemyBullets[i].y > this.p.height) {
        this.state.enemyBullets.splice(i, 1); // Remove bullets that go off-screen
      }
    }
    
    // Update enemies
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const shouldShoot = this.state.enemies[i].update();
      
      if (shouldShoot) {
        const bullet = this.state.enemies[i].shoot();
        this.state.enemyBullets.push(bullet);
      }
      
      if (this.state.enemies[i].y > this.p.height) {
        this.state.enemies.splice(i, 1); // Remove enemies that go off-screen
      }
    }
    
    // Update power-ups
    for (let i = this.state.powerUps.length - 1; i >= 0; i--) {
      this.state.powerUps[i].update();
      if (this.state.powerUps[i].y > this.p.height) {
        this.state.powerUps.splice(i, 1); // Remove power-ups that go off-screen
      }
    }
  }
  
  checkCollisions() {
    // Collision detection: player bullets vs enemies
    for (let i = this.state.bullets.length - 1; i >= 0; i--) {
      for (let j = this.state.enemies.length - 1; j >= 0; j--) {
        let d = this.p.dist(
          this.state.bullets[i].x, 
          this.state.bullets[i].y, 
          this.state.enemies[j].x, 
          this.state.enemies[j].y
        );
        
        if (d < this.state.enemies[j].r + 5) {
          // Create explosion at enemy position
          let explosion = new Explosion(
            this.p,
            this.state.enemies[j].x,
            this.state.enemies[j].y,
            this.state.enemies[j].r * 1.5,
            this.p.color(255, 100, 50, 200)
          );
          this.state.explosions.push(explosion);
          
          this.state.bullets.splice(i, 1); // Remove bullet
          this.state.enemies.splice(j, 1); // Remove enemy
          this.state.score++; // Increase score
          
          // Play sound
          if (this.assets.enemyHitSound) this.assets.enemyHitSound.play();
          
          break; // Exit inner loop after hit
        }
      }
    }
    
    // Collision detection: player vs power-ups
    for (let i = this.state.powerUps.length - 1; i >= 0; i--) {
      let d = this.p.dist(
        this.state.powerUps[i].x, 
        this.state.powerUps[i].y, 
        this.state.player.x, 
        this.state.player.y
      );
      
      if (d < this.state.player.r + this.state.powerUps[i].r) {
        // Apply power-up effect
        if (this.state.powerUps[i].type === 0) { // Health
          this.state.player.health = Math.min(100, this.state.player.health + 20);
          toast.success("Health restored!", {
            position: "bottom-center",
            duration: 1500,
          });
        } else if (this.state.powerUps[i].type === 1) { // Shield
          this.state.player.shield = 300; // Shield duration
          toast.info("Shield activated!", {
            position: "bottom-center",
            duration: 1500,
          });
        } else { // Rapid fire
          this.state.shootDelay = 150; // Temporarily reduce cooldown
          setTimeout(() => {
            this.state.shootDelay = 300; // Reset after 5 seconds
          }, 5000);
          toast.info("Rapid fire activated!", {
            position: "bottom-center",
            duration: 1500,
          });
        }
        
        // Create particles at power-up position
        for (let j = 0; j < 15; j++) {
          let color;
          if (this.state.powerUps[i].type === 0) color = this.p.color(0, 255, 100, 200);
          else if (this.state.powerUps[i].type === 1) color = this.p.color(30, 144, 255, 200);
          else color = this.p.color(255, 220, 0, 200);
          
          let particle = new Particle(
            this.p,
            this.state.powerUps[i].x,
            this.state.powerUps[i].y,
            this.p.random(-2, 2),
            this.p.random(-2, 2),
            color,
            this.p.random(5, 10),
            this.p.random(20, 40)
          );
          this.state.backgroundParticles.push(particle);
        }
        
        // Play sound
        if (this.assets.powerUpSound) this.assets.powerUpSound.play();
        
        this.state.powerUps.splice(i, 1); // Remove power-up
      }
    }
    
    // Collision detection: enemy bullets vs player
    for (let i = this.state.enemyBullets.length - 1; i >= 0; i--) {
      let d = this.p.dist(
        this.state.enemyBullets[i].x, 
        this.state.enemyBullets[i].y, 
        this.state.player.x, 
        this.state.player.y
      );
      
      if (d < this.state.player.r + 5) {
        this.state.enemyBullets.splice(i, 1); // Remove bullet
        
        // Shield absorbs damage
        if (this.state.player.shield > 0) {
          // Reduced shield effect
          this.state.player.shield -= 50;
        } else {
          this.state.player.health -= 10; // Decrease health
          this.state.hitFlash = 5; // Trigger hit flash effect
          
          // Play sound
          if (this.assets.playerHitSound) this.assets.playerHitSound.play();
          
          // Create hit particles
          for (let j = 0; j < 10; j++) {
            let particle = new Particle(
              this.p,
              this.state.player.x,
              this.state.player.y,
              this.p.random(-2, 2),
              this.p.random(-2, 0),
              this.p.color(255, 100, 100, 200),
              this.p.random(5, 10),
              this.p.random(10, 20)
            );
            this.state.backgroundParticles.push(particle);
          }
          
          if (this.state.player.health <= 0) {
            // Create large explosion at player position
            let explosion = new Explosion(
              this.p,
              this.state.player.x,
              this.state.player.y,
              this.state.player.r * 3,
              this.p.color(30, 144, 255, 200)
            );
            this.state.explosions.push(explosion);
            
            this.state.gameOver = true; // Game over state
            
            // Play game over sound
            if (this.assets.gameOverSound) this.assets.gameOverSound.play();
          }
        }
      }
    }
    
    // Collision detection: enemies vs player (direct collision)
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      let d = this.p.dist(
        this.state.enemies[i].x, 
        this.state.enemies[i].y, 
        this.state.player.x, 
        this.state.player.y
      );
      
      if (d < this.state.player.r + this.state.enemies[i].r) {
        // Create explosion
        let explosion = new Explosion(
          this.p,
          this.state.enemies[i].x,
          this.state.enemies[i].y,
          this.state.enemies[i].r * 2,
          this.p.color(255, 100, 50, 200)
        );
        this.state.explosions.push(explosion);
        
        this.state.enemies.splice(i, 1); // Remove enemy
        
        // Shield absorbs some damage
        if (this.state.player.shield > 0) {
          this.state.player.shield -= 100;
        } else {
          this.state.player.health -= 20; // More damage for direct collision
          this.state.hitFlash = 10; // Stronger hit flash
          
          if (this.state.player.health <= 0) {
            // Create large explosion at player position
            let explosion = new Explosion(
              this.p,
              this.state.player.x,
              this.state.player.y,
              this.state.player.r * 3,
              this.p.color(30, 144, 255, 200)
            );
            this.state.explosions.push(explosion);
            
            this.state.gameOver = true; // Game over state
            
            // Play game over sound
            if (this.assets.gameOverSound) this.assets.gameOverSound.play();
          }
        }
      }
    }
  }
  
  drawBackground() {
    // Draw space background
    this.p.background(10, 15, 30); // Deep space color
    
    // Render stars (parallax effect)
    for (let star of this.state.stars) {
      star.draw();
    }
    
    // Draw futuristic grid background (subtler)
    this.p.stroke(30, 40, 80, 50); // Subtle blue grid
    this.p.strokeWeight(0.5);
    let gridSpacing = 40;
    
    // Vertical lines with perspective effect
    for (let i = 0; i < this.p.width; i += gridSpacing) {
      let opacity = this.p.map(i, 0, this.p.width, 30, 10);
      this.p.stroke(30, 60, 120, opacity);
      this.p.line(i, 0, i, this.p.height);
    }
    
    // Horizontal lines with perspective effect
    for (let j = 0; j < this.p.height; j += gridSpacing) {
      let progress = j / this.p.height;
      let spacing = gridSpacing * (1 + progress * 0.5);
      let opacity = this.p.map(j, 0, this.p.height, 10, 30);
      this.p.stroke(30, 60, 120, opacity);
      this.p.line(0, j, this.p.width, j);
    }
  }
  
  drawEntities() {
    this.p.noStroke();
    
    // Draw background particles
    for (let particle of this.state.backgroundParticles) {
      particle.draw();
    }
    
    // Draw explosions
    for (let explosion of this.state.explosions) {
      explosion.draw();
    }
    
    // Draw player bullets
    for (let bullet of this.state.bullets) {
      bullet.draw();
    }
    
    // Draw enemy bullets
    for (let bullet of this.state.enemyBullets) {
      bullet.draw();
    }
    
    // Draw enemies
    for (let enemy of this.state.enemies) {
      enemy.draw();
    }
    
    // Draw power-ups
    for (let powerUp of this.state.powerUps) {
      powerUp.draw();
    }
    
    // Draw player
    this.state.player.draw();
  }
  
  drawInterface() {
    // Display interface panel
    this.p.push();
    
    // Semi-transparent HUD background
    this.p.fill(10, 20, 40, 180);
    this.p.rect(10, 10, 200, 90, 10);
    
    // Score display with glow
    this.p.textAlign(this.p.LEFT, this.p.TOP);
    this.p.fill(30, 144, 255);
    this.p.textSize(16);
    this.p.text("SCORE", 20, 20);
    this.p.fill(255);
    this.p.textSize(28);
    this.p.text(this.state.score, 20, 40);
    
    // Health bar
    this.p.textSize(16);
    this.p.fill(30, 144, 255);
    this.p.text("HEALTH", 100, 20);
    
    // Health bar background
    this.p.fill(40, 40, 60);
    this.p.rect(100, 45, 100, 15, 7);
    
    // Health bar fill
    let healthGradient;
    if (this.state.player.health > 60) {
      healthGradient = this.p.lerpColor(
        this.p.color(30, 200, 200), 
        this.p.color(30, 255, 100), 
        (this.state.player.health - 60) / 40
      );
    } else if (this.state.player.health > 30) {
      healthGradient = this.p.lerpColor(
        this.p.color(255, 200, 0), 
        this.p.color(30, 200, 200), 
        (this.state.player.health - 30) / 30
      );
    } else {
      healthGradient = this.p.lerpColor(
        this.p.color(255, 30, 30), 
        this.p.color(255, 200, 0), 
        this.state.player.health / 30
      );
    }
    
    this.p.fill(healthGradient);
    let healthWidth = this.p.map(this.state.player.health, 0, 100, 0, 100);
    this.p.rect(100, 45, healthWidth, 15, 7);
    
    // Shield indicator
    if (this.state.player.shield > 0) {
      let shieldWidth = this.p.map(this.state.player.shield, 0, 300, 0, 100);
      this.p.fill(30, 144, 255, 150);
      this.p.rect(100, 65, shieldWidth, 8, 4);
    }
    
    this.p.pop();
    
    // Draw hit flash effect
    if (this.state.hitFlash > 0) {
      this.p.fill(255, 0, 0, this.state.hitFlash * 20); // Semi-transparent red
      this.p.rect(0, 0, this.p.width, this.p.height);
      this.state.hitFlash--;
    }
  }
  
  drawTitleScreen() {
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    
    // Game title with glow effect
    this.p.fill(30, 144, 255, 100 + Math.sin(this.p.frameCount * 0.05) * 50);
    this.p.textSize(72);
    this.p.text("ROBOTIC BATTLE", this.p.width / 2, this.p.height / 2 - 100);
    
    // Subtitle
    this.p.fill(200, 220, 255);
    this.p.textSize(24);
    this.p.text("A FUTURISTIC SPACE COMBAT EXPERIENCE", this.p.width / 2, this.p.height / 2 - 40);
    
    // Instructions
    this.p.fill(180, 200, 220);
    this.p.textSize(18);
    this.p.text("Use ARROW KEYS to move and SPACE to shoot", this.p.width / 2, this.p.height / 2 + 40);
    this.p.text("Destroy enemy ships and collect power-ups to survive", this.p.width / 2, this.p.height / 2 + 70);
    
    // Start prompt with pulsing effect
    let promptAlpha = 150 + Math.sin(this.p.frameCount * 0.1) * 105;
    this.p.fill(255, 255, 255, promptAlpha);
    this.p.textSize(28);
    this.p.text("PRESS ENTER TO START", this.p.width / 2, this.p.height / 2 + 150);
    
    // Listen for Enter key
    if (this.p.keyIsDown(13)) { // 13 is Enter key
      this.state.gameStarted = true;
      toast.info("Game started! Good luck!", {
        position: "bottom-center",
        duration: 2000,
      });
    }
  }
  
  drawGameOverScreen() {
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    
    // Game over text with red glow
    this.p.fill(255, 50, 50, 100 + Math.sin(this.p.frameCount * 0.05) * 50);
    this.p.textSize(72);
    this.p.text("GAME OVER", this.p.width / 2, this.p.height / 2 - 60);
    
    // Score display
    this.p.fill(200, 200, 255);
    this.p.textSize(42);
    this.p.text("FINAL SCORE: " + this.state.score, this.p.width / 2, this.p.height / 2 + 20);
    
    // Restart prompt
    let promptAlpha = 150 + Math.sin(this.p.frameCount * 0.1) * 105;
    this.p.fill(255, 255, 255, promptAlpha);
    this.p.textSize(28);
    this.p.text("PRESS ENTER TO RESTART", this.p.width / 2, this.p.height / 2 + 120);
    
    // Listen for Enter key to restart
    if (this.p.keyIsDown(13)) { // 13 is Enter key
      this.resetGame();
      toast.success("Game restarted! Good luck!", {
        position: "bottom-center",
        duration: 2000,
      });
    }
  }
  
  resetGame() {
    // Reset game state
    this.state.player = new Player(this.p, this.p.width / 2, this.p.height - 100, 60, 40);
    this.state.enemies = [];
    this.state.bullets = [];
    this.state.enemyBullets = [];
    this.state.explosions = [];
    this.state.powerUps = [];
    this.state.score = 0;
    this.state.lastShotTime = 0;
    this.state.lastEnemySpawnTime = 0;
    this.state.powerUpLastSpawnTime = 0;
    this.state.hitFlash = 0;
    this.state.gameOver = false;
  }
  
  update() {
    this.drawBackground();
    
    if (!this.state.gameStarted) {
      this.drawTitleScreen();
      return;
    }
    
    if (this.state.gameOver) {
      this.drawGameOverScreen();
      return;
    }
    
    this.handleInput();
    this.spawnEnemies();
    this.spawnPowerUps();
    this.updateEntities();
    this.checkCollisions();
    this.drawEntities();
    this.drawInterface();
  }
  
  windowResized() {
    // Handle window resizing
  }
  
  keyReleased(keyCode: number) {
    if (keyCode === 32) { // Spacebar
      if (this.state.gameStarted && !this.state.gameOver && this.p.millis() - this.state.lastShotTime > this.state.shootDelay) {
        const { bullet, particles } = this.state.player.shoot();
        this.state.bullets.push(bullet);
        this.state.backgroundParticles.push(...particles);
        this.state.lastShotTime = this.p.millis();
        
        // Play shoot sound
        if (this.assets.shootSound) this.assets.shootSound.play();
      }
      return false; // Prevent default
    }
    return true;
  }
}
