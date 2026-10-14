import {
  ClassSkill,
  DungeonMap,
  Item,
  Monster,
  Player,
  PlayerClass,
  TileType,
} from '../types';

export const CLASS_SKILLS: Record<PlayerClass, ClassSkill[]> = {
  Fighter: [
    {
      id: 'power_strike',
      name: 'Power Strike',
      mpCost: 3,
      description: 'Delivers a crushing strike dealing 1.8x physical damage.',
      type: 'attack',
      damageMultiplier: 1.8,
    },
    {
      id: 'shield_bash',
      name: 'Shield Bash',
      mpCost: 4,
      description: 'Bashes target with heavy shield, dealing damage and inflicting Weakened (3t).',
      type: 'debuff',
      damageMultiplier: 1.2,
      bonusEffect: {
        type: 'weakened',
        name: 'Weakened',
        duration: 3,
        potency: 2,
        description: 'Attack damage reduced by 2.',
      },
    },
    {
      id: 'battle_cry',
      name: 'Battle Cry',
      mpCost: 5,
      description: 'Bolsters spirit, restoring 8 HP and granting +3 ATK for 4 turns.',
      type: 'buff',
      bonusEffect: {
        type: 'hasted',
        name: 'Enraged',
        duration: 4,
        potency: 3,
        description: 'Adrenaline rush grants +3 Attack Power.',
      },
    },
  ],
  Mage: [
    {
      id: 'fireball',
      name: 'Fireball',
      mpCost: 6,
      description: 'Hurls an explosive sphere of flame, dealing heavy damage and Burn (3t).',
      type: 'spell',
      damageMultiplier: 2.2,
      bonusEffect: {
        type: 'burned',
        name: 'Burned',
        duration: 3,
        potency: 3,
        description: 'Suffers 3 fire damage each turn.',
      },
    },
    {
      id: 'frost_nova',
      name: 'Frost Nova',
      mpCost: 5,
      description: 'Blasts freezing cold, dealing damage and inflicting Weakened (4t).',
      type: 'spell',
      damageMultiplier: 1.5,
      bonusEffect: {
        type: 'weakened',
        name: 'Chilled',
        duration: 4,
        potency: 3,
        description: 'Severely slowed and weakened by frost.',
      },
    },
    {
      id: 'arcane_barrier',
      name: 'Arcane Barrier',
      mpCost: 4,
      description: 'Surrounds caster in radiant protective energy (+3 DEF for 5 turns).',
      type: 'buff',
      bonusEffect: {
        type: 'shielded',
        name: 'Arcane Shield',
        duration: 5,
        potency: 3,
        description: 'Magical barrier absorbs and mitigates incoming attacks.',
      },
    },
    {
      id: 'lesser_heal',
      name: 'Lesser Heal',
      mpCost: 4,
      description: 'Weaves restorative celestial light to heal 18 HP.',
      type: 'heal',
    },
  ],
  Rogue: [
    {
      id: 'shadow_backstab',
      name: 'Shadow Backstab',
      mpCost: 5,
      description: 'Strikes from the shadows with lethal precision for 2.4x critical damage.',
      type: 'attack',
      damageMultiplier: 2.4,
    },
    {
      id: 'poison_blade',
      name: 'Poison Blade',
      mpCost: 4,
      description: 'Coats weapon in venom, dealing strike damage and inflicting Poison (4t).',
      type: 'debuff',
      damageMultiplier: 1.3,
      bonusEffect: {
        type: 'poisoned',
        name: 'Poisoned',
        duration: 4,
        potency: 3,
        description: 'Suffers 3 poison damage each turn.',
      },
    },
    {
      id: 'haste_surge',
      name: 'Haste Surge',
      mpCost: 4,
      description: 'Channels lightning reflexes, granting Hasted status (+3 ATK for 5 turns).',
      type: 'buff',
      bonusEffect: {
        type: 'hasted',
        name: 'Hasted',
        duration: 5,
        potency: 3,
        description: 'Superhuman speed and heightened critical strikes.',
      },
    },
  ],
};

