
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import p5 from "p5";
import { GameEngine } from "../game/GameEngine";

const Index = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let myP5: p5;
    let gameEngine: GameEngine;
    
    if (p5ContainerRef.current) {
      const sketch = (p: p5) => {
        gameEngine = new GameEngine(p);
        
        p.preload = () => {
          gameEngine.preload();
        };
        
        p.setup = () => {
          p.createCanvas(window.innerWidth, window.innerHeight);
          gameEngine.setup();
        };
        
        p.draw = () => {
          gameEngine.update();
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

  return (
    <motion.div 
      className="w-full min-h-screen bg-black flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div ref={gameContainerRef} className="w-full h-screen overflow-hidden">
        <div ref={p5ContainerRef} className="w-full h-full" />
      </div>
    </motion.div>
  );
};

export default Index;
