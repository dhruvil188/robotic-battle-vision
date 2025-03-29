import p5 from "p5";
import { toast } from "sonner";

class Soldier {
  x: number;
  y: number;
  size: number;
  angle: number;
  health: number;
  currentWeapon: number;
  reloadTime: number;
  private p: p5;

  constructor(p: p5, x: number, y: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.size = 30;
    this.angle = 0;
    this.health = 100;
    this.currentWeapon = 0;
    this.reloadTime = 0;
  }

  update(mouseX: number, mouseY: number) {
    // Calculate angle to mouse position
    this.angle = this.p.atan2(mouseY - this.y, mouseX - this.x);
    
    // Update reload time
    if (this.reloadTime > 0) {
      this.reloadTime--;
    }
  }

  draw() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.angle);
    
    // Draw soldier body
    this.p.fill(50, 100, 50);
    this.p.ellipse(0, 0, this.size, this.size);
    
    // Draw soldier gun
    this.p.fill(100);
    this.p.rect(this.size / 2, -5, this.size, 10);
    
    this.p.pop();
  }

  shoot(zombies: Zombie[], bullets: Bullet[], weaponLevels: number[], damage: number): boolean {
    if (this.reloadTime > 0) return false;
    
    const weaponSpread = [0.1, 0.3, 0.05]; // Accuracy for each weapon
    const weaponReloadTime = [10, 25, 5]; // Reload time for each weapon
    const bulletCount = [1, 5, 1]; // Bullets per shot
    
    this.reloadTime = Math.max(5, weaponReloadTime[this.currentWeapon] - (weaponLevels[this.currentWeapon] * 2));
    
    // Create bullets based on weapon type
    for (let i = 0; i < bulletCount[this.currentWeapon]; i++) {
      const spread = weaponSpread[this.currentWeapon] * (1 - weaponLevels[this.currentWeapon] * 0.15);
      const angle = this.angle + this.p.random(-spread, spread);
      
      const vx = this.p.cos(angle) * 10;
      const vy = this.p.sin(angle) * 10;
      
      const bullet = new Bullet(
        this.p,
        this.x + this.p.cos(this.angle) * this.size,
        this.y + this.p.sin(this.angle) * this.size,
        vx,
        vy,
        damage
      );
      
      bullets.push(bullet);
    }
    
    return true;
  }

  switchWeapon() {
    this.currentWeapon = (this.currentWeapon + 1) % 3;
  }
}

class Zombie {
  x: number;
  y: number;
  size: number;
  speed: number;
  health: number;
  maxHealth: number;
  angle: number;
  type: number;
  isBoss: boolean;
  targetX: number;
  targetY: number;
  private p: p5;

  constructor(p: p5, x: number, y: number, targetX: number, targetY: number, type: number = 0, isBoss: boolean = false) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.type = type;
    this.isBoss = isBoss;
    
    // Set attributes based on type
    if (isBoss) {
      this.size = 60;
      this.speed = 0.6;
      this.health = 300;
      this.maxHealth = 300;
    } else if (type === 0) { // Regular zombie
      this.size = 25;
      this.speed = 1;
      this.health = 30;
      this.maxHealth = 30;
    } else if (type === 1) { // Fast zombie
      this.size = 20;
      this.speed = 2;
      this.health = 15;
      this.maxHealth = 15;
    } else if (type === 2) { // Tanky zombie
      this.size = 35;
      this.speed = 0.7;
      this.health = 60;
      this.maxHealth = 60;
    }
    
