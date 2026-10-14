/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CRTColorTheme,
  Monster,
  PlayerClass,
} from './types';
import {
  GameState,
  buyShopItem,
  castClassSkill,
  createInitialGame,
  handlePlayerAction,
  lightTorch,
  repairWeapon,
  selectPlayerClass,
  usePotion,
} from './engine/gameEngine';
import { sounds } from './engine/sound';
import { AsciiScreen } from './components/AsciiScreen';
import { HudDisplay } from './components/HudDisplay';
import { ActionControls } from './components/ActionControls';
import { TurnHistoryView } from './components/TurnHistoryView';
import { InventoryModal } from './components/InventoryModal';
import { MerchantModal } from './components/MerchantModal';
import { ClassSelectionModal } from './components/ClassSelectionModal';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Tv,
  HelpCircle,
  Skull,
  Trophy,
  Flame,
  Store,
} from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGame());
  const [crtTheme, setCrtTheme] = useState<CRTColorTheme>('amber');
  const [scanlines, setScanlines] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isMerchantOpen, setIsMerchantOpen] = useState(false);

  // Synchronize internal merchant state
  useEffect(() => {
    if (gameState.isMerchantOpen) {
      setIsMerchantOpen(true);
    }
  }, [gameState.isMerchantOpen]);

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

  const handleSelectClass = (chosenClass: PlayerClass) => {
    setGameState((prev: GameState) => selectPlayerClass(prev, chosenClass));
  };

  const handleCastSkill = (skillId: string) => {
    setGameState((prev: GameState) => castClassSkill(prev, skillId));
  };

  const handleLightTorch = () => {
    setGameState((prev: GameState) => lightTorch(prev));
  };

  const handleRepairWeapon = () => {
    setGameState((prev: GameState) => repairWeapon(prev));
  };

  const handleUsePotion = () => {
    setGameState((prev: GameState) => usePotion(prev));
  };

  const handleBuyShopItem = (itemType: 'potion' | 'torch' | 'repair' | 'sword') => {
    setGameState((prev: GameState) => buyShopItem(prev, itemType));
  };

  const handleToggleMute = () => {
    const nextMute = sounds.toggleMute();
    setIsMuted(nextMute);
  };

  const handleRestart = () => {
    setGameState(createInitialGame());
    setIsMerchantOpen(false);
  };

  // Command prompt interpreter from terminal chat input
  const handleCommandSubmit = (rawCmd: string) => {
    const cmd = rawCmd.toLowerCase().trim();

    // Turn 1 Class Selection commands:
    if (!gameState.player.classChosen) {
      if (cmd === '1' || cmd.includes('fighter')) {
        handleSelectClass('Fighter');
        return;
      }
      if (cmd === '2' || cmd.includes('mage')) {
        handleSelectClass('Mage');
        return;
      }
      if (cmd === '3' || cmd.includes('rogue')) {
        handleSelectClass('Rogue');
        return;
      }
    }

    if (
      cmd === '1' ||
      cmd === 'w' ||
      cmd.startsWith('forward') ||
      cmd === 'move forward' ||
      cmd === 'step' ||
      cmd === 'step forward'
    ) {
      handleAction(1);
    } else if (
      cmd === '2' ||
      cmd === 'a' ||
      cmd.includes('left') ||
      cmd === 'turn left' ||
      cmd === 'turn'
    ) {
      handleAction(2);
    } else if (
      cmd === '3' ||
      cmd === ' ' ||
      cmd.startsWith('attack') ||
      cmd.startsWith('strike') ||
      cmd === 'melee'
    ) {
      handleAction(3);
    } else if (
      cmd === '4' ||
      cmd === 'f' ||
      cmd.startsWith('cast') ||
      cmd.startsWith('spell') ||
      cmd.startsWith('skill')
    ) {
      if (gameState.player.skills[0]) {
        handleCastSkill(gameState.player.skills[0].id);
      } else {
        handleAction(4);
      }
    } else if (cmd.includes('fireball') || cmd.includes('fire')) {
      handleCastSkill('fireball');
    } else if (cmd.includes('frost') || cmd.includes('ice')) {
      handleCastSkill('frost_nova');
    } else if (cmd.includes('power') || cmd.includes('power strike')) {
      handleCastSkill('power_strike');
    } else if (cmd.includes('shield bash') || cmd.includes('bash')) {
      handleCastSkill('shield_bash');
    } else if (cmd.includes('backstab') || cmd.includes('shadow')) {
      handleCastSkill('shadow_backstab');
    } else if (cmd.includes('poison') || cmd.includes('poison blade')) {
      handleCastSkill('poison_blade');
    } else if (cmd.includes('barrier') || cmd.includes('shield')) {
      handleCastSkill('arcane_barrier');
    } else if (cmd.includes('heal')) {
      handleCastSkill('lesser_heal');
    } else if (cmd === 't' || cmd.includes('torch') || cmd.includes('light torch')) {
      handleLightTorch();
    } else if (cmd === 'p' || cmd.includes('potion') || cmd.includes('drink')) {
      handleUsePotion();
    } else if (cmd.includes('repair') || cmd.includes('whetstone') || cmd.includes('fix')) {
      handleRepairWeapon();
    } else if (
      cmd === '5' ||
      cmd === 'r' ||
      cmd.startsWith('item') ||
      cmd.startsWith('use')
    ) {
      handleAction(5);
    } else if (
      cmd === '6' ||
      cmd === 'e' ||
      cmd.startsWith('interact') ||
      cmd.startsWith('open') ||
      cmd.startsWith('search') ||
      cmd.startsWith('inspect') ||
      cmd.startsWith('shop') ||
      cmd.startsWith('merchant')
    ) {
      handleAction(6);
    } else if (cmd === 'shop' || cmd === 'merchant') {
      setIsMerchantOpen(true);
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
                <span>3D ASCII RPG ENGINE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  CLASS & SPELL FX
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">
                Fighter/Mage/Rogue • Dynamic Torch Lighting • Spell FX • Equipment Durability
              </p>
            </div>
          </div>

          {/* CRT Theme & Controls Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Quick Torch Trigger */}
            <button
              onClick={handleLightTorch}
              className="flex items-center gap-1 px-2 py-1 rounded bg-amber-950/60 border border-amber-600/50 text-amber-300 hover:bg-amber-900/80 transition cursor-pointer text-[11px]"
              title="Light a fresh torch (T)"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Torch [{player.torchFuel}/5]</span>
            </button>

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
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            {/* Codex & Guide */}
            <button
              onClick={() => setIsInventoryOpen(true)}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:border-zinc-700 transition cursor-pointer"
              title="Backpack & Spellbook (I)"
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

        {/* TURN 1 CLASS SELECTION PROMPT */}
        {!player.classChosen && (
          <ClassSelectionModal onSelectClass={handleSelectClass} />
        )}

        {/* VICTORY BANNER */}
        {gameState.isVictory && (
          <div className="p-4 rounded-xl border border-yellow-500/60 bg-gradient-to-r from-yellow-950/70 via-amber-900/60 to-yellow-950/70 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-300 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-yellow-200 uppercase tracking-wide">
                  Victory! The Minotaur Dreadlord Slain!
                </h2>
                <p className="text-xs text-yellow-300/80">
                  You conquered the 30x30 Abyssal Vault and recovered the legendary Ancient Relic!
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
                  Your Journey Has Ended on Floor {gameState.currentFloor}
                </h2>
                <p className="text-xs text-red-400/80">
                  The dark corridors claim your bones. Light a torch and rise once more.
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

        {/* 1. WIDESCREEN 3D VIEWPORT & MINI-MAP */}
        <AsciiScreen
          currentTurn={currentTurn}
          theme={crtTheme}
          scanlines={scanlines}
          flashEffect={gameState.flashEffect}
          monsterInFront={monsterInFront}
          floatingText={gameState.floatingText}
        />

        {/* 2. EXTENDED HUD & CLASS SPELLBOOK + 3. VIEWPORT LOG & COMBAT TEXT */}
        <HudDisplay currentTurn={currentTurn} />

        {/* 4. EXPANDED ACTION MENU */}
        <ActionControls
          currentTurn={currentTurn}
          skills={player.skills || []}
          onAction={handleAction}
          onCastSkill={handleCastSkill}
          onLightTorch={handleLightTorch}
          onRepairWeapon={handleRepairWeapon}
          onUsePotion={handleUsePotion}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenMerchant={() => setIsMerchantOpen(true)}
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

      {/* Backpack & Equipment Modal */}
      {isInventoryOpen && (
        <InventoryModal
          player={player}
          onClose={() => setIsInventoryOpen(false)}
          onUseItem={(itemId) => {
            const item = player.inventory.find((i) => i.id === itemId);
            if (item?.type === 'torch') handleLightTorch();
            else if (item?.type === 'repair_kit') handleRepairWeapon();
            else handleUsePotion();
          }}
        />
      )}

      {/* Subterranean Merchant Trading Modal */}
      {isMerchantOpen && (
        <MerchantModal
          player={player}
          onClose={() => setIsMerchantOpen(false)}
          onBuyItem={handleBuyShopItem}
        />
      )}
    </div>
  );
}
