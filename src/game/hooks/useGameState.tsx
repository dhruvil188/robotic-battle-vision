
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
  
  // Weapon names array
  const weaponNames = ["Standard Gun", "Shotgun", "Laser", "Plasma Cannon"];

  // Update state from game engine
  const updateGameState = () => {
    if (!gameEngineRef.current?.state) return;
    
    const engine = gameEngineRef.current;
    
    setGameState(prevState => {
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
    
    if (gameEngineRef.current) {
      // Ensure game is stopped first
      if (gameEngineRef.current.state.gameOver) {
        gameEngineRef.current.resetGame();
      }
      
      // Start the game
      gameEngineRef.current.state.gameStarted = true;
      gameEngineRef.current.state.gameOver = false;
      
      // Ensure player is properly initialized
      if (!gameEngineRef.current.state.player) {
        console.log("Initializing player");
        gameEngineRef.current.resetGame();
      }
      
      // Show a toast notification
      toast({
        title: "Game Started!",
        description: "Use arrow keys to move and SPACE to shoot",
        duration: 3000,
      });
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isStartingRef.current = false;
      }, 500);
    }
  };
  
  const handleRestartGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resetGame();
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