    // Calculate angle to target
    this.angle = this.p.atan2(targetY - y, targetX - x);
  }

  update(): boolean {
    // Move toward target
    this.x += this.p.cos(this.angle) * this.speed;
    this.y += this.p.sin(this.angle) * this.speed;
    
    // Recalculate angle to target (slight tracking)
    const newAngle = this.p.atan2(this.targetY - this.y, this.targetX - this.x);
    this.angle = this.p.lerp(this.angle, newAngle, 0.05);
    
    // Check if reached target
    const distToTarget = this.p.dist(this.x, this.y, this.targetX, this.targetY);
    return distToTarget < 50;
  }

  draw() {
    this.p.push();
    this.p.translate(this.x, this.y);
    
    // Draw health bar
    const healthPct = this.health / this.maxHealth;
    this.p.fill(255, 0, 0);
    this.p.rect(-this.size/2, -this.size/2 - 10, this.size, 5);
    this.p.fill(0, 255, 0);
    this.p.rect(-this.size/2, -this.size/2 - 10, this.size * healthPct, 5);
    
    // Draw zombie body based on type
    if (this.isBoss) {
      this.p.fill(150, 30, 30);
    } else if (this.type === 0) {
      this.p.fill(100, 150, 100);
    } else if (this.type === 1) {
      this.p.fill(200, 150, 100);
    } else if (this.type === 2) {
      this.p.fill(50, 100, 50);
    }
    
    this.p.ellipse(0, 0, this.size, this.size);
    
    // Draw face direction
    this.p.rotate(this.angle);
    this.p.fill(0);
    this.p.ellipse(this.size/3, -this.size/5, 5, 5);
    this.p.ellipse(this.size/3, this.size/5, 5, 5);
    
    this.p.pop();
  }

  takeDamage(damage: number): boolean {
    this.health -= damage;
    return this.health <= 0;
  }
}

class Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  private p: p5;

  constructor(p: p5, x: number, y: number, vx: number, vy: number, damage: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
  }

  update(): boolean {
    this.x += this.vx;
    this.y += this.vy;
    
    // Check if bullet is out of bounds
    return (
      this.x < 0 ||
      this.x > this.p.width ||
      this.y < 0 ||
      this.y > this.p.height
    );
  }

  draw() {
    this.p.fill(255, 255, 100);
    this.p.ellipse(this.x, this.y, 5, 5);
  }
}

class Base {
  x: number;
  y: number;
  size: number;
  health: number;
  maxHealth: number;
  private p: p5;

  constructor(p: p5, x: number, y: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.size = 100;
    this.health = 100;
    this.maxHealth = 100;
  }

  draw() {
    // Draw base health bar
    const healthPct = this.health / this.maxHealth;
    this.p.fill(100);
    this.p.rect(this.x - 50, this.y - 80, 100, 10);
    this.p.fill(
      this.p.map(healthPct, 0, 1, 255, 0),
      this.p.map(healthPct, 0, 1, 0, 255),
      0
    );
    this.p.rect(this.x - 50, this.y - 80, 100 * healthPct, 10);
    
    // Draw base structure
    this.p.fill(150);
    this.p.ellipse(this.x, this.y, this.size, this.size);
    
    // Draw sandbags around base
    this.p.fill(200, 180, 120);
    for (let i = 0; i < 8; i++) {
      const angle = i * this.p.TWO_PI / 8;
      const bagX = this.x + this.p.cos(angle) * this.size/2;
      const bagY = this.y + this.p.sin(angle) * this.size/2;
      this.p.ellipse(bagX, bagY, 30, 20);
    }
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    return this.health <= 0;
  }

  repair(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: p5.Color;
  private p: p5;
  
  constructor(p: p5, x: number, y: number, vx: number, vy: number, color: p5.Color, size: number, life: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.color = color;
  }
  
  update(): boolean {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    return this.life <= 0;
  }
  
  draw() {
    const alpha = this.p.map(this.life, 0, this.maxLife, 0, 255);
    this.p.fill(
      this.p.red(this.color),
      this.p.green(this.color),
      this.p.blue(this.color),
      alpha
    );
    this.p.noStroke();
    this.p.ellipse(this.x, this.y, this.size, this.size);
  }
}

export class GameEngine {
  private p: p5;
  public state: any;
  private base: Base;
  private soldier: Soldier;
  private zombies: Zombie[];
  private bullets: Bullet[];
  private particles: Particle[];
  
