import {
  ClassSkill,
  Direction,
  DIRECTION_NAMES,
  DIRECTION_OFFSETS,
  DungeonMap,
  ExtendedHudData,
  Item,
  Monster,
  Player,
  PlayerClass,
  StatusEffect,
  StatusEffectType,
  TileType,
  TurnLog,
  VisualFxType,
} from '../types';
import {
  CLASS_LOADOUTS,
  CLASS_SKILLS,
  getDungeonFloor,
  getInitialPlayerForClass,
  INITIAL_PLAYER,
} from './dungeonData';
import { renderFirstPersonView } from './renderer';
import { sounds } from './sound';

export interface GameState {
  player: Player;
  currentFloor: number;
  dungeonMap: DungeonMap;
  turnCount: number;
  logs: TurnLog[];
  currentTurn: TurnLog;
  isGameOver: boolean;
  isVictory: boolean;
  floatingText: string | null;
  flashEffect: 'hit' | 'damage' | 'heal' | 'door' | null;
  isMerchantOpen: boolean;
  selectedSkillId: string | null;
}

// Helper to apply or refresh status effects
export function applyStatusEffect(
  target: { statusEffects?: StatusEffect[] },
  newEffect: StatusEffect
): void {
  if (!target.statusEffects) {
    target.statusEffects = [];
  }
  const existing = target.statusEffects.find((e) => e.type === newEffect.type);
  if (existing) {
    existing.duration = Math.max(existing.duration, newEffect.duration);
    existing.potency = Math.max(existing.potency, newEffect.potency);
  } else {
    target.statusEffects.push({ ...newEffect });
  }
}

// Helper to remove specific status effects
export function removeStatusEffects(
  target: { statusEffects?: StatusEffect[] },
  typesToRemove: StatusEffectType[]
): string[] {
  if (!target.statusEffects || target.statusEffects.length === 0) return [];
  const removedNames: string[] = [];
  target.statusEffects = target.statusEffects.filter((e) => {
    if (typesToRemove.includes(e.type)) {
      removedNames.push(e.name);
      return false;
    }
    return true;
  });
  return removedNames;
}

// Process tick-down and damage-over-time for status effects
function tickStatusEffects(
  entity: { hp: number; maxHp: number; statusEffects?: StatusEffect[]; name?: string },
  isPlayer: boolean
): { logMessages: string[]; dotDamage: number } {
  const logMessages: string[] = [];
  let dotDamage = 0;
  if (!entity.statusEffects || entity.statusEffects.length === 0) {
    return { logMessages, dotDamage };
  }

  const entityName = isPlayer ? 'You' : entity.name || 'Monster';
  const remainingEffects: StatusEffect[] = [];

  for (const effect of entity.statusEffects) {
    if (effect.type === 'poisoned') {
      const dmg = effect.potency || 2;
      entity.hp = Math.max(0, entity.hp - dmg);
      dotDamage += dmg;
      logMessages.push(
        isPlayer ? `☠ You suffered ${dmg} Poison damage!` : `☠ ${entityName} suffered ${dmg} Poison damage!`
      );
    } else if (effect.type === 'burned') {
      const dmg = effect.potency || 3;
      entity.hp = Math.max(0, entity.hp - dmg);
      dotDamage += dmg;
      logMessages.push(
        isPlayer ? `🔥 You suffered ${dmg} Burn damage!` : `🔥 ${entityName} suffered ${dmg} Burn damage!`
      );
    }

    effect.duration -= 1;
    if (effect.duration > 0) {
      remainingEffects.push(effect);
    } else {
      logMessages.push(
        isPlayer ? `⌛ Your ${effect.name} status has worn off.` : `⌛ ${entityName}'s ${effect.name} status has worn off.`
      );
    }
  }

  entity.statusEffects = remainingEffects;
  return { logMessages, dotDamage };
}

export function createInitialGame(): GameState {
  const currentFloor = 1;
  const dungeonMap = getDungeonFloor(currentFloor);
  const player: Player = JSON.parse(JSON.stringify(INITIAL_PLAYER));

  const turnLog = buildTurnLog(
    player,
    dungeonMap,
    currentFloor,
    1,
    'Initialized Floor 1 in front of a heavy wooden door. Choose your Class.',
    'none'
  );

  return {
    player,
    currentFloor,
    dungeonMap,
    turnCount: 1,
    logs: [turnLog],
    currentTurn: turnLog,
    isGameOver: false,
    isVictory: false,
    floatingText: 'Select your Class to begin your adventure!',
    flashEffect: null,
    isMerchantOpen: false,
    selectedSkillId: null,
  };
}

