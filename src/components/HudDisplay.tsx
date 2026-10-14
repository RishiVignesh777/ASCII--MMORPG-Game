import React from 'react';
import {
  Compass,
  Heart,
  Zap,
  Sword,
  Shield,
  MapPin,
  Eye,
  Sparkles,
  Skull,
  ShieldOff,
  Flame,
  ShieldCheck,
  Activity,
  AlertTriangle,
  BookOpen,
  Wrench,
  Package,
  Key,
  Coins,
} from 'lucide-react';
import { StatusEffect, TurnLog } from '../types';

interface HudDisplayProps {
  currentTurn: TurnLog;
}

export const HudDisplay: React.FC<HudDisplayProps> = ({ currentTurn }) => {
  const { extendedHud: hud, heading, viewportDescription, targetMonsterEffects } = currentTurn;

  const hpPercent = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const mpPercent = Math.max(0, Math.min(100, (hud.mp / hud.maxMp) * 100));
  const torchPercent = Math.max(0, Math.min(100, (hud.torchFuel / hud.maxTorchFuel) * 100));
  const duraPercent = Math.max(0, Math.min(100, (hud.weaponDura / hud.maxWeaponDura) * 100));
  const xpPercent = Math.max(0, Math.min(100, (hud.xp / hud.nextXp) * 100));

  const statusEffects = hud.statusEffects || [];

  const getStatusIcon = (type: StatusEffect['type']) => {
    switch (type) {
      case 'poisoned':
        return <Skull className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />;
      case 'weakened':
        return <ShieldOff className="w-3.5 h-3.5 text-purple-400" />;
      case 'hasted':
        return <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />;
      case 'burned':
        return <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />;
      case 'shielded':
        return <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getStatusStyle = (type: StatusEffect['type']) => {
    switch (type) {
      case 'poisoned':
        return 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'weakened':
        return 'bg-purple-950/70 border-purple-600/60 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
      case 'hasted':
        return 'bg-amber-950/70 border-amber-500/70 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
      case 'burned':
        return 'bg-orange-950/70 border-orange-600/60 text-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
      case 'shielded':
        return 'bg-sky-950/70 border-sky-600/60 text-sky-200 shadow-[0_0_10px_rgba(14,165,233,0.2)]';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-300';
    }
  };

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* 2. EXTENDED HUD & CLASS SPELLBOOK CARD */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between pb-2 mb-3 border-b border-zinc-800/80 gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>2. EXTENDED HUD & CLASS SPELLBOOK</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
            {/* Class & Level Badge */}
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
              <span>{hud.characterClass}</span>
              <span className="text-zinc-500">•</span>
              <span>Lvl {hud.level}</span>
              <span className="text-[10px] text-zinc-400 font-normal">
                ({hud.xp}/{hud.nextXp} XP)
              </span>
            </span>

            {/* Map Position */}
            <span className="text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-400" />
              Grid ({hud.x}, {hud.y}) Fl: {hud.floor}
            </span>
          </div>
        </div>

        {/* VITALS GRID: HP, MP, Torch Fuel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {/* Health Gauge */}
          <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-400 flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" /> HP:
              </span>
              <span className="font-bold text-red-300">
                {hud.hp} / {hud.maxHp}
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
              <span className="text-zinc-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-blue-400" /> MP:
              </span>
              <span className="font-bold text-blue-300">
                {hud.mp} / {hud.maxMp}
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${mpPercent}%` }}
              />
            </div>
          </div>

          {/* Torch Fuel Gauge */}
          <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> Torch Fuel:
              </span>
              <span
                className={`font-bold ${
                  hud.torchFuel === 0
                    ? 'text-zinc-500'
                    : hud.torchFuel <= 2
                    ? 'text-amber-400 animate-pulse'
                    : 'text-amber-300'
                }`}
              >
                {hud.torchFuel} / {hud.maxTorchFuel}
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all duration-300 ${
                  hud.torchFuel > 2
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : hud.torchFuel > 0
                    ? 'bg-amber-600'
                    : 'bg-zinc-700'
                }`}
                style={{ width: `${torchPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* EQUIPMENT & WEAPON DURABILITY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 text-xs">
          {/* Main Hand + Durability */}
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Sword className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-zinc-200 truncate">{hud.mainHand}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  hud.weaponDura === 0
                    ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                    : hud.weaponDura <= 5
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'text-zinc-400'
                }`}
              >
                Dura: {hud.weaponDura}/{hud.maxWeaponDura}
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  duraPercent > 40 ? 'bg-amber-400' : duraPercent > 0 ? 'bg-amber-600' : 'bg-red-500'
                }`}
                style={{ width: `${duraPercent}%` }}
              />
            </div>
          </div>

          {/* Armor */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500">Equipped Armor:</span>
              <span className="font-semibold text-zinc-200 truncate">{hud.armor}</span>
            </div>
          </div>
        </div>

        {/* ACTIVE SPELLS / SKILLS BAR */}
        <div className="mt-2.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Class Spellbook:</span>
          </div>
          <div className="text-[11px] text-zinc-300 truncate">
            {hud.activeSpells}
          </div>
        </div>

        {/* INVENTORY QUICK COUNTS: Potions | Torches | Keys | Gold */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5 text-xs">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/40">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span className="text-zinc-400">Potions:</span>
            <span className="font-bold text-red-300">{hud.potionsCount}</span>
          </div>

          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/40">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">Torches:</span>
            <span className="font-bold text-amber-300">{hud.torchesCount}</span>
          </div>

          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/40">
            <Key className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-zinc-400">Keys:</span>
            <span className="font-bold text-yellow-300">{hud.keysCount}</span>
          </div>

          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/40">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-zinc-400">Gold:</span>
            <span className="font-bold text-yellow-400">{hud.gold}g</span>
          </div>
        </div>

        {/* ACTIVE STATUS EFFECTS & TARGET CONDITIONS */}
        {statusEffects.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Conditions:
            </span>
            {statusEffects.map((effect, idx) => (
              <div
                key={`${effect.type}-${idx}`}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${getStatusStyle(
                  effect.type
                )}`}
                title={`${effect.name}: ${effect.description}`}
              >
                {getStatusIcon(effect.type)}
                <span>{effect.name} ({effect.duration}t)</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. VIEWPORT LOG & COMBAT TEXT CARD */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-zinc-800/80 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Eye className="w-4 h-4 text-amber-400" />
          <span>3. VIEWPORT LOG & COMBAT TEXT</span>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-mono italic bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
          "{viewportDescription}"
        </p>

        {currentTurn.combatLog && currentTurn.combatLog.length > 0 && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-red-950/20 border border-red-900/40 text-xs flex flex-col gap-1">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
              Encounter Action Outcome:
            </span>
            {currentTurn.combatLog.map((line, idx) => (
              <div key={idx} className="text-zinc-300 flex items-center gap-1.5">
                <span className="text-red-400 font-bold">•</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
