import React, { useState } from 'react';
import {
  Copy,
  Check,
  Terminal,
  Sparkles,
  ShieldAlert,
  Eye,
  Flame,
  Swords,
  Snowflake,
} from 'lucide-react';
import { CRTColorTheme, Monster, TurnLog } from '../types';
import { formatTurnResponse } from '../engine/gameEngine';

interface AsciiScreenProps {
  currentTurn: TurnLog;
  theme: CRTColorTheme;
  scanlines: boolean;
  flashEffect: 'hit' | 'damage' | 'heal' | 'door' | null;
  monsterInFront: Monster | null;
  floatingText: string | null;
}

export const AsciiScreen: React.FC<AsciiScreenProps> = ({
  currentTurn,
  theme,
  scanlines,
  flashEffect,
  monsterInFront,
  floatingText,
}) => {
  const [copied, setCopied] = useState(false);
  const [fovDimmingEnabled, setFovDimmingEnabled] = useState(true);

  const handleCopy = () => {
    const text = formatTurnResponse(currentTurn);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Theme color maps
  const themeClasses: Record<CRTColorTheme, { text: string; glow: string; border: string; bg: string }> = {
    amber: {
      text: 'text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      border: 'border-amber-500/40',
      bg: 'bg-zinc-950',
    },
    emerald: {
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      border: 'border-emerald-500/40',
      bg: 'bg-zinc-950',
    },
    cyan: {
      text: 'text-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.25)]',
      border: 'border-cyan-500/40',
      bg: 'bg-zinc-950',
    },
    monochrome: {
      text: 'text-zinc-200',
      glow: 'shadow-[0_0_20px_rgba(255,255,255,0.15)]',
      border: 'border-zinc-500/40',
      bg: 'bg-zinc-950',
    },
  };

  const getFovCharStyle = (depth: number, theme: CRTColorTheme) => {
    if (!fovDimmingEnabled) return '';

    if (theme === 'amber') {
      switch (depth) {
        case 1:
          return 'text-amber-300 font-extrabold opacity-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]';
        case 2:
          return 'text-amber-400 font-semibold opacity-80 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]';
        case 3:
          return 'text-amber-600 font-normal opacity-55';
        case 4:
          return 'text-amber-800/80 font-light opacity-35';
        default:
          return 'text-amber-500/80 font-medium opacity-75';
      }
    } else if (theme === 'emerald') {
      switch (depth) {
        case 1:
          return 'text-emerald-300 font-extrabold opacity-100 drop-shadow-[0_0_8px_rgba(110,231,183,0.9)]';
        case 2:
          return 'text-emerald-400 font-semibold opacity-80 drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]';
        case 3:
          return 'text-emerald-600 font-normal opacity-55';
        case 4:
          return 'text-emerald-800/80 font-light opacity-35';
        default:
          return 'text-emerald-500/80 font-medium opacity-75';
      }
    } else if (theme === 'cyan') {
      switch (depth) {
        case 1:
          return 'text-cyan-300 font-extrabold opacity-100 drop-shadow-[0_0_8px_rgba(103,232,249,0.9)]';
        case 2:
          return 'text-cyan-400 font-semibold opacity-80 drop-shadow-[0_0_4px_rgba(6,182,212,0.4)]';
        case 3:
          return 'text-cyan-600 font-normal opacity-55';
        case 4:
          return 'text-cyan-800/80 font-light opacity-35';
        default:
          return 'text-cyan-500/80 font-medium opacity-75';
      }
    } else {
      switch (depth) {
        case 1:
          return 'text-white font-extrabold opacity-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]';
        case 2:
          return 'text-zinc-300 font-semibold opacity-80 drop-shadow-[0_0_4px_rgba(212,212,216,0.4)]';
        case 3:
          return 'text-zinc-500 font-normal opacity-55';
        case 4:
          return 'text-zinc-700 font-light opacity-35';
        default:
          return 'text-zinc-400 font-medium opacity-75';
      }
    }
  };

  const currentThemeStyle = themeClasses[theme];
  const hud = currentTurn.extendedHud;
  const activeFx = currentTurn.activeVisualFx;

  // Combine lines for 12 rows
  const combinedLines: string[] = [];
  const maxRows = Math.max(currentTurn.viewportAscii.length, currentTurn.miniMapAscii.length, 12);
  for (let i = 0; i < maxRows; i++) {
    const vp = currentTurn.viewportAscii[i] || '+------------------------------+';
    const mm = currentTurn.miniMapAscii[i] || '';
    combinedLines.push(`${vp}  ${mm}`);
  }

  return (
    <div className="relative flex flex-col w-full rounded-xl border border-zinc-800 bg-zinc-900/90 overflow-hidden shadow-2xl backdrop-blur-md font-mono">
      {/* CRT Top Frame Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-zinc-950/80 border-b border-zinc-800 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-zinc-200">1. WIDESCREEN 3D VIEWPORT & MINI-MAP</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-[10px] text-zinc-400">
            TURN {currentTurn.turn}
          </span>

          {/* Torch status badge */}
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
              hud.torchFuel === 0
                ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                : hud.torchFuel <= 2
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}
          >
            <Flame
              className={`w-3 h-3 ${
                hud.torchFuel === 0
                  ? 'text-zinc-600'
                  : hud.torchFuel <= 2
                  ? 'text-amber-400 animate-pulse'
                  : 'text-amber-400'
              }`}
            />
            <span>Torch: {hud.torchFuel}/5 Fuel</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {monsterInFront && (
            <span
              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                monsterInFront.isBoss
                  ? 'bg-red-950 text-red-300 border-red-600 animate-pulse'
                  : 'text-red-400 bg-red-950/60 border-red-800/50'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              {monsterInFront.isBoss ? 'BOSS: ' : 'HOSTILE: '} {monsterInFront.name} (
              {monsterInFront.hp}/{monsterInFront.maxHp} HP)
            </span>
          )}

          {/* FOV Toggle */}
          <button
            onClick={() => setFovDimmingEnabled(!fovDimmingEnabled)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition cursor-pointer border ${
              fovDimmingEnabled
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle Field-of-View dynamic lighting"
          >
            <Eye className="w-3 h-3 text-amber-400" />
            <span>Light Shading: {fovDimmingEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-all text-[11px] cursor-pointer"
            title="Copy Turn Output formatted as Markdown"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Turn Output</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Screen Monitor Body */}
      <div
        className={`relative p-4 md:p-6 select-none overflow-x-auto ${currentThemeStyle.bg} ${currentThemeStyle.glow} transition-colors duration-300`}
      >
        {/* Active Combat / Spell Visual FX Overlay */}
        {activeFx === 'melee_hit' && (
          <div className="absolute top-4 right-8 z-20 flex items-center gap-1 px-3 py-1 rounded bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs shadow-lg animate-pulse">
            <Swords className="w-3.5 h-3.5" />
            <span>Slash Hit!</span>
          </div>
        )}
        {activeFx === 'fireball' && (
          <div className="absolute top-4 right-8 z-20 flex items-center gap-1 px-3 py-1 rounded bg-orange-950/80 border border-orange-500/60 text-orange-300 text-xs shadow-lg animate-bounce">
            <Flame className="w-3.5 h-3.5" />
            <span>Fireball Burst!</span>
          </div>
        )}
        {activeFx === 'frost' && (
          <div className="absolute top-4 right-8 z-20 flex items-center gap-1 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 text-xs shadow-lg animate-pulse">
            <Snowflake className="w-3.5 h-3.5" />
            <span>Frost Nova!</span>
          </div>
        )}
        {activeFx === 'damage_taken' && (
          <div className="absolute inset-0 border-4 border-red-600/70 pointer-events-none animate-pulse z-20" />
        )}

        {/* Flash damage or hit overlay */}
        {flashEffect === 'hit' && (
          <div className="absolute inset-0 bg-amber-400/20 pointer-events-none animate-ping" />
        )}
        {flashEffect === 'damage' && (
          <div className="absolute inset-0 bg-red-500/30 pointer-events-none animate-pulse" />
        )}
        {flashEffect === 'heal' && (
          <div className="absolute inset-0 bg-emerald-400/20 pointer-events-none" />
        )}
        {flashEffect === 'door' && (
          <div className="absolute inset-0 bg-amber-200/10 pointer-events-none" />
        )}

        {/* Scanlines Effect */}
        {scanlines && (
          <div
            className="absolute inset-0 pointer-events-none opacity-25 z-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0px, rgba(0, 0, 0, 0.4) 1px, transparent 1px, transparent 2px)',
            }}
          />
        )}

        {/* Floating feedback alert */}
        {floatingText && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-zinc-900/90 border border-amber-500/50 text-amber-300 text-xs font-mono font-medium shadow-lg animate-bounce flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {floatingText}
          </div>
        )}

        {/* ASCII Viewport & Mini-map side by side display */}
        <div className="flex justify-center items-center py-1">
          <pre
            className="text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-widest leading-tight"
            style={{ fontFamily: "'Fira Code', monospace" }}
          >
            {combinedLines.map((line, rowIndex) => {
              const depthRow = currentTurn.depthGrid?.[rowIndex];

              return (
                <div key={rowIndex} className="whitespace-pre">
                  {line.split('').map((char, charIndex) => {
                    const depth = depthRow?.[charIndex] ?? 1;
                    const fovClass = getFovCharStyle(depth, theme);

                    return (
                      <span
                        key={charIndex}
                        className={`transition-opacity duration-200 ${
                          fovDimmingEnabled ? fovClass : currentThemeStyle.text
                        }`}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </pre>
        </div>

        {/* Torch & Visibility Indicator Legend */}
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-zinc-300">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Dynamic Lighting:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-3.5 h-2 rounded-xs ${
                    level <= hud.torchFuel
                      ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                      : 'bg-zinc-800 border border-zinc-700/50'
                  }`}
                  title={`Torch Fuel Level ${hud.torchFuel}/5`}
                />
              ))}
            </div>
            <span className="text-[10px] text-zinc-400 ml-1">
              {hud.torchFuel >= 4
                ? 'High Torch (Full FOV)'
                : hud.torchFuel >= 1
                ? 'Low Torch (Fading)'
                : 'Pitch Black (Touch Only)'}
            </span>
          </div>

          <div className="text-zinc-500 text-[10px] italic">
            Sprites: Door [ | + | ] • Chest [ ( $ ) ] • Boss (5x5) • Shop (S)
          </div>
        </div>
      </div>
    </div>
  );
};
