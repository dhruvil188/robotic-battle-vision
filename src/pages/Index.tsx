
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import p5 from "p5";
import { GameEngine } from "../game/GameEngine";
import HealthBar from "../game/ui/HealthBar";
import ScoreDisplay from "../game/ui/ScoreDisplay";
import ShopInterface from "../game/ui/ShopInterface";
import GameOverScreen from "../game/ui/GameOverScreen";
import GameStartScreen from "../game/ui/GameStartScreen";
import WeaponIndicator from "../game/ui/WeaponIndicator";

const Index = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  
  // Game state
  const [playerHealth, setPlayerHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [gold, setGold] = useState(0);
  const [enemiesDestroyed, setEnemiesDestroyed] = useState(0);
  const [bossesDefeated, setBossesDefeated] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopItems, setShopItems] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentWeapon, setCurrentWeapon] = useState(0);
  
  // Weapon names array
  const weaponNames = ["Standard Gun", "Shotgun", "Laser", "Plasma Cannon"];
  
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
          if (gameEngine.state) {
            setPlayerHealth(gameEngine.state.player?.health || 0);
            setMaxHealth(100); // Assuming max health is 100
            setScore(gameEngine.state.score);
            setGold(gameEngine.state.gold);
            setEnemiesDestroyed(gameEngine.state.enemiesDestroyed);
            setBossesDefeated(gameEngine.state.bossesDefeated);
            setShopOpen(gameEngine.state.shopOpen);
            setShopItems(gameEngine.state.shopItems);
            setGameStarted(gameEngine.state.gameStarted);
            setGameOver(gameEngine.state.gameOver);
            
            if (gameEngine.state.player) {
              setCurrentWeapon(gameEngine.state.player.currentWeapon);
            }
          }
        };
        
        p.windowResized = () => {
          p.resizeCanvas(window.innerWidth, window.innerHeight);
          gameEngine.windowResized();
        };
        
        p.keyReleased = () => {
          return gameEngine.keyReleased(p.keyCode);
        };
      };
      
      myP5 = new p5(sketch, p5ContainerRef.current);
    }
    
    return () => {
      myP5?.remove();
    };
  }, []);

  // Handle shop toggle
  const handleToggleShop = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.state.shopOpen = !shopOpen;
    }
  };
  
  // Handle buying shop items
  const handleBuyItem = (index: number) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.buyShopItem(index);
    }
  };
  
  // Handle game start
  const handleStartGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.state.gameStarted = true;
    }
  };
  
  // Handle game restart
  const handleRestartGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resetGame();
    }
  };

  return (
    <motion.div 
      className="w-full min-h-screen bg-black flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div ref={gameContainerRef} className="w-full h-screen overflow-hidden relative">
        <div ref={p5ContainerRef} className="w-full h-full" />
        
        {/* Game UI Overlay */}
        {gameStarted && !gameOver && (
          <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-10">
            <div className="flex flex-col justify-between h-[calc(100vh-2rem)] max-w-7xl mx-auto">
              {/* Top row with health, score and gold */}
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
                <WeaponIndicator currentWeapon={currentWeapon} weaponNames={weaponNames} />
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
            enemiesDestroyed={enemiesDestroyed}
            bossesDefeated={bossesDefeated}
            onRestart={handleRestartGame}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Index;
