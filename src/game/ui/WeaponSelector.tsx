
import React from 'react';
import { getWeaponColor } from './WeaponIndicator';

interface WeaponSelectorProps {
  currentWeapon: number;
  weaponNames: string[];
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({ 
  currentWeapon, 
  weaponNames 
}) => {
  return (
    <div className="mt-1 flex gap-1">
      {weaponNames.map((_, index) => (
        <div 
          key={index}
          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
            index === currentWeapon 
              ? getWeaponColor(index).replace("text-", "bg-") 
              : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
};
