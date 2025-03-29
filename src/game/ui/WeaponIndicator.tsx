
import React, { useEffect, useState } from 'react';
import { Zap, Circle, ArrowUp } from 'lucide-react';
import { WeaponDirectionIndicator } from './WeaponDirectionIndicator';
import { WeaponLevelDisplay } from './WeaponLevelDisplay';
import { WeaponSelector } from './WeaponSelector';

interface WeaponIndicatorProps {
  currentWeapon: number;
  weaponNames: string[];
  weaponLevels: number[];
}

// Weapon specific colors
export const getWeaponColor = (index: number) => {
  const colors = ["text-blue-400", "text-orange-400", "text-green-400", "text-purple-400"];
  return colors[index % colors.length];
};

// Weapon specific icons
export const getWeaponIcon = (index: number) => {
  if (index === 2) return <Zap size={18} className={getWeaponColor(index)} />;
  if (index === 3) return <Circle size={18} className={getWeaponColor(index)} />;
  return <Circle size={18} className={getWeaponColor(index)} />;
};

const WeaponIndicator: React.FC<WeaponIndicatorProps> = ({ 
  currentWeapon, 
  weaponNames, 
  weaponLevels 
}) => {
  const [prevWeapon, setPrevWeapon] = useState(currentWeapon);
  const [isChanging, setIsChanging] = useState(false);
  
  // Add transition effect when weapon changes
  useEffect(() => {
    if (prevWeapon !== currentWeapon) {
      setIsChanging(true);
      const timer = setTimeout(() => {
        setIsChanging(false);
        setPrevWeapon(currentWeapon);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentWeapon, prevWeapon]);

  // Get current weapon level
  const currentLevel = weaponLevels[currentWeapon];
  const levelDisplay = currentLevel > 0 ? ` Mk${currentLevel}` : "";

  return (
    <div className={`bg-black p-2 px-3 rounded-lg shadow-[0_0_25px_rgba(0,0,0,1)] border-2 transition-all duration-300 
      ${isChanging ? 'scale-110 border-' + getWeaponColor(currentWeapon).replace('text-', '') : 'border-slate-700'}`}>
      
      <div className="flex items-center gap-2 mb-1">
        {getWeaponIcon(currentWeapon)}
        <div>
          <div className="text-xs text-slate-400 uppercase">Weapon</div>
          <div className={`font-bold ${getWeaponColor(currentWeapon)} flex items-center gap-1`}>
            {weaponNames[currentWeapon]}{levelDisplay}
            <WeaponLevelDisplay level={currentLevel} weaponIndex={currentWeapon} />
          </div>
        </div>
      </div>
      
      <WeaponDirectionIndicator 
        currentWeapon={currentWeapon} 
        currentLevel={currentLevel} 
      />
      
      <WeaponSelector 
        currentWeapon={currentWeapon} 
        weaponNames={weaponNames} 
      />
      
      <div className="text-xs text-slate-500 mt-1 text-right">PRESS [1-4]</div>
    </div>
  );
};

export default WeaponIndicator;