export function buildTurnLog(
  player: Player,
  map: DungeonMap,
  floor: number,
  turn: number,
  actionTaken: string,
  visualFx: VisualFxType = 'none',
  combatEvents?: string[],
  lootNotice?: string
): TurnLog {
  const view = renderFirstPersonView(player, map, floor, visualFx);

  // Active spells text format for Extended HUD
  const spellsList = (player.skills || [])
    .map((s) => `${s.name} (${s.mpCost} MP)`)
    .join(', ');

  const potionsCount = player.inventory.filter((i) => i.type === 'potion').length;
  const keysCount = player.keys;

  const weaponBonus = player.weapon.bonusAtk ? ` (+${player.weapon.bonusAtk} ATK)` : '';
  const armorBonus = player.shieldArmor.bonusDef ? ` (+${player.shieldArmor.bonusDef} DEF)` : '';

  const extendedHud: ExtendedHudData = {
    characterClass: player.characterClass,
    level: player.level,
    xp: player.xp,
    nextXp: player.nextXp,
    hp: player.hp,
    maxHp: player.maxHp,
    mp: player.mp,
    maxMp: player.maxMp,
    torchFuel: player.torchFuel,
    maxTorchFuel: player.maxTorchFuel,
    mainHand: `${player.weapon.name}${weaponBonus}`,
    weaponDura: player.weaponDurability,
    maxWeaponDura: player.maxWeaponDurability,
    armor: `${player.shieldArmor.name}${armorBonus}`,
    activeSpells: spellsList || 'None',
    potionsCount,
    torchesCount: player.torchesCount,
    keysCount,
    gold: player.gold,
    x: player.x,
    y: player.y,
    floor,
    statusEffects: player.statusEffects || [],
  };

  // 6 EXPANDED ACTION MENU OPTIONS:
  let action6 = 'Environment Action (Inspect stone floor)';
  if (view.objectInFront === 'merchant') {
    action6 = 'Environment Action (Talk to Shopkeeper)';
  } else if (view.monsterInFront) {
    action6 = `Environment Action (Examine ${view.monsterInFront.name})`;
  } else if (view.objectInFront === 'door_closed') {
    action6 = 'Environment Action (Open heavy door [ | + | ])';
  } else if (view.objectInFront === 'chest') {
    action6 = 'Environment Action (Open treasure chest [ ( $ ) ])';
  } else if (view.objectInFront === 'fountain') {
    action6 = 'Environment Action (Drink from celestial fountain)';
  } else if (view.objectInFront === 'stairs_down') {
    action6 = `Environment Action (Descend stairs to Floor ${floor + 1})`;
  }

  const actions = [
    'Move Forward / Step Back',
    'Turn Left (90°) / Turn Right (90°)',
    view.monsterInFront
      ? `Basic Attack / Melee Strike (${view.monsterInFront.name})`
      : 'Basic Attack / Melee Strike (Swing into air)',
    `Cast Spell / Use Class Skill (${player.skills[0]?.name || 'Spellbook'})`,
    `Use Item (Potion, Light Torch [${player.torchFuel}/5], Repair)`,
    action6,
  ];

  const targetMonsterEffects = view.monsterInFront
    ? {
        name: view.monsterInFront.name,
        statusEffects: view.monsterInFront.statusEffects || [],
      }
    : undefined;

  return {
    turn,
    actionTaken,
    viewportAscii: view.viewportLines,
    miniMapAscii: view.miniMapLines,
    depthGrid: view.depthGrid,
    heading: view.facingName,
    activeVisualFx: visualFx,
    extendedHud,
    viewportDescription: view.description,
    actions,
    combatLog: combatEvents,
    lootNotification: lootNotice,
    targetMonsterEffects,
  };
}

