
import React from 'react';
import { Award, ShoppingCart, Coins } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
  gold: number;
  onShopOpen: () => void;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, gold, onShopOpen }) => {
  return (
    <div className="flex gap-3">
      <div className="flex items-center gap-2 bg-black/60 p-2 px-3 rounded-lg backdrop-blur-sm shadow-lg border border-slate-700/50">
        <Award className="text-blue-400" size={18} />
        <div>
          <div className="text-xs text-slate-400 uppercase">Score</div>
          <div className="text-white font-bold tracking-wider">
            {score.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div 
        className="flex items-center gap-2 bg-black/60 p-2 px-3 rounded-lg backdrop-blur-sm shadow-lg border border-slate-700/50 cursor-pointer hover:bg-slate-900/70 transition-colors"
        onClick={onShopOpen}
      >
        <Coins className="text-yellow-400" size={18} />
        <div>
          <div className="text-xs text-slate-400 uppercase">Credits</div>
          <div className="text-yellow-400 font-bold tracking-wider">
            {gold}
          </div>
        </div>
        <div className="ml-1 flex items-center justify-center w-5 h-5 bg-slate-800 rounded-full text-xs text-white">
          S
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;
