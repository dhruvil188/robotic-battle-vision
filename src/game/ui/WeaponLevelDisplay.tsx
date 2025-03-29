
import React from 'react';
import { ArrowUp } from 'lucide-react';
import { getWeaponColor } from './WeaponIndicator';

interface WeaponLevelDisplayProps {
  level: number;
  weaponIndex: number;
}

export const WeaponLevelDisplay: React.FC<WeaponLevelDisplayProps> = ({ 
  level, 
  weaponIndex 
}) => {
  if (level === 0) return null;
  
  // For laser (2) and plasma (3) weapons, add directional indicators
  if (weaponIndex === 2 || weaponIndex === 3) {
    // Calculate how many beams based on level (1 at level 1, 2 at level 2-3, 3 at level 4, 4 at level 5)
    const beamCount = level <= 1 ? 1 : 
                      level <= 3 ? 2 : 
                      level === 4 ? 3 : 4;
                      
    return (
      <div className="flex gap-0.5 mt-0.5">
        {/* Show beam direction indicators */}
        {Array.from({ length: beamCount }).map((_, i) => (
          <ArrowUp 
            key={i} 
            size={10} 
            className={`${getWeaponColor(weaponIndex)} fill-current animate-pulse`} 
          />
        ))}
      </div>
    );
  }
  
  // Standard display for other weapons
  return (
    <div className="flex gap-0.5 mt-0.5">
      {Array.from({ length: level }).map((_, i) => (
        <ArrowUp 
          key={i} 
          size={10} 
          className={`${getWeaponColor(weaponIndex)} fill-current animate-pulse`} 
        />
      ))}
    </div>
  );
};