export const CLASS_LOADOUTS: Record<
  PlayerClass,
  {
    hp: number;
    mp: number;
    stamina: number;
    baseAttack: number;
    baseDefense: number;
    weapon: Item;
    shieldArmor: Item;
  }
> = {
  Fighter: {
    hp: 36,
    mp: 10,
    stamina: 28,
    baseAttack: 5,
    baseDefense: 2,
    weapon: {
      id: 'iron_broadsword',
      name: 'Tempered Broadsword',
      type: 'weapon',
      value: 20,
      bonusAtk: 4,
      durability: 30,
      maxDurability: 30,
      description: 'A heavy forged steel blade designed for cleaving strikes.',
    },
    shieldArmor: {
      id: 'iron_scale_mail',
      name: 'Heavy Scale Hauberk',
      type: 'armor',
      value: 25,
      bonusDef: 3,
      description: 'Overlapping steel plates over boiled leather padding.',
    },
  },
  Mage: {
    hp: 22,
    mp: 30,
    stamina: 18,
    baseAttack: 3,
    baseDefense: 1,
    weapon: {
      id: 'runic_staff',
      name: 'Runic Willow Staff',
      type: 'weapon',
      value: 25,
      bonusAtk: 2,
      durability: 20,
      maxDurability: 20,
      description: 'An ash-carved staff humming with primal arcane resonance.',
    },
    shieldArmor: {
      id: 'mystic_robes',
      name: 'Arcane Woven Vestments',
      type: 'armor',
      value: 20,
      bonusDef: 1,
      description: 'Silk garments inscribed with protective silver runes.',
    },
  },
  Rogue: {
    hp: 26,
    mp: 18,
    stamina: 30,
    baseAttack: 4,
    baseDefense: 1,
    weapon: {
      id: 'stiletto_daggers',
      name: 'Twin Shadow Blades',
      type: 'weapon',
      value: 22,
      bonusAtk: 3,
      durability: 25,
      maxDurability: 25,
      description: 'Razor-honed stiletto daggers balanced for critical hits.',
    },
    shieldArmor: {
      id: 'shadow_leather',
      name: 'Dark Leather Cuirass',
      type: 'armor',
      value: 20,
      bonusDef: 2,
      description: 'Supple muffled leather designed for silent movement.',
    },
  },
};

export function getInitialPlayerForClass(characterClass: PlayerClass): Player {
  const loadout = CLASS_LOADOUTS[characterClass];
  return {
    characterClass,
    classChosen: true,
    x: 15,
    y: 24,
    facing: 0, // Facing North
    hp: loadout.hp,
    maxHp: loadout.hp,
    mp: loadout.mp,
    maxMp: loadout.mp,
    stamina: loadout.stamina,
    maxStamina: loadout.stamina,
    torchFuel: 5,
    maxTorchFuel: 5,
    torchTurnCounter: 0,
    torchesCount: 3,
    weaponDurability: loadout.weapon.durability ?? 25,
    maxWeaponDurability: loadout.weapon.maxDurability ?? 25,
    skills: CLASS_SKILLS[characterClass],
    level: 1,
    xp: 0,
    nextXp: 35,
    baseAttack: loadout.baseAttack,
    baseDefense: loadout.baseDefense,
    weapon: { ...loadout.weapon },
    shieldArmor: { ...loadout.shieldArmor },
    inventory: [
      {
        id: 'healing_pot_1',
        name: 'Healing Potion',
        type: 'potion',
        value: 15,
        healHp: 20,
        description: 'Restores 20 Health Points.',
      },
      {
        id: 'healing_pot_2',
        name: 'Healing Potion',
        type: 'potion',
        value: 15,
        healHp: 20,
        description: 'Restores 20 Health Points.',
      },
      {
        id: 'mana_vial_1',
        name: 'Mana Vial',
        type: 'potion',
        value: 12,
        healMp: 14,
        description: 'Restores 14 Mana Points.',
      },
      {
        id: 'whetstone_1',
        name: 'Whetstone & Repair Kit',
        type: 'repair_kit',
        value: 18,
        description: 'Sharpens and repairs weapon, restoring up to 15 durability.',
      },
      {
        id: 'torch_bundle',
        name: 'Spare Torches (x3)',
        type: 'torch',
        value: 10,
        description: 'Tallow-soaked pitch torches. Ignite to restore full visibility (5/5).',
      },
    ],
    gold: 25,
    keys: 1,
    statusEffects: [],
  };
}

