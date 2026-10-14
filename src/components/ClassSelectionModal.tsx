import React from 'react';
import { Shield, Sparkles, Wand2, Footprints, Sword, Heart, Zap, Flame } from 'lucide-react';
import { PlayerClass } from '../types';

interface ClassSelectionModalProps {
  onSelectClass: (c: PlayerClass) => void;
}

export const ClassSelectionModal: React.FC<ClassSelectionModalProps> = ({ onSelectClass }) => {
  return (
    <div className="rounded-xl border border-amber-500/60 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-4 sm:p-6 shadow-2xl font-mono text-zinc-100 flex flex-col gap-4">
      <div className="flex flex-col gap-1 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm sm:text-base uppercase tracking-wider">
          <Sparkles className="w-5 h-5" />
          <span>Turn 1: Choose Your Adventurer Class</span>
        </div>
        <p className="text-xs text-zinc-400">
          The heavy doors of the Abyssal Vault loom ahead. Select your discipline to prepare your starting loadout, stats, and spellbook:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* FIGHTER */}
        <div className="flex flex-col justify-between p-4 rounded-xl border border-amber-500/30 bg-zinc-900/80 hover:border-amber-400 hover:bg-zinc-850 transition shadow-lg flex-1">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                FIGHTER
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                Tank / Melee
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Resilient combatant equipped in heavy steel scale mail with devastating power strikes.
            </p>

            <div className="flex flex-col gap-1 text-[11px] bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800/80 my-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Vitals:</span>
                <span className="font-bold text-red-300">36 HP • 10 MP • 28 Stamina</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Weapon:</span>
                <span className="text-zinc-200">Tempered Broadsword (Dura: 30)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Armor:</span>
                <span className="text-zinc-200">Heavy Scale Hauberk (+3 DEF)</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-300">
              <span className="text-amber-400 font-semibold">Skills:</span>
              <ul className="list-disc list-inside text-zinc-400 text-[10px] mt-0.5 space-y-0.5">
                <li>Power Strike (3 MP) - 1.8x cleave damage</li>
                <li>Shield Bash (4 MP) - Weakens foe</li>
                <li>Battle Cry (5 MP) - Restores 8 HP & +3 ATK</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => onSelectClass('Fighter')}
            className="mt-4 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs transition cursor-pointer shadow-md"
          >
            Select Fighter [1]
          </button>
        </div>

        {/* MAGE */}
        <div className="flex flex-col justify-between p-4 rounded-xl border border-blue-500/30 bg-zinc-900/80 hover:border-blue-400 hover:bg-zinc-850 transition shadow-lg flex-1">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-blue-300 text-sm flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-blue-400" />
                MAGE
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                Elemental Spells
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Master of arcane flame and frost, wielding devastating elemental bursts and celestial wards.
            </p>

            <div className="flex flex-col gap-1 text-[11px] bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800/80 my-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Vitals:</span>
                <span className="font-bold text-blue-300">22 HP • 30 MP • 18 Stamina</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Weapon:</span>
                <span className="text-zinc-200">Runic Willow Staff (Dura: 20)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Armor:</span>
                <span className="text-zinc-200">Arcane Woven Vestments (+1 DEF)</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-300">
              <span className="text-blue-400 font-semibold">Spells:</span>
              <ul className="list-disc list-inside text-zinc-400 text-[10px] mt-0.5 space-y-0.5">
                <li>Fireball (6 MP) - Heavy burst + Burn (3t)</li>
                <li>Frost Nova (5 MP) - Cold blast + Chill</li>
                <li>Arcane Barrier (4 MP) - Shielded ward</li>
                <li>Lesser Heal (4 MP) - Restores 18 HP</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => onSelectClass('Mage')}
            className="mt-4 w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-zinc-950 font-extrabold text-xs transition cursor-pointer shadow-md"
          >
            Select Mage [2]
          </button>
        </div>

        {/* ROGUE */}
        <div className="flex flex-col justify-between p-4 rounded-xl border border-emerald-500/30 bg-zinc-900/80 hover:border-emerald-400 hover:bg-zinc-850 transition shadow-lg flex-1">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-300 text-sm flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-emerald-400" />
                ROGUE
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Agility & Crits
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Agile shadow walker striking vital arteries with venom blades and lightning haste.
            </p>

            <div className="flex flex-col gap-1 text-[11px] bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800/80 my-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Vitals:</span>
                <span className="font-bold text-emerald-300">26 HP • 18 MP • 30 Stamina</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Weapon:</span>
                <span className="text-zinc-200">Twin Shadow Blades (Dura: 25)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Armor:</span>
                <span className="text-zinc-200">Dark Leather Cuirass (+2 DEF)</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-300">
              <span className="text-emerald-400 font-semibold">Skills:</span>
              <ul className="list-disc list-inside text-zinc-400 text-[10px] mt-0.5 space-y-0.5">
                <li>Shadow Backstab (5 MP) - 2.4x Crit strike</li>
                <li>Poison Blade (4 MP) - Inflicts Venom (4t)</li>
                <li>Haste Surge (4 MP) - Speed & +3 ATK</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => onSelectClass('Rogue')}
            className="mt-4 w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs transition cursor-pointer shadow-md"
          >
            Select Rogue [3]
          </button>
        </div>
      </div>
    </div>
  );
};
