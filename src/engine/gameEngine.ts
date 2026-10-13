import {
  Direction,
  DIRECTION_NAMES,
  DIRECTION_OFFSETS,
  DungeonMap,
  Item,
  Monster,
  Player,
  StatusEffect,
  StatusEffectType,
  TileType,
  TurnLog,
} from '../types';
import { getDungeonFloor, INITIAL_PLAYER } from './dungeonData';
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
}

// Helper to apply or refresh a status effect
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
      if (isPlayer) {
        logMessages.push(`☠ You suffered ${dmg} Poison damage!`);
      } else {
        logMessages.push(`☠ ${entityName} suffered ${dmg} Poison damage!`);
      }
    } else if (effect.type === 'burned') {
      const dmg = effect.potency || 3;
      entity.hp = Math.max(0, entity.hp - dmg);
      dotDamage += dmg;
      if (isPlayer) {
        logMessages.push(`🔥 You suffered ${dmg} Burn damage!`);
      } else {
        logMessages.push(`🔥 ${entityName} suffered ${dmg} Burn damage!`);
      }
    }

    effect.duration -= 1;
    if (effect.duration > 0) {
      remainingEffects.push(effect);
    } else {
      if (isPlayer) {
        logMessages.push(`⌛ Your ${effect.name} status has worn off.`);
      } else {
        logMessages.push(`⌛ ${entityName}'s ${effect.name} status has worn off.`);
      }
    }
  }

  entity.statusEffects = remainingEffects;
  return { logMessages, dotDamage };
}

export function createInitialGame(): GameState {
  const currentFloor = 1;
  const dungeonMap = getDungeonFloor(currentFloor);
  const player: Player = JSON.parse(JSON.stringify(INITIAL_PLAYER));
  if (!player.statusEffects) player.statusEffects = [];

  const turnLog = buildTurnLog(
    player,
    dungeonMap,
    currentFloor,
    1,
    'Expansive 30x30 Dungeon entered. Standing before a heavy door.'
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
    floatingText: null,
    flashEffect: null,
  };
}

export function buildTurnLog(
  player: Player,
  map: DungeonMap,
  floor: number,
  turn: number,
  actionTaken: string,
  combatEvents?: string[],
  lootNotice?: string
): TurnLog {
  const view = renderFirstPersonView(player, map, floor);

  const weaponBonus = player.weapon.bonusAtk ? ` (+${player.weapon.bonusAtk} ATK)` : '';
  const armorBonus = player.shieldArmor.bonusDef ? ` (+${player.shieldArmor.bonusDef} DEF)` : '';

  // Determine dynamic 6th action option
  let action6 = 'Search floor for secrets';
  if (view.monsterInFront) {
    action6 = `Attack ${view.monsterInFront.name} in view`;
  } else if (view.objectInFront === 'door_closed') {
    action6 = 'Open heavy door in view';
  } else if (view.objectInFront === 'chest') {
    action6 = 'Open treasure chest in view';
  } else if (view.objectInFront === 'fountain') {
    action6 = 'Drink from holy fountain in view';
  } else if (view.objectInFront === 'stairs_down') {
    action6 = `Descend stairs to Floor ${floor + 1}`;
  }

  const actions = [
    'Step Forward',
    'Turn Left (90°)',
    'Turn Right (90°)',
    'Step Back / Turn 180°',
    'Strafe Left / Right',
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
    hudInfo: {
      hp: player.hp,
      maxHp: player.maxHp,
      mp: player.mp,
      maxMp: player.maxMp,
      stamina: player.stamina,
      maxStamina: player.maxStamina,
      mainHand: `${player.weapon.name}${weaponBonus}`,
      offHand: 'Oak Buckler (+1 DEF)',
      armor: `${player.shieldArmor.name}${armorBonus}`,
      weapon: `${player.weapon.name}${weaponBonus}`,
      shieldArmor: `${player.shieldArmor.name}${armorBonus}`,
      x: player.x,
      y: player.y,
      floor,
      statusEffects: player.statusEffects || [],
    },
    viewportDescription: view.description,
    actions,
    combatLog: combatEvents,
    lootNotification: lootNotice,
    targetMonsterEffects,
  };
}

