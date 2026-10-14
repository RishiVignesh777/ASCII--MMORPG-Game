import React from 'react';
import { X, Store, Heart, Flame, Wrench, Sword, Shield, Coins } from 'lucide-react';
import { Player } from '../types';

interface MerchantModalProps {
  player: Player;
  onClose: () => void;
  onBuyItem: (itemType: 'potion' | 'torch' | 'repair' | 'sword') => void;
}

export const MerchantModal: React.FC<MerchantModalProps> = ({
  player,
  onClose,
  onBuyItem,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm font-mono">
      <div className="relative w-full max-w-lg rounded-xl border border-amber-600/60 bg-zinc-950 p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-300">
                Subterranean Shopkeeper
              </h2>
              <p className="text-[11px] text-zinc-400">
                Safe Sanctuary Trading Post • Gold: <span className="text-yellow-400 font-bold">{player.gold}g</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shopkeeper quote */}
        <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs italic text-zinc-300">
          "The catacombs are treacherous, adventurer. Better keep a bright torch burning and your blade keen."
        </div>

        {/* Wares for sale */}
        <div className="flex flex-col gap-2.5">
          {/* Health Potion */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-red-950/60 text-red-400 border border-red-900/50">
                <Heart className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-zinc-200">Healing Potion</span>
                <span className="text-[11px] text-zinc-400">Restores +20 HP immediately</span>
              </div>
            </div>

            <button
              onClick={() => onBuyItem('potion')}
              disabled={player.gold < 15}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>15g</span>
            </button>
          </div>

          {/* Torches Bundle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-amber-950/60 text-amber-400 border border-amber-900/50">
                <Flame className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-zinc-200">Torch Bundle (+2 Torches)</span>
                <span className="text-[11px] text-zinc-400">Restores full 5/5 light level</span>
              </div>
            </div>

            <button
              onClick={() => onBuyItem('torch')}
              disabled={player.gold < 10}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>10g</span>
            </button>
          </div>

          {/* Full Weapon Repair */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-sky-950/60 text-sky-400 border border-sky-900/50">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-zinc-200">Masterwork Weapon Repair</span>
                <span className="text-[11px] text-zinc-400">
                  Fully restores weapon durability ({player.weaponDurability}/{player.maxWeaponDurability})
                </span>
              </div>
            </div>

            <button
              onClick={() => onBuyItem('repair')}
              disabled={player.gold < 12 || player.weaponDurability >= player.maxWeaponDurability}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>12g</span>
            </button>
          </div>

          {/* Forged Runed Blade */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-purple-950/60 text-purple-400 border border-purple-900/50">
                <Sword className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-zinc-200">Forged Runed Blade</span>
                <span className="text-[11px] text-zinc-400">+7 ATK • Max Durability 40</span>
              </div>
            </div>

            <button
              onClick={() => onBuyItem('sword')}
              disabled={player.gold < 40}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>40g</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition cursor-pointer"
          >
            Leave Shop
          </button>
        </div>
      </div>
    </div>
  );
};
