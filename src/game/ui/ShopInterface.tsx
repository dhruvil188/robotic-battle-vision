
import React from 'react';
import { ShopItem } from '../types';
import { X, ChevronUp } from 'lucide-react';

interface ShopInterfaceProps {
  items: ShopItem[];
  gold: number;
  onClose: () => void;
  onBuy: (index: number) => void;
  weaponLevels: number[];
}

const ShopInterface: React.FC<ShopInterfaceProps> = ({ items, gold, onClose, onBuy, weaponLevels }) => {
  // Helper function to get upgrade text and price
  const getUpgradeInfo = (item: ShopItem, index: number) => {
    if (item.type !== 'weapon' || !item.purchased) return null;
    
    // Get the weapon index (subtract 1 because standard gun is 0)
    const weaponIndex = ['shotgun', 'laser', 'plasma'].indexOf(item.id);
    if (weaponIndex === -1) return null;
    
    // Add 1 because we're displaying to user (levels 1-5 instead of 0-4)
    const level = weaponLevels[weaponIndex + 1];
    const maxLevel = 5;
    
    if (level >= maxLevel) {
      return { text: "MAX LEVEL", price: null };
    }
    
    // Each upgrade costs more
    const upgradePrice = Math.ceil((level + 1) * (item.price * 0.8));
    
    return { 
      text: `Level ${level}/${maxLevel}`, 
      price: upgradePrice,
      canUpgrade: level < maxLevel
    };
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl overflow-hidden">
        {/* Shop header */}
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">SHOP</h2>
            <div className="flex items-center gap-1 bg-yellow-900/50 px-3 py-1 rounded-full">
              <div className="w-4 h-4 bg-yellow-400 rounded-full" />
              <span className="text-yellow-400 font-bold">{gold}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Shop items */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {items.map((item, index) => {
            const upgradeInfo = getUpgradeInfo(item, index);
            
            return (
              <div 
                key={item.id}
                className="bg-gray-800/70 rounded-lg p-3 flex justify-between items-center border border-gray-700 hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-white font-semibold">{item.name}</div>
                  <div className="text-gray-400 text-sm">{item.description}</div>
                  
                  {/* Show purchase status or upgrade level */}
                  {item.type === 'weapon' && (
                    <div className="mt-1">
                      {!item.purchased ? (
                        <div className="text-yellow-400 text-xs">Not Owned</div>
                      ) : upgradeInfo ? (
                        <div className={`text-xs ${upgradeInfo.price ? 'text-blue-400' : 'text-green-400'}`}>
                          {upgradeInfo.text}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => onBuy(index)}
                  disabled={(item.type === 'weapon' && item.purchased && (!upgradeInfo?.price))}
                  className={`px-3 py-1 rounded ${
                    (item.type === 'weapon' && item.purchased && (!upgradeInfo?.price))
                      ? 'bg-gray-700 text-gray-500' 
                      : 'bg-yellow-600 hover:bg-yellow-500 text-white'
                  } transition-colors flex items-center gap-1`}
                >
                  {item.type === 'weapon' && item.purchased ? (
                    upgradeInfo?.price ? (
                      <>
                        <ChevronUp size={14} className="mr-1" />
                        <span>{upgradeInfo.price}</span>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                      </>
                    ) : (
                      <span>MAX</span>
                    )
                  ) : (
                    <>
                      <span>{item.price}</span>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Shop footer */}
        <div className="bg-gray-800 p-3 text-center text-gray-400 text-sm">
          Press 1-5 to quickly purchase items • Press S to close
        </div>
      </div>
    </div>
  );
};

export default ShopInterface;