// Format the Turn into the exact 4-section format specified by the user prompt
export function formatTurnResponse(log: TurnLog): string {
  // Combine Viewport & Mini-map side by side (12 lines)
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

  return `1. WIDESCREEN 3D VIEWPORT & EXPANDED MINI-MAP:
\`\`\`
${combinedLines.join('\n')}
\`\`\`

2. COMPASS & HUD:
- Orientation: ${log.heading}
- Stats: HP: ${log.hudInfo.hp}/${log.hudInfo.maxHp} | MP: ${log.hudInfo.mp}/${log.hudInfo.maxMp} | Stamina: ${log.hudInfo.stamina}/${log.hudInfo.maxStamina}
- Equipment: Main-Hand: ${log.hudInfo.mainHand} | Off-Hand: ${log.hudInfo.offHand} | Armor: ${log.hudInfo.armor}
- Map Position: Grid (X: ${log.hudInfo.x}, Y: ${log.hudInfo.y}) | Dungeon Floor: ${log.hudInfo.floor}
${combatSection}${lootSection}
3. VIEWPORT DESCRIPTION:
${log.viewportDescription}

4. FIRST-PERSON ACTIONS:
${actionsList}`;
}

export function handlePlayerAction(
  state: GameState,
  actionIndex: number // 1: Step Forward, 2: Turn Left, 3: Turn Right, 4: Step Back/180, 5: Strafe, 6: Interact
): GameState {
  if (state.isGameOver) return state;

  const player = JSON.parse(JSON.stringify(state.player)) as Player;
  if (!player.statusEffects) player.statusEffects = [];
  const map = JSON.parse(JSON.stringify(state.dungeonMap)) as DungeonMap;
  let floor = state.currentFloor;
  let actionTakenName = '';
  const combatLog: string[] = [];
  let lootNotification: string | undefined = undefined;
  let floatingText: string | null = null;
  let flashEffect: GameState['flashEffect'] = null;
  let isVictory = state.isVictory;

  const { dx, dy } = DIRECTION_OFFSETS[player.facing];
  const targetX = player.x + dx;
  const targetY = player.y + dy;

  const getTile = (x: number, y: number): TileType => {
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) return 'wall';
    return map.tiles[y][x];
  };

  const getMonster = (x: number, y: number): Monster | null => {
    return map.monsters.find((m) => m.x === x && m.y === y && m.hp > 0) || null;
  };

  const targetTile = getTile(targetX, targetY);
  const targetMonster = getMonster(targetX, targetY);

  // Passive stamina recovery (+1 per turn up to max)
  player.stamina = Math.min(player.maxStamina, player.stamina + 1);

  switch (actionIndex) {
    case 1: {
      // 1. Step Forward
      actionTakenName = 'Step Forward';
      if (targetMonster) {
        actionTakenName = `Blocked by ${targetMonster.name}! You must attack.`;
        sounds.bump();
        floatingText = `Blocked by ${targetMonster.name}!`;
      } else if (targetTile === 'wall') {
        actionTakenName = 'You bump face-first into the cold stone wall.';
        sounds.bump();
        floatingText = 'Blocked by solid wall';
      } else if (targetTile === 'door_closed') {
        actionTakenName = 'The heavy wooden door is shut. Interact (Action 6) to open it.';
        sounds.bump();
        floatingText = 'Door is closed';
      } else {
        player.x = targetX;
        player.y = targetY;
        sounds.step();
        floatingText = 'Stepped forward';

        const nextFrontX = player.x + dx;
        const nextFrontY = player.y + dy;
        const enemyAhead = getMonster(nextFrontX, nextFrontY);
        if (enemyAhead) {
          combatLog.push(`Warning: You have closed in on a ${enemyAhead.name}! Combat is imminent.`);
        }
      }
      break;
    }

    case 2: {
      // 2. Turn Left (90°)
      actionTakenName = 'Turn Left (90°)';
      player.facing = ((player.facing + 3) % 4) as Direction;
      sounds.turn();
      floatingText = `Turned left (${DIRECTION_NAMES[player.facing]})`;
      break;
    }

    case 3: {
      // 3. Turn Right (90°)
      actionTakenName = 'Turn Right (90°)';
      player.facing = ((player.facing + 1) % 4) as Direction;
      sounds.turn();
      floatingText = `Turned right (${DIRECTION_NAMES[player.facing]})`;
      break;
    }

    case 4: {
      // 4. Step Back / Turn 180°
      const backX = player.x - dx;
      const backY = player.y - dy;
      const backTile = getTile(backX, backY);
      const backMonster = getMonster(backX, backY);

      if (backTile === 'floor' && !backMonster) {
        player.x = backX;
        player.y = backY;
        actionTakenName = 'Stepped backward carefully.';
        sounds.step();
        floatingText = 'Stepped backward';
      } else {
        player.facing = ((player.facing + 2) % 4) as Direction;
        actionTakenName = 'Turned around 180° to face the rear.';
        sounds.turn();
        floatingText = `Turned 180° (${DIRECTION_NAMES[player.facing]})`;
      }
      break;
    }

    case 5: {
      // 5. Strafe Left / Right
      const leftX = player.x - dy;
      const leftY = player.y + dx;
      const leftTile = getTile(leftX, leftY);
      const leftMonster = getMonster(leftX, leftY);

      const rightX = player.x + dy;
      const rightY = player.y - dx;
      const rightTile = getTile(rightX, rightY);
      const rightMonster = getMonster(rightX, rightY);

      if (leftTile === 'floor' && !leftMonster) {
        player.x = leftX;
        player.y = leftY;
        sounds.step();
        actionTakenName = 'Strafed laterally to the left.';
        floatingText = 'Strafed Left';
      } else if (rightTile === 'floor' && !rightMonster) {
        player.x = rightX;
        player.y = rightY;
        sounds.step();
        actionTakenName = 'Strafed laterally to the right.';
        floatingText = 'Strafed Right';
      } else {
        sounds.bump();
        actionTakenName = 'Lateral corridors on both sides are blocked by solid stone.';
        floatingText = 'Strafe Blocked';
      }
      break;
    }

    case 6: {
      // 6. Context Interaction
      if (targetMonster) {
        actionTakenName = `Attack ${targetMonster.name}`;
        sounds.attack();
        flashEffect = 'hit';

        if (!targetMonster.statusEffects) targetMonster.statusEffects = [];

        const isHasted = player.statusEffects.some((e) => e.type === 'hasted');
        const isWeakened = player.statusEffects.some((e) => e.type === 'weakened');
        const critChance = isHasted ? 0.45 : 0.2;
        const isCrit = Math.random() < critChance;

        let playerAtk = player.baseAttack + (player.weapon.bonusAtk || 0);
        if (isHasted) playerAtk += 3;
        if (isWeakened) playerAtk = Math.max(1, playerAtk - 2);

        const atkRoll = Math.floor(Math.random() * 4);
        const monsterWeakened = targetMonster.statusEffects.some((e) => e.type === 'weakened');
        const monsterDef = Math.max(0, targetMonster.defense - (monsterWeakened ? 1 : 0));

        let dmg = Math.max(1, playerAtk + atkRoll - monsterDef);
        if (isCrit) dmg = Math.floor(dmg * 1.5) + 2;

        targetMonster.hp -= dmg;
        combatLog.push(
          `You strike ${targetMonster.name} with your ${player.weapon.name} for ${dmg} DMG!${isCrit ? ' (CRITICAL HIT!)' : ''}`
        );
        floatingText = `-${dmg} HP to ${targetMonster.name}`;

        if (targetMonster.hp <= 0) {
          targetMonster.hp = 0;
          sounds.hit();
          player.xp += targetMonster.xpReward;
          const goldDropped = Math.floor(Math.random() * 14) + 6;
          player.gold += goldDropped;

          combatLog.push(`★ Defeated ${targetMonster.name}! Gained ${targetMonster.xpReward} XP and ${goldDropped} gold.`);

          if (targetMonster.id === 'minotaur_boss') {
            isVictory = true;
            combatLog.push('★ TRIUMPH! The Minotaur Dreadlord falls! The dungeon tremors as the Abyssal Portal unlocks!');
          }

          if (player.xp >= player.nextXp) {
            player.level += 1;
            player.maxHp += 6;
            player.hp = player.maxHp;
            player.maxMp += 4;
            player.mp = player.maxMp;
            player.maxStamina += 4;
            player.stamina = player.maxStamina;
            player.baseAttack += 1;
            player.nextXp = Math.floor(player.nextXp * 1.8);
            combatLog.push(`▲ LEVEL UP! Reached Level ${player.level}! All attributes increased and fully restored!`);
          }
        } else {
          let monsterAtk = targetMonster.attack;
          if (monsterWeakened) monsterAtk = Math.max(1, monsterAtk - 2);

          const isShielded = player.statusEffects.some((e) => e.type === 'shielded');
          const totalDef = player.baseDefense + (player.shieldArmor.bonusDef || 0) + (isShielded ? 3 : 0);
          const monsterAtkRoll = Math.floor(Math.random() * 3);
          const monsterDmg = Math.max(1, monsterAtk + monsterAtkRoll - totalDef);

          player.hp -= monsterDmg;
          sounds.hit();
          flashEffect = 'damage';
          combatLog.push(`${targetMonster.name} retaliates, slashing you for ${monsterDmg} DMG!`);

          if (targetMonster.symbol === 'g' && Math.random() < 0.4) {
            applyStatusEffect(player, {
              type: 'poisoned',
              name: 'Poisoned',
              duration: 3,
              potency: 2,
              description: 'Vile goblin toxins sap 2 HP each turn.',
            });
            sounds.debuff();
            combatLog.push('☣ The Goblin Scout blade is poisoned! You are POISONED (3 turns)!');
          } else if (targetMonster.symbol === 'S' && Math.random() < 0.4) {
            applyStatusEffect(player, {
              type: 'weakened',
              name: 'Weakened',
              duration: 3,
              potency: 2,
              description: 'Chilling undead frost numbs your muscles (-2 ATK).',
            });
            sounds.debuff();
            combatLog.push('❄ The Skeleton chilling frost numbs your strength! You are WEAKENED (-2 ATK)!');
          } else if (targetMonster.symbol === 'N' && Math.random() < 0.5) {
            applyStatusEffect(player, {
              type: 'weakened',
              name: 'Weakened',
              duration: 4,
              potency: 2,
              description: 'A shadowy hex degrades physical prowess (-2 ATK for 4 turns).',
            });
            sounds.debuff();
            combatLog.push('🔮 The Necromancer hexes your soul! You are WEAKENED (-2 ATK)!');
          } else if (targetMonster.symbol === 'B' && Math.random() < 0.4) {
            applyStatusEffect(player, {
              type: 'weakened',
              name: 'Weakened',
              duration: 3,
              potency: 2,
              description: 'A colossal shockwave dazes you (-2 ATK for 3 turns).',
            });
            sounds.debuff();
            combatLog.push('💥 The Minotaur colossal blow dazes you! You are WEAKENED (-2 ATK)!');
          }

          if (player.hp <= 0) {
            player.hp = 0;
            combatLog.push('☠ YOU HAVE BEEN SLAIN in the dungeon depths!');
          }
        }
      } else if (targetTile === 'door_closed') {
        map.tiles[targetY][targetX] = 'door_open';
        sounds.door();
        flashEffect = 'door';
        actionTakenName = 'You push open the heavy reinforced door with a loud groan.';
        floatingText = 'Door Opened';
      } else if (targetTile === 'chest') {
        const chest = map.chests.find((c) => c.x === targetX && c.y === targetY);
        if (chest && !chest.opened) {
          chest.opened = true;
          sounds.chest();
          flashEffect = 'heal';
          player.inventory.push(chest.item);
          lootNotification = `Found ${chest.item.name}! (${chest.item.description})`;
          actionTakenName = `Opened the chest and found ${chest.item.name}!`;
          floatingText = `Looted ${chest.item.name}`;

          if (chest.item.type === 'weapon' && (chest.item.bonusAtk || 0) > (player.weapon.bonusAtk || 0)) {
            player.inventory.push(player.weapon);
            player.weapon = chest.item;
            lootNotification += ` Equipped ${chest.item.name} automatically!`;
          } else if (chest.item.type === 'armor' && (chest.item.bonusDef || 0) > (player.shieldArmor.bonusDef || 0)) {
            player.inventory.push(player.shieldArmor);
            player.shieldArmor = chest.item;
            lootNotification += ` Equipped ${chest.item.name} automatically!`;
          }
        } else {
          actionTakenName = 'The chest is already empty.';
          floatingText = 'Chest is empty';
        }
      } else if (targetTile === 'fountain') {
        sounds.spell();
        flashEffect = 'heal';
        const healHp = player.maxHp - player.hp;
        const healMp = player.maxMp - player.mp;
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        player.stamina = player.maxStamina;
        const cleansed = removeStatusEffects(player, ['poisoned', 'weakened', 'burned']);
        const cleanseNotice = cleansed.length > 0 ? ` Cleansed ${cleansed.join(', ')}!` : '';
        actionTakenName = `You drink from the radiant fountain. Wounds seal, mana and stamina surge!${cleanseNotice}`;
        floatingText = `+${healHp} HP, +${healMp} MP`;
      } else if (targetTile === 'stairs_down') {
        sounds.stairs();
        floor += 1;
        const newMap = getDungeonFloor(floor);
        map.width = newMap.width;
        map.height = newMap.height;
        map.tiles = newMap.tiles;
        map.monsters = newMap.monsters;
        map.chests = newMap.chests;
        map.explored = newMap.explored;

        player.x = 15;
        player.y = 24;
        player.facing = 0;

        actionTakenName = `Descended the spiral stone stairway into the dark abyss of Floor ${floor}!`;
        floatingText = `Entered Floor ${floor}`;
      } else {
        const foundGold = Math.random() < 0.35;
        if (foundGold) {
          const goldAmount = Math.floor(Math.random() * 6) + 3;
          player.gold += goldAmount;
          sounds.chest();
          actionTakenName = `Searched the floor cracks and found ${goldAmount} ancient gold coins!`;
          floatingText = `+${goldAmount} Gold`;
        } else {
          actionTakenName = 'Searched the floor carefully, but found only dust and ancient bone fragments.';
          floatingText = 'Found nothing';
        }
      }
      break;
    }
  }

  // TICK STATUS EFFECTS FOR PLAYER AND VISIBLE/ACTIVE MONSTERS AT END OF TURN
  const playerTick = tickStatusEffects(player, true);
  if (playerTick.dotDamage > 0) {
    sounds.poison();
    flashEffect = 'damage';
  }
  playerTick.logMessages.forEach((msg) => combatLog.push(msg));

  map.monsters.forEach((mon) => {
    if (mon.hp > 0 && mon.statusEffects && mon.statusEffects.length > 0) {
      const monTick = tickStatusEffects(mon, false);
      monTick.logMessages.forEach((msg) => combatLog.push(msg));
      if (mon.hp <= 0) {
        mon.hp = 0;
        player.xp += mon.xpReward;
        combatLog.push(`★ ${mon.name} succumbed to status afflictions! (+${mon.xpReward} XP)`);
        if (mon.id === 'minotaur_boss') {
          isVictory = true;
          combatLog.push('★ TRIUMPH! The Minotaur Dreadlord falls!');
        }
      }
    }
  });

  const nextTurnNumber = state.turnCount + 1;
  const newTurn = buildTurnLog(
    player,
    map,
    floor,
    nextTurnNumber,
    actionTakenName,
    combatLog.length > 0 ? combatLog : undefined,
    lootNotification
  );

  return {
    player,
    currentFloor: floor,
    dungeonMap: map,
    turnCount: nextTurnNumber,
    logs: [newTurn, ...state.logs],
    currentTurn: newTurn,
    isGameOver: player.hp <= 0,
    isVictory,
    floatingText,
    flashEffect,
  };
}

