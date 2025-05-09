
import React from 'react';
import { Award, Coins } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
  gold: number;
  onShopOpen: () => void;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, gold, onShopOpen }) => {
  return (
    <div className="flex gap-3">
      <div className="flex items-center gap-2 bg-black p-2 px-3 rounded-lg shadow-[0_0_25px_rgba(0,0,0,1)] border-2 border-slate-700">
        <Award className="text-blue-400" size={18} />
        <div>
          <div className="text-xs text-slate-400 uppercase">Score</div>
          <div className="text-white font-bold tracking-wider">
            {score.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div 
        className="flex items-center gap-2 bg-black p-2 px-3 rounded-lg shadow-[0_0_25px_rgba(0,0,0,1)] border-2 border-slate-700 cursor-pointer hover:bg-slate-900 transition-colors"
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
