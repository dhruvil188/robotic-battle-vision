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
import { toast } from "sonner";

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
  const [weaponLevels, setWeaponLevels] = useState([0, 0, 0, 0]); // Levels for all weapons
  
  // Controls tooltip shown state
  const [controlsShown, setControlsShown] = useState(false);
  
  // Weapon names array
  const weaponNames = ["Standard Gun", "Shotgun", "Laser", "Plasma Cannon"];

  // Show controls tooltip when game starts
  useEffect(() => {
    if (gameStarted && !controlsShown) {
      setControlsShown(true);
      
      // Show toast notifications for controls
      toast.info("Press W to switch weapons", {
        position: "bottom-center",
        duration: 5000,
      });
      
      setTimeout(() => {
        toast.info("Press S to open the shop", {
          position: "bottom-center",
          duration: 5000,
        });
      }, 6000);
    }
  }, [gameStarted, controlsShown]);
  
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
            setWeaponLevels(gameEngine.state.weaponLevels || [0, 0, 0, 0]);
            
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
      setControlsShown(false); // Reset controls shown flag
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
        {/* Canvas Container - This is where p5 will render the game */}
        <div ref={p5ContainerRef} className="w-full h-full" />
        
        {/* Custom UI Overlay - Only visible when game is active */}
        {gameStarted && !gameOver && (
          <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-50">
            <div className="flex flex-col justify-between h-[calc(100vh-2rem)] max-w-7xl mx-auto">
              {/* Top row with health, score, and weapon indicator */}
              <div className="flex justify-between items-start">
                <div className="pointer-events-auto">
                  <HealthBar health={playerHealth} maxHealth={maxHealth} />
                </div>
                
                <div className="pointer-events-auto flex items-start gap-4">
                  <WeaponIndicator 
                    currentWeapon={currentWeapon} 
                    weaponNames={weaponNames} 
                    weaponLevels={weaponLevels}
                  />
                  <ScoreDisplay 
                    score={score} 
                    gold={gold} 
                    onShopOpen={handleToggleShop} 
                  />
                </div>
              </div>
              
              {/* Controls legend (shows at game start) */}
              {gameStarted && !gameOver && controlsShown && (
                <div className="self-end pointer-events-auto mb-16 mr-4">
                  <div className="bg-black/80 p-2 rounded-lg border border-gray-700 text-sm text-gray-300 opacity-80">
                    <div><span className="text-white font-bold">W</span>: Switch Weapon</div>
                    <div><span className="text-white font-bold">S</span>: Open Shop</div>
                    <div><span className="text-white font-bold">Space</span>: Shoot</div>
                  </div>
                </div>
              )}
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
