import { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../GameEngine';
import { toast } from "@/hooks/use-toast";

export interface GameState {
  playerHealth: number;
  maxHealth: number;
  score: number;
  gold: number;
  zombiesKilled: number;
  enemiesDestroyed: number;
  bossesDefeated: number;
  baseHealth: number;
  maxBaseHealth: number;
  shopOpen: boolean;
  shopItems: any[];
  gameStarted: boolean;
  gameOver: boolean;
  currentWeapon: number;
  weaponLevels: number[];
  ammo: number;
  maxAmmo: number;
  wave: number;
}

export const useGameState = (gameEngineRef: React.MutableRefObject<GameEngine | null>) => {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    playerHealth: 100,
    maxHealth: 100,
    score: 0,
    gold: 0,
    zombiesKilled: 0,
    enemiesDestroyed: 0,
    bossesDefeated: 0,
    baseHealth: 100,
    maxBaseHealth: 100,
    shopOpen: false,
    shopItems: [],
    gameStarted: false,
    gameOver: false,
    currentWeapon: 0,
    weaponLevels: [1, 0, 0],
    ammo: 30,
    maxAmmo: 30,
    wave: 1
  });

  // Previous state for comparisons
  const prevStateRef = useRef<GameState>({
    ...gameState
  });
  
  // Flag to prevent multiple start attempts
  const isStartingRef = useRef(false);
  // Track if the game engine is being initialized
  const isInitializingRef = useRef(false);
  
  // Weapon names array
  const weaponNames = ["Pistol", "Shotgun", "Assault Rifle"];

  // Update state from game engine
  const updateGameState = () => {
    if (!gameEngineRef.current?.state) return;
    
    const engine = gameEngineRef.current;
    
    // If we're in the process of starting the game, don't update state yet
    if (isInitializingRef.current) return;
    
    setGameState(prevState => {
      // Make a copy of the previous state
      const newState = {
        ...prevState,
        playerHealth: engine.state.player?.health || 0,
        maxHealth: 100,
        score: engine.state.score,
        gold: engine.state.gold,
        zombiesKilled: engine.state.zombiesKilled,
        enemiesDestroyed: engine.state.zombiesKilled,
        bossesDefeated: engine.state.bossesDefeated,
        baseHealth: engine.state.baseHealth,
        maxBaseHealth: engine.state.maxBaseHealth,
        shopOpen: engine.state.shopOpen,
        shopItems: engine.state.shopItems,
        gameStarted: engine.state.gameStarted,
        gameOver: engine.state.gameOver,
        weaponLevels: engine.state.weaponLevels || [1, 0, 0],
        ammo: engine.state.ammo,
        maxAmmo: engine.state.maxAmmo,
        wave: engine.state.wave
      };
      
      if (engine.state.player) {
        newState.currentWeapon = engine.state.player.currentWeapon;
      }
      
      return newState;
    });
  };

  // Check for changes and show toasts
  useEffect(() => {
    const prevState = prevStateRef.current;
    
    // Check for weapon change
    if (gameState.currentWeapon !== prevState.currentWeapon && gameState.gameStarted) {
      toast({
        title: "Weapon Changed",
        description: `Switched to ${weaponNames[gameState.currentWeapon]}`,
        duration: 2000,
      });
    }
    
    // Check for weapon upgrade
    for (let i = 0; i < gameState.weaponLevels.length; i++) {
      if (gameState.weaponLevels[i] > prevState.weaponLevels[i] && gameState.weaponLevels[i] > 0) {
        toast({
          title: "Weapon Upgraded",
          description: `${weaponNames[i]} upgraded to level ${gameState.weaponLevels[i]}`,
          duration: 2000,
        });
        break;
      }
    }
    
    // Check for wave change
    if (gameState.wave > prevState.wave) {
      toast({
        title: "New Wave",
        description: `Wave ${gameState.wave} incoming!`,
        variant: "destructive",
        duration: 3000,
      });
    }
    
    // Check for boss defeated
    if (gameState.bossesDefeated > prevState.bossesDefeated) {
      toast({
        title: "Boss Defeated",
        description: "You've taken down a boss zombie!",
        duration: 3000,
      });
    }
    
    // Update previous state reference
    prevStateRef.current = gameState;
  }, [gameState]);

  // Game action handlers
  const handleToggleShop = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.state.shopOpen = !gameState.shopOpen;
    }
  };
  
  const handleBuyItem = (index: number) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.buyShopItem(index);
    }
  };
  
  const handleStartGame = () => {
    // Prevent multiple start attempts
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    isInitializingRef.current = true;
    
    // Log that we're starting the game
    console.log("Starting game...");
    
    if (gameEngineRef.current) {
      // Reset the game regardless of current state to ensure clean start
      gameEngineRef.current.resetGame();
      
      // Set game states explicitly
      gameEngineRef.current.state.gameStarted = true;
      gameEngineRef.current.state.gameOver = false;
      
      // Show a toast notification
      toast({
        title: "Game Started!",
        description: "Use mouse to aim and click to shoot. Defend your base!",
        duration: 3000,
      });
      
      // Allow state updates after a short delay
      setTimeout(() => {
        isInitializingRef.current = false;
        console.log("Game started successfully");
        
        // Reset the start flag after a longer delay to prevent rapid restarts
        setTimeout(() => {
          isStartingRef.current = false;
        }, 1000);
      }, 100);
    } else {
      console.error("Game engine not initialized");
      isStartingRef.current = false;
      isInitializingRef.current = false;
    }
  };
  
  const handleRestartGame = () => {
    // Prevent rapid restart if already starting
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    
    if (gameEngineRef.current) {
      // Reset the game
      gameEngineRef.current.resetGame();
      
      // Reset the flag after a delay
      setTimeout(() => {
        isStartingRef.current = false;
      }, 1000);
    }
  };

  return {
    gameState,
    updateGameState,
    handleToggleShop,
    handleBuyItem,
    handleStartGame,
    handleRestartGame,
    weaponNames
  };
};
