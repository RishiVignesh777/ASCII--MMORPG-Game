import React from 'react';
import { Copy, Check, Terminal, Sparkles, ShieldAlert } from 'lucide-react';
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
  const [copied, setCopied] = React.useState(false);

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

  const currentThemeStyle = themeClasses[theme];

  // Side-by-side combined text lines
  const combinedLines: string[] = [];
  for (let i = 0; i < 8; i++) {
    const vp = currentTurn.viewportAscii[i] || '+----------------+';
    const mm = currentTurn.miniMapAscii[i] || '';
    combinedLines.push(`${vp}  ${mm}`);
  }

  return (
    <div className="relative flex flex-col w-full rounded-xl border border-zinc-800 bg-zinc-900/90 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* CRT Top Frame Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/80 border-b border-zinc-800 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-zinc-200">1. 3D FIRST-PERSON VIEWPORT & MINI-MAP</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-[10px] text-zinc-400">
            TURN {currentTurn.turn}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {monsterInFront && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 animate-pulse bg-red-950/60 px-2 py-0.5 rounded border border-red-800/50">
              <ShieldAlert className="w-3 h-3" />
              HOSTILE: {monsterInFront.name} ({monsterInFront.hp}/{monsterInFront.maxHp} HP)
            </span>
          )}

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
        className={`relative p-4 md:p-6 font-mono select-none overflow-x-auto ${currentThemeStyle.bg} ${currentThemeStyle.glow} transition-colors duration-300`}
      >
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
        <div className="flex justify-center items-center">
          <pre
            className={`text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-widest leading-tight ${currentThemeStyle.text} drop-shadow-[0_0_8px_currentColor]`}
            style={{ fontFamily: "'Fira Code', monospace" }}
          >
            {combinedLines.join('\n')}
          </pre>
        </div>
      </div>
    </div>
  );
};
