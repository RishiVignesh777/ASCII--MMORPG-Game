import { DungeonMap, Item, Monster, Player, TileType } from '../types';

export const STARTER_WEAPON: Item = {
  id: 'rusty_dagger',
  name: 'Rusty Shortblade',
  type: 'weapon',
  value: 5,
  bonusAtk: 3,
  description: 'A notched iron blade recovered from old crypt rubble.',
};

export const STARTER_SHIELD: Item = {
  id: 'oak_buckler',
  name: 'Oak Buckler',
  type: 'armor',
  value: 8,
  bonusDef: 1,
  description: 'An iron-rimmed round wooden shield.',
};

export const STARTER_ARMOR: Item = {
  id: 'leather_tunic',
  name: 'Reinforced Leather Hauberk',
  type: 'armor',
  value: 12,
  bonusDef: 2,
  description: 'Tough boiled leather offering reliable physical protection.',
};

export const INITIAL_PLAYER: Player = {
  x: 15,
  y: 24,
  facing: 0, // Facing North
  hp: 28,
  maxHp: 28,
  mp: 16,
  maxMp: 16,
  stamina: 24,
  maxStamina: 24,
  level: 1,
  xp: 0,
  nextXp: 35,
  baseAttack: 4,
  baseDefense: 1,
  weapon: STARTER_WEAPON,
  shieldArmor: STARTER_ARMOR,
  inventory: [
    {
      id: 'minor_healing_pot',
      name: 'Minor Health Potion',
      type: 'potion',
      value: 15,
      healHp: 18,
      description: 'A crimson draught that restores 18 HP.',
    },
    {
      id: 'mana_vial',
      name: 'Mana Vial',
      type: 'potion',
      value: 15,
      healMp: 12,
      description: 'Restores 12 MP for spellcasting.',
    },
    {
      id: 'antidote_vial',
      name: 'Purifying Antidote',
      type: 'potion',
      value: 20,
      curesStatus: ['poisoned', 'weakened', 'burned'],
      description: 'Cleanses all negative status conditions (Poison, Weakness, Burn).',
    },
    {
      id: 'potion_of_haste',
      name: 'Potion of Haste',
      type: 'potion',
      value: 25,
      appliesStatus: {
        type: 'hasted',
        name: 'Hasted',
        duration: 5,
        potency: 3,
        description: 'Surges with kinetic speed (+3 ATK, heightened critical chance for 5 turns).',
      },
      description: 'Imbues the drinker with blinding speed (+3 ATK & high critical rate for 5 turns).',
    },
  ],
  gold: 15,
  keys: 1,
  statusEffects: [],
};

// Floor 1: 30x30 Floor Layout
// Player starts at (15, 24) facing North (0). At (15, 23) is heavy door_closed.
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

  // 3. West Wing Corridors and Chambers (x: 4..13, y: 16..22)
  for (let x = 7; x <= 14; x++) tiles[19][x] = 'floor';
  for (let y = 16; y <= 22; y++) {
    for (let x = 4; x <= 9; x++) {
      tiles[y][x] = 'floor';
    }
  }
  tiles[17][5] = 'fountain'; // Healing Fountain in West crypt

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
      x: 6,
      y: 19,
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
        id: 'iron_broadsword',
        name: 'Forged Iron Broadsword',
        type: 'weapon' as const,
        value: 30,
        bonusAtk: 6,
        description: 'A finely balanced double-edged broadsword.',
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

  // Entrance area
  for (let y = 22; y <= 26; y++) {
    for (let x = 13; x <= 17; x++) tiles[y][x] = 'floor';
  }
  tiles[21][15] = 'door_closed';

  // Winding catacomb corridors
  for (let y = 12; y <= 20; y++) {
    for (let x = 14; x <= 16; x++) tiles[y][x] = 'floor';
  }

  // East winding wing
  for (let x = 16; x <= 24; x++) tiles[16][x] = 'floor';
  for (let y = 10; y <= 18; y++) {
    for (let x = 22; x <= 26; x++) tiles[y][x] = 'floor';
  }
  tiles[12][24] = 'chest';

  // West winding wing
  for (let x = 6; x <= 14; x++) tiles[16][x] = 'floor';
  for (let y = 10; y <= 18; y++) {
    for (let x = 4; x <= 8; x++) tiles[y][x] = 'floor';
  }
  tiles[12][6] = 'fountain';

  // North chamber with stairs
  for (let y = 4; y <= 10; y++) {
    for (let x = 10; x <= 20; x++) {
      tiles[y][x] = 'floor';
    }
  }
  tiles[5][15] = 'stairs_down';

  const explored = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false)
  );

  const monsters: Monster[] = [
    {
      id: 'orc_berserker',
      name: 'Orc Berserker',
      symbol: 'M',
      x: 15,
      y: 15,
      hp: 26,
      maxHp: 26,
      attack: 7,
      defense: 3,
      xpReward: 50,
      description: 'A battle-hardened orc brandishing dual jagged axes.',
    },
    {
      id: 'catacomb_necro',
      name: 'Necromancer',
      symbol: 'N',
      x: 24,
      y: 14,
      hp: 20,
      maxHp: 20,
      attack: 8,
      defense: 2,
      xpReward: 55,
      description: 'A hooded dark sorcerer chanting foul soul hexes.',
    },
    {
      id: 'armored_skele',
      name: 'Dread Skeleton',
      symbol: 'S',
      x: 6,
      y: 14,
      hp: 22,
      maxHp: 22,
      attack: 6,
      defense: 4,
      xpReward: 40,
      description: 'An ancient warrior preserved in tarnished plate armor.',
    },
    {
      id: 'gate_keeper',
      name: 'Orc Warlord',
      symbol: 'M',
      x: 15,
      y: 8,
      hp: 30,
      maxHp: 30,
      attack: 8,
      defense: 4,
      xpReward: 70,
      description: 'A towering orc champion defending the descent.',
    },
  ];

  const chests = [
    {
      x: 24,
      y: 11,
      opened: false,
      item: {
        id: 'steel_plate',
        name: 'Tempered Steel Plate',
        type: 'armor' as const,
        value: 65,
        bonusDef: 5,
        description: 'Heavy plate armor capable of turning lethal blows aside.',
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

  // Relic victory portal
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
      hp: 55,
      maxHp: 55,
      attack: 10,
      defense: 5,
      xpReward: 150,
      description: 'A gargantuan beast of darkness wielding a colossal dual-bladed war axe.',
    },
    {
      id: 'demon_thrall_1',
      name: 'Abyssal Thrall',
      symbol: 'M',
      x: 11,
      y: 14,
      hp: 22,
      maxHp: 22,
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
      hp: 22,
      maxHp: 22,
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
        value: 140,
        bonusAtk: 11,
        description: 'A legendary sword wreathed in roaring dragon fire.',
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
