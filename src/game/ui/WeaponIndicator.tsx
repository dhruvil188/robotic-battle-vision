
import React from 'react';

interface WeaponIndicatorProps {
  currentWeapon: number;
  weaponNames: string[];
}

const WeaponIndicator: React.FC<WeaponIndicatorProps> = ({ currentWeapon, weaponNames }) => {
  return (
    <div className="bg-black/60 p-2 rounded-lg backdrop-blur-sm shadow-lg">
      <div className="text-xs text-gray-400 uppercase">Current Weapon</div>
      <div className="text-white font-bold">{weaponNames[currentWeapon]}</div>
      <div className="mt-1 flex gap-1">
        {weaponNames.map((_, index) => (
          <div 
            key={index}
            className={`h-1.5 flex-1 rounded-full ${index === currentWeapon ? 'bg-blue-500' : 'bg-gray-700'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default WeaponIndicator;
