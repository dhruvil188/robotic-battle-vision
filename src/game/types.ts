
import p5 from "p5";

export interface PlayerType {
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
  currentWeapon: number;
  moveLeft: () => void;
  moveRight: () => void;
  shoot: () => { bullet: BulletType; extraBullets?: BulletType[]; particles: ParticleType[] };
  switchWeapon: () => void;
  draw: () => void;
}

export interface EnemyType {
  x: number;
  y: number;
  r: number;
  speed: number;
  health: number;
  type: number;
  rotationAngle: number;
  pulseValue: number;
  isBoss?: boolean;
  maxHealth?: number;
  fireRate?: number;
  lastShotTime?: number;
  pattern?: number;
  update: () => boolean;
  shoot: () => BulletType | BulletType[];
  draw: () => void;
}

export interface BulletType {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  isPlayerBullet: boolean;
  damage?: number;
  update: () => ParticleType | null;
  draw: () => void;
}

export interface ParticleType {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: p5.Color;
  size: number;
  life: number;
  maxLife: number;
  update: () => void;
  draw: () => void;
  isDead: () => boolean;
}

export interface ExplosionType {
  x: number;
  y: number;
  size: number;
  color: p5.Color;
  particles: ParticleType[];
  life: number;
  update: () => void;
  draw: () => void;
  isDead: () => boolean;
}

export interface PowerUpType {
  x: number;
  y: number;
  r: number;
  speed: number;
  rotationAngle: number;
  type: number;
  update: () => void;
  draw: () => void;
}

export interface StarType {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  blinkRate: number;
  update: () => void;
  draw: () => void;
}

export interface ParallaxLayerType {
  img: p5.Image;
  speed: number;
  y: number;
  scale: number;
  update: () => void;
  draw: () => void;
}

export interface GameAssets {
  gameFont?: p5.Font;
  playerImg?: p5.Image;
  enemyImg?: p5.Image;
  bulletImg?: p5.Image;
  enemyBulletImg?: p5.Image;
  particleImg?: p5.Image;
  powerUpImg?: p5.Image;
  gameOverSound?: p5.SoundFile;
  shootSound?: p5.SoundFile;
  enemyHitSound?: p5.SoundFile;
  playerHitSound?: p5.SoundFile;
  powerUpSound?: p5.SoundFile;
  bossWarningSound?: p5.SoundFile;
}

export interface VisualEffects {
  screenShake: number;
  screenShakeIntensity: number;
  flashEffect: {
    active: boolean;
    color: p5.Color;
    alpha: number;
    duration: number;
  };
  distortionEffect: {
    active: boolean;
    intensity: number;
    duration: number;
    centerX: number;
    centerY: number;
  };
}

export interface ShopItem {
  name: string;
  description: string;
  price: number;
  type: 'weapon' | 'health' | 'upgrade';
  id: string;
  purchased?: boolean;
  upgradePrice?: number;
}

export interface GameState {
  player: PlayerType;
  enemies: EnemyType[];
  bullets: BulletType[];
  enemyBullets: BulletType[];
  score: number;
  gold: number;
  enemiesDestroyed: number;
  bossActive: boolean;
  lastBossSpawn: number;
  bossSpawnThreshold: number;
  bossesDefeated: number;
  bossKillCounter: number;
  lastShotTime: number;
  shootDelay: number;
  lastEnemySpawnTime: number;
  enemySpawnInterval: number;
  hitFlash: number;
  backgroundParticles: ParticleType[];
  gameStarted: boolean;
  gameOver: boolean;
  stars: StarType[];
  explosions: ExplosionType[];
  shieldOpacity: number;
  powerUps: PowerUpType[];
  powerUpLastSpawnTime: number;
  powerUpSpawnInterval: number;
  parallaxLayers: ParallaxLayerType[];
  tripleShot: number;
  speedBoost: number;
  visualEffects: VisualEffects;
  shopOpen: boolean;
  shopItems: ShopItem[];
  weaponLevels: number[]; // Array of levels for each weapon
}
