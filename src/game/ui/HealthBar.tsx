
import React from 'react';
import { Progress } from "@/components/ui/progress";
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
    <div className="flex items-center gap-2 bg-black/60 p-2 rounded-lg backdrop-blur-sm shadow-lg">
      <Heart className="text-red-500 animate-pulse" size={22} />
      <div className="flex-1 w-44">
        <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getHealthColor()} rounded-full transition-all duration-300`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
        <div className="text-xs font-bold text-white text-center mt-1">
          {health}/{maxHealth}
        </div>
      </div>
    </div>
  );
};

export default HealthBar;