// FORMAT THE TURN EXACTLY INTO THE 4 REQUIRED SECTIONS
export function formatTurnResponse(log: TurnLog): string {
  const combinedLines: string[] = [];
  for (let i = 0; i < 12; i++) {
    const vp = log.viewportAscii[i] || '+------------------------------+';
    const mm = log.miniMapAscii[i] || '';
    combinedLines.push(`${vp}  ${mm}`);
  }

  const actionsList = log.actions
    .map((act, index) => `${index + 1}. ${act}`)
    .join('\n');

  let combatSection = '';
  if (log.combatLog && log.combatLog.length > 0) {
    combatSection = `\nCOMBAT LOG:\n${log.combatLog.map((c) => `* ${c}`).join('\n')}\n`;
  }

  let lootSection = '';
  if (log.lootNotification) {
    lootSection = `\nLOOT:\n* ${log.lootNotification}\n`;
  }

  const hud = log.extendedHud;

  return `1. WIDESCREEN 3D VIEWPORT & MINI-MAP:
\`\`\`
${combinedLines.join('\n')}
\`\`\`

2. EXTENDED HUD & CLASS SPELLBOOK:
- Class: ${hud.characterClass} | Level: ${hud.level} (XP: ${hud.xp}/${hud.nextXp})
- Vitals: HP: ${hud.hp}/${hud.maxHp} | MP: ${hud.mp}/${hud.maxMp} | Torch Fuel: ${hud.torchFuel}/${hud.maxTorchFuel}
- Equipment: Main-Hand: ${hud.mainHand} (Dura: ${hud.weaponDura}/${hud.maxWeaponDura}) | Armor: ${hud.armor}
- Active Spells/Skills: ${hud.activeSpells}
- Inventory: Potions: ${hud.potionsCount} | Torches: ${hud.torchesCount} | Keys: ${hud.keysCount} | Gold: ${hud.gold}${combatSection}${lootSection}
3. VIEWPORT LOG & COMBAT TEXT:
${log.viewportDescription}

4. EXPANDED ACTION MENU:
${actionsList}`;
}

// SELECT PLAYER CLASS (Turn 1 mechanic)
export function selectPlayerClass(state: GameState, chosenClass: PlayerClass): GameState {
  const newPlayer = getInitialPlayerForClass(chosenClass);
  sounds.buff();

  const turnLog = buildTurnLog(
    newPlayer,
    state.dungeonMap,
    state.currentFloor,
    state.turnCount,
    `Selected Class: ${chosenClass}. Equipping class loadout and spellbook.`,
    'none',
    [`Sworn path of the ${chosenClass}! Gained ${newPlayer.skills.map((s) => s.name).join(', ')}.`]
  );

  return {
    ...state,
    player: newPlayer,
    logs: [turnLog, ...state.logs.slice(1)],
    currentTurn: turnLog,
    floatingText: `${chosenClass} Selected!`,
  };
}

// LIGHT TORCH
export function lightTorch(state: GameState): GameState {
  if (state.player.torchesCount <= 0 && state.player.torchFuel > 0) {
    return {
      ...state,
      floatingText: 'No spare torches in inventory!',
    };
  }

  const player = JSON.parse(JSON.stringify(state.player)) as Player;
  if (player.torchesCount > 0) {
    player.torchesCount -= 1;
  }
  player.torchFuel = player.maxTorchFuel;
  player.torchTurnCounter = 0;

  sounds.torch();

  const turnLog = buildTurnLog(
    player,
    state.dungeonMap,
    state.currentFloor,
    state.turnCount + 1,
    'Lit a fresh tallow torch. Full 30x12 dungeon visibility restored (5/5).',
    'none',
    ['🔥 A bright amber flame ignites, pushing back the oppressive subterranean darkness!']
  );

  return {
    ...state,
    player,
    turnCount: state.turnCount + 1,
    logs: [turnLog, ...state.logs],
    currentTurn: turnLog,
    floatingText: 'Torch Lit (5/5 Fuel)!',
  };
}