  constructor(p: p5) {
    this.p = p;
    
    // Initialize game state
    this.state = {
      player: null,
      zombies: [],
      bullets: [],
      score: 0,
      gold: 0,
      baseHealth: 100,
      maxBaseHealth: 100,
      zombiesKilled: 0,
      bossesDefeated: 0,
      lastSpawnTime: 0,
      spawnInterval: 2000,
      wave: 1,
      zombiesPerWave: 10,
      zombiesRemaining: 10,
      waveActive: false,
      waveCompleteTime: 0,
      betweenWaves: false,
      shopOpen: false,
      gameStarted: false,
      gameOver: false,
      shopItems: [
        {
          id: 'repair',
          name: 'Repair Base',
          description: 'Restore 25 base health',
          price: 10,
          type: 'repair'
        },
        {
          id: 'shotgun',
          name: 'Shotgun',
          description: 'Wide spread, good for crowds',
          price: 50,
          type: 'weapon',
          purchased: false
        },
        {
          id: 'rifle',
          name: 'Assault Rifle',
          description: 'Fast firing, accurate weapon',
          price: 100,
          type: 'weapon',
          purchased: false
        },
        {
          id: 'ammo',
          name: 'Ammo Refill',
          description: 'Restore full ammo',
          price: 5,
          type: 'ammo'
        }
      ],
      weaponLevels: [1, 0, 0],
      ammo: 30,
      maxAmmo: 30
    };
    
    // Create base and soldier
    this.base = new Base(p, p.width / 2, p.height / 2);
    this.soldier = new Soldier(p, p.width / 2, p.height / 2);
    this.zombies = [];
    this.bullets = [];
    this.particles = [];
    
    // Set soldier as player in game state
    this.state.player = this.soldier;
  }
  
  preload() {
    // Load assets if needed
  }
  
  setup() {
    // Setup the game
    this.resetGame();
    
    // Toast notification
    toast.success("Game loaded! Press ENTER to start", {
      position: "bottom-center",
      duration: 3000,
    });
  }
  
  update() {
    if (!this.state.gameStarted) {
      // Draw background
      this.p.background(30, 40, 30);
      return;
    }
    
    if (this.state.gameOver) {
      // Draw game over screen
      this.p.background(30, 40, 30);
      this.p.fill(255, 0, 0);
      this.p.textSize(40);
      this.p.textAlign(this.p.CENTER);
      this.p.text("GAME OVER", this.p.width / 2, this.p.height / 2 - 40);
      this.p.fill(255);
      this.p.textSize(20);
      this.p.text(`Score: ${this.state.score}`, this.p.width / 2, this.p.height / 2 + 20);
      this.p.text(`Zombies Killed: ${this.state.zombiesKilled}`, this.p.width / 2, this.p.height / 2 + 50);
      this.p.textSize(16);
      this.p.text("Press ENTER to play again", this.p.width / 2, this.p.height / 2 + 100);
      
      // Check for ENTER key to restart
      if (this.p.keyIsDown(13)) {
        this.resetGame();
      }
      return;
    }
    
    // Clear background
    this.p.background(30, 40, 30);
    
    // If shop is open, draw shop and don't update game
    if (this.state.shopOpen) {
      this.drawShop();
      return;
    }
    
    // Update game state based on current wave
    this.updateWaveState();
    
    // Update soldier position based on mouse position
    this.soldier.update(this.p.mouseX, this.p.mouseY);
    
    // Handle mouse click shooting
    if (this.p.mouseIsPressed && this.state.ammo > 0) {
      const weaponDamage = [10, 6, 8];
      const didShoot = this.soldier.shoot(
        this.zombies, 
        this.bullets, 
        this.state.weaponLevels,
        weaponDamage[this.soldier.currentWeapon] * (1 + this.state.weaponLevels[this.soldier.currentWeapon] * 0.2)
      );
      
      if (didShoot) {
        // Reduce ammo
        this.state.ammo--;
        
        // Add muzzle flash particles
        this.createMuzzleFlash();
      }
    }
    
    // Handle keyboard input for weapon switching and reload
    this.handleInput();
    
    // Update bullets
    this.updateBullets();
    
    // Update zombies
    this.updateZombies();
    
    // Update particles
    this.updateParticles();
    
    // Check for collisions
    this.checkCollisions();
    
    // Draw everything
    this.drawGame();
    
    // Update UI state
    this.updateUIState();
  }
  
  updateWaveState() {
    // If between waves and waiting period is over, start next wave
    if (this.state.betweenWaves && this.p.millis() - this.state.waveCompleteTime > 5000) {
      this.startNextWave();
    }
    
    // If wave is active, spawn zombies
    if (this.state.waveActive && this.zombies.length < 20 && this.state.zombiesRemaining > 0) {
      if (this.p.millis() - this.state.lastSpawnTime > this.state.spawnInterval) {
        this.spawnZombie();
        this.state.lastSpawnTime = this.p.millis();
        this.state.zombiesRemaining--;
      }
    }
    
    // Check if wave is complete
    if (this.state.waveActive && this.state.zombiesRemaining === 0 && this.zombies.length === 0) {
      this.completeWave();
    }
  }
  
