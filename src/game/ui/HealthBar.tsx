
import React from 'react';
import { Heart } from "lucide-react";

interface HealthBarProps {
  health: number;
  maxHealth: number;
}

const HealthBar: React.FC<HealthBarProps> = ({ health, maxHealth }) => {
  // Calculate health percentage
  const healthPercentage = (health / maxHealth) * 100;
  
  // Determine health bar color based on current health
  const getHealthColor = () => {
    if (healthPercentage > 66) return "bg-green-500";
    if (healthPercentage > 33) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-2 bg-black/80 p-2 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.8)] border border-slate-700/50">
      <Heart className="text-red-500 animate-pulse" size={20} />
      <div className="flex-1 w-44">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-300">HULL INTEGRITY</span>
          <span className="text-xs font-bold text-white">{Math.floor(healthPercentage)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getHealthColor()} rounded-full transition-all duration-300`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
        <div className="text-xs font-bold text-slate-400 mt-1">
          {health}/{maxHealth}
        </div>
      </div>
    </div>
  );
};

export default HealthBar;
