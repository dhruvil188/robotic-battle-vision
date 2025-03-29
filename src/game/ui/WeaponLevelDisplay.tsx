
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
