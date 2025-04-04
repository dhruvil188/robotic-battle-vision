
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import p5 from "p5";
import { GameEngine } from "../game/GameEngine";
import HealthBar from "../game/ui/HealthBar";
import ScoreDisplay from "../game/ui/ScoreDisplay";
import ShopInterface from "../game/ui/ShopInterface";
import GameOverScreen from "../game/ui/GameOverScreen";
import GameStartScreen from "../game/ui/GameStartScreen";
import WeaponIndicator from "../game/ui/WeaponIndicator";
import { useGameState } from "../game/hooks/useGameState";

const Index = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const keyHandlerInitializedRef = useRef(false);
  
  // Use our custom hook for game state management
  const { 
    gameState,
    updateGameState,
    handleToggleShop,
    handleBuyItem,
    handleStartGame,
    handleRestartGame,
    weaponNames
  } = useGameState(gameEngineRef);
  
  useEffect(() => {
    let myP5: p5;
    
    if (p5ContainerRef.current) {
      const sketch = (p: p5) => {
        const gameEngine = new GameEngine(p);
        gameEngineRef.current = gameEngine;
        
        p.preload = () => {
          gameEngine.preload();
        };
        
        p.setup = () => {
          p.createCanvas(window.innerWidth, window.innerHeight);
          gameEngine.setup();
        };
        
        p.draw = () => {
          gameEngine.update();
          
          // Update React state with game engine state
          updateGameState();
        };
        
        p.windowResized = () => {
          p.resizeCanvas(window.innerWidth, window.innerHeight);
          gameEngine.windowResized();
        };
        
        p.keyReleased = () => {
          return gameEngine.keyReleased(p.keyCode);
        };

        // Add keyPressed event handler to make controls more responsive
        p.keyPressed = () => {
          // Only handle ENTER key if not initialized yet
          if (!keyHandlerInitializedRef.current && p.keyCode === p.ENTER && !gameState.gameStarted) {
            handleStartGame();
            keyHandlerInitializedRef.current = true;
            
            // Reset after a delay
            setTimeout(() => {
              keyHandlerInitializedRef.current = false;
            }, 1000);
            
            return false; // Prevent default behavior
          }
          
          // Pass other key events to the game engine if game is started
          if (gameState.gameStarted && !gameState.gameOver) {
            // Allow default behavior for game keys
            return true;
          }
          
          return true; // Allow default behavior for other keys
        };
      };
      
      myP5 = new p5(sketch, p5ContainerRef.current);
    }
    
    // No additional event listeners needed here
    
    return () => {
      myP5?.remove();
    };
  }, [updateGameState, gameState.gameStarted, gameState.gameOver, handleStartGame]);

  const { 
    playerHealth, 
    maxHealth, 
    score, 
    gold, 
    zombiesKilled,
    bossesDefeated,
    shopOpen,
    shopItems,
    gameStarted,
    gameOver,
    currentWeapon,
    weaponLevels
  } = gameState;

  return (
    <motion.div 
      className="w-full min-h-screen bg-black flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div ref={gameContainerRef} className="w-full h-screen overflow-hidden relative">
        {/* Canvas Container - This is where p5 will render the game */}
        <div ref={p5ContainerRef} className="w-full h-full" />
        
        {/* Custom UI Overlay - Only visible when game is active */}
        {gameStarted && !gameOver && (
          <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-50">
            <div className="flex flex-col justify-between h-[calc(100vh-2rem)] max-w-7xl mx-auto">
              {/* Top row with health and score */}
              <div className="flex justify-between items-start">
                <div className="pointer-events-auto">
                  <HealthBar health={playerHealth} maxHealth={maxHealth} />
                </div>
                
                <div className="pointer-events-auto">
                  <ScoreDisplay 
                    score={score} 
                    gold={gold} 
                    onShopOpen={handleToggleShop} 
                  />
                </div>
              </div>
              
              {/* Bottom row with weapon indicator */}
              <div className="self-start pointer-events-auto mb-4">
                <WeaponIndicator 
                  currentWeapon={currentWeapon} 
                  weaponNames={weaponNames} 
                  weaponLevels={weaponLevels}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Shop Interface */}
        {shopOpen && (
          <ShopInterface 
            items={shopItems} 
            gold={gold} 
            onClose={handleToggleShop}
            onBuy={handleBuyItem}
            weaponLevels={weaponLevels}
          />
        )}
        
        {/* Game Start Screen */}
        {!gameStarted && (
          <GameStartScreen onStart={handleStartGame} />
        )}
        
        {/* Game Over Screen */}
        {gameOver && (
          <GameOverScreen 
            score={score}
            zombiesKilled={zombiesKilled}
            bossesDefeated={bossesDefeated}
            onRestart={handleRestartGame}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Index;