// REPAIR WEAPON
export function repairWeapon(state: GameState): GameState {
  const repairItemIndex = state.player.inventory.findIndex((i) => i.type === 'repair_kit');
  if (repairItemIndex === -1 && state.player.gold < 12) {
    return {
      ...state,
      floatingText: 'Need a Whetstone or 12 Gold to repair!',
    };
  }

  const player = JSON.parse(JSON.stringify(state.player)) as Player;
  let notice = '';

  if (repairItemIndex !== -1) {
    player.inventory.splice(repairItemIndex, 1);
    player.weaponDurability = Math.min(
      player.maxWeaponDurability,
      player.weaponDurability + 15
    );
    notice = 'Used Whetstone & Repair Kit: Restored +15 weapon durability!';
  } else {
    player.gold -= 12;
    player.weaponDurability = player.maxWeaponDurability;
    notice = 'Paid 12 gold: Fully polished and restored weapon durability!';
  }

  sounds.repair();

  const turnLog = buildTurnLog(
    player,
    state.dungeonMap,
    state.currentFloor,
    state.turnCount + 1,
    'Repaired Main-Hand weapon with whetstone.',
    'none',
    [notice]
  );

  return {
    ...state,
    player,
    turnCount: state.turnCount + 1,
    logs: [turnLog, ...state.logs],
    currentTurn: turnLog,
    floatingText: `Weapon Repaired (${player.weaponDurability}/${player.maxWeaponDurability})`,
  };
}

// USE ITEM (POTION)
export function usePotion(state: GameState, itemId?: string): GameState {
  const player = JSON.parse(JSON.stringify(state.player)) as Player;
  const idx = itemId
    ? player.inventory.findIndex((i) => i.id === itemId)
    : player.inventory.findIndex((i) => i.type === 'potion');

  if (idx === -1) {
    return {
      ...state,
      floatingText: 'No potions left in inventory!',
    };
  }

  const item = player.inventory[idx];
  player.inventory.splice(idx, 1);

  const events: string[] = [];
  if (item.healHp) {
    const healed = Math.min(item.healHp, player.maxHp - player.hp);
    player.hp += healed;
    events.push(`Restored ${healed} HP! (${player.hp}/${player.maxHp})`);
  }
  if (item.healMp) {
    const restored = Math.min(item.healMp, player.maxMp - player.mp);
    player.mp += restored;
    events.push(`Restored ${restored} MP! (${player.mp}/${player.maxMp})`);
  }

  sounds.heal();

  const turnLog = buildTurnLog(
    player,
    state.dungeonMap,
    state.currentFloor,
    state.turnCount + 1,
    `Drank ${item.name}.`,
    'none',
    events
  );

  return {
    ...state,
    player,
    turnCount: state.turnCount + 1,
    logs: [turnLog, ...state.logs],
    currentTurn: turnLog,
    flashEffect: 'heal',
    floatingText: `Drank ${item.name}!`,
  };
}

