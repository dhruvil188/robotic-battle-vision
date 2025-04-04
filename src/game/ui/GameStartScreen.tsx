
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Info, Settings } from 'lucide-react';

interface GameStartScreenProps {
  onStart: () => void;
}

const GameStartScreen: React.FC<GameStartScreenProps> = ({ onStart }) => {
  // Handle keyboard input directly in the component
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onStart();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onStart]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <motion.div 
        className="text-center mb-12"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.h1 
          className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
          animate={{ 
            textShadow: [
              "0 0 5px rgba(59, 130, 246, 0.5)", 
              "0 0 20px rgba(59, 130, 246, 0.8)", 
              "0 0 5px rgba(59, 130, 246, 0.5)"
            ] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          SPACE SHOOTER
        </motion.h1>
        <motion.div 
          className="text-gray-400 mt-2 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Are you ready for the challenge?
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
      >
        <motion.button
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold w-full py-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-6"
          onClick={onStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Star className="text-yellow-300" size={20} />
          <span className="text-xl">START GAME</span>
        </motion.button>
        
        <div className="space-y-4 mb-4">
          <div className="bg-gray-800/70 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
              <Info size={18} />
              <span>CONTROLS</span>
            </div>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Arrow keys to move ship</li>
              <li>• SPACE to shoot</li>
              <li>• W to change weapons</li>
              <li>• S to open shop</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/70 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-400 font-semibold mb-2">
              <Settings size={18} />
              <span>TIPS</span>
            </div>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Collect gold to buy upgrades</li>
              <li>• Watch out for boss enemies</li>
              <li>• Different weapons work better against different enemies</li>
            </ul>
          </div>
        </div>
        
        <div className="text-center text-gray-500 mt-2">Press ENTER to start</div>
      </motion.div>
      
      <motion.div 
        className="text-gray-600 mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div>© 2023 Space Shooter</div>
        <div className="text-sm">Made with ♥ by Lovable</div>
      </motion.div>
    </div>
  );
};

export default GameStartScreen;
