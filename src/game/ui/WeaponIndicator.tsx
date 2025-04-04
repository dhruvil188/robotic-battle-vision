
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

  // Get damage text
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
    
    return baseDamage;
  };

  // Make the component more compact for the top right position
  return (
    <div className="bg-black/70 p-1.5 rounded-lg shadow-md border border-slate-700 flex items-center gap-2">
      {getWeaponIcon(currentWeapon)}
      <div>
        <div className={`text-xs font-bold ${getWeaponColor(currentWeapon)} flex items-center gap-1`}>
          {weaponNames[currentWeapon]}{levelDisplay}
          {renderLevelIndicators(currentLevel)}
        </div>
        <div className="flex items-center text-xs text-slate-400">
          <span>DMG: </span>
          <span className={getWeaponColor(currentWeapon)}>{getDamageText()}</span>
          <span className="mx-1">•</span>
          <span className="text-slate-500">[W]</span>
        </div>
      </div>
    </div>
  );
};

export default WeaponIndicator;