// Cast Magic Spell
export function castSpell(
  state: GameState,
  spellType: 'firebolt' | 'heal' | 'haste' | 'weaken'
): GameState {
  if (state.isGameOver) return state;

  const player = JSON.parse(JSON.stringify(state.player)) as Player;
  if (!player.statusEffects) player.statusEffects = [];
  const map = JSON.parse(JSON.stringify(state.dungeonMap)) as DungeonMap;
  const combatLog: string[] = [];
  let floatingText: string | null = null;
  let flashEffect: GameState['flashEffect'] = null;
  let isVictory = state.isVictory;

  if (spellType === 'heal') {
    const cost = 4;
    if (player.mp < cost) {
      return { ...state, floatingText: 'Not enough Mana! (Needs 4 MP)' };
    }
    player.mp -= cost;
    const healAmount = 16;
    const actualHeal = Math.min(healAmount, player.maxHp - player.hp);
    player.hp = Math.min(player.maxHp, player.hp + healAmount);
    sounds.spell();
    flashEffect = 'heal';
    floatingText = `+${actualHeal} HP Healed`;
    combatLog.push(`★ Chanted Healing Glow! Restored ${actualHeal} HP. (Cost 4 MP)`);
  } else if (spellType === 'haste') {
    const cost = 4;
    if (player.mp < cost) {
      return { ...state, floatingText: 'Not enough Mana! (Needs 4 MP)' };
    }
    player.mp -= cost;
    applyStatusEffect(player, {
      type: 'hasted',
      name: 'Hasted',
      duration: 5,
      potency: 3,
      description: 'Supernatural agility (+3 ATK and heightened critical chance for 5 turns).',
    });
    sounds.buff();
    flashEffect = 'heal';
    floatingText = 'Hasted! (+3 ATK & Crit)';
    combatLog.push('★ Chanted Haste Surge! Infused with blistering speed (+3 ATK & +35% Crit for 5 turns).');
  } else if (spellType === 'weaken') {
    const cost = 3;
    if (player.mp < cost) {
      return { ...state, floatingText: 'Not enough Mana! (Needs 3 MP)' };
    }

    const { dx, dy } = DIRECTION_OFFSETS[player.facing];
    let hitMonster: Monster | null = null;
    for (let dist = 1; dist <= 4; dist++) {
      const tx = player.x + dx * dist;
      const ty = player.y + dy * dist;
      const m = map.monsters.find((mon) => mon.x === tx && mon.y === ty && mon.hp > 0);
      if (m) {
        hitMonster = m;
        break;
      }
      if (map.tiles[ty]?.[tx] === 'wall' || map.tiles[ty]?.[tx] === 'door_closed') break;
    }

    if (!hitMonster) {
      return { ...state, floatingText: 'No target in sight for Weaken Curse!' };
    }

    player.mp -= cost;
    applyStatusEffect(hitMonster, {
      type: 'weakened',
      name: 'Weakened',
      duration: 4,
      potency: 2,
      description: 'Enfeebled muscles (-2 ATK for 4 turns).',
    });
    sounds.debuff();
    flashEffect = 'hit';
    floatingText = `Weakened ${hitMonster.name}!`;
    combatLog.push(`★ Cast Weaken Curse upon ${hitMonster.name}! Their attack power withered (-2 ATK for 4 turns).`);
  } else if (spellType === 'firebolt') {
    const cost = 5;
    if (player.mp < cost) {
      return { ...state, floatingText: 'Not enough Mana! (Needs 5 MP)' };
    }

    const { dx, dy } = DIRECTION_OFFSETS[player.facing];
    let hitMonster: Monster | null = null;
    for (let dist = 1; dist <= 4; dist++) {
      const tx = player.x + dx * dist;
      const ty = player.y + dy * dist;
      const m = map.monsters.find((mon) => mon.x === tx && mon.y === ty && mon.hp > 0);
      if (m) {
        hitMonster = m;
        break;
      }
      if (map.tiles[ty]?.[tx] === 'wall' || map.tiles[ty]?.[tx] === 'door_closed') break;
    }

    if (!hitMonster) {
      return { ...state, floatingText: 'No target in sight for Firebolt!' };
    }

    player.mp -= cost;
    sounds.spell();
    flashEffect = 'hit';
    const fireDmg = Math.floor(Math.random() * 6) + 14;
    hitMonster.hp -= fireDmg;

    applyStatusEffect(hitMonster, {
      type: 'burned',
      name: 'Burned',
      duration: 3,
      potency: 3,
      description: 'Clinging arcane flames (3 DMG each turn).',
    });

    floatingText = `-${fireDmg} Fire DMG + Burned!`;
    combatLog.push(`★ Hurled Firebolt at ${hitMonster.name} for ${fireDmg} Fire DMG! Applied BURNED status (3 turns).`);

    if (hitMonster.hp <= 0) {
      hitMonster.hp = 0;
      player.xp += hitMonster.xpReward;
      combatLog.push(`★ The Firebolt incinerated ${hitMonster.name}! Gained ${hitMonster.xpReward} XP.`);
      if (hitMonster.id === 'minotaur_boss') {
        isVictory = true;
        combatLog.push('★ TRIUMPH! The Minotaur Dreadlord falls before your magic! The Abyssal Portal unlocks!');
      }
    }
  }

  const playerTick = tickStatusEffects(player, true);
  playerTick.logMessages.forEach((msg) => combatLog.push(msg));

  const nextTurnNumber = state.turnCount + 1;
  const newTurn = buildTurnLog(
    player,
    map,
    state.currentFloor,
    nextTurnNumber,
    `Cast ${spellType}`,
    combatLog,
    undefined
  );

  return {
    ...state,
    player,
    dungeonMap: map,
    turnCount: nextTurnNumber,
    logs: [newTurn, ...state.logs],
    currentTurn: newTurn,
    isVictory,
    floatingText,
    flashEffect,
  };
}

