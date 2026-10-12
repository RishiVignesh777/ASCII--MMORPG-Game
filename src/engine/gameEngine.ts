import {
  Direction,
  DIRECTION_NAMES,
  DIRECTION_OFFSETS,
  DungeonMap,
  Item,
  Monster,
  Player,
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

export function createInitialGame(): GameState {
  const currentFloor = 1;
  const dungeonMap = getDungeonFloor(currentFloor);
  const player: Player = JSON.parse(JSON.stringify(INITIAL_PLAYER));

  const turnLog = buildTurnLog(player, dungeonMap, currentFloor, 1, 'Dungeon entered. Standing before a heavy door.');

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

  // Determine dynamic 5th action option
  let action5 = 'Search floor for secrets';
  if (view.monsterInFront) {
    action5 = `Attack ${view.monsterInFront.name} in view`;
  } else if (view.objectInFront === 'door_closed') {
    action5 = 'Open wooden door in view';
  } else if (view.objectInFront === 'chest') {
    action5 = 'Open treasure chest in view';
  } else if (view.objectInFront === 'fountain') {
    action5 = 'Drink holy water from fountain';
  } else if (view.objectInFront === 'stairs_down') {
    action5 = `Descend stairs to Floor ${floor + 1}`;
  }

  const actions = [
    'Move Forward',
    'Turn Left (90°)',
    'Turn Right (90°)',
    'Move Backward / Turn 180°',
    action5,
  ];

  return {
    turn,
    actionTaken,
    viewportAscii: view.viewportLines,
    miniMapAscii: view.miniMapLines,
    heading: view.facingName,
    hudInfo: {
      hp: player.hp,
      maxHp: player.maxHp,
      mp: player.mp,
      maxMp: player.maxMp,
      weapon: `${player.weapon.name}${weaponBonus}`,
      shieldArmor: `${player.shieldArmor.name}${armorBonus}`,
      x: player.x,
      y: player.y,
      floor,
    },
    viewportDescription: view.description,
    actions,
    combatLog: combatEvents,
    lootNotification: lootNotice,
  };
}

// Format the Turn into the exact 4-section format specified by the user prompt
export function formatTurnResponse(log: TurnLog): string {
  // Combine Viewport & Mini-map side by side
  const combinedLines: string[] = [];
  for (let i = 0; i < 8; i++) {
    const vp = log.viewportAscii[i] || '+----------------+';
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

  return `1. 3D FIRST-PERSON VIEWPORT & MINI-MAP:
\`\`\`
${combinedLines.join('\n')}
\`\`\`

2. COMPASS & HUD:
- Heading: ${log.heading}
- Health: ${log.hudInfo.hp}/${log.hudInfo.maxHp} HP | Mana: ${log.hudInfo.mp}/${log.hudInfo.maxMp} MP
- Weapon: ${log.hudInfo.weapon} | Shield/Armor: ${log.hudInfo.shieldArmor}
- Room Coordinates: (${log.hudInfo.x}, ${log.hudInfo.y}) | Floor: ${log.hudInfo.floor}
${combatSection}${lootSection}
3. VIEWPORT DESCRIPTION:
${log.viewportDescription}

4. FIRST-PERSON ACTIONS:
${actionsList}`;
}

export function handlePlayerAction(
  state: GameState,
  actionIndex: number // 1: Forward, 2: Turn Left, 3: Turn Right, 4: Back/180, 5: Interact
): GameState {
  if (state.isGameOver) return state;

  const player = JSON.parse(JSON.stringify(state.player)) as Player;
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

  switch (actionIndex) {
    case 1: {
      // 1. Move Forward
      actionTakenName = 'Move Forward';
      if (targetMonster) {
        // Cannot step into monster tile without attacking
        actionTakenName = `Blocked by ${targetMonster.name}! You must attack.`;
        sounds.bump();
        floatingText = `Blocked by ${targetMonster.name}!`;
      } else if (targetTile === 'wall') {
        actionTakenName = 'You bump face-first into the cold stone wall.';
        sounds.bump();
        floatingText = 'Blocked by solid wall';
      } else if (targetTile === 'door_closed') {
        actionTakenName = 'The heavy wooden door is shut. Interact (Action 5) to open it.';
        sounds.bump();
        floatingText = 'Door is closed';
      } else {
        // Clear passage! Step forward
        player.x = targetX;
        player.y = targetY;
        sounds.step();
        floatingText = 'Stepped forward';

        // Check if monster is now in front!
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
      // 4. Move Backward / Turn 180°
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
        // Wall behind: turn 180°
        player.facing = ((player.facing + 2) % 4) as Direction;
        actionTakenName = 'Turned around 180° to face the rear.';
        sounds.turn();
        floatingText = `Turned 180° (${DIRECTION_NAMES[player.facing]})`;
      }
      break;
    }

    case 5: {
      // 5. Contextual Interaction
      if (targetMonster) {
        // COMBAT MATH!
        actionTakenName = `Attack ${targetMonster.name}`;
        sounds.attack();
        flashEffect = 'hit';

        const isCrit = Math.random() < 0.2;
        const atkRoll = Math.floor(Math.random() * 4);
        const playerAtk = player.baseAttack + (player.weapon.bonusAtk || 0);
        let dmg = Math.max(1, playerAtk + atkRoll - targetMonster.defense);
        if (isCrit) dmg = Math.floor(dmg * 1.5) + 2;

        targetMonster.hp -= dmg;
        combatLog.push(
          `You strike ${targetMonster.name} with your ${player.weapon.name} for ${dmg} DMG!${isCrit ? ' (CRITICAL HIT!)' : ''}`
        );
        floatingText = `-${dmg} HP to ${targetMonster.name}`;

        if (targetMonster.hp <= 0) {
          // Monster defeated!
          targetMonster.hp = 0;
          sounds.hit();
          player.xp += targetMonster.xpReward;
          const goldDropped = Math.floor(Math.random() * 12) + 5;
          player.gold += goldDropped;

          combatLog.push(`★ Defeated ${targetMonster.name}! Gained ${targetMonster.xpReward} XP and ${goldDropped} gold.`);

          // Check if Boss defeated on Floor 3
          if (targetMonster.id === 'minotaur_boss') {
            isVictory = true;
            combatLog.push('★ TRIUMPH! The Minotaur Dreadlord falls! The dungeon tremors as the Abyssal Portal unlocks!');
          }

          // Check Level Up
          if (player.xp >= player.nextXp) {
            player.level += 1;
            player.maxHp += 6;
            player.hp = player.maxHp;
            player.maxMp += 4;
            player.mp = player.maxMp;
            player.baseAttack += 1;
            player.nextXp = Math.floor(player.nextXp * 1.8);
            combatLog.push(`▲ LEVEL UP! Reached Level ${player.level}! Max HP/MP increased and fully restored!`);
          }
        } else {
          // Monster counter-attacks!
          const monsterAtkRoll = Math.floor(Math.random() * 3);
          const totalDef = player.baseDefense + (player.shieldArmor.bonusDef || 0);
          const monsterDmg = Math.max(1, targetMonster.attack + monsterAtkRoll - totalDef);

          player.hp -= monsterDmg;
          sounds.hit();
          flashEffect = 'damage';
          combatLog.push(`${targetMonster.name} retaliates, slashing you for ${monsterDmg} DMG!`);

          if (player.hp <= 0) {
            player.hp = 0;
            combatLog.push('☠ YOU HAVE BEEN SLAIN in the dungeon depths!');
          }
        }
      } else if (targetTile === 'door_closed') {
        // Open door!
        map.tiles[targetY][targetX] = 'door_open';
        sounds.door();
        flashEffect = 'door';
        actionTakenName = 'You push open the heavy wooden door with a loud groan.';
        floatingText = 'Door Opened';
      } else if (targetTile === 'chest') {
        // Open chest!
        const chest = map.chests.find((c) => c.x === targetX && c.y === targetY);
        if (chest && !chest.opened) {
          chest.opened = true;
          sounds.chest();
          flashEffect = 'heal';
          player.inventory.push(chest.item);
          lootNotification = `Found ${chest.item.name}! (${chest.item.description})`;
          actionTakenName = `Opened the chest and found ${chest.item.name}!`;
          floatingText = `Looted ${chest.item.name}`;

          // Auto-equip if better weapon or armor
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
        // Fountain of healing
        sounds.spell();
        flashEffect = 'heal';
        const healHp = player.maxHp - player.hp;
        const healMp = player.maxMp - player.mp;
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        actionTakenName = 'You cup your hands and drink from the glowing fountain. Your wounds seal and mana surges!';
        floatingText = `+${healHp} HP, +${healMp} MP`;
      } else if (targetTile === 'stairs_down') {
        // Descend to next floor!
        sounds.stairs();
        floor += 1;
        const newMap = getDungeonFloor(floor);
        // Replace map and reset player position to start of new floor
        map.width = newMap.width;
        map.height = newMap.height;
        map.tiles = newMap.tiles;
        map.monsters = newMap.monsters;
        map.chests = newMap.chests;
        map.explored = newMap.explored;

        // Position player at entrance of new floor
        if (floor === 2) {
          player.x = 6;
          player.y = 8;
          player.facing = 0;
        } else if (floor === 3) {
          player.x = 6;
          player.y = 9;
          player.facing = 0;
        }

        actionTakenName = `Descended the spiral stone stairway into the dark abyss of Floor ${floor}!`;
        floatingText = `Entered Floor ${floor}`;
      } else {
        // Search floor for coins
        const foundGold = Math.random() < 0.35;
        if (foundGold) {
          const goldAmount = Math.floor(Math.random() * 5) + 2;
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
export function castSpell(state: GameState, spellType: 'firebolt' | 'heal'): GameState {
  if (state.isGameOver) return state;

  const player = JSON.parse(JSON.stringify(state.player)) as Player;
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
    const healAmount = 14;
    const actualHeal = Math.min(healAmount, player.maxHp - player.hp);
    player.hp = Math.min(player.maxHp, player.hp + healAmount);
    sounds.spell();
    flashEffect = 'heal';
    floatingText = `+${actualHeal} HP Healed`;
    combatLog.push(`★ Chanted Healing Glow! Restored ${actualHeal} HP. (Cost 4 MP)`);
  } else if (spellType === 'firebolt') {
    const cost = 5;
    if (player.mp < cost) {
      return { ...state, floatingText: 'Not enough Mana! (Needs 5 MP)' };
    }

    // Check monster in view (Distance 1 or 2 or 3)
    const { dx, dy } = DIRECTION_OFFSETS[player.facing];
    let hitMonster: Monster | null = null;
    for (let dist = 1; dist <= 3; dist++) {
      const tx = player.x + dx * dist;
      const ty = player.y + dy * dist;
      const m = map.monsters.find((mon) => mon.x === tx && mon.y === ty && mon.hp > 0);
      if (m) {
        hitMonster = m;
        break;
      }
      if (map.tiles[ty]?.[tx] === 'wall' || map.tiles[ty]?.[tx] === 'door_closed') {
        break; // line of sight blocked
      }
    }

    if (!hitMonster) {
      return { ...state, floatingText: 'No target in sight for Firebolt!' };
    }

    player.mp -= cost;
    sounds.spell();
    flashEffect = 'hit';
    const fireDmg = Math.floor(Math.random() * 5) + 12;
    hitMonster.hp -= fireDmg;
    floatingText = `-${fireDmg} Fire DMG to ${hitMonster.name}`;
    combatLog.push(`★ Hurled a blazing Firebolt at ${hitMonster.name} for ${fireDmg} Arcane Fire DMG!`);

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

  const nextTurnNumber = state.turnCount + 1;
  const newTurn = buildTurnLog(
    player,
    map,
    state.currentFloor,
    nextTurnNumber,
    `Cast ${spellType === 'heal' ? 'Healing Glow' : 'Firebolt'}`,
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

// Consume potion
export function useItem(state: GameState, itemId: string): GameState {
  const itemIndex = state.player.inventory.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) return state;

  const player = JSON.parse(JSON.stringify(state.player)) as Player;
  const item = player.inventory[itemIndex];
  let floatingText: string | null = null;

  if (item.healHp) {
    player.hp = Math.min(player.maxHp, player.hp + item.healHp);
    sounds.spell();
    floatingText = `+${item.healHp} HP Restored`;
    player.inventory.splice(itemIndex, 1);
  } else if (item.healMp) {
    player.mp = Math.min(player.maxMp, player.mp + item.healMp);
    sounds.spell();
    floatingText = `+${item.healMp} MP Restored`;
    player.inventory.splice(itemIndex, 1);
  }

  const newTurn = buildTurnLog(
    player,
    state.dungeonMap,
    state.currentFloor,
    state.turnCount + 1,
    `Consumed ${item.name}`,
    [`Used ${item.name}.`],
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
