/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CRTColorTheme,
  Monster,
} from './types';
import {
  GameState,
  castSpell,
  createInitialGame,
  handlePlayerAction,
  useItem,
} from './engine/gameEngine';
import { sounds } from './engine/sound';
import { AsciiScreen } from './components/AsciiScreen';
import { HudDisplay } from './components/HudDisplay';
import { ActionControls } from './components/ActionControls';
import { TurnHistoryView } from './components/TurnHistoryView';
import { InventoryModal } from './components/InventoryModal';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Tv,
  HelpCircle,
  Skull,
  Trophy,
} from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGame());
  const [crtTheme, setCrtTheme] = useState<CRTColorTheme>('amber');
  const [scanlines, setScanlines] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // Victory Confetti
  useEffect(() => {
    if (gameState.isVictory) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [gameState.isVictory]);

  const handleAction = (actionIndex: number) => {
    setGameState((prev: GameState) => handlePlayerAction(prev, actionIndex));
  };

  const handleCastSpell = (spellType: 'firebolt' | 'heal' | 'haste' | 'weaken') => {
    setGameState((prev: GameState) => castSpell(prev, spellType));
  };

  const handleUseItem = (itemId: string) => {
    setGameState((prev: GameState) => useItem(prev, itemId));
  };

  const handleToggleMute = () => {
    const nextMute = sounds.toggleMute();
    setIsMuted(nextMute);
  };

  const handleRestart = () => {
    setGameState(createInitialGame());
  };

  // Command prompt interpreter from terminal chat input
  const handleCommandSubmit = (rawCmd: string) => {
    const cmd = rawCmd.toLowerCase().trim();

    if (cmd === '1' || cmd === 'w' || cmd.startsWith('forward') || cmd === 'move forward' || cmd === 'step' || cmd === 'step forward') {
      handleAction(1);
    } else if (cmd === '2' || cmd === 'a' || cmd.includes('left') || cmd === 'turn left') {
      handleAction(2);
    } else if (cmd === '3' || cmd === 'd' || cmd.includes('right') || cmd === 'turn right') {
      handleAction(3);
    } else if (cmd === '4' || cmd === 's' || cmd.includes('back') || cmd === '180' || cmd === 'step back') {
      handleAction(4);
    } else if (cmd === '5' || cmd === 'c' || cmd.startsWith('strafe')) {
      handleAction(5);
    } else if (
      cmd === '6' ||
      cmd === 'e' ||
      cmd.startsWith('interact') ||
      cmd.startsWith('open') ||
      cmd.startsWith('attack') ||
      cmd.startsWith('search') ||
      cmd.startsWith('drink') ||
      cmd.startsWith('descend')
    ) {
      handleAction(6);
    } else if (cmd.includes('fire') || cmd === 'q') {
      handleCastSpell('firebolt');
    } else if (cmd.includes('heal') || cmd === 'h') {
      handleCastSpell('heal');
    } else if (cmd.includes('haste') || cmd === 'z') {
      handleCastSpell('haste');
    } else if (cmd.includes('weaken') || cmd.includes('curse') || cmd === 'x') {
      handleCastSpell('weaken');
    } else if (cmd.includes('potion') || cmd.includes('drink potion')) {
      const pot = gameState.player.inventory.find((item) => item.type === 'potion');
      if (pot) handleUseItem(pot.id);
    } else if (cmd === 'inventory' || cmd === 'bag' || cmd === 'i') {
      setIsInventoryOpen(true);
    } else if (cmd === 'restart') {
      handleRestart();
    } else {
      const num = parseInt(cmd, 10);
      if (num >= 1 && num <= 6) {
        handleAction(num);
      } else {
        handleAction(6);
      }
    }
  };

  // Check if monster in front
  const { currentTurn, player, dungeonMap } = gameState;
  const { dx, dy } = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ][player.facing];
  const monsterInFront: Monster | null =
    dungeonMap.monsters.find(
      (m: Monster) => m.x === player.x + dx && m.y === player.y + dy && m.hp > 0
    ) || null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 font-mono">
      <div className="w-full max-w-5xl flex flex-col gap-3 sm:gap-4">
        {/* APP HEADER */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              3D
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-wider text-zinc-100 flex items-center gap-2">
                <span>3D ASCII DUNGEON ENGINE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  WIDESCREEN 30x12
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">
                Widescreen FOV • 11x11 Radar • 30x30 Dungeon Scale • Real-Time Depth Shading
              </p>
            </div>
          </div>

          {/* CRT Theme & Controls Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Color Palette Switcher */}
            <div className="flex items-center bg-zinc-950/80 p-1 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-500 px-1.5 hidden md:inline">Phosphor:</span>
              <button
                onClick={() => setCrtTheme('amber')}
                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                  crtTheme === 'amber'
                    ? 'bg-amber-400 ring-2 ring-amber-400 scale-110'
                    : 'bg-amber-600/60 hover:bg-amber-500'
                }`}
                title="Amber Phosphor"
              />
              <button
                onClick={() => setCrtTheme('emerald')}
                className={`w-4 h-4 rounded-full ml-1.5 transition-transform cursor-pointer ${
                  crtTheme === 'emerald'
                    ? 'bg-emerald-400 ring-2 ring-emerald-400 scale-110'
                    : 'bg-emerald-600/60 hover:bg-emerald-500'
                }`}
                title="Emerald Green"
              />
              <button
                onClick={() => setCrtTheme('cyan')}
                className={`w-4 h-4 rounded-full ml-1.5 transition-transform cursor-pointer ${
                  crtTheme === 'cyan'
                    ? 'bg-cyan-400 ring-2 ring-cyan-400 scale-110'
                    : 'bg-cyan-600/60 hover:bg-cyan-500'
                }`}
                title="Cyber Cyan"
              />
              <button
                onClick={() => setCrtTheme('monochrome')}
                className={`w-4 h-4 rounded-full ml-1.5 transition-transform cursor-pointer ${
                  crtTheme === 'monochrome'
                    ? 'bg-zinc-200 ring-2 ring-zinc-200 scale-110'
                    : 'bg-zinc-500/60 hover:bg-zinc-400'
                }`}
                title="Monochrome White"
              />
            </div>

            {/* Scanline Toggle */}
            <button
              onClick={() => setScanlines(!scanlines)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                scanlines
                  ? 'bg-zinc-800 border-zinc-600 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500'
              }`}
              title="Toggle CRT Scanline Effect"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>

            {/* Audio Mute Toggle */}
            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                !isMuted
                  ? 'bg-zinc-800 border-zinc-600 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500'
              }`}
              title="Toggle Audio Effects (M)"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Codex & Guide */}
            <button
              onClick={() => setIsInventoryOpen(true)}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:border-zinc-700 transition cursor-pointer"
              title="Guide & Backpack"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {/* Restart */}
            <button
              onClick={handleRestart}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700 transition cursor-pointer text-[11px]"
              title="Restart Game from Floor 1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </header>

        {/* VICTORY BANNER */}
        {gameState.isVictory && (
          <div className="p-4 rounded-xl border border-yellow-500/60 bg-gradient-to-r from-yellow-950/70 via-amber-900/60 to-yellow-950/70 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-300 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-yellow-200 uppercase tracking-wide">
                  Victory! The Abyssal Vault Conquered!
                </h2>
                <p className="text-xs text-yellow-300/80">
                  You vanquished the Minotaur Dreadlord and retrieved the Ancient Relic of Power.
                </p>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="px-4 py-2 rounded-lg bg-yellow-500 text-zinc-950 font-bold text-xs hover:bg-yellow-400 transition cursor-pointer shrink-0"
            >
              Play Again
            </button>
          </div>
        )}

        {/* GAME OVER BANNER */}
        {gameState.isGameOver && !gameState.isVictory && (
          <div className="p-4 rounded-xl border border-red-800/80 bg-red-950/70 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-900/60 border border-red-700/60 flex items-center justify-center text-red-400 shrink-0">
                <Skull className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-red-300 uppercase tracking-wide">
                  Your Soul Has Perished in Floor {gameState.currentFloor}
                </h2>
                <p className="text-xs text-red-400/80">
                  The cold dungeon stones claim another wandering adventurer.
                </p>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer shrink-0"
            >
              Try Again
            </button>
          </div>
        )}

        {/* 1. 3D FIRST-PERSON VIEWPORT & MINI-MAP */}
        <AsciiScreen
          currentTurn={currentTurn}
          theme={crtTheme}
          scanlines={scanlines}
          flashEffect={gameState.flashEffect}
          monsterInFront={monsterInFront}
          floatingText={gameState.floatingText}
        />

        {/* 2. COMPASS & HUD + 3. VIEWPORT DESCRIPTION */}
        <HudDisplay
          currentTurn={currentTurn}
          xp={player.xp}
          nextXp={player.nextXp}
          level={player.level}
          gold={player.gold}
        />

        {/* 4. FIRST-PERSON ACTIONS */}
        <ActionControls
          currentTurn={currentTurn}
          onAction={handleAction}
          onCastSpell={handleCastSpell}
          onOpenInventory={() => setIsInventoryOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isGameOver={gameState.isGameOver}
        />

        {/* TRANSCRIPT & COMMAND CONSOLE */}
        <TurnHistoryView
          logs={gameState.logs}
          onCommandSubmit={handleCommandSubmit}
          isGameOver={gameState.isGameOver}
        />
      </div>

      {/* Backpack & Guide Modal */}
      {isInventoryOpen && (
        <InventoryModal
          player={player}
          onClose={() => setIsInventoryOpen(false)}
          onUseItem={handleUseItem}
        />
      )}
    </div>
  );
}
