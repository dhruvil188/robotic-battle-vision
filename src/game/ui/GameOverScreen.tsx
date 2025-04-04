
import React from 'react';
import { motion } from 'framer-motion';
import { Star, RotateCw } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  enemiesDestroyed: number;
  bossesDefeated: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
  score, 
  enemiesDestroyed, 
  bossesDefeated,
  onRestart 
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <motion.div 
        className="bg-gray-900 border border-red-900 rounded-xl p-8 max-w-md w-full shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <motion.div 
          className="text-red-500 text-center font-bold text-5xl mb-6"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          GAME OVER
        </motion.div>
        
        <div className="space-y-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <span className="text-gray-300">FINAL SCORE</span>
            <span className="text-white font-bold text-xl">{score.toLocaleString()}</span>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <span className="text-gray-300">ENEMIES DESTROYED</span>
            <span className="text-white font-bold text-xl">{enemiesDestroyed}</span>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <span className="text-gray-300">BOSSES DEFEATED</span>
            <span className="text-white font-bold text-xl">{bossesDefeated}</span>
          </div>
        </div>
        
        <motion.button
          className="bg-red-600 hover:bg-red-500 text-white font-bold w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          onClick={onRestart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCw size={18} />
          <span>PLAY AGAIN</span>
        </motion.button>
        
        <div className="text-center text-gray-500 mt-4">Press ENTER to restart</div>
      </motion.div>
    </div>
  );
};

export default GameOverScreen;
