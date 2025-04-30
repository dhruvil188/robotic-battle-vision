
import React from 'react';
import { Zap, Circle, ArrowUp, Sword, Gun, Bomb, Shield } from 'lucide-react';

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

  // Enhanced weapon-specific icons with more distinct visuals
  const getWeaponIcon = (index: number) => {
    switch(index) {
      case 0: return <Gun size={18} className={getWeaponColor(index)} />;
      case 1: return <Sword size={18} className={getWeaponColor(index)} />;
      case 2: return <Zap size={18} className={getWeaponColor(index)} />;
      case 3: return <Bomb size={18} className={getWeaponColor(index)} />;
      default: return <Circle size={18} className={getWeaponColor(index)} />;
    }
  };

  // Get current weapon level
  const currentLevel = weaponLevels[currentWeapon];
  const levelDisplay = currentLevel > 0 ? ` Mk${currentLevel}` : "";

  // Generate level indicators (stars or up arrows) with enhanced visuals
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

  // Enhanced damage text calculation with better scaling
  const getDamageText = () => {
    const level = weaponLevels[currentWeapon];
    let baseDamage = 0;
    
    // Improved base damage values and scaling per weapon
    switch(currentWeapon) {
      case 0: // Standard gun
        baseDamage = 10 + (level * 5);
        break;
      case 1: // Shotgun (per pellet)
        baseDamage = 8 + (level * 3);
        break;
      case 2: // Laser
        baseDamage = 20 + (level * 8);
        break;
      case 3: // Plasma
        baseDamage = 45 + (level * 12);
        break;
    }
    
    return baseDamage;
  };

  // Make the component more compact and visually appealing for the top right position
  return (
    <div className="bg-black/70 p-1.5 rounded-lg shadow-md border border-slate-700 flex items-center gap-2 backdrop-blur-sm">
      <div className={`rounded-full p-0.5 bg-slate-800 border ${getWeaponColor(currentWeapon).replace('text-', 'border-')}`}>
        {getWeaponIcon(currentWeapon)}
      </div>
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
