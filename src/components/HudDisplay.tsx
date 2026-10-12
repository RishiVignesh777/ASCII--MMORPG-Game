import React from 'react';
import { Compass, Heart, Zap, Sword, Shield, MapPin, Eye, Sparkles } from 'lucide-react';
import { TurnLog } from '../types';

interface HudDisplayProps {
  currentTurn: TurnLog;
  xp: number;
  nextXp: number;
  level: number;
  gold: number;
}

export const HudDisplay: React.FC<HudDisplayProps> = ({
  currentTurn,
  xp,
  nextXp,
  level,
  gold,
}) => {
  const { hudInfo, heading, viewportDescription } = currentTurn;

  const hpPercent = Math.max(0, Math.min(100, (hudInfo.hp / hudInfo.maxHp) * 100));
  const mpPercent = Math.max(0, Math.min(100, (hudInfo.mp / hudInfo.maxMp) * 100));
  const xpPercent = Math.max(0, Math.min(100, (xp / nextXp) * 100));

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* 2. COMPASS & HUD CARD */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>2. COMPASS & HUD</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              Lvl {level} ({xp}/{nextXp} XP)
            </span>
            <span className="text-yellow-400 font-semibold">🪙 {gold}g</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Heading & Compass */}
          <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
            <span className="text-zinc-500 text-[11px] flex items-center gap-1">
              <Compass className="w-3 h-3 text-sky-400" /> Heading
            </span>
            <span className="text-sm font-bold text-sky-300 tracking-wide">
              {heading}
            </span>
            <span className="text-[10px] text-zinc-500">
              Facing {heading.toLowerCase()}ward
            </span>
          </div>

          {/* Health Gauge */}
          <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500 flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" /> Health
              </span>
              <span className="font-bold text-red-300">
                {hudInfo.hp} / {hudInfo.maxHp} HP
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all duration-300 ${
                  hpPercent > 50
                    ? 'bg-red-500'
                    : hpPercent > 25
                    ? 'bg-amber-500'
                    : 'bg-red-600 animate-pulse'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Mana Gauge */}
          <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500 flex items-center gap-1">
                <Zap className="w-3 h-3 text-blue-400" /> Mana
              </span>
              <span className="font-bold text-blue-300">
                {hudInfo.mp} / {hudInfo.maxMp} MP
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${mpPercent}%` }}
              />
            </div>
          </div>

          {/* Coordinates & Floor */}
          <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
            <span className="text-zinc-500 text-[11px] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> Coordinates & Depth
            </span>
            <span className="text-sm font-bold text-emerald-300">
              ({hudInfo.x}, {hudInfo.y}) | Floor {hudInfo.floor}
            </span>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${xpPercent}%` }}
                title={`Level Progress: ${xp}/${nextXp} XP`}
              />
            </div>
          </div>
        </div>

        {/* Equipment Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/40">
            <Sword className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-zinc-500 shrink-0">Weapon:</span>
            <span className="font-semibold text-zinc-200 truncate">{hudInfo.weapon}</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/40">
            <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-zinc-500 shrink-0">Shield/Armor:</span>
            <span className="font-semibold text-zinc-200 truncate">{hudInfo.shieldArmor}</span>
          </div>
        </div>
      </div>

      {/* 3. VIEWPORT DESCRIPTION CARD */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-zinc-800/80 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Eye className="w-4 h-4 text-amber-400" />
          <span>3. VIEWPORT DESCRIPTION</span>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-mono italic bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
          "{viewportDescription}"
        </p>
      </div>
    </div>
  );
};
