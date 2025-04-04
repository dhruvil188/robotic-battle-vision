import p5 from "p5";
import { toast } from "sonner";
import { GameState, GameAssets, BulletType, VisualEffects, ShopItem } from "./types";
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
  public state: GameState;
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
      gold: 0,
      enemiesDestroyed: 0,
      bossActive: false,
      lastBossSpawn: 0,
      bossSpawnThreshold: 50, // Boss appears after 50 enemies destroyed
      bossesDefeated: 0,      // Track how many bosses have been defeated
      bossKillCounter: 0,     // Counter for kills after first boss is defeated
      lastShotTime: 0,
      shootDelay: 300,
      lastEnemySpawnTime: 0,
      enemySpawnInterval: 1200, // Decreased from 1500 for higher frequency
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
      parallaxLayers: [],
      tripleShot: 0,
      speedBoost: 0,
      visualEffects: {
        screenShake: 0,
        screenShakeIntensity: 0,
        flashEffect: {
          active: false,
          color: null,
          alpha: 0,
          duration: 0
        },
        distortionEffect: {
          active: false,
          intensity: 0,
          duration: 0,
          centerX: 0,
          centerY: 0
        }
      },
      shopOpen: false,
      shopItems: [
        {
          id: 'health_refill',
          name: 'Health Refill',
          description: 'Restore full health',
          price: 1,
          type: 'health'
        },
        {
          id: 'shotgun',
          name: 'Shotgun',
          description: 'Triple spread shot',
          price: 5,
          type: 'weapon',
          purchased: false
        },
        {
          id: 'laser',
          name: 'Laser',
          description: 'Fast piercing beam',
          price: 10,
          type: 'weapon',
          purchased: false
        },
        {
          id: 'plasma',
          name: 'Plasma Cannon',
          description: 'High damage, slow shot',
          price: 15,
          type: 'weapon',
          purchased: false
        },
        {
          id: 'shield',
          name: 'Shield Boost',
          description: 'Temporary shield',
          price: 3,
          type: 'upgrade'
        }
      ],
      weaponLevels: [0, 0, 0, 0] // Standard, Shotgun, Laser, Plasma - all starting at level 0
    };
  }
  
  preload() {
    // Load font
    this.assets.gameFont = this.p.loadFont('https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4i1UA.ttf');
    
    try {
      // Initialize sounds if p5.sound is available
      if (this.p.SoundFile) {
        this.assets.shootSound = new this.p.SoundFile("data:audio/wav;base64,UklGRpQEAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YXAEAABt7XDtgO2X7bLtzO3o7QHuGe4v7kXuWu5v7oLule6m7rjuyO7X7ufu9e4C7w7vGe8k7y3vNe877z/vQu9E70XvRO9C70HvPO857zPvLO8l7xzvE+8I7//u9O7p7tzu0e7E7rjuq+6d7o/ufu5w7mDuT+4+7izuGu4I7vXt4u3O7brtpu2R7X3taO1T7T7tKe0U7f/s6uzV7MHsrOyX7ILsb+xb7EfsM+wg7A7s/OvL6+3rAewV7CnsP+xV7GvsgeyX7K7sxezc7PPsCu0h7TjtT+1m7X3tle2r7cLt2O3v7Qbu3e0W7k7uh+7B7vru8+4s72XvnO/T7wLwA/AK8ynzXfOX88bztuLwEfE38VzxgfGm8cnx6/EL8irySPJm8oPyoPK78tbyzPG98djx8vEN8ib+NfNA80zzWPNi823zePOC844zmfOj86zzs/O5877zwvPG88jzyvPK88rzyfPI88bzw/PCYMsnyXzJy8kXynDKu8oEy0zLksvZyxrMV8yCzKbMxczdzO3M980HzQ/NFc0Z5M/NJc8zz0DPTc9Zz2TPbs93z3/Phc+Kz47Pkc+Sz5LPkc+Pz4zPiM+Ez3/Pes91z2/PaM9hz1nPUM9Gz0DPXeDHH8k9yVrJdMmOyabJvcnTyenJ/skSyiXKNspGylLKXcpoyoZ3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKd4p3ineKPY/Njv2OLo9ej42PvI/qjxmQSJB3kKaQ1JD9KNeQN+BZ4HngmOC24NXg9+Kh4VLhM+EV4fngy+hn4kvCZMp4yozKoMqzysbK2crryv3KD8sgyzLKPMq6ysvK28ogy4nLmcupy7jLx8vWy+TL8sv/yyvJYsyNzLnM5Mpb79/vLvIw8vnyXPNA8+DzfPQZ9bb1VPbI9kH3u/c0+K74Jvmf+Rj6kfp0+3377/yp/WL+Hf/Y/2kAHAG0AYkCSgMNBNMEngVlBi4H9wfCCIwJVwoiC+4LugyGDVQOIg/xD7/QQfD/8Ijy/PJn87nzB/RT9J/06/Q19YD1y/UV9l72p/bw9jn3gffJ9xL4WviT+dX5DPpJ+oH6uvry+ir7YvuZ+9H7CPw//HX8q/zi/Bn9T/2F/bn95/0b/k/+g/63/uv+H/9S/4X/uP/r/x0AUACCALQAGQBbAAEBMgFjAZMBwgHxASACTwJ9AqsCKAKFAusCEAM0A1cDeQOaA7oDVwKXArUCGQMUBFAEpwT9BE8FoQXyBUMGlAbkBjQHgwfTBxcIYAiqCPIIOwmCCcgJDgpTCpcK2wo=");
        
        if (this.assets.shootSound) {
          this.assets.shootSound.setVolume(0.2);
        }
      }
    } catch (error) {
      console.log("Sound not supported:", error);
    }
  }
  
  setup() {
    // Create the player
    this.state.player = new Player(this.p, this.p.width / 2, this.p.height - 100, 60, 40, this.state.weaponLevels);
    
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
    // Toggle shop with 'S' key
    if (this.p.keyIsPressed && (this.p.key === 's' || this.p.key === 'S')) {
      this.p.keyIsPressed = false; // Reset to prevent multiple toggles
      this.state.shopOpen = !this.state.shopOpen;
      
      if (this.state.shopOpen) {
        toast.info("Shop opened. Press S to close.", {
          position: "bottom-center",
          duration: 2000,
        });
      }
    }
    
    // If shop is open, handle shop interactions instead of regular gameplay
    if (this.state.shopOpen) {
      this.handleShopInput();
      return;
    }
    
    // Player movement with speed boost consideration
    const moveSpeed = this.state.speedBoost > 0 ? this.state.player.speed * 1.5 : this.state.player.speed;
    
    if (this.p.keyIsDown(37)) { // Left arrow
      this.state.player.x -= moveSpeed;
      if (this.state.player.x - this.state.player.w / 2 < 0) {
        this.state.player.x = this.state.player.w / 2;
      }
    }
    if (this.p.keyIsDown(39)) { // Right arrow
      this.state.player.x += moveSpeed;
      if (this.state.player.x + this.state.player.w / 2 > this.p.width) {
        this.state.player.x = this.p.width - this.state.player.w / 2;
      }
    }

    // Weapon switching with W key
    if (this.p.keyIsPressed && this.p.key === 'w' || this.p.key === 'W') {
      this.p.keyIsPressed = false; // Reset to prevent multiple switches
      this.state.player.switchWeapon();
      
      // Add flash effect for weapon switch
      this.triggerFlashEffect(this.p.color(180, 180, 255), 60);
      
      // Get current weapon name for toast
      let weaponName = "Standard Gun";
      if (this.state.player.currentWeapon === 1) weaponName = "Shotgun";
      if (this.state.player.currentWeapon === 2) weaponName = "Laser";
      if (this.state.player.currentWeapon === 3) weaponName = "Plasma Cannon";
      
      toast.info(`Switched to ${weaponName}`, {
        position: "bottom-center",
        duration: 1500,
      });
    }

    // Player shooting with cooldown
    if (this.p.keyIsDown(32) && this.p.millis() - this.state.lastShotTime > this.state.shootDelay) { // 32 is spacebar
      // Handle different shot types
      if (this.state.tripleShot > 0) {
        // Triple shot
        const mainShot = this.state.player.shoot();
        this.state.bullets.push(mainShot.bullet);
        this.state.backgroundParticles.push(...mainShot.particles);
        
        // Create side bullets for triple shot
        const leftBullet = new Bullet(
          this.p, 
          this.state.player.x - 15, 
          this.state.player.y - this.state.player.h / 2, 
          -2, 
          -11, 
          true
        );
        
        const rightBullet = new Bullet(
          this.p, 
          this.state.player.x + 15, 
          this.state.player.y - this.state.player.h / 2, 
          2, 
          -11,
          true
        );
        
        this.state.bullets.push(leftBullet, rightBullet);
      } else {
        // Normal shot based on weapon type
        const result = this.state.player.shoot();
        this.state.bullets.push(result.bullet);
        
        // Add extra bullets if present (for shotgun)
        if (result.extraBullets && result.extraBullets.length > 0) {
          this.state.bullets.push(...result.extraBullets);
        }
        
        this.state.backgroundParticles.push(...result.particles);
      }
      
      this.state.lastShotTime = this.p.millis();
      
      // Play shoot sound
      if (this.assets.shootSound) {
        try {
          this.assets.shootSound.play();
        } catch (error) {
          console.log("Error playing sound:", error);
        }
      }
    }
  }
  
  handleShopInput() {
    // Handle number keys 1-5 to buy items
    if (this.p.keyIsPressed) {
      const keyNum = parseInt(this.p.key);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= this.state.shopItems.length) {
        this.p.keyIsPressed = false; // Reset to prevent multiple purchases
        this.buyShopItem(keyNum - 1);
      }
    }
  }
  
  buyShopItem(itemIndex: number) {
    const item = this.state.shopItems[itemIndex];
    
    // Helper to get weapon index from ID
    const getWeaponIndex = (id: string) => {
      switch(id) {
        case 'shotgun': return 1;
        case 'laser': return 2;
        case 'plasma': return 3;
        default: return 0;
      }
    };
    
    // Handle weapon upgrades
    if (item.type === 'weapon' && item.purchased) {
      const weaponIndex = getWeaponIndex(item.id);
      const currentLevel = this.state.weaponLevels[weaponIndex];
      
      // Max level check
      if (currentLevel >= 5) {
        toast.info(`${item.name} is already at maximum level!`, {
          position: "bottom-center",
          duration: 2000,
        });
        return;
      }
      
      // Calculate upgrade price based on level
      const upgradePrice = Math.ceil((currentLevel + 1) * (item.price * 0.8));
      
      // Check if player has enough gold
      if (this.state.gold < upgradePrice) {
        toast.error(`Not enough credits! You need ${upgradePrice} credits.`, {
          position: "bottom-center",
          duration: 2000,
        });
        return;
      }
      
      // Apply the upgrade
      this.state.weaponLevels[weaponIndex]++;
      this.state.gold -= upgradePrice;
      
      // Show success message
      toast.success(`${item.name} upgraded to Level ${this.state.weaponLevels[weaponIndex]}!`, {
        position: "bottom-center",
        duration: 2000,
      });
      
      // Add visual effect
      this.triggerFlashEffect(this.p.color(180, 180, 255), 60);
      
      return;
    }
    
    // Check if player has enough gold for the initial purchase
    if (this.state.gold < item.price) {
      toast.error(`Not enough credits! You need ${item.price} credits.`, {
        position: "bottom-center",
        duration: 2000,
      });
      return;
    }
    
    // Process purchase based on item type (original logic for initial purchases)
    if (item.type === 'health') {
      this.state.player.health = 100;
      this.state.gold -= item.price;
      toast.success(`Health restored!`, {
        position: "bottom-center",
        duration: 1500,
      });
      
      // Add visual effect
      this.triggerFlashEffect(this.p.color(0, 255, 0), 60);
    } 
    else if (item.type === 'weapon') {
      // Check if weapon is already purchased
      if (item.purchased) {
        toast.info(`You already own the ${item.name}!`, {
          position: "bottom-center",
          duration: 1500,
        });
        return;
      }
      
      // Mark as purchased
      item.purchased = true;
      this.state.gold -= item.price;
      
      // Switch to newly purchased weapon
      if (item.id === 'shotgun') this.state.player.currentWeapon = 1;
      if (item.id === 'laser') this.state.player.currentWeapon = 2;
      if (item.id === 'plasma') this.state.player.currentWeapon = 3;
      
      toast.success(`${item.name} purchased and equipped!`, {
        position: "bottom-center",
        duration: 2000,
      });
      
      // Add visual effect
      this.triggerFlashEffect(this.p.color(180, 180, 255), 60);
    }
    else if (item.type === 'upgrade') {
      if (item.id === 'shield') {
        this.state.player.shield = 300;
        this.state.gold -= item.price;
        toast.success(`Shield activated!`, {
          position: "bottom-center",
          duration: 1500,
        });
        
        // Add visual effect
        this.triggerFlashEffect(this.p.color(30, 144, 255), 60);
      }
    }
  }
  
  spawnEnemies() {
    // Get difficulty multiplier based on shotgun level (index 1 in weaponLevels)
    const shotgunLevel = this.state.weaponLevels[1];
    const isShotgunAdvanced = shotgunLevel >= 3;
    
    // Base difficulty multiplier starts at 1, increases after shotgun level 3
    const difficultyMultiplier = isShotgunAdvanced ? 1 + ((shotgunLevel - 2) * 0.5) : 1;
    
    // Modify boss spawn conditions based on shotgun level
    // After shotgun level 3, bosses will spawn more frequently
    const bossCooldownReduction = isShotgunAdvanced ? Math.min(0.7, 1 - (shotgunLevel - 2) * 0.1) : 1;
    const bossKillThreshold = isShotgunAdvanced ? Math.max(5, 15 - (shotgunLevel - 2) * 2) : 15;
    
    // Check if it's time to spawn a boss
    // After the first boss is defeated, a new boss will appear based on kill threshold and multipliers
    const shouldSpawnBoss = this.state.bossesDefeated === 0 
      ? this.state.enemiesDestroyed >= this.state.bossSpawnThreshold
      : this.state.bossKillCounter >= bossKillThreshold;
      
    if (shouldSpawnBoss && !this.state.bossActive && this.p.millis() - this.state.lastBossSpawn > 15000 * bossCooldownReduction) {
      this.spawnBoss(difficultyMultiplier);
      
      // Reset the boss kill counter after spawning a new boss
      if (this.state.bossesDefeated > 0) {
        this.state.bossKillCounter = 0;
      }
      
      return;
    }
    
    // Regular enemy spawning logic - INCREASED FREQUENCY
    if (this.p.millis() - this.state.lastEnemySpawnTime > this.state.enemySpawnInterval) {
      // Determine how many enemies to spawn (1-6 based on score and difficulty)
      // Make this scale with the number of bosses defeated and shotgun level to increase difficulty
      const baseSpawnCount = Math.min(4, Math.floor(this.state.score / 8) + 1);
      const additionalEnemies = Math.min(4, Math.floor(this.state.bossesDefeated / 2)); 
      const shotgunBonus = isShotgunAdvanced ? Math.floor((shotgunLevel - 2) * 0.7) : 0;
      const spawnCount = Math.min(6, baseSpawnCount + additionalEnemies + shotgunBonus);
      
      for (let i = 0; i < spawnCount; i++) {
        // Add some variation to positions for multiple spawns
        const offsetX = i === 0 ? 0 : this.p.random(-100, 100);
        const spawnX = this.p.constrain(
          this.p.random(this.p.width) + offsetX, 
          50, 
          this.p.width - 50
        );
        
        // Randomly choose enemy type, with higher chance of stronger enemies as score increases
        // And as more bosses are defeated
        let enemyType = 0;
        const typeRoll = this.p.random();
        const difficultyBoost = this.state.bossesDefeated * 0.05 + (isShotgunAdvanced ? (shotgunLevel - 2) * 0.1 : 0);
        
        if (this.state.score > 50 || this.state.bossesDefeated > 0) {
          if (typeRoll < Math.max(0.1, 0.3 - difficultyBoost)) enemyType = 0; // Basic - less common as game progresses
          else if (typeRoll < Math.max(0.2, 0.5 - difficultyBoost)) enemyType = 1; // Tanky
          else if (typeRoll < Math.max(0.3, 0.7 - difficultyBoost)) enemyType = 2; // Fast
          else if (typeRoll < Math.max(0.6, 0.9 - difficultyBoost)) enemyType = 3; // Rapid fire
          else enemyType = 4; // Heavy gunner - more common as game progresses
        } else if (this.state.score > 25) {
          if (typeRoll < 0.4) enemyType = 0; // Basic
          else if (typeRoll < 0.6) enemyType = 1; // Tanky
          else if (typeRoll < 0.8) enemyType = 2; // Fast
          else enemyType = 3; // Rapid fire
        } else if (this.state.score > 10) {
          if (typeRoll < 0.6) enemyType = 0; // Basic
          else if (typeRoll < 0.8) enemyType = 1; // Tanky
          else if (typeRoll < 1.0) enemyType = 2; // Fast
        } else {
          if (typeRoll < 1.0) enemyType = 0; // Basic
          else enemyType = 1; // Tanky
        }
        
        // Increase enemy speed based on bosses defeated and shotgun level
        const speedBoost = 1 + (this.state.bossesDefeated * 0.1) + (isShotgunAdvanced ? (shotgunLevel - 2) * 0.15 : 0);
        const baseSpeed = this.p.random(2, 3.5);
        
        const enemy = new Enemy(
          this.p, 
          spawnX, 
          -30 - (i * 30), // Stagger vertical positions
          20, 
          baseSpeed * speedBoost, // Speed increases with each boss defeated and shotgun level
          enemyType,
          false, // Not a boss
          difficultyMultiplier // Pass the difficulty multiplier to scale boss health/damage
        );
        this.state.enemies.push(enemy);
      }
      
      this.state.lastEnemySpawnTime = this.p.millis();
      
      // Gradually increase difficulty - faster spawn rate
      // Make spawn rate decrease more rapidly after each boss is defeated
      // Additional acceleration based on shotgun level
      const difficultyFactor = 0.990 - (this.state.bossesDefeated * 0.001) - (isShotgunAdvanced ? (shotgunLevel - 2) * 0.002 : 0);
      if (this.state.enemySpawnInterval > 350) { // Decreased minimum spawn interval from 450 to 350
        this.state.enemySpawnInterval *= difficultyFactor;
      }
    }
  }
  
  spawnBoss(difficultyMultiplier = 1) {
    // Create boss at the top center of the screen
    const bossX = this.p.width / 2;
    const bossY = -50;
    
    const boss = new Enemy(
      this.p,
      bossX,
      bossY,
      30, // Larger radius
      1.5, // Speed
      undefined, // Random type
      true, // Is boss
      difficultyMultiplier // Pass the difficulty multiplier to scale boss health/damage
    );
    
    this.state.enemies.push(boss);
    this.state.bossActive = true;
    this.state.lastBossSpawn = this.p.millis();
    
    // Show boss warning with increasing threat level
    const bossLevel = this.state.bossesDefeated + 1;
    const difficultyMessage = difficultyMultiplier > 1.5 ? " [EXTREME]" : 
                             difficultyMultiplier > 1.2 ? " [HARD]" : 
                             difficultyMultiplier > 1 ? " [MEDIUM]" : "";
    
    toast.error(`WARNING: Level ${bossLevel} Boss approaching!${difficultyMessage}`, {
      position: "top-center",
      duration: 3000,
    });
    
    // Play boss warning sound if available
    if (this.assets.bossWarningSound) {
      try {
        this.assets.bossWarningSound.play();
      } catch (error) {
        console.log("Error playing boss warning sound:", error);
      }
    }
    
    // Create warning particles
    for (let i = 0; i < 30; i++) {
      const warningParticle = new Particle(
        this.p,
        this.p.random(this.p.width),
        this.p.random(100),
        this.p.random(-2, 2),
        this.p.random(-1, 3),
        this.p.color(255, 50, 50, this.p.random(100, 200)),
        this.p.random(5, 15),
        this.p.random(30, 60)
      );
      this.state.backgroundParticles.push(warningParticle);
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
        const bulletResult = this.state.enemies[i].shoot();
        
        // Handle both single bullets and arrays of bullets
        if (Array.isArray(bulletResult)) {
          this.state.enemyBullets.push(...bulletResult);
        } else {
          this.state.enemyBullets.push(bulletResult);
        }
      }
      
      // If enemy is not boss and goes off-screen, remove it
      if (!this.state.enemies[i].isBoss && this.state.enemies[i].y > this.p.height) {
        this.state.enemies.splice(i, 1);
      }
    }
    
    // Update power-ups
    for (let i = this.state.powerUps.length - 1; i >= 0; i--) {
      this.state.powerUps[i].update();
      if (this.state.powerUps[i].y > this.p.height) {
        this.state.powerUps.splice(i, 1); // Remove power-ups that go off-screen
      }
    }
    
    // Update power-up timers
    if (this.state.tripleShot > 0) this.state.tripleShot--;
    if (this.state.speedBoost > 0) this.state.speedBoost--;
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
          // Apply bullet damage to enemy health
          this.state.enemies[j].health -= this.state.bullets[i].damage || 10;
          
          // Create small hit effect
          for (let k = 0; k < 5; k++) {
            let hitParticle = new Particle(
              this.p,
              this.state.bullets[i].x,
              this.state.bullets[i].y,
              this.p.random(-2, 2),
              this.p.random(-2, 2),
              this.p.color(255, this.state.enemies[j].isBoss ? 100 : 200, 100, 200),
              this.p.random(3, 8),
              this.p.random(10, 20)
            );
            this.state.backgroundParticles.push(hitParticle);
          }
          
          // Remove bullet
          this.state.bullets.splice(i, 1);
          
          // If enemy health <= 0, destroy it
          if (this.state.enemies[j].health <= 0) {
            // Create explosion at enemy position
            let explosion = new Explosion(
              this.p,
              this.state.enemies[j].x,
              this.state.enemies[j].y,
              this.state.enemies[j].r * (this.state.enemies[j].isBoss ? 3 : 1.5),
              this.p.color(255, 100, 50, 200)
            );
            this.state.explosions.push(explosion);
            
            // Add screen shake based on enemy size or if it's a boss
            const shakeIntensity = this.state.enemies[j].isBoss ? 10 : Math.min(5, this.state.enemies[j].r * 0.3);
            this.triggerScreenShake(shakeIntensity);
            
            // Add gold for kill
            this.state.gold += this.state.enemies[j].isBoss ? 5 : 1;
            
            // If it was a boss, create multiple explosions and distortion effect
            if (this.state.enemies[j].isBoss) {
              // Create additional explosions around the boss
              for (let k = 0; k < 5; k++) {
                let bossExplosion = new Explosion(
                  this.p,
                  this.state.enemies[j].x + this.p.random(-50, 50),
                  this.state.enemies[j].y + this.p.random(-50, 50),
                  this.p.random(20, 40),
                  this.p.color(255, this.p.random(50, 150), 30, 200)
                );
                this.state.explosions.push(bossExplosion);
              }
              
              // Trigger distortion effect
              this.triggerDistortionEffect(
                this.state.enemies[j].x,
                this.state.enemies[j].y,
                15,
                30
              );
              
              // Add colorful flash effect for boss defeat
              this.triggerFlashEffect(this.p.color(255, 100, 50), 80);
              
              // Update boss state
              this.state.bossActive = false;
              this.state.bossesDefeated++;
              
              // Increment the number of bosses defeated
              const baseScore = 25;
              const bossBonus = this.state.bossesDefeated * 5; // Each boss gives more points
              this.state.score += baseScore + bossBonus;
              
              // Spawn power-ups from boss
              // More power-ups from higher-level bosses
              const powerUpCount = 3 + Math.min(3, Math.floor(this.state.bossesDefeated / 2));
              for (let k = 0; k < powerUpCount; k++) {
                const powerUp = new PowerUp(
                  this.p, 
                  this.state.enemies[j].x + this.p.random(-30, 30), 
                  this.state.enemies[j].y + this.p.random(-30, 30)
                );
                this.state.powerUps.push(powerUp);
              }
              
              // Show boss defeated message
              toast.success(`Boss Level ${this.state.bossesDefeated} defeated! +${baseScore + bossBonus} score, +5 gold`, {
                position: "top-center",
                duration: 3000,
              });
              
              // Increase boss spawn threshold for next boss
              this.state.bossSpawnThreshold += 50;
            } else {
              // Regular enemy destroyed
              this.state.score++;
              
              // After first boss is defeated, count kills toward next boss spawn
              if (this.state.bossesDefeated > 0) {
                this.state.bossKillCounter++;
              }
            }
            
            // Increment enemies destroyed counter
            this.state.enemiesDestroyed++;
            
            // Remove enemy
            this.state.enemies.splice(j, 1);
            
            // Play sound
            if (this.assets.enemyHitSound) {
              try {
                this.assets.enemyHitSound.play();
              } catch (error) {
                console.log("Error playing enemy hit sound:", error);
              }
            }
          }
          
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
        // Apply power-up effect based on type
        if (this.state.powerUps[i].type === 0) { // Health
          this.state.player.health = Math.min(100, this.state.player.health + 20);
          this.triggerFlashEffect(this.p.color(0, 255, 100), 80);
          toast.success("Health restored!", {
            position: "bottom-center",
            duration: 1500,
          });
        } else if (this.state.powerUps[i].type === 1) { // Shield
          this.state.player.shield = 300; // Shield duration
          this.triggerFlashEffect(this.p.color(30, 144, 255), 80);
          toast.info("Shield activated!", {
            position: "bottom-center",
            duration: 1500,
          });
        } else if (this.state.powerUps[i].type === 2) { // Rapid fire
          this.state.shootDelay = 150; // Temporarily reduce cooldown
          this.triggerFlashEffect(this.p.color(255, 220, 0), 80);
          setTimeout(() => {
            this.state.shootDelay = 300; // Reset after 5 seconds
          }, 5000);
          toast.info("Rapid fire activated!", {
            position: "bottom-center",
            duration: 1500,
          });
        } else if (this.state.powerUps[i].type === 3) { // Triple shot
          this.state.tripleShot = 300; // Triple shot duration (frames)
          this.triggerFlashEffect(this.p.color(180, 90, 255), 80);
          toast.info("Triple shot activated!", {
            position: "bottom-center",
            duration: 1500,
          });
        } else if (this.state.powerUps[i].type === 4) { // Bomb
          // Create a large explosion that destroys all enemies on screen
          let explosion = new Explosion(
            this.p,
            this.state.player.x,
            this.state.player.y - 100,
            150,
            this.p.color(255, 100, 30, 200)
          );
          this.state.explosions.push(explosion);
          
          // Add strong screen shake and distortion for bomb
          this.triggerScreenShake(30);
          this.triggerDistortionEffect(this.p.width/2, this.p.height/2, 40, 90);
          
          // Add flash effect for bomb
          this.triggerFlashEffect(this.p.color(255, 100, 30), 120);
          
          // Clear all enemies
          for (let enemy of this.state.enemies) {
            this.state.score++; // Increase score for each enemy destroyed
            
            // Create smaller explosions at each enemy position
            let enemyExplosion = new Explosion(
              this.p,
              enemy.x,
              enemy.y,
              enemy.r * 2,
              this.p.color(255, 100, 50, 200)
            );
            this.state.explosions.push(enemyExplosion);
          }
          
          // Clear all enemy bullets
          this.state.enemyBullets = [];
          this.state.enemies = [];
          
          toast.info("Bomb detonated! All enemies destroyed!", {
            position: "bottom-center",
            duration: 2000,
          });
        } else if (this.state.powerUps[i].type === 5) { // Speed boost
          this.state.speedBoost = 300; // Speed boost duration (frames)
          this.triggerFlashEffect(this.p.color(0, 220, 220), 80);
          toast.info("Speed boost activated!", {
            position: "bottom-center",
            duration: 1500,
          });
        }
        
        // Create particles at power-up position
        for (let j = 0; j < 15; j++) {
          let color;
          if (this.state.powerUps[i].type === 0) color = this.p.color(0, 255, 100, 200);
          else if (this.state.powerUps[i].type === 1) color = this.p.color(30, 144, 255, 200);
          else if (this.state.powerUps[i].type === 2) color = this.p.color(255, 220, 0, 200);
          else if (this.state.powerUps[i].type === 3) color = this.p.color(180, 90, 255, 200);
          else if (this.state.powerUps[i].type === 4) color = this.p.color(255, 100, 30, 200);
          else color = this.p.color(0, 220, 220, 200);
          
          let powerUpParticle = new Particle(
            this.p,
            this.state.powerUps[i].x,
            this.state.powerUps[i].y,
            this.p.random(-3, 3),
            this.p.random(-3, 3),
            color,
            this.p.random(3, 8),
            this.p.random(20, 30)
          );
          this.state.backgroundParticles.push(powerUpParticle);
        }
        
        // Remove power-up
        this.state.powerUps.splice(i, 1);
        
        // Play sound
        if (this.assets.powerUpSound) {
          try {
            this.assets.powerUpSound.play();
          } catch (error) {
            console.log("Error playing power-up sound:", error);
          }
        }
        
        break; // Exit loop after collecting power-up
      }
    }
    
    // Collision detection: enemy bullets vs player
    if (!this.state.gameOver && this.state.player.shield <= 0) { // Only check if no shield and game not over
      for (let i = this.state.enemyBullets.length - 1; i >= 0; i--) {
        let d = this.p.dist(
          this.state.enemyBullets[i].x, 
          this.state.enemyBullets[i].y, 
          this.state.player.x, 
          this.state.player.y
        );
        
        if (d < this.state.player.r - 5) {
          // Player takes damage
          this.state.player.health -= 10;
          
          // Add hit flash effect
          this.state.hitFlash = 15;
          
          // Add screen shake when player gets hit
          this.triggerScreenShake(5);
          
          // Add flash effect when player gets hit
          this.triggerFlashEffect(this.p.color(255, 0, 0), 60);
          
          // Create hit particles
          for (let j = 0; j < 10; j++) {
            let hitParticle = new Particle(
              this.p,
              this.state.enemyBullets[i].x,
              this.state.enemyBullets[i].y,
              this.p.random(-3, 3),
              this.p.random(-3, 3),
              this.p.color(255, 100, 100, 200),
              this.p.random(3, 8),
              this.p.random(20, 30)
            );
            this.state.backgroundParticles.push(hitParticle);
          }
          
          // Remove bullet
          this.state.enemyBullets.splice(i, 1);
          
          // Check if game over
          if (this.state.player.health <= 0) {
            this.gameOver();
          }
          
          // Play sound
          if (this.assets.playerHitSound) {
            try {
              this.assets.playerHitSound.play();
            } catch (error) {
              console.log("Error playing player hit sound:", error);
            }
          }
          
          break; // Exit loop after hit
        }
      }
    }
    
    // Collision detection: player vs enemies
    if (!this.state.gameOver && this.state.player.shield <= 0) { // Only check if no shield and game not over
      for (let i = this.state.enemies.length - 1; i >= 0; i--) {
        let d = this.p.dist(
          this.state.enemies[i].x, 
          this.state.enemies[i].y, 
          this.state.player.x, 
          this.state.player.y
        );
        
        if (d < this.state.player.r + this.state.enemies[i].r - 15) {
          // Player takes damage
          this.state.player.health -= 20;
          
          // Add hit flash effect
          this.state.hitFlash = 15;
          
          // Add screen shake when player gets hit
          this.triggerScreenShake(8);
          
          // Add flash effect when player gets hit
          this.triggerFlashEffect(this.p.color(255, 0, 0), 80);
          
          // Create explosion at collision point
          let explosion = new Explosion(
            this.p,
            (this.state.player.x + this.state.enemies[i].x) / 2,
            (this.state.player.y + this.state.enemies[i].y) / 2,
            Math.max(20, this.state.enemies[i].r * 1.5),
            this.p.color(255, 100, 50, 200)
          );
          this.state.explosions.push(explosion);
          
          // Check if game over
          if (this.state.player.health <= 0) {
            this.gameOver();
            return;
          }
          
          // Remove enemy
          this.state.enemies.splice(i, 1);
          
          // Play sound
          if (this.assets.playerHitSound) {
            try {
              this.assets.playerHitSound.play();
            } catch (error) {
              console.log("Error playing player hit sound:", error);
            }
          }
          
          break; // Exit loop after collision
        }
      }
    }
  }
  
  update() {
    if (!this.state.gameStarted) {
      // Draw stars in the background
      this.p.background(0);
      for (let star of this.state.stars) {
        star.update();
        star.draw();
      }
      
      // Display start game message
      this.p.fill(255);
      this.p.textSize(32);
      this.p.textAlign(this.p.CENTER);
      this.p.text("SPACE SHOOTER", this.p.width / 2, this.p.height / 2 - 40);
      this.p.textSize(16);
      this.p.text("Press ENTER to start", this.p.width / 2, this.p.height / 2 + 20);
      this.p.text("Arrow keys to move, SPACE to shoot", this.p.width / 2, this.p.height / 2 + 50);
      this.p.text("W to change weapons, S to open shop", this.p.width / 2, this.p.height / 2 + 80);
      
      // Check for ENTER key to start game
      if (this.p.keyIsDown(13)) {
        this.state.gameStarted = true;
      }
      return;
    }
    
    if (this.state.gameOver) {
      // Draw stars in the background
      this.p.background(0);
      for (let star of this.state.stars) {
        star.update();
        star.draw();
      }
      
      // Display game over message
      this.p.fill(255, 0, 0);
      this.p.textSize(40);
      this.p.textAlign(this.p.CENTER);
      this.p.text("GAME OVER", this.p.width / 2, this.p.height / 2 - 40);
      this.p.fill(255);
      this.p.textSize(20);
      this.p.text(`Final Score: ${this.state.score}`, this.p.width / 2, this.p.height / 2 + 20);
      this.p.text(`Enemies Destroyed: ${this.state.enemiesDestroyed}`, this.p.width / 2, this.p.height / 2 + 50);
      this.p.text(`Bosses Defeated: ${this.state.bossesDefeated}`, this.p.width / 2, this.p.height / 2 + 80);
      this.p.textSize(16);
      this.p.text("Press ENTER to play again", this.p.width / 2, this.p.height / 2 + 130);
      
      // Check for ENTER key to restart game
      if (this.p.keyIsDown(13)) {
        this.resetGame();
      }
      return;
    }
    
    // Clear background
    this.p.background(0);
    
    // Update parallax layers
    for (let layer of this.state.parallaxLayers) {
      layer.update();
      layer.draw();
    }
    
    // Update stars
    for (let star of this.state.stars) {
      star.update();
      star.draw();
    }
    
    // If shop is open, draw shop instead of handling game logic
    if (this.state.shopOpen) {
      this.drawShop();
      // Still handle input for shop interactions
      this.handleInput();
      return;
    }
    
    // Handle input
    this.handleInput();
    
    // Spawn enemies
    this.spawnEnemies();
    
    // Spawn power-ups
    this.spawnPowerUps();
    
    // Update all entities
    this.updateEntities();
    
    // Check for collisions
    this.checkCollisions();
    
    // Apply visual effects
    this.applyVisualEffects();
    
    // Update player shield opacity for visual feedback
    if (this.state.player.shield > 0) {
      this.state.player.shield--;
      this.state.shieldOpacity = this.p.map(this.state.player.shield, 0, 300, 0, 150);
    } else {
      this.state.shieldOpacity = 0;
    }
    
    // Draw all entities
    this.drawEntities();
    
    // Draw UI
    this.drawUI();
    
    // Gradually reduce visual effects
    this.updateVisualEffects();
  }
  
  drawShop() {
    // Draw semi-transparent overlay
    this.p.fill(0, 0, 0, 180);
    this.p.rect(0, 0, this.p.width, this.p.height);
    
    // Draw shop title
    this.p.fill(255);
    this.p.textSize(30);
    this.p.textAlign(this.p.CENTER);
    this.p.text("SHOP", this.p.width / 2, 70);
    
    // Draw gold
    this.p.fill(255, 215, 0); // Gold color
    this.p.textSize(20);
    this.p.text(`Gold: ${this.state.gold}`, this.p.width / 2, 110);
    
    // Draw shop items
    const itemHeight = 80;
    const startY = 150;
    
    this.p.textAlign(this.p.LEFT);
    for (let i = 0; i < this.state.shopItems.length; i++) {
      const item = this.state.shopItems[i];
      const y = startY + i * itemHeight;
      
      // Draw background for item slot
      this.p.fill(30, 30, 40, 200);
      this.p.rect(this.p.width / 2 - 200, y, 400, itemHeight - 10, 5);
      
      // Draw item info
      this.p.fill(255);
      this.p.textSize(18);
      this.p.text(`${i + 1}. ${item.name}`, this.p.width / 2 - 180, y + 25);
      
      // Draw description
      this.p.fill(200);
      this.p.textSize(14);
      this.p.text(item.description, this.p.width / 2 - 180, y + 50);
      
      // Draw price with gold icon
      this.p.fill(255, 215, 0); // Gold color
      this.p.textAlign(this.p.RIGHT);
      this.p.text(`${item.price} Gold`, this.p.width / 2 + 180, y + 25);
      
      // Draw status (purchased or available)
      if (item.type === 'weapon' && item.purchased) {
        this.p.fill(0, 255, 0);
        this.p.text("Purchased", this.p.width / 2 + 180, y + 50);
      } else {
        this.p.fill(30, 144, 255);
        this.p.text("Available", this.p.width / 2 + 180, y + 50);
      }
      
      // Reset text align
      this.p.textAlign(this.p.LEFT);
    }
    
    // Draw instruction
    this.p.fill(200);
    this.p.textAlign(this.p.CENTER);
    this.p.textSize(16);
    this.p.text("Press 1-5 to purchase items, S to close shop", this.p.width / 2, this.p.height - 50);
  }
  
  drawEntities() {
    // Draw player
    if (!this.state.gameOver) {
      this.state.player.draw();
      
      // Draw shield effect if active
      if (this.state.shieldOpacity > 0) {
        this.p.noFill();
        this.p.stroke(30, 144, 255, this.state.shieldOpacity);
        this.p.strokeWeight(3);
        this.p.ellipse(this.state.player.x, this.state.player.y, this.state.player.r * 2.5);
        this.p.strokeWeight(1);
      }
    }
    
    // Draw enemies
    for (let enemy of this.state.enemies) {
      enemy.draw();
    }
    
    // Draw player bullets
    for (let bullet of this.state.bullets) {
      bullet.draw();
    }
    
    // Draw enemy bullets
    for (let bullet of this.state.enemyBullets) {
      bullet.draw();
    }
    
    // Draw power-ups
    for (let powerUp of this.state.powerUps) {
      powerUp.draw();
    }
    
    // Draw background particles
    for (let particle of this.state.backgroundParticles) {
      particle.draw();
    }
    
    // Draw explosions
    for (let explosion of this.state.explosions) {
      explosion.draw();
    }
  }
  
  drawUI() {
    // Health bar
    this.p.noStroke();
    this.p.fill(50);
    this.p.rect(20, 20, 200, 20, 5);
    const healthColor = this.p.color(
      this.p.map(this.state.player.health, 0, 100, 255, 0),
      this.p.map(this.state.player.health, 0, 100, 0, 255),
      0
    );
    this.p.fill(healthColor);
    this.p.rect(20, 20, this.p.map(this.state.player.health, 0, 100, 0, 200), 20, 5);
    this.p.fill(255);
    this.p.textSize(14);
    this.p.textAlign(this.p.CENTER);
    this.p.text(`Health: ${this.state.player.health}`, 120, 35);
    
    // Gold display
    this.p.fill(255, 215, 0); // Gold color
    this.p.textAlign(this.p.LEFT);
    this.p.textSize(18);
    this.p.text(`Gold: ${this.state.gold}`, 20, 60);
    
    // Score
    this.p.fill(255);
    this.p.textAlign(this.p.RIGHT);
    this.p.textSize(20);
    this.p.text(`Score: ${this.state.score}`, this.p.width - 20, 30);
    
    // Shop hint
    this.p.textSize(14);
    this.p.text("Press S for Shop", this.p.width - 20, 60);
  }
  
  applyVisualEffects() {
    // Apply screen shake
    if (this.state.visualEffects.screenShake > 0) {
      const shakeAmount = this.state.visualEffects.screenShakeIntensity * 
                          (this.state.visualEffects.screenShake / 30);
      this.p.translate(
        this.p.random(-shakeAmount, shakeAmount),
        this.p.random(-shakeAmount, shakeAmount)
      );
    }
    
    // Apply flash effect
    if (this.state.visualEffects.flashEffect.active) {
      this.p.noStroke();
      this.p.fill(
        this.p.red(this.state.visualEffects.flashEffect.color),
        this.p.green(this.state.visualEffects.flashEffect.color),
        this.p.blue(this.state.visualEffects.flashEffect.color),
        this.state.visualEffects.flashEffect.alpha
      );
      this.p.rect(0, 0, this.p.width, this.p.height);
    }
    
    // Apply distortion effect
    if (this.state.visualEffects.distortionEffect.active) {
      // Simple distortion effect - not implemented fully
      // Will need shader implementation for real distortion
    }
  }
  
  updateVisualEffects() {
    // Update screen shake
    if (this.state.visualEffects.screenShake > 0) {
      this.state.visualEffects.screenShake -= 1;
    } else {
      this.state.visualEffects.screenShake = 0;
    }
    
    // Update flash effect
    if (this.state.visualEffects.flashEffect.active) {
      this.state.visualEffects.flashEffect.alpha -= 
        this.state.visualEffects.flashEffect.alpha / 
        this.state.visualEffects.flashEffect.duration * 2;
      
      if (this.state.visualEffects.flashEffect.alpha <= 1) {
        this.state.visualEffects.flashEffect.active = false;
      }
    }
    
    // Update distortion effect
    if (this.state.visualEffects.distortionEffect.active) {
      this.state.visualEffects.distortionEffect.intensity -= 
        this.state.visualEffects.distortionEffect.intensity / 
        this.state.visualEffects.distortionEffect.duration * 2;
      
      if (this.state.visualEffects.distortionEffect.intensity <= 0.1) {
        this.state.visualEffects.distortionEffect.active = false;
      }
    }
  }
  
  triggerScreenShake(intensity: number, duration: number = 30) {
    // Only trigger if the new shake would be stronger than current
    if (intensity > this.state.visualEffects.screenShakeIntensity || 
        this.state.visualEffects.screenShake <= 0) {
      this.state.visualEffects.screenShake = duration;
      this.state.visualEffects.screenShakeIntensity = intensity;
    }
  }
  
  triggerFlashEffect(color: p5.Color, alpha: number = 100, duration: number = 30) {
    this.state.visualEffects.flashEffect.active = true;
    this.state.visualEffects.flashEffect.color = color;
    this.state.visualEffects.flashEffect.alpha = alpha;
    this.state.visualEffects.flashEffect.duration = duration;
  }
  
  triggerDistortionEffect(centerX: number, centerY: number, intensity: number = 10, duration: number = 30) {
    this.state.visualEffects.distortionEffect.active = true;
    this.state.visualEffects.distortionEffect.centerX = centerX;
    this.state.visualEffects.distortionEffect.centerY = centerY;
    this.state.visualEffects.distortionEffect.intensity = intensity;
    this.state.visualEffects.distortionEffect.duration = duration;
  }
  
  windowResized() {
    // Handle window resize
  }
  
  keyReleased(keyCode: number) {
    // Handle key released
    return true;
  }
  
  resetGame() {
    // Reset game state
    this.state.weaponLevels = [0, 0, 0, 0]; // Reset weapon levels
    this.state.player = new Player(this.p, this.p.width / 2, this.p.height - 100, 60, 40, this.state.weaponLevels);
    this.state.enemies = [];
    this.state.bullets = [];
    this.state.enemyBullets = [];
    this.state.score = 0;
    this.state.gold = 0;
    this.state.enemiesDestroyed = 0;
    this.state.bossActive = false;
    this.state.lastBossSpawn = 0;
    this.state.bossSpawnThreshold = 50;
    this.state.bossesDefeated = 0;
    this.state.bossKillCounter = 0;
    this.state.lastShotTime = 0;
    this.state.shootDelay = 300;
    this.state.lastEnemySpawnTime = 0;
    this.state.enemySpawnInterval = 1200;
    this.state.hitFlash = 0;
    this.state.backgroundParticles = [];
    this.state.gameOver = false;
    this.state.explosions = [];
    this.state.shieldOpacity = 0;
    this.state.powerUps = [];
    this.state.powerUpLastSpawnTime = 0;
    this.state.powerUpSpawnInterval = 10000;
    this.state.tripleShot = 0;
    this.state.speedBoost = 0;
    this.state.shopOpen = false;
    
    // Reset purchased status for weapons
    for (let item of this.state.shopItems) {
      if (item.type === 'weapon') {
        item.purchased = false;
      }
    }
    
    this.state.visualEffects = {
      screenShake: 0,
      screenShakeIntensity: 0,
      flashEffect: {
        active: false,
        color: this.p.color(255),
        alpha: 0,
        duration: 0
      },
      distortionEffect: {
        active: false,
        intensity: 0,
        duration: 0,
        centerX: 0,
        centerY: 0
      }
    };
  }
  
  gameOver() {
    if (!this.state.gameOver) {
      this.state.gameOver = true;
      
      // Create multiple explosions at player's ship
      for (let i = 0; i < 3; i++) {
        let explosion = new Explosion(
          this.p,
          this.state.player.x + this.p.random(-30, 30),
          this.state.player.y + this.p.random(-30, 30),
          this.p.random(30, 50),
          this.p.color(255, 100, 50, 200)
        );
        this.state.explosions.push(explosion);
      }
      
      // Add screen shake and flash
      this.triggerScreenShake(20, 60);
      this.triggerFlashEffect(this.p.color(255, 0, 0), 150, 60);
      
      // Play game over sound
      if (this.assets.gameOverSound) {
        try {
          this.assets.gameOverSound.play();
        } catch (error) {
          console.log("Error playing game over sound:", error);
        }
      }
      
      // Show game over toast
      toast.error(`Game Over! Score: ${this.state.score}`, {
        position: "top-center",
        duration: 5000,
      });
    }
  }
}
