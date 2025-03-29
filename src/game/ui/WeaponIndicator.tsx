
import React from 'react';
import { Zap, Circle, ArrowUp } from 'lucide-react';

interface WeaponIndicatorProps {
  currentWeapon: number;
  weaponNames: string[];
  weaponLevels: number[];
}

const WeaponIndicator: React.FC<WeaponIndicatorProps> = ({ currentWeapon, weaponNames, weaponLevels }) => {
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

  // Get current weapon level
  const currentLevel = weaponLevels[currentWeapon];
  const levelDisplay = currentLevel > 0 ? ` Mk${currentLevel}` : "";

  // Generate level indicators (stars or up arrows)
  const renderLevelIndicators = (level: number) => {
    if (level === 0) return null;
    
    return (
      <div className="flex gap-0.5 mt-0.5">
        {Array.from({ length: level }).map((_, i) => (
          <ArrowUp key={i} size={10} className={`${getWeaponColor(currentWeapon)} fill-current`} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-black p-2 px-3 rounded-lg shadow-[0_0_25px_rgba(0,0,0,1)] border-2 border-slate-700">
      <div className="flex items-center gap-2 mb-1">
        {getWeaponIcon(currentWeapon)}
        <div>
          <div className="text-xs text-slate-400 uppercase">Weapon</div>
          <div className={`font-bold ${getWeaponColor(currentWeapon)} flex items-center gap-1`}>
            {weaponNames[currentWeapon]}{levelDisplay}
            {renderLevelIndicators(currentLevel)}
          </div>
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
