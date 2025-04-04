
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

  // Generate multi-directional fire indicators for laser and plasma
  const renderDirectionalIndicators = () => {
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
                  className={`h-2.5 w-0.5 ${getWeaponColor(currentWeapon).replace("text-", "bg-")}`}
                />
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Add damage indicator - NEW FUNCTIONALITY
  const getDamageText = () => {
    const level = weaponLevels[currentWeapon];
    let baseDamage = 0;
    
    // Base damage values per weapon
    switch(currentWeapon) {
      case 0: // Standard gun
        baseDamage = 10 + (level * 3);
        break;
      case 1: // Shotgun (per pellet)
        baseDamage = 6 + (level * 2);
        break;
      case 2: // Laser
        baseDamage = 20 + (level * 4);
        break;
      case 3: // Plasma
        baseDamage = 40 + (level * 5);
        break;
    }
    
    return (
      <div className="text-xs text-slate-400 mt-1">
        Damage: <span className={getWeaponColor(currentWeapon)}>{baseDamage}</span>
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
      {renderDirectionalIndicators()}
      {getDamageText()}
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