export const INITIAL_PLAYER: Player = {
  characterClass: 'Fighter',
  classChosen: false, // Player prompted to pick class on Turn 1!
  x: 15,
  y: 24,
  facing: 0, // Facing North
  hp: 36,
  maxHp: 36,
  mp: 10,
  maxMp: 10,
  stamina: 28,
  maxStamina: 28,
  torchFuel: 5,
  maxTorchFuel: 5,
  torchTurnCounter: 0,
  torchesCount: 3,
  weaponDurability: 30,
  maxWeaponDurability: 30,
  skills: CLASS_SKILLS['Fighter'],
  level: 1,
  xp: 0,
  nextXp: 35,
  baseAttack: 5,
  baseDefense: 2,
  weapon: CLASS_LOADOUTS['Fighter'].weapon,
  shieldArmor: CLASS_LOADOUTS['Fighter'].shieldArmor,
  inventory: [
    {
      id: 'healing_pot_1',
      name: 'Healing Potion',
      type: 'potion',
      value: 15,
      healHp: 20,
      description: 'Restores 20 Health Points.',
    },
    {
      id: 'healing_pot_2',
      name: 'Healing Potion',
      type: 'potion',
      value: 15,
      healHp: 20,
      description: 'Restores 20 Health Points.',
    },
    {
      id: 'mana_vial_1',
      name: 'Mana Vial',
      type: 'potion',
      value: 12,
      healMp: 14,
      description: 'Restores 14 Mana Points.',
    },
    {
      id: 'whetstone_1',
      name: 'Whetstone & Repair Kit',
      type: 'repair_kit',
      value: 18,
      description: 'Sharpens and repairs weapon, restoring up to 15 durability.',
    },
    {
      id: 'torch_bundle',
      name: 'Spare Torches (x3)',
      type: 'torch',
      value: 10,
      description: 'Tallow-soaked pitch torches. Ignite to restore full visibility (5/5).',
    },
  ],
  gold: 25,
  keys: 1,
  statusEffects: [],
};