  startNextWave() {
    this.state.wave++;
    this.state.zombiesPerWave = Math.floor(10 + this.state.wave * 2);
    this.state.zombiesRemaining = this.state.zombiesPerWave;
    this.state.waveActive = true;
    this.state.betweenWaves = false;
    
    // Reduce spawn interval as waves progress, but not less than 500ms
    this.state.spawnInterval = Math.max(500, 2000 - this.state.wave * 100);
    
    // Show wave start message
    toast.info(`Wave ${this.state.wave} started!`, {
      position: "top-center",
      duration: 3000,
    });
    
    // Spawn a boss every 5 waves
    if (this.state.wave % 5 === 0) {
      this.spawnBossZombie();
      
      toast.error(`WARNING: Boss zombie approaching!`, {
        position: "top-center",
        duration: 4000,
      });
    }
  }
  
  completeWave() {
    this.state.waveActive = false;
    this.state.betweenWaves = true;
    this.state.waveCompleteTime = this.p.millis();
    
    // Award gold for completing wave
    const waveBonus = this.state.wave * 10;
    this.state.gold += waveBonus;
    
    // Show wave complete message
    toast.success(`Wave ${this.state.wave} complete! +${waveBonus} gold`, {
      position: "top-center",
      duration: 3000,
    });
  }
  
  handleInput() {
    // Switch weapons with number keys
    if (this.p.keyIsPressed) {
      if (this.p.key === '1') {
        this.soldier.currentWeapon = 0;
        this.p.keyIsPressed = false;
      } else if (this.p.key === '2' && this.state.shopItems[1].purchased) {
        this.soldier.currentWeapon = 1;
        this.p.keyIsPressed = false;
      } else if (this.p.key === '3' && this.state.shopItems[2].purchased) {
        this.soldier.currentWeapon = 2;
        this.p.keyIsPressed = false;
      }
      
      // Reload with R key
      if (this.p.key === 'r' || this.p.key === 'R') {
        const maxAmmo = [30, 20, 50];
        this.state.ammo = maxAmmo[this.soldier.currentWeapon];
        this.state.maxAmmo = maxAmmo[this.soldier.currentWeapon];
        this.p.keyIsPressed = false;
        
        // Show reload message
        toast.info(`Reloaded ${this.getWeaponName(this.soldier.currentWeapon)}`, {
          position: "bottom-center",
          duration: 1500,
        });
      }
      
      // Toggle shop with S key
      if (this.p.key === 's' || this.p.key === 'S') {
        // Only allow shop during between-wave periods
        if (this.state.betweenWaves) {
          this.state.shopOpen = !this.state.shopOpen;
          this.p.keyIsPressed = false;
        } else {
          toast.error("Shop only available between waves", {
            position: "bottom-center",
            duration: 2000,
          });
        }
      }
    }
  }
  
  getWeaponName(index: number): string {
    const weaponNames = ["Pistol", "Shotgun", "Assault Rifle"];
    return weaponNames[index];
  }
  
  updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const isOutOfBounds = this.bullets[i].update();
      this.bullets[i].draw();
      
