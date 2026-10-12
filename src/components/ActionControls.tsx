import React, { useEffect } from 'react';
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
} from 'lucide-react';
import { TurnLog } from '../types';
import { sounds } from '../engine/sound';

interface ActionControlsProps {
  currentTurn: TurnLog;
  onAction: (index: number) => void;
  onCastSpell: (type: 'firebolt' | 'heal') => void;
  onOpenInventory: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isGameOver: boolean;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  currentTurn,
  onAction,
  onCastSpell,
  onOpenInventory,
  isMuted,
  onToggleMute,
  isGameOver,
}) => {
  const actions = currentTurn.actions;

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if typing in input
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
      } else if (key === '3' || key === 'd' || key === 'arrowright') {
        e.preventDefault();
        onAction(3);
      } else if (key === '4' || key === 's' || key === 'arrowdown') {
        e.preventDefault();
        onAction(4);
      } else if (key === '5' || key === 'e' || key === ' ') {
        e.preventDefault();
        onAction(5);
      } else if (key === 'q' || key === 'f') {
        e.preventDefault();
        onCastSpell('firebolt');
      } else if (key === 'h' || key === 'r') {
        e.preventDefault();
        onCastSpell('heal');
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
  }, [onAction, onCastSpell, onOpenInventory, onToggleMute, isGameOver]);

  const actionIcons = [
    <ArrowUp className="w-4 h-4 text-emerald-400" key="1" />,
    <ArrowLeft className="w-4 h-4 text-sky-400" key="2" />,
    <ArrowRight className="w-4 h-4 text-sky-400" key="3" />,
    <ArrowDown className="w-4 h-4 text-amber-400" key="4" />,
    <Crosshair className="w-4 h-4 text-rose-400" key="5" />,
  ];

  const actionKeys = ['[1] / W', '[2] / A', '[3] / D', '[4] / S', '[5] / E'];

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* 4. FIRST-PERSON ACTIONS CARD */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Crosshair className="w-4 h-4 text-amber-400" />
            <span>4. FIRST-PERSON ACTIONS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-200 text-xs transition cursor-pointer"
              title="Toggle retro audio sound effects (M)"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-500" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden sm:inline text-[11px]">{isMuted ? 'Muted' : 'Audio ON'}</span>
            </button>

            <button
              onClick={onOpenInventory}
              className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-300 hover:text-amber-300 text-xs transition cursor-pointer"
              title="Open Inventory (I)"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">Bag [I]</span>
            </button>
          </div>
        </div>

        {/* The 5 Numbered Action Buttons Required by Output Structure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {actions.map((actName, idx) => {
            const actionNumber = idx + 1;
            const isContextAction = actionNumber === 5;

            return (
              <button
                key={actionNumber}
                onClick={() => onAction(actionNumber)}
                disabled={isGameOver}
                className={`group flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                  isContextAction
                    ? 'sm:col-span-2 lg:col-span-2 bg-gradient-to-r from-amber-950/40 to-rose-950/40 border-amber-500/50 hover:border-amber-400 hover:from-amber-900/50 hover:to-rose-900/50 shadow-md'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-6 h-6 rounded flex items-center justify-center bg-zinc-900 border border-zinc-700/60 text-xs font-bold text-amber-300 shrink-0">
                    {actionNumber}
                  </span>
                  <div className="shrink-0">{actionIcons[idx]}</div>
                  <span
                    className={`text-xs font-medium truncate ${
                      isContextAction
                        ? 'text-amber-200 group-hover:text-amber-100 font-semibold'
                        : 'text-zinc-200 group-hover:text-white'
                    }`}
                  >
                    {actName}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400 shrink-0 ml-2">
                  {actionKeys[idx]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Auxiliary Magic Spells Row */}
        <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-[11px] text-zinc-500">Quick Spells:</span>
            <button
              onClick={() => onCastSpell('firebolt')}
              disabled={isGameOver || currentTurn.hudInfo.mp < 5}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-950/50 border border-orange-700/50 hover:border-orange-500 text-orange-200 text-xs font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Hurls a flaming orb at visible enemies (5 MP)"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Firebolt (5 MP)</span>
              <kbd className="text-[10px] text-orange-400/80 bg-orange-900/50 px-1 rounded">Q</kbd>
            </button>

            <button
              onClick={() => onCastSpell('heal')}
              disabled={isGameOver || currentTurn.hudInfo.mp < 4}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-700/50 hover:border-emerald-500 text-emerald-200 text-xs font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Restores 14 HP through divine light (4 MP)"
            >
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              <span>Heal (4 MP)</span>
              <kbd className="text-[10px] text-emerald-400/80 bg-emerald-900/50 px-1 rounded">H</kbd>
            </button>
          </div>

          <div className="text-[11px] text-zinc-500 italic">
            Controls: [1-5], WASD, Arrows, Space, Q/H
          </div>
        </div>
      </div>
    </div>
  );
};
