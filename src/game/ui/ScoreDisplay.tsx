
import React from 'react';
import { Award, ShoppingCart } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
  gold: number;
  onShopOpen: () => void;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, gold, onShopOpen }) => {
  return (
    <div className="flex gap-4">
      <div className="flex items-center gap-2 bg-black/60 p-2 rounded-lg backdrop-blur-sm shadow-lg">
        <Award className="text-blue-400" size={20} />
        <div className="text-white font-bold">
          {score.toLocaleString()}
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-black/60 p-2 rounded-lg backdrop-blur-sm shadow-lg cursor-pointer hover:bg-black/70 transition-colors" onClick={onShopOpen}>
        <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
          G
        </div>
        <div className="text-yellow-400 font-bold">
          {gold}
        </div>
        <ShoppingCart size={18} className="text-white ml-1" />
      </div>
    </div>
  );
};

export default ScoreDisplay;