// Floor 1: 30x30 Floor Layout
// Player starts at (15, 24) facing North (0). At (15, 23) is heavy door_closed.
// West wing chamber includes a safe Merchant sanctuary (x: 6, y: 20).
export function createFloor1(): DungeonMap {
  const width = 30;
  const height = 30;
  const tiles: TileType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall' as TileType)
  );

  // 1. Starting Chamber (x: 13..17, y: 24..27)
  for (let y = 24; y <= 27; y++) {
    for (let x = 13; x <= 17; x++) {
      tiles[y][x] = 'floor';
    }
  }

  // Heavy wooden door right in front of player
  tiles[23][15] = 'door_closed';

  // 2. Grand Central Corridor (x: 14..16, y: 10..22)
  for (let y = 10; y <= 22; y++) {
    for (let x = 14; x <= 16; x++) {
      tiles[y][x] = 'floor';
    }
  }

  // 3. West Wing Corridors and Safe Sanctuary (x: 4..13, y: 16..22)
  for (let x = 7; x <= 14; x++) tiles[19][x] = 'floor';
  for (let y = 16; y <= 22; y++) {
    for (let x = 4; x <= 9; x++) {
      tiles[y][x] = 'floor';
    }
  }
  tiles[17][5] = 'fountain'; // Healing Fountain in West crypt
  tiles[20][6] = 'merchant'; // Shopkeeper NPC in safe alcove!

  // 4. East Wing Barracks (x: 16..25, y: 16..22)
  for (let x = 16; x <= 22; x++) tiles[19][x] = 'floor';
  for (let y = 16; y <= 22; y++) {
    for (let x = 20; x <= 25; x++) {
      tiles[y][x] = 'floor';
    }
  }
  tiles[17][24] = 'chest'; // Treasure chest

  // 5. Mid Crossway (x: 8..22, y: 13..14)
  for (let x = 8; x <= 22; x++) {
    tiles[13][x] = 'floor';
    tiles[14][x] = 'floor';
  }

  // 6. North Sanctum & Great Hall (x: 10..20, y: 4..9)
  for (let y = 4; y <= 9; y++) {
    for (let x = 10; x <= 20; x++) {
      // Pillars in hall
      if ((x === 12 || x === 18) && (y === 6 || y === 8)) {
        tiles[y][x] = 'wall';
      } else {
        tiles[y][x] = 'floor';
      }
    }
  }

  // Staircase down to Floor 2
  tiles[5][15] = 'stairs_down';

  const explored = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false)
  );

  const monsters: Monster[] = [
    {
      id: 'goblin_sentry',
      name: 'Goblin Scout',
      symbol: 'g',
      x: 15,
      y: 18,
      hp: 12,
      maxHp: 12,
      attack: 4,
      defense: 1,
      xpReward: 18,
      description: 'A wiry green goblin brandishing a jagged cleaver.',
    },
    {
      id: 'skeleton_crypt',
      name: 'Skeleton Guardian',
      symbol: 'S',
      x: 8,
      y: 17,
      hp: 16,
      maxHp: 16,
      attack: 5,
      defense: 2,
      xpReward: 25,
      description: 'Ancient animated bones clutching a rusted broadsword.',
    },
    {
      id: 'goblin_chief',
      name: 'Goblin Skulker',
      symbol: 'g',
      x: 23,
      y: 19,
      hp: 14,
      maxHp: 14,
      attack: 5,
      defense: 1,
      xpReward: 22,
      description: 'A cunning goblin archer lurking in the eastern barracks.',
    },
    {
      id: 'orc_vanguard',
      name: 'Orc Warrior',
      symbol: 'M',
      x: 15,
      y: 11,
      hp: 22,
      maxHp: 22,
      attack: 6,
      defense: 3,
      xpReward: 45,
      description: 'A hulking orc veteran blocking the grand passage to the lower vaults.',
    },
    {
      id: 'hall_guard',
      name: 'Crypt Skeleton Knight',
      symbol: 'S',
      x: 13,
      y: 7,
      hp: 18,
      maxHp: 18,
      attack: 5,
      defense: 3,
      xpReward: 30,
      description: 'An armored skeleton guarding the northern stairway.',
    },
  ];

  const chests = [
    {
      x: 24,
      y: 17,
      opened: false,
      item: {
        id: 'iron_broadsword_chest',
        name: 'Forged Steel Blade',
        type: 'weapon' as const,
        value: 35,
        bonusAtk: 6,
        durability: 35,
        maxDurability: 35,
        description: 'A finely balanced double-edged blade with superior durability.',
      },
    },
  ];

  return {
    width,
    height,
    tiles,
    monsters,
    chests,
    explored,
  };
}

