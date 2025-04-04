
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Info, Settings } from 'lucide-react';

interface GameStartScreenProps {
  onStart: () => void;
}

const GameStartScreen: React.FC<GameStartScreenProps> = ({ onStart }) => {
  // Use a ref to track if we've already started
  const hasStartedRef = React.useRef(false);
  
  // Safe onStart handler to prevent multiple calls
  const handleStart = React.useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    
    // Call the onStart handler directly, no animation delay needed
    onStart();
    
    // Reset the flag after a short delay to prevent double-clicks
    setTimeout(() => {
      hasStartedRef.current = false;
    }, 1000);
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
          className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500"
          animate={{ 
            textShadow: [
              "0 0 5px rgba(220, 38, 38, 0.5)", 
              "0 0 20px rgba(220, 38, 38, 0.8)", 
              "0 0 5px rgba(220, 38, 38, 0.5)"
            ] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ZOMBIE DEFENSE
        </motion.h1>
        <motion.div 
          className="text-gray-400 mt-2 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Defend your base from the zombie horde!
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
      >
        <motion.button
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold w-full py-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-6"
          onClick={handleStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Target className="text-white" size={20} />
          <span className="text-xl">START GAME</span>
        </motion.button>
        
        <div className="space-y-4 mb-4">
          <div className="bg-gray-800/70 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
              <Info size={18} />
              <span>CONTROLS</span>
            </div>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Mouse to aim</li>
              <li>• Click to shoot</li>
              <li>• R to reload</li>
              <li>• 1-3 to change weapons</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/70 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-400 font-semibold mb-2">
              <Settings size={18} />
              <span>TIPS</span>
            </div>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Headshots deal extra damage</li>
              <li>• Repair your base between waves</li>
              <li>• Upgrade weapons for better damage</li>
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
        <div>© 2023 Zombie Defense</div>
        <div className="text-sm">Made with ♥ by Lovable</div>
      </motion.div>
    </div>
  );
};

export default GameStartScreen;