// CAST CLASS SKILL / SPELL
export function castClassSkill(state: GameState, skillId: string): GameState {
  if (state.isGameOver) return state;

  const player = JSON.parse(JSON.stringify(state.player)) as Player;
  const map = JSON.parse(JSON.stringify(state.dungeonMap)) as DungeonMap;
  const skill = player.skills.find((s) => s.id === skillId);

  if (!skill) {
    return { ...state, floatingText: 'Skill not found!' };
  }

  if (player.mp < skill.mpCost) {
    sounds.bump();
    return { ...state, floatingText: `Not enough MP! Needs ${skill.mpCost} MP.` };
  }

  player.mp -= skill.mpCost;

  const { dx, dy } = DIRECTION_OFFSETS[player.facing];
  const targetX = player.x + dx;
  const targetY = player.y + dy;
  const monster = map.monsters.find((m: Monster) => m.x === targetX && m.y === targetY && m.hp > 0);

  const combatLog: string[] = [];
  let visualFx: VisualFxType = 'none';
  let flashEffect: GameState['flashEffect'] = null;
  let isVictory = state.isVictory;

  if (skill.type === 'heal') {
    const healed = Math.min(20, player.maxHp - player.hp);
    player.hp += healed;
    sounds.heal();
    combatLog.push(`✨ ${skill.name} weaves celestial light, restoring ${healed} HP!`);
    flashEffect = 'heal';
  } else if (skill.type === 'buff') {
    if (skill.bonusEffect) {
      applyStatusEffect(player, skill.bonusEffect);
      combatLog.push(`⚡ ${skill.name} activated: Gained ${skill.bonusEffect.name} for ${skill.bonusEffect.duration} turns!`);
    }
    sounds.buff();
    flashEffect = 'heal';
  } else if (!monster) {
    combatLog.push(`💨 You cast ${skill.name}, but there is no enemy directly ahead!`);
    sounds.attack();
  } else {
    // Attack / Spell targeting monster ahead!
    if (skill.id === 'fireball') {
      sounds.fireball();
      visualFx = 'fireball';
    } else if (skill.id === 'frost_nova') {
      sounds.frost();
      visualFx = 'frost';
    } else {
      sounds.attack();
      visualFx = 'melee_hit';
    }

    // Durability loss on physical weapon skills
    if (skill.type === 'attack') {
      player.weaponDurability = Math.max(0, player.weaponDurability - 1);
    }

    const multiplier = skill.damageMultiplier || 1.5;
    const baseDmg = Math.max(1, player.baseAttack + (player.weapon.bonusAtk || 0));
    let totalDmg = Math.round(baseDmg * multiplier);

    if (player.weaponDurability === 0 && skill.type === 'attack') {
      totalDmg = Math.max(1, Math.floor(totalDmg * 0.35));
      combatLog.push('⚠ Your weapon is broken! Strike dealt reduced damage.');
    }

    monster.hp = Math.max(0, monster.hp - totalDmg);
    combatLog.push(`💥 ${skill.name} strikes ${monster.name} for ${totalDmg} damage! (${monster.hp}/${monster.maxHp} HP)`);

    if (skill.bonusEffect) {
      applyStatusEffect(monster, skill.bonusEffect);
      combatLog.push(`🎯 Inflicted ${skill.bonusEffect.name} on ${monster.name} for ${skill.bonusEffect.duration} turns!`);
    }

    if (monster.hp <= 0) {
      sounds.monsterDeath();
      combatLog.push(`💀 ${monster.name} has been vanquished!`);
      player.xp += monster.xpReward;
      combatLog.push(`🌟 Gained +${monster.xpReward} XP!`);
      if (monster.isBoss) {
        isVictory = true;
        combatLog.push('🏆 The Minotaur Dreadlord falls! The ancient Abyssal Relic is claimed!');
      }
    } else {
      // Monster counter-attacks
      const retaliation = Math.max(1, monster.attack - (player.shieldArmor.bonusDef || 0));
      player.hp = Math.max(0, player.hp - retaliation);
      sounds.playerHurt();
      combatLog.push(`🩸 ${monster.name} retaliates for ${retaliation} damage!`);
      visualFx = 'damage_taken';
      flashEffect = 'damage';
    }
  }

  // Tick status effects
  const pDot = tickStatusEffects(player, true);
  combatLog.push(...pDot.logMessages);

  const isGameOver = player.hp <= 0;
  if (isGameOver) {
    sounds.gameOver();
    combatLog.push('💀 Your wounds prove fatal. Your journey ends here.');
  }

  const turnLog = buildTurnLog(
    player,
    map,
    state.currentFloor,
    state.turnCount + 1,
    `Used ${skill.name}`,
    visualFx,
    combatLog
  );

  return {
    ...state,
    player,
    dungeonMap: map,
    turnCount: state.turnCount + 1,
    logs: [turnLog, ...state.logs],
    currentTurn: turnLog,
    isGameOver,
    isVictory,
    flashEffect,
    floatingText: `Used ${skill.name}!`,
  };
}