// Floor 2: 30x30 Sunken Catacombs
export function createFloor2(): DungeonMap {
  const width = 30;
  const height = 30;
  const tiles: TileType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall' as TileType)
  );

  // Entrance room
  for (let y = 23; y <= 26; y++) {
    for (let x = 13; x <= 17; x++) tiles[y][x] = 'floor';
  }
  tiles[22][15] = 'door_closed';

  // Winding subterranean labyrinth
  for (let y = 6; y <= 21; y++) {
    tiles[y][15] = 'floor';
    if (y % 4 === 0) {
      for (let x = 6; x <= 24; x++) tiles[y][x] = 'floor';
    }
  }

  // Safe rest camp with Shopkeeper
  for (let y = 14; y <= 16; y++) {
    for (let x = 5; x <= 8; x++) tiles[y][x] = 'floor';
  }
  tiles[15][6] = 'merchant';

  // Chambers
  for (let y = 7; y <= 11; y++) {
    for (let x = 6; x <= 10; x++) tiles[y][x] = 'floor';
    for (let x = 20; x <= 25; x++) tiles[y][x] = 'floor';
  }

  tiles[9][7] = 'fountain';
  tiles[9][24] = 'chest';
  tiles[5][15] = 'stairs_down';

  const explored = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false)
  );

  const monsters: Monster[] = [
    {
      id: 'crypt_ghoul_1',
      name: 'Crypt Ghoul',
      symbol: 'z',
      x: 15,
      y: 19,
      hp: 20,
      maxHp: 20,
      attack: 6,
      defense: 2,
      xpReward: 35,
      description: 'A ravenous undead fiend dripping with tomb rot.',
    },
    {
      id: 'necromancer_apprentice',
      name: 'Dark Cultist',
      symbol: 'm',
      x: 22,
      y: 9,
      hp: 18,
      maxHp: 18,
      attack: 7,
      defense: 2,
      xpReward: 40,
      description: 'A robed acolyte chanting curses of weakness and despair.',
    },
    {
      id: 'orc_berserker',
      name: 'Orc Chieftain',
      symbol: 'M',
      x: 15,
      y: 10,
      hp: 28,
      maxHp: 28,
      attack: 8,
      defense: 3,
      xpReward: 60,
      description: 'A battle-hardened orc chieftain wielding a serrated greatsword.',
    },
  ];

  const chests = [
    {
      x: 24,
      y: 9,
      opened: false,
      item: {
        id: 'tempered_plate',
        name: 'Tempered Dwarven Plate',
        type: 'armor' as const,
        value: 65,
        bonusDef: 5,
        description: 'Masterwork armor capable of deflecting the fiercest blows.',
      },
    },
  ];

  return {
    width,
    height,
    tiles,
    monsters,
    chests,
    explored,
  };
}

// Floor 3: 30x30 The Abyssal Vault (Boss Floor)
export function createFloor3(): DungeonMap {
  const width = 30;
  const height = 30;
  const tiles: TileType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall' as TileType)
  );

  // Entrance Hall
  for (let y = 22; y <= 26; y++) {
    for (let x = 13; x <= 17; x++) tiles[y][x] = 'floor';
  }
  tiles[21][15] = 'door_closed';

  // Great Abyssal Chamber (x: 6..24, y: 5..19)
  for (let y = 5; y <= 19; y++) {
    for (let x = 6; x <= 24; x++) {
      // Grand columns
      if (
        (x === 9 || x === 15 || x === 21) &&
        (y === 8 || y === 12 || y === 16)
      ) {
        tiles[y][x] = 'wall';
      } else {
        tiles[y][x] = 'floor';
      }
    }
  }

  // Relic victory altar
  tiles[6][15] = 'stairs_down';

  const explored = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false)
  );

  const monsters: Monster[] = [
    {
      id: 'minotaur_boss',
      name: 'Minotaur Dreadlord',
      symbol: 'B',
      x: 15,
      y: 10,
      hp: 60,
      maxHp: 60,
      attack: 11,
      defense: 5,
      xpReward: 200,
      isBoss: true,
      description: 'A gargantuan horned behemoth wielding a colossal dual-bladed axe!',
    },
    {
      id: 'demon_thrall_1',
      name: 'Abyssal Thrall',
      symbol: 'M',
      x: 11,
      y: 14,
      hp: 24,
      maxHp: 24,
      attack: 7,
      defense: 3,
      xpReward: 35,
      description: 'A demon infused with hellfire.',
    },
    {
      id: 'demon_thrall_2',
      name: 'Abyssal Thrall',
      symbol: 'M',
      x: 19,
      y: 14,
      hp: 24,
      maxHp: 24,
      attack: 7,
      defense: 3,
      xpReward: 35,
      description: 'A demon infused with hellfire.',
    },
  ];

  const chests = [
    {
      x: 8,
      y: 6,
      opened: false,
      item: {
        id: 'flamebrand_blade',
        name: 'Flamebrand Blade',
        type: 'weapon' as const,
        value: 150,
        bonusAtk: 12,
        durability: 50,
        maxDurability: 50,
        description: 'A mythic blade enveloped in roaring dragon flames.',
      },
    },
  ];

  return {
    width,
    height,
    tiles,
    monsters,
    chests,
    explored,
  };
}

export function getDungeonFloor(floorNumber: number): DungeonMap {
  if (floorNumber === 1) return createFloor1();
  if (floorNumber === 2) return createFloor2();
  return createFloor3();
}
