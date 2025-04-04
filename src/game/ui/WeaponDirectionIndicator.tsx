
import React from 'react';
import { getWeaponColor } from './WeaponIndicator';

interface WeaponDirectionIndicatorProps {
  currentWeapon: number;
  currentLevel: number;
}

export const WeaponDirectionIndicator: React.FC<WeaponDirectionIndicatorProps> = ({ 
  currentWeapon, 
  currentLevel 
}) => {
  // Only show for laser and plasma at level 2+
  if ((currentWeapon === 2 || currentWeapon === 3) && currentLevel >= 2) {
    const directions = Math.min(currentLevel, 4); // Max 4 directions
    
    return (
      <div className="mt-1 flex justify-center">
        {Array.from({ length: directions }).map((_, i) => {
          // Calculate angle for each direction (-30 to +30 degrees)
          const angleOffset = directions <= 1 ? 0 : -30 + (60 / (directions - 1)) * i;
          const style = { transform: `rotate(${angleOffset}deg)` };
          
          return (
            <div key={i} className="px-0.5">
              <div 
                style={style} 
                className={`h-2.5 w-0.5 ${getWeaponColor(currentWeapon).replace("text-", "bg-")} transition-all duration-300`}
              />
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};
