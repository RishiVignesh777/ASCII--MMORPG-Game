import React from 'react';
import { X, Sword, Shield, Package, Heart, Zap, Sparkles, BookOpen, Key, Coins } from 'lucide-react';
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
                  <span className="text-[10px] text-zinc-500 uppercase">Level</span>
                  <div className="font-bold text-amber-300 text-sm">Lvl {player.level}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">Gold</span>
                  <div className="font-bold text-yellow-300 text-sm flex items-center gap-1">
                    <Coins className="w-3 h-3" /> {player.gold}g
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">Attack</span>
                  <div className="font-bold text-rose-300 text-sm">
                    {player.baseAttack + (player.weapon.bonusAtk || 0)} ATK
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">Defense</span>
                  <div className="font-bold text-sky-300 text-sm">
                    {player.baseDefense + (player.shieldArmor.bonusDef || 0)} DEF
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
                        <div className="text-[11px] text-zinc-500">{player.weapon.description}</div>
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
                          <div className="font-bold text-zinc-200">{item.name}</div>
                          <div className="text-[11px] text-zinc-500">{item.description}</div>
                        </div>

                        {item.type === 'potion' ? (
                          <button
                            onClick={() => onUseItem(item.id)}
                            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer transition shadow"
                          >
                            Drink
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-500 italic">Inventory</span>
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
                  <BookOpen className="w-3.5 h-3.5" /> 3D Depth Shading Rules
                </h4>
                <ul className="space-y-1 text-zinc-400 text-[11px]">
                  <li>
                    <code className="text-amber-400 font-bold">█ / #</code> : Close Wall (Distance 1 - Solid Barrier)
                  </li>
                  <li>
                    <code className="text-amber-400 font-bold">▒ / =</code> : Mid Wall (Distance 2 - Mid Corridor Depth)
                  </li>
                  <li>
                    <code className="text-amber-400 font-bold">░ / -</code> : Far Wall (Distance 3 - Distant Barrier)
                  </li>
                  <li>
                    <code className="text-amber-400 font-bold">/ \ . :</code> : Perspective ceiling/floor gridlines
                  </li>
                  <li>
                    <code className="text-amber-400 font-bold">[ . ]</code> : Straight corridor vanishing point
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-amber-300">Overhead Mini-Map Symbols</h4>
                <ul className="space-y-1 text-zinc-400 text-[11px]">
                  <li>
                    <code className="text-emerald-400 font-bold">@^, @&gt;, @v, @&lt;</code> : Player position & facing direction
                  </li>
                  <li>
                    <code className="text-zinc-300 font-bold">#</code> : Solid stone wall
                  </li>
                  <li>
                    <code className="text-zinc-500 font-bold">.</code> : Walkable stone floor
                  </li>
                  <li>
                    <code className="text-amber-400 font-bold">+</code> : Closed wooden door (Action 5 opens it)
                  </li>
                  <li>
                    <code className="text-amber-300 font-bold">/</code> : Open door threshold
                  </li>
                  <li>
                    <code className="text-yellow-400 font-bold">$</code> : Treasure chest
                  </li>
                  <li>
                    <code className="text-sky-400 font-bold">~</code> : Fountain of Restoration
                  </li>
                  <li>
                    <code className="text-indigo-400 font-bold">&gt;</code> : Spiral stone staircase down
                  </li>
                  <li>
                    <code className="text-rose-400 font-bold">g, S, M, B</code> : Hostile dungeon monsters
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
