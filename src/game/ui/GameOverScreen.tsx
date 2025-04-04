
import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Skull } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  zombiesKilled: number;
  enemiesDestroyed?: number; // Add as optional for backward compatibility
  bossesDefeated: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  zombiesKilled,
  enemiesDestroyed, // Can accept this prop too now
  bossesDefeated,
  onRestart,
}) => {
  // Use enemiesDestroyed if provided, otherwise fall back to zombiesKilled
  const totalZombiesKilled = enemiesDestroyed !== undefined ? enemiesDestroyed : zombiesKilled;

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
      <motion.div 
        className="text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex justify-center"
          animate={{ 
            rotate: [0, 5, 0, -5, 0],
            scale: [1, 1.05, 1, 1.05, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Skull className="text-red-600 w-24 h-24" />
        </motion.div>
        
        <motion.h1 
          className="text-6xl font-bold text-red-600 my-6"
          animate={{ 
            textShadow: [
              "0 0 5px rgba(220, 38, 38, 0.5)", 
              "0 0 20px rgba(220, 38, 38, 0.8)", 
              "0 0 5px rgba(220, 38, 38, 0.5)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          GAME OVER
        </motion.h1>
      </motion.div>
      
      <motion.div 
        className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl my-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <div className="space-y-4 text-center">
          <div className="text-2xl font-bold text-white">FINAL STATS</div>
          
          <div className="bg-gray-800/80 rounded-lg p-4">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
              <span className="text-gray-400">Score</span>
              <span className="text-2xl font-bold text-yellow-500">{score}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
              <span className="text-gray-400">Zombies Killed</span>
              <span className="text-xl font-semibold text-green-500">{totalZombiesKilled}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Bosses Defeated</span>
              <span className="text-xl font-semibold text-purple-500">{bossesDefeated}</span>
            </div>
          </div>
          
          <motion.button
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold w-full py-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            onClick={onRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="text-white" size={20} />
            <span className="text-xl">PLAY AGAIN</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameOverScreen;
