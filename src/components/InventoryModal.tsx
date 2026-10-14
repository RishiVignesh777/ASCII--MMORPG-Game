import React from 'react';
import { X, Sword, Shield, Package, Heart, Zap, Sparkles, BookOpen, Key, Coins, Flame, Wrench } from 'lucide-react';
import { Item, Player } from '../types';

interface InventoryModalProps {
  player: Player;
  onClose: () => void;
  onUseItem: (itemId: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  player,
  onClose,
  onUseItem,
}) => {
  const [activeTab, setActiveTab] = React.useState<'bag' | 'guide'>('bag');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Adventurer Satchel & Codex
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 text-xs">
          <button
            onClick={() => setActiveTab('bag')}
            className={`flex-1 py-2.5 px-4 font-semibold text-center border-b-2 transition cursor-pointer ${
              activeTab === 'bag'
                ? 'border-amber-400 text-amber-300 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Equipment & Backpack ({player.inventory.length})
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2.5 px-4 font-semibold text-center border-b-2 transition cursor-pointer ${
              activeTab === 'guide'
                ? 'border-amber-400 text-amber-300 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Dungeon Symbols & Guide
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-300">
          {activeTab === 'bag' ? (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-zinc-950/70 border border-zinc-800">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">Class & Level</span>
                  <div className="font-bold text-amber-300 text-sm">
                    {player.characterClass} {player.level}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">Gold</span>
                  <div className="font-bold text-yellow-300 text-sm flex items-center gap-1">
                    <Coins className="w-3 h-3" /> {player.gold}g
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">Torch Fuel</span>
                  <div className="font-bold text-amber-400 text-sm flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {player.torchFuel}/5
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">Weapon Dura</span>
                  <div className="font-bold text-sky-300 text-sm flex items-center gap-1">
                    <Wrench className="w-3 h-3" /> {player.weaponDurability}/{player.maxWeaponDurability}
                  </div>
                </div>
              </div>

              {/* Equipped items */}
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sword className="w-3.5 h-3.5 text-amber-400" /> Equipped Gear
                </h3>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-amber-950/50 border border-amber-700/50 flex items-center justify-center text-amber-300">
                        <Sword className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-200">{player.weapon.name}</div>
                        <div className="text-[11px] text-zinc-500">
                          {player.weapon.description} • Durability: {player.weaponDurability}/{player.maxWeaponDurability}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                      +{player.weapon.bonusAtk} ATK
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-sky-950/50 border border-sky-700/50 flex items-center justify-center text-sky-300">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-200">{player.shieldArmor.name}</div>
                        <div className="text-[11px] text-zinc-500">{player.shieldArmor.description}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 font-bold text-[11px]">
                      +{player.shieldArmor.bonusDef} DEF
                    </span>
                  </div>
                </div>
              </div>

              {/* Bag Inventory */}
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-400" /> Backpack Inventory
                </h3>

                {player.inventory.length === 0 ? (
                  <div className="p-4 rounded-lg bg-zinc-950/40 border border-zinc-800 text-center text-zinc-500 text-xs">
                    Your backpack is empty. Search dungeon chests and crypt rubble to discover loot!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {player.inventory.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex-1">
                          <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                            {item.type === 'potion' && <Heart className="w-3.5 h-3.5 text-red-400" />}
                            {item.type === 'torch' && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                            {item.type === 'repair_kit' && <Wrench className="w-3.5 h-3.5 text-sky-400" />}
                            <span>{item.name}</span>
                          </div>
                          <div className="text-[11px] text-zinc-500">{item.description}</div>
                        </div>

                        {item.type === 'potion' ? (
                          <button
                            onClick={() => onUseItem(item.id)}
                            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer transition shadow"
                          >
                            Drink
                          </button>
                        ) : item.type === 'torch' ? (
                          <button
                            onClick={() => onUseItem(item.id)}
                            className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs cursor-pointer transition shadow"
                          >
                            Ignite
                          </button>
                        ) : item.type === 'repair_kit' ? (
                          <button
                            onClick={() => onUseItem(item.id)}
                            className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs cursor-pointer transition shadow"
                          >
                            Repair
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-500 italic">Item</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guide Tab */
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> 3D Depth Shading & Dynamic Lighting
                </h4>
                <ul className="space-y-1 text-zinc-400 text-[11px]">
                  <li>
                    <code className="text-amber-400 font-bold">Torch 4-5 (High):</code> Full 30x12 view visible with far-depth shading (░).
                  </li>
                  <li>
                    <code className="text-amber-400 font-bold">Torch 1-2 (Low):</code> Reduced field of view; distant tiles fade into darkness.
                  </li>
                  <li>
                    <code className="text-amber-400 font-bold">Torch 0 (Out):</code> Pitch black frame except for adjacent tiles (█).
                  </li>
                  <li>
                    <code className="text-amber-400 font-bold">[ | + | ]</code> : Reinforced heavy wooden door sprite
                  </li>
                  <li>
                    <code className="text-amber-400 font-bold">[ ( $ ) ]</code> : Detailed iron-banded treasure chest sprite
                  </li>
                  <li>
                    <code className="text-amber-400 font-bold">Boss Monster:</code> Detailed 5x5 multi-line beast sprite
                  </li>
                  <li>
                    <code className="text-amber-400 font-bold">Shopkeeper (S):</code> Safe room trading post to buy potions, torches, repairs
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-amber-300">Class Disciplines & Spellbook</h4>
                <ul className="space-y-1.5 text-zinc-400 text-[11px]">
                  <li>
                    <strong className="text-amber-300">Fighter:</strong> High HP/Heavy armor. Power Strike, Shield Bash, Battle Cry.
                  </li>
                  <li>
                    <strong className="text-blue-300">Mage:</strong> High MP/Offensive spells. Fireball, Frost Nova, Arcane Barrier, Heal.
                  </li>
                  <li>
                    <strong className="text-emerald-300">Rogue:</strong> High speed/Critical strikes. Shadow Backstab, Poison Blade, Haste Surge.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer transition"
          >
            Close Satchel
          </button>
        </div>
      </div>
    </div>
  );
};
