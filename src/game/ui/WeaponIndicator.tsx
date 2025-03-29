
import React from 'react';
import { Zap, Circle } from 'lucide-react';

interface WeaponIndicatorProps {
  currentWeapon: number;
  weaponNames: string[];
}

const WeaponIndicator: React.FC<WeaponIndicatorProps> = ({ currentWeapon, weaponNames }) => {
  // Weapon specific colors
  const getWeaponColor = (index: number) => {
    const colors = ["text-blue-400", "text-orange-400", "text-green-400", "text-purple-400"];
    return colors[index % colors.length];
  };

  // Weapon specific icons (we would use different icons for each weapon type)
  const getWeaponIcon = (index: number) => {
    if (index === 2) return <Zap size={18} className={getWeaponColor(index)} />;
    return <Circle size={18} className={getWeaponColor(index)} />;
  };

  return (
    <div className="bg-black/90 p-2 px-3 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.9)] border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1">
        {getWeaponIcon(currentWeapon)}
        <div>
          <div className="text-xs text-slate-400 uppercase">Weapon</div>
          <div className={`font-bold ${getWeaponColor(currentWeapon)}`}>{weaponNames[currentWeapon]}</div>
        </div>
      </div>
      <div className="mt-1 flex gap-1">
        {weaponNames.map((_, index) => (
          <div 
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index === currentWeapon 
                ? getWeaponColor(index).replace("text-", "bg-") 
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <div className="text-xs text-slate-500 mt-1 text-right">PRESS [1-4]</div>
    </div>
  );
};

export default WeaponIndicator;