// Consume potion or use item
export function useItem(state: GameState, itemId: string): GameState {
  const itemIndex = state.player.inventory.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) return state;

  const player = JSON.parse(JSON.stringify(state.player)) as Player;
  if (!player.statusEffects) player.statusEffects = [];
  const item = player.inventory[itemIndex];
  let floatingText: string | null = null;
  const logEvents: string[] = [];

  if (item.healHp) {
    player.hp = Math.min(player.maxHp, player.hp + item.healHp);
    sounds.spell();
    floatingText = `+${item.healHp} HP Restored`;
    logEvents.push(`Restored ${item.healHp} HP.`);
  }

  if (item.healMp) {
    player.mp = Math.min(player.maxMp, player.mp + item.healMp);
    sounds.spell();
    floatingText = `+${item.healMp} MP Restored`;
    logEvents.push(`Restored ${item.healMp} MP.`);
  }

  if (item.curesStatus && item.curesStatus.length > 0) {
    const cleansed = removeStatusEffects(player, item.curesStatus);
    sounds.buff();
    floatingText = cleansed.length > 0 ? `Cleansed ${cleansed.join(', ')}!` : 'Cleansed toxins';
    logEvents.push(`Purged negative status conditions: ${cleansed.join(', ') || 'No afflictions'}.`);
  }

  if (item.appliesStatus) {
    applyStatusEffect(player, item.appliesStatus);
    sounds.buff();
    floatingText = `Gained ${item.appliesStatus.name}!`;
    logEvents.push(`Infused with ${item.appliesStatus.name} (${item.appliesStatus.duration} turns).`);
  }

  player.inventory.splice(itemIndex, 1);

  const playerTick = tickStatusEffects(player, true);
  playerTick.logMessages.forEach((msg) => logEvents.push(msg));

  const newTurn = buildTurnLog(
    player,
    state.dungeonMap,
    state.currentFloor,
    state.turnCount + 1,
    `Used ${item.name}`,
    logEvents,
    undefined
  );

  return {
    ...state,
    player,
    turnCount: state.turnCount + 1,
    logs: [newTurn, ...state.logs],
    currentTurn: newTurn,
    floatingText,
    flashEffect: 'heal',
  };
}