// HANDLE 6 EXPANDED PLAYER ACTIONS
export function handlePlayerAction(
  state: GameState,
  actionIndex: number // 1: Move Forward/Back, 2: Turn Left/Right, 3: Attack, 4: Skill, 5: Item, 6: Environment
): GameState {
  if (state.isGameOver) return state;

  // Turn 1 Class prompt handling if not yet chosen:
  if (!state.player.classChosen) {
    if (actionIndex === 1) return selectPlayerClass(state, 'Fighter');
    if (actionIndex === 2) return selectPlayerClass(state, 'Mage');
    if (actionIndex === 3) return selectPlayerClass(state, 'Rogue');
  }

  const player = JSON.parse(JSON.stringify(state.player)) as Player;
  const map = JSON.parse(JSON.stringify(state.dungeonMap)) as DungeonMap;
  let floor = state.currentFloor;
  let actionTakenName = '';
  const combatLog: string[] = [];
  let lootNotification: string | undefined = undefined;
  let floatingText: string | null = null;
  let flashEffect: GameState['flashEffect'] = null;
  let isVictory = state.isVictory;
  let visualFx: VisualFxType = 'none';

  const { dx, dy } = DIRECTION_OFFSETS[player.facing];
  const targetX = player.x + dx;
  const targetY = player.y + dy;
  const monsterInFront = map.monsters.find(
    (m: Monster) => m.x === targetX && m.y === targetY && m.hp > 0
  );

  // Helper for torch decay on movement:
  const checkMovementTorch = () => {
    player.torchTurnCounter += 1;
    if (player.torchTurnCounter >= 5) {
      player.torchTurnCounter = 0;
      if (player.torchFuel > 0) {
        player.torchFuel -= 1;
        if (player.torchFuel === 0) {
          combatLog.push('🔥 Your torch has burned out completely! The dungeon plunges into pitch darkness.');
        } else {
          combatLog.push(`🔥 Your torch flickers low (Torch Fuel: ${player.torchFuel}/5).`);
        }
      }
    }
  };

  // 1. MOVE FORWARD / STEP BACK
  if (actionIndex === 1) {
    if (monsterInFront) {
      sounds.bump();
      actionTakenName = `Cannot step forward; blocked by ${monsterInFront.name}.`;
      floatingText = 'Blocked by monster!';
    } else if (
      targetX < 0 ||
      targetX >= map.width ||
      targetY < 0 ||
      targetY >= map.height ||
      map.tiles[targetY][targetX] === 'wall'
    ) {
      sounds.bump();
      actionTakenName = 'Bumped solidly into a masonry wall.';
      floatingText = 'Wall blocking passage!';
    } else if (map.tiles[targetY][targetX] === 'door_closed') {
      sounds.bump();
      actionTakenName = 'Bumped against the heavy closed door.';
      floatingText = 'Closed Door ahead!';
    } else {
      player.x = targetX;
      player.y = targetY;
      sounds.step();
      checkMovementTorch();
      actionTakenName = `Stepped forward into Grid (${player.x}, ${player.y}).`;

      // Check tile events
      const currTile = map.tiles[player.y][player.x];
      if (currTile === 'fountain') {
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        sounds.heal();
        flashEffect = 'heal';
        combatLog.push('💧 The sacred spring radiates divine grace, fully restoring your HP and MP!');
      } else if (currTile === 'stairs_down') {
        if (floor < 3) {
          floor += 1;
          const nextFloorMap = getDungeonFloor(floor);
          player.x = 15;
          player.y = 24;
          player.facing = 0;
          sounds.stairs();
          actionTakenName = `Descended the spiral stone stairway to Floor ${floor}!`;
          floatingText = `Entered Floor ${floor}!`;
          return {
            ...state,
            player,
            currentFloor: floor,
            dungeonMap: nextFloorMap,
            turnCount: state.turnCount + 1,
            logs: [
              buildTurnLog(
                player,
                nextFloorMap,
                floor,
                state.turnCount + 1,
                actionTakenName,
                'none',
                [`Entered Floor ${floor}. The air grows colder.`]
              ),
              ...state.logs,
            ],
            currentTurn: buildTurnLog(
              player,
              nextFloorMap,
              floor,
              state.turnCount + 1,
              actionTakenName,
              'none',
              [`Entered Floor ${floor}. The air grows colder.`]
            ),
          };
        }
      }
    }
  }

  // 2. TURN LEFT (90°) / TURN RIGHT (90°)
  else if (actionIndex === 2) {
    player.facing = ((player.facing + 3) % 4) as Direction;
    sounds.turn();
    actionTakenName = `Turned left 90° to face ${DIRECTION_NAMES[player.facing]}.`;
  }

  // 3. BASIC ATTACK / MELEE STRIKE
  else if (actionIndex === 3) {
    if (!monsterInFront) {
      sounds.attack();
      actionTakenName = 'Swung weapon into the empty dungeon air.';
      floatingText = 'No target in melee range!';
    } else {
      sounds.attack();
      visualFx = 'melee_hit';

      // Weapon durability decay
      player.weaponDurability = Math.max(0, player.weaponDurability - 1);
      let baseAtk = player.baseAttack + (player.weapon.bonusAtk || 0);

      if (player.weaponDurability === 0) {
        baseAtk = Math.max(1, Math.floor(baseAtk * 0.3));
        combatLog.push('⚠ Your weapon is broken! Deals minimal damage until repaired.');
      }

      const roll = Math.floor(Math.random() * 4) + 1;
      const dmg = Math.max(1, baseAtk + roll - monsterInFront.defense);
      monsterInFront.hp = Math.max(0, monsterInFront.hp - dmg);
      combatLog.push(`⚔ You strike ${monsterInFront.name} for ${dmg} physical damage! (${monsterInFront.hp}/${monsterInFront.maxHp} HP)`);

      if (monsterInFront.hp <= 0) {
        sounds.monsterDeath();
        combatLog.push(`💀 ${monsterInFront.name} collapses into lifeless dust!`);
        player.xp += monsterInFront.xpReward;
        combatLog.push(`🌟 Gained +${monsterInFront.xpReward} XP!`);
        if (monsterInFront.isBoss) {
          isVictory = true;
          combatLog.push('🏆 The Minotaur Dreadlord falls! The ancient Abyssal Relic is claimed!');
        }
      } else {
        // Monster retaliates
        const retaliation = Math.max(1, monsterInFront.attack - (player.shieldArmor.bonusDef || 0));
        player.hp = Math.max(0, player.hp - retaliation);
        sounds.playerHurt();
        combatLog.push(`🩸 ${monsterInFront.name} counter-attacks for ${retaliation} damage!`);
        visualFx = 'damage_taken';
        flashEffect = 'damage';
      }
      actionTakenName = `Melee strike on ${monsterInFront.name}.`;
    }
  }

  // 4. CAST SPELL / USE CLASS SKILL
  else if (actionIndex === 4) {
    const primarySkill = player.skills[0];
    if (primarySkill) {
      return castClassSkill(state, primarySkill.id);
    }
  }

  // 5. USE ITEM (POTION, LIGHT TORCH, REPAIR WEAPON)
  else if (actionIndex === 5) {
    if (player.torchFuel < 3 && player.torchesCount > 0) {
      return lightTorch(state);
    } else if (player.weaponDurability <= 5) {
      return repairWeapon(state);
    } else {
      return usePotion(state);
    }
  }

  // 6. ENVIRONMENT ACTION (Open door, Open chest, Talk to merchant, Search)
  else if (actionIndex === 6) {
    const targetTile = map.tiles[targetY]?.[targetX];
    const chest = map.chests.find((c) => c.x === targetX && c.y === targetY && !c.opened);

    if (targetTile === 'merchant') {
      sounds.merchant();
      actionTakenName = 'Spoke with the Shopkeeper.';
      floatingText = 'Shopkeeper welcomes you!';
      combatLog.push('💰 Shopkeeper: "Welcome, traveler! Browse potions, torches, and repairs."');
      return {
        ...state,
        isMerchantOpen: true,
      };
    } else if (targetTile === 'door_closed') {
      map.tiles[targetY][targetX] = 'door_open';
      sounds.door();
      flashEffect = 'door';
      actionTakenName = 'Pushed open the heavy wooden door [ | + | ].';
      floatingText = 'Door Opened!';
      combatLog.push('🚪 The iron hinges shriek as the heavy wooden door swings wide into the hall.');
    } else if (chest) {
      chest.opened = true;
      sounds.loot();
      player.inventory.push(chest.item);
      player.gold += 20;
      lootNotification = `Found ${chest.item.name} and 20 gold pieces!`;
      actionTakenName = `Opened the ornate chest [ ( $ ) ].`;
      floatingText = `Looted ${chest.item.name}!`;
    } else if (targetTile === 'fountain') {
      player.hp = player.maxHp;
      player.mp = player.maxMp;
      sounds.heal();
      flashEffect = 'heal';
      actionTakenName = 'Drank deep from the sacred fountain.';
      floatingText = 'Fully Restored!';
      combatLog.push('💧 Celestial energies flood your spirit, fully rejuvenating HP and MP.');
    } else if (targetTile === 'stairs_down') {
      if (floor < 3) {
        floor += 1;
        const nextFloorMap = getDungeonFloor(floor);
        player.x = 15;
        player.y = 24;
        player.facing = 0;
        sounds.stairs();
        actionTakenName = `Descended the spiral stone stairway to Floor ${floor}!`;
        floatingText = `Entered Floor ${floor}!`;
        return {
          ...state,
          player,
          currentFloor: floor,
          dungeonMap: nextFloorMap,
          turnCount: state.turnCount + 1,
          logs: [
            buildTurnLog(
              player,
              nextFloorMap,
              floor,
              state.turnCount + 1,
              actionTakenName,
              'none',
              [`Entered Floor ${floor}. The air grows colder.`]
            ),
            ...state.logs,
          ],
          currentTurn: buildTurnLog(
            player,
            nextFloorMap,
            floor,
            state.turnCount + 1,
            actionTakenName,
            'none',
            [`Entered Floor ${floor}. The air grows colder.`]
          ),
        };
      }
    } else {
      actionTakenName = 'Searched the floor and surrounding masonry for secrets.';
      combatLog.push('🔍 You scrutinize the flagstones and mortar seams, but find nothing of note.');
    }
  }

  // Tick status effects
  const pDot = tickStatusEffects(player, true);
  combatLog.push(...pDot.logMessages);

  // Check game over
  const isGameOver = player.hp <= 0;
  if (isGameOver) {
    sounds.gameOver();
    combatLog.push('💀 Your wounds prove fatal. Your journey ends here.');
  }

  const turnLog = buildTurnLog(
    player,
    map,
    floor,
    state.turnCount + 1,
    actionTakenName,
    visualFx,
    combatLog,
    lootNotification
  );

  return {
    ...state,
    player,
    currentFloor: floor,
    dungeonMap: map,
    turnCount: state.turnCount + 1,
    logs: [turnLog, ...state.logs],
    currentTurn: turnLog,
    isGameOver,
    isVictory,
    floatingText,
    flashEffect,
  };
}