      if (isOutOfBounds) {
        this.bullets.splice(i, 1);
      }
    }
  }
  
  updateZombies() {
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const reachedBase = this.zombies[i].update();
      
      if (reachedBase) {
        // Damage the base
        const damage = this.zombies[i].isBoss ? 20 : 5;
        const baseDestroyed = this.base.takeDamage(damage);
        
        // Update base health in state
        this.state.baseHealth = this.base.health;
        
        // Create blood particles
        this.createBloodSplatter(this.zombies[i].x, this.zombies[i].y);
        
        // Remove the zombie
        this.zombies.splice(i, 1);
        
        // Check if base destroyed
        if (baseDestroyed) {
          this.gameOver();
        }
      }
    }
  }
  
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const isDead = this.particles[i].update();
      this.particles[i].draw();
      
      if (isDead) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  checkCollisions() {
    // Check bullet-zombie collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      for (let j = this.zombies.length - 1; j >= 0; j--) {
        const distance = this.p.dist(
          this.bullets[i].x,
          this.bullets[i].y,
          this.zombies[j].x,
          this.zombies[j].y
        );
        
        if (distance < this.zombies[j].size / 2) {
          // Zombie hit by bullet
          const killed = this.zombies[j].takeDamage(this.bullets[i].damage);
          
          // Create hit particles
          this.createBulletImpact(this.bullets[i].x, this.bullets[i].y);
          
          // Remove bullet
          this.bullets.splice(i, 1);
          
          if (killed) {
            // Award points and gold
            const pointValue = this.zombies[j].isBoss ? 50 : 10;
            const goldValue = this.zombies[j].isBoss ? 20 : 1;
            
            this.state.score += pointValue;
            this.state.gold += goldValue;
            this.state.zombiesKilled++;
            
            if (this.zombies[j].isBoss) {
              this.state.bossesDefeated++;
            }
            
            // Create death particles
            this.createZombieDeathEffect(this.zombies[j].x, this.zombies[j].y, this.zombies[j].size);
            
            // Remove zombie
            this.zombies.splice(j, 1);
          }
          
          break; // Skip to next bullet
        }
      }
    }
  }
  
  drawGame() {
    // Draw ground texture
    this.p.fill(50, 60, 50);
    this.p.rect(0, 0, this.p.width, this.p.height);
    
    // Draw base
    this.base.draw();
    
    // Draw zombies
    for (const zombie of this.zombies) {
      zombie.draw();
    }
    
    // Draw soldier
    this.soldier.draw();
    
    // Draw UI
    this.drawUI();
  }
  
  drawUI() {
    // Draw ammo
    this.p.fill(255);
    this.p.textSize(20);
    this.p.textAlign(this.p.LEFT);
    this.p.text(`Ammo: ${this.state.ammo}/${this.state.maxAmmo}`, 20, 30);
    
    // Draw current weapon
    const weaponNames = ["Pistol", "Shotgun", "Assault Rifle"];
    this.p.text(`Weapon: ${weaponNames[this.soldier.currentWeapon]}`, 20, 60);
    
    // Draw score and gold
    this.p.textAlign(this.p.RIGHT);
    this.p.text(`Score: ${this.state.score}`, this.p.width - 20, 30);
    this.p.text(`Gold: ${this.state.gold}`, this.p.width - 20, 60);
    
    // Draw wave information
    this.p.textAlign(this.p.CENTER);
    this.p.text(`Wave ${this.state.wave}`, this.p.width / 2, 30);
    
    if (this.state.betweenWaves) {
      const timeLeft = Math.ceil((5000 - (this.p.millis() - this.state.waveCompleteTime)) / 1000);
      this.p.textSize(24);
      this.p.text(`Next wave in ${timeLeft}s`, this.p.width / 2, 70);
      this.p.textSize(18);
      this.p.text(`Press S to open shop`, this.p.width / 2, 100);
    } else {
      this.p.text(`Zombies left: ${this.state.zombiesRemaining + this.zombies.length}`, this.p.width / 2, 60);
    }
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
      if (item.type === 'weapon') {
        if (item.purchased) {
          this.p.fill(0, 255, 0);
          this.p.text("Purchased", this.p.width / 2 + 180, y + 50);
          this.p.text(`Level ${this.state.weaponLevels[i]}`, this.p.width / 2 + 180, y + 70);
        } else {
          this.p.fill(30, 144, 255);
          this.p.text("Available", this.p.width / 2 + 180, y + 50);
        }
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
    this.p.text("Press 1-4 to purchase items, S to close shop", this.p.width / 2, this.p.height - 50);
    
    // Handle shop keypresses
    if (this.p.keyIsPressed) {
      const keyNum = parseInt(this.p.key);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= this.state.shopItems.length) {
        this.p.keyIsPressed = false; // Reset to prevent multiple purchases
        this.buyShopItem(keyNum - 1);
      }
    }
  }
  
  spawnZombie() {
    // Determine spawn position (from edge of screen)
    let x, y;
    const edge = this.p.random(4); // 0: top, 1: right, 2: bottom, 3: left
    
    if (edge < 1) { // Top
      x = this.p.random(this.p.width);
      y = -30;
    } else if (edge < 2) { // Right
      x = this.p.width + 30;
      y = this.p.random(this.p.height);
    } else if (edge < 3) { // Bottom
      x = this.p.random(this.p.width);
      y = this.p.height + 30;
    } else { // Left
      x = -30;
      y = this.p.random(this.p.height);
    }
    
    // Determine zombie type (more difficult types as waves progress)
    let type = 0;
    const typeRoll = this.p.random();
    
    if (this.state.wave >= 10) {
      if (typeRoll < 0.3) type = 0; // 30% regular
      else if (typeRoll < 0.6) type = 1; // 30% fast
      else type = 2; // 40% tanky
    } else if (this.state.wave >= 5) {
      if (typeRoll < 0.5) type = 0; // 50% regular
      else if (typeRoll < 0.8) type = 1; // 30% fast
      else type = 2; // 20% tanky
    } else if (this.state.wave >= 3) {
      if (typeRoll < 0.7) type = 0; // 70% regular
      else if (typeRoll < 0.9) type = 1; // 20% fast
      else type = 2; // 10% tanky
    } else {
      type = 0; // 100% regular for early waves
    }
    
    const zombie = new Zombie(
      this.p,
      x,
      y,
      this.base.x,
      this.base.y,
      type
    );
    
    this.zombies.push(zombie);
  }
  
  spawnBossZombie() {
    // Spawn boss from random edge
    let x, y;
    const edge = this.p.random(4); // 0: top, 1: right, 2: bottom, 3: left
    
    if (edge < 1) { // Top
      x = this.p.width / 2;
      y = -50;
    } else if (edge < 2) { // Right
      x = this.p.width + 50;
      y = this.p.height / 2;
    } else if (edge < 3) { // Bottom
      x = this.p.width / 2;
      y = this.p.height + 50;
    } else { // Left
      x = -50;
      y = this.p.height / 2;
    }
    
    const boss = new Zombie(
      this.p,
      x,
      y,
      this.base.x,
      this.base.y,
      0, // Type doesn't matter for boss
      true // isBoss = true
    );
    
    this.zombies.push(boss);
  }
  
  createBulletImpact(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      const particle = new Particle(
        this.p,
        x,
        y,
        this.p.random(-2, 2),
        this.p.random(-2, 2),
        this.p.color(255, 200, 0),
        this.p.random(3, 6),
        this.p.random(10, 20)
      );
      
      this.particles.push(particle);
    }
  }
  
  createZombieDeathEffect(x: number, y: number, size: number) {
    const particleCount = size / 2;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new Particle(
        this.p,
        x + this.p.random(-size/2, size/2),
        y + this.p.random(-size/2, size/2),
        this.p.random(-3, 3),
        this.p.random(-3, 3),
        this.p.color(0, 100, 0),
        this.p.random(3, 8),
        this.p.random(20, 40)
      );
      
      this.particles.push(particle);
    }
    
    // Add blood particles
    this.createBloodSplatter(x, y);
  }
  
  createBloodSplatter(x: number, y: number) {
    for (let i = 0; i < 15; i++) {
      const particle = new Particle(
        this.p,
        x,
        y,
        this.p.random(-3, 3),
        this.p.random(-3, 3),
        this.p.color(150, 0, 0),
        this.p.random(3, 8),
        this.p.random(30, 60)
      );
      
      this.particles.push(particle);
    }
  }
  
  createMuzzleFlash() {
    const muzzleX = this.soldier.x + this.p.cos(this.soldier.angle) * this.soldier.size;
    const muzzleY = this.soldier.y + this.p.sin(this.soldier.angle) * this.soldier.size;
    
    for (let i = 0; i < 5; i++) {
      const particle = new Particle(
        this.p,
        muzzleX,
        muzzleY,
        this.p.cos(this.soldier.angle) * this.p.random(1, 3) + this.p.random(-1, 1),
        this.p.sin(this.soldier.angle) * this.p.random(1, 3) + this.p.random(-1, 1),
        this.p.color(255, 200, 0),
        this.p.random(3, 8),
        this.p.random(5, 10)
      );
      
      this.particles.push(particle);
    }
  }
  
  buyShopItem(index: number) {
    const item = this.state.shopItems[index];
    
    // Check if player has enough gold
    if (this.state.gold < item.price) {
      toast.error(`Not enough gold! You need ${item.price} gold.`, {
        position: "bottom-center",
        duration: 2000,
      });
      return;
    }
    
    // Process purchase based on item type
    if (item.type === 'repair') {
      this.base.repair(25);
      this.state.baseHealth = this.base.health;
      this.state.gold -= item.price;
      
      toast.success(`Base repaired! Health: ${this.state.baseHealth}`, {
        position: "bottom-center",
        duration: 1500,
      });
    }
    else if (item.type === 'weapon') {
      if (item.purchased) {
        // Upgrade weapon
        const weaponIndex = index;
        const currentLevel = this.state.weaponLevels[weaponIndex];
        
        // Max level check (5)
        if (currentLevel >= 5) {
          toast.info(`${item.name} is already at maximum level!`, {
            position: "bottom-center",
            duration: 2000,
          });
          return;
        }
        
        // Calculate upgrade price based on level
        const upgradePrice = item.price / 2 * (currentLevel + 1);
        
        // Check if player has enough gold for upgrade
        if (this.state.gold < upgradePrice) {
          toast.error(`Not enough gold! You need ${upgradePrice} gold.`, {
            position: "bottom-center",
            duration: 2000,
          });
          return;
        }
        
        // Apply the upgrade
        this.state.weaponLevels[weaponIndex]++;
        this.state.gold -= upgradePrice;
        
        toast.success(`${item.name} upgraded to Level ${this.state.weaponLevels[weaponIndex]}!`, {
          position: "bottom-center",
          duration: 2000,
        });
      } else {
        // Purchase new weapon
        item.purchased = true;
        this.state.gold -= item.price;
        
        // Set weapon level to 1
        const weaponIndex = index;
        this.state.weaponLevels[weaponIndex] = 1;
        
        // Switch to newly purchased weapon
        this.soldier.currentWeapon = weaponIndex;
        
        toast.success(`${item.name} purchased and equipped!`, {
          position: "bottom-center",
          duration: 2000,
        });
      }
    }
    else if (item.type === 'ammo') {
      // Reset ammo based on current weapon
      const maxAmmo = [30, 20, 50];
      this.state.ammo = maxAmmo[this.soldier.currentWeapon];
      this.state.maxAmmo = maxAmmo[this.soldier.currentWeapon];
      this.state.gold -= item.price;
      
      toast.success(`Ammo refilled!`, {
        position: "bottom-center",
        duration: 1500,
      });
    }
  }
  
  updateUIState() {
    // Update game state for UI
    this.state.baseHealth = this.base.health;
    this.state.player.health = this.soldier.health;
  }
  
  gameOver() {
    this.state.gameOver = true;
    
    // Show game over message
    toast.error(`Game Over! Final score: ${this.state.score}`, {
      position: "top-center",
      duration: 5000,
    });
  }
  
  resetGame() {
    // Reset base and soldier
    this.base = new Base(this.p, this.p.width / 2, this.p.height / 2);
    this.soldier = new Soldier(this.p, this.p.width / 2, this.p.height / 2);
    
    // Update player reference
    this.state.player = this.soldier;
    
    // Clear entities
    this.zombies = [];
    this.bullets = [];
    this.particles = [];
    
    // Reset game state
    this.state.score = 0;
    this.state.gold = 0;
    this.state.baseHealth = 100;
    this.state.maxBaseHealth = 100;
    this.state.zombiesKilled = 0;
    this.state.bossesDefeated = 0;
    this.state.wave = 1;
    this.state.zombiesPerWave = 10;
    this.state.zombiesRemaining = 10;
    this.state.waveActive = true;
    this.state.betweenWaves = false;
    this.state.shopOpen = false;
    this.state.gameOver = false;
    this.state.gameStarted = true;
    this.state.ammo = 30;
    this.state.maxAmmo = 30;
    
    // Reset weapon levels and purchases
    this.state.weaponLevels = [1, 0, 0];
    for (let item of this.state.shopItems) {
      if (item.type === 'weapon') {
        item.purchased = false;
      }
    }
  }
  
  windowResized() {
    // Handle window resize
    // Update base position to center
    this.base.x = this.p.width / 2;
    this.base.y = this.p.height / 2;
  }
  
  keyReleased(keyCode: number) {
    // Handle key released
    return true;
  }
}
