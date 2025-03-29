
import { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../GameEngine';
import { showWeaponChangeToast, showWeaponUpgradeToast, showEnemyDefeatedToast } from '../utils/toastManager';
import { toast } from "@/hooks/use-toast";

export interface GameState {
  playerHealth: number;
  maxHealth: number;
  score: number;
  gold: number;
  enemiesDestroyed: number;
  bossesDefeated: number;
  shopOpen: boolean;
  shopItems: any[];
  gameStarted: boolean;
  gameOver: boolean;
  currentWeapon: number;
  weaponLevels: number[];
  previousWeapon?: number;
}

export const useGameState = (gameEngineRef: React.MutableRefObject<GameEngine | null>) => {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    playerHealth: 100,
    maxHealth: 100,
    score: 0,
    gold: 0,
    enemiesDestroyed: 0,
    bossesDefeated: 0,
    shopOpen: false,
    shopItems: [],
    gameStarted: false,
    gameOver: false,
    currentWeapon: 0,
    weaponLevels: [0, 0, 0, 0],
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
  const weaponNames = ["Standard Gun", "Shotgun", "Laser", "Plasma Cannon"];

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
        enemiesDestroyed: engine.state.enemiesDestroyed,
        bossesDefeated: engine.state.bossesDefeated,
        shopOpen: engine.state.shopOpen,
        shopItems: engine.state.shopItems,
        gameStarted: engine.state.gameStarted,
        gameOver: engine.state.gameOver,
        weaponLevels: engine.state.weaponLevels || [0, 0, 0, 0],
        previousWeapon: prevState.currentWeapon,
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
      showWeaponChangeToast(weaponNames[gameState.currentWeapon]);
    }
    
    // Check for weapon upgrade
    for (let i = 0; i < gameState.weaponLevels.length; i++) {
      if (gameState.weaponLevels[i] > prevState.weaponLevels[i] && gameState.weaponLevels[i] > 0) {
        showWeaponUpgradeToast(weaponNames[i], gameState.weaponLevels[i]);
        break;
      }
    }
    
    // Check for boss defeated
    if (gameState.bossesDefeated > prevState.bossesDefeated) {
      showEnemyDefeatedToast(true);
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
        description: "Use arrow keys to move and SPACE to shoot",
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