// MERCHANT SHOP ACTIONS
export function buyShopItem(
  state: GameState,
  itemType: 'potion' | 'torch' | 'repair' | 'sword'
): GameState {
  const player = JSON.parse(JSON.stringify(state.player)) as Player;
  let cost = 15;
  let text = '';

  if (itemType === 'potion') {
    cost = 15;
    if (player.gold < cost) return { ...state, floatingText: 'Not enough gold!' };
    player.gold -= cost;
    player.inventory.push({
      id: `healing_pot_${Date.now()}`,
      name: 'Healing Potion',
      type: 'potion',
      value: 15,
      healHp: 20,
      description: 'Restores 20 HP.',
    });
    text = 'Bought Healing Potion!';
  } else if (itemType === 'torch') {
    cost = 10;
    if (player.gold < cost) return { ...state, floatingText: 'Not enough gold!' };
    player.gold -= cost;
    player.torchesCount += 2;
    text = 'Bought +2 Torches!';
  } else if (itemType === 'repair') {
    cost = 12;
    if (player.gold < cost) return { ...state, floatingText: 'Not enough gold!' };
    player.gold -= cost;
    player.weaponDurability = player.maxWeaponDurability;
    text = 'Weapon fully repaired!';
  } else if (itemType === 'sword') {
    cost = 40;
    if (player.gold < cost) return { ...state, floatingText: 'Not enough gold!' };
    player.gold -= cost;
    player.weapon = {
      id: 'fine_steel_blade',
      name: 'Forged Runed Blade',
      type: 'weapon',
      value: 40,
      bonusAtk: 7,
      durability: 40,
      maxDurability: 40,
      description: 'A masterfully balanced blade inscribed with glowing runes.',
    };
    player.weaponDurability = 40;
    player.maxWeaponDurability = 40;
    text = 'Equipped Forged Runed Blade (+7 ATK)!';
  }

  sounds.merchant();

  const turnLog = buildTurnLog(
    player,
    state.dungeonMap,
    state.currentFloor,
    state.turnCount,
    `Traded with Shopkeeper: ${text}`,
    'none',
    [`💰 Paid ${cost} gold: ${text}`]
  );

  return {
    ...state,
    player,
    logs: [turnLog, ...state.logs.slice(1)],
    currentTurn: turnLog,
    floatingText: text,
  };
}
