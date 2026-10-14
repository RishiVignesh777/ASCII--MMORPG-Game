import React, { useEffect, useState } from 'react';
import {
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Flame,
  HeartPulse,
  Package,
  Crosshair,
  Volume2,
  VolumeX,
  Zap,
  BookOpen,
  Wrench,
  Shield,
  Store,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ClassSkill, TurnLog } from '../types';
import { sounds } from '../engine/sound';

interface ActionControlsProps {
  currentTurn: TurnLog;
  skills: ClassSkill[];
  onAction: (index: number) => void;
  onCastSkill: (skillId: string) => void;
  onLightTorch: () => void;
  onRepairWeapon: () => void;
  onUsePotion: () => void;
  onOpenInventory: () => void;
  onOpenMerchant: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isGameOver: boolean;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  currentTurn,
  skills,
  onAction,
  onCastSkill,
  onLightTorch,
  onRepairWeapon,
  onUsePotion,
  onOpenInventory,
  onOpenMerchant,
  isMuted,
  onToggleMute,
  isGameOver,
}) => {
  const [spellbookOpen, setSpellbookOpen] = useState(false);
  const [itemMenuOpen, setItemMenuOpen] = useState(false);

  const actions = currentTurn.actions;

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (isGameOver) return;

      const key = e.key.toLowerCase();

      if (key === '1' || key === 'w' || key === 'arrowup') {
        e.preventDefault();
        onAction(1);
      } else if (key === '2' || key === 'a' || key === 'arrowleft') {
        e.preventDefault();
        onAction(2);
      } else if (key === '3' || key === ' ') {
        e.preventDefault();
        onAction(3); // Basic Attack
      } else if (key === '4' || key === 'f') {
        e.preventDefault();
        if (skills[0]) onCastSkill(skills[0].id);
        else onAction(4);
      } else if (key === '5' || key === 'r') {
        e.preventDefault();
        onAction(5); // Use Item
      } else if (key === '6' || key === 'e') {
        e.preventDefault();
        onAction(6); // Environment Action
      } else if (key === 't') {
        e.preventDefault();
        onLightTorch();
      } else if (key === 'p') {
        e.preventDefault();
        onUsePotion();
      } else if (key === 'i' || key === 'b') {
        e.preventDefault();
        onOpenInventory();
      } else if (key === 'm') {
        e.preventDefault();
        onToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onAction,
    onCastSkill,
    onLightTorch,
    onUsePotion,
    onOpenInventory,
    onToggleMute,
    isGameOver,
    skills,
  ]);

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* 4. EXPANDED ACTION MENU CARD */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between pb-2 mb-3 border-b border-zinc-800/80 gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Crosshair className="w-4 h-4 text-amber-400" />
            <span>4. EXPANDED ACTION MENU</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-200 text-xs transition cursor-pointer"
              title="Toggle audio effects (M)"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden sm:inline text-[11px]">{isMuted ? 'Muted' : 'Sound'}</span>
            </button>

            <button
              onClick={onOpenInventory}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-300 hover:text-amber-300 text-xs transition cursor-pointer border border-zinc-700/50"
              title="Open Inventory Backpack (I)"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">Backpack [I]</span>
            </button>
          </div>
        </div>

        {/* 6 NUMBERED EXPANDED ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {actions.map((actName, idx) => {
            const actionNumber = idx + 1;
            const isAttack = actionNumber === 3;
            const isSpell = actionNumber === 4;
            const isItem = actionNumber === 5;
            const isEnv = actionNumber === 6;

            return (
              <button
                key={actionNumber}
                onClick={() => {
                  if (isSpell) {
                    setSpellbookOpen(!spellbookOpen);
                  } else if (isItem) {
                    setItemMenuOpen(!itemMenuOpen);
                  } else {
                    onAction(actionNumber);
                  }
                }}
                disabled={isGameOver}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-150 cursor-pointer text-xs font-semibold group ${
                  isAttack
                    ? 'bg-red-950/40 hover:bg-red-900/60 border-red-800/60 text-red-200 hover:border-red-600'
                    : isSpell
                    ? 'bg-blue-950/40 hover:bg-blue-900/60 border-blue-800/60 text-blue-200 hover:border-blue-600'
                    : isItem
                    ? 'bg-amber-950/40 hover:bg-amber-900/60 border-amber-800/60 text-amber-200 hover:border-amber-600'
                    : isEnv
                    ? 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-800/60 text-emerald-200 hover:border-emerald-600'
                    : 'bg-zinc-950/70 hover:bg-zinc-800/90 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                } ${isGameOver ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded flex items-center justify-center bg-zinc-900 text-zinc-400 text-[11px] font-bold border border-zinc-800 group-hover:text-amber-400 group-hover:border-amber-500/50">
                    {actionNumber}
                  </span>
                  <span className="truncate">{actName}</span>
                </div>

                <div className="text-[10px] text-zinc-500 font-mono pl-1 shrink-0">
                  {actionNumber === 1 && '[W]'}
                  {actionNumber === 2 && '[A/D]'}
                  {actionNumber === 3 && '[Space]'}
                  {actionNumber === 4 && (spellbookOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                  {actionNumber === 5 && (itemMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                  {actionNumber === 6 && '[E]'}
                </div>
              </button>
            );
          })}
        </div>

        {/* ACTIVE SPELLBOOK DRAWER (When Option 4 is opened or clicked) */}
        {spellbookOpen && (
          <div className="mt-3 p-3 rounded-lg bg-zinc-950 border border-blue-900/60 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-400 border-b border-zinc-800 pb-1.5">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Select Class Skill / Spell to Cast:
              </span>
              <span className="text-[10px] text-zinc-500">Available MP: {currentTurn.extendedHud.mp}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => {
                    onCastSkill(skill.id);
                    setSpellbookOpen(false);
                  }}
                  disabled={currentTurn.extendedHud.mp < skill.mpCost}
                  className={`flex flex-col p-2.5 rounded-lg border text-left transition cursor-pointer text-xs ${
                    currentTurn.extendedHud.mp >= skill.mpCost
                      ? 'bg-blue-950/40 hover:bg-blue-900/60 border-blue-800/70 text-blue-200'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{skill.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-900/50 text-blue-300 font-mono">
                      {skill.mpCost} MP
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">{skill.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* QUICK ITEM USE MENU (When Option 5 is opened or clicked) */}
        {itemMenuOpen && (
          <div className="mt-3 p-3 rounded-lg bg-zinc-950 border border-amber-900/60 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-400 border-b border-zinc-800 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                Select Item to Use:
              </span>
              <span className="text-[10px] text-zinc-500">Hotkeys: [P] Potion • [T] Torch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Drink Potion */}
              <button
                onClick={() => {
                  onUsePotion();
                  setItemMenuOpen(false);
                }}
                disabled={currentTurn.extendedHud.potionsCount <= 0}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-200 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HeartPulse className="w-4 h-4 text-red-400" />
                <div className="flex flex-col text-left">
                  <span className="font-bold">Drink Health Potion</span>
                  <span className="text-[10px] text-zinc-400">
                    {currentTurn.extendedHud.potionsCount} remaining (+20 HP)
                  </span>
                </div>
              </button>

              {/* Light Torch */}
              <button
                onClick={() => {
                  onLightTorch();
                  setItemMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-200 transition cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <div className="flex flex-col text-left">
                  <span className="font-bold">Light New Torch</span>
                  <span className="text-[10px] text-zinc-400">
                    Fuel: {currentTurn.extendedHud.torchFuel}/5 (Torches: {currentTurn.extendedHud.torchesCount})
                  </span>
                </div>
              </button>

              {/* Repair Weapon */}
              <button
                onClick={() => {
                  onRepairWeapon();
                  setItemMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 transition cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <div className="flex flex-col text-left">
                  <span className="font-bold">Repair Weapon</span>
                  <span className="text-[10px] text-zinc-400">
                    Dura: {currentTurn.extendedHud.weaponDura}/{currentTurn.extendedHud.maxWeaponDura}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
