import { DungeonMap, Item, Monster, Player, TileType } from '../types';

export const STARTER_WEAPON: Item = {
  id: 'rusty_dagger',
  name: 'Rusty Dagger',
  type: 'weapon',
  value: 5,
  bonusAtk: 2,
  description: 'A notched blade recovered from old crypt rubble.',
};

export const STARTER_ARMOR: Item = {
  id: 'leather_tunic',
  name: 'Leather Tunic',
  type: 'armor',
  value: 8,
  bonusDef: 1,
  description: 'Tough boiled leather offering basic protection.',
};

export const INITIAL_PLAYER: Player = {
  x: 4,
  y: 6,
  facing: 0, // Facing North
  hp: 24,
  maxHp: 24,
  mp: 12,
  maxMp: 12,
  level: 1,
  xp: 0,
  nextXp: 30,
  baseAttack: 3,
  baseDefense: 1,
  weapon: STARTER_WEAPON,
  shieldArmor: STARTER_ARMOR,
  inventory: [
    {
      id: 'minor_healing_pot',
      name: 'Minor Health Potion',
      type: 'potion',
      value: 15,
      healHp: 15,
      description: 'A crimson draught that restores 15 HP.',
    },
    {
      id: 'mana_vial',
      name: 'Mana Vial',
      type: 'potion',
      value: 15,
      healMp: 10,
      description: 'Restores 10 MP for spells.',
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
        duration: 4,
        potency: 3,
        description: 'Surges with kinetic speed (+3 ATK, heightened critical chance for 4 turns).',
      },
      description: 'Imbues the drinker with blinding speed (+3 ATK & high critical rate for 4 turns).',
    },
  ],
  gold: 10,
  keys: 0,
  statusEffects: [],
};

// Floor 1: The Crypt Entrance
// Player at (4, 6) facing North (0). At (4, 5) is door_closed.
export function createFloor1(): DungeonMap {
  const width = 11;
  const height = 10;
  const tiles: TileType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall' as TileType)
  );

  // Carve start chamber & corridor
  // Player room: (3..5, 6..7)
  for (let y = 6; y <= 7; y++) {
    for (let x = 3; x <= 5; x++) {
      tiles[y][x] = 'floor';
    }
  }

  // Door directly North of player at (4, 5)
  tiles[5][4] = 'door_closed';

  // Central corridor going North (4, 1..4)
  for (let y = 1; y <= 4; y++) {
    tiles[y][4] = 'floor';
  }

  // West chamber (1..3, 2..4)
  for (let y = 2; y <= 4; y++) {
    for (let x = 1; x <= 3; x++) {
      tiles[y][x] = 'floor';
    }
  }
  tiles[3][1] = 'fountain'; // Healing fountain

  // East chamber (5..9, 2..4)
  for (let y = 2; y <= 4; y++) {
    for (let x = 5; x <= 9; x++) {
      tiles[y][x] = 'floor';
    }
  }
  tiles[2][9] = 'chest'; // Chest with Iron Sword

  // North chamber (3..6, 1)
  for (let x = 3; x <= 6; x++) {
    tiles[1][x] = 'floor';
  }
  tiles[1][6] = 'stairs_down'; // Stairs down to Floor 2

  const explored = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false)
  );

  const monsters: Monster[] = [
    {
      id: 'goblin_1',
      name: 'Goblin Scout',
      symbol: 'g',
      x: 7,
      y: 3,
      hp: 10,
      maxHp: 10,
      attack: 3,
      defense: 1,
      xpReward: 15,
      description: 'A wiry green goblin brandishing a jagged cleaver.',
    },
    {
      id: 'skeleton_1',
      name: 'Skeleton Guardian',
      symbol: 'S',
      x: 2,
      y: 2,
      hp: 14,
      maxHp: 14,
      attack: 4,
      defense: 2,
      xpReward: 20,
      description: 'Ancient animated bones clutching a rusted broadsword.',
    },
    {
      id: 'orc_1',
      name: 'Orc Warrior',
      symbol: 'M',
      x: 4,
      y: 2,
      hp: 18,
      maxHp: 18,
      attack: 5,
      defense: 2,
      xpReward: 35,
      description: 'A hulking orc veteran blocking the passage to the lower vaults.',
    },
  ];

  const chests = [
    {
      x: 9,
      y: 2,
      opened: false,
      item: {
        id: 'iron_shortsword',
        name: 'Iron Shortsword',
        type: 'weapon' as const,
        value: 25,
        bonusAtk: 5,
        description: 'A forged iron blade with a balanced crossguard.',
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

// Floor 2: The Sunken Catacombs
export function createFloor2(): DungeonMap {
  const width = 13;
  const height = 12;
  const tiles: TileType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall' as TileType)
  );

  // Main paths
  for (let y = 8; y <= 10; y++) {
    for (let x = 5; x <= 7; x++) tiles[y][x] = 'floor';
  }
  tiles[7][6] = 'door_closed';

  for (let y = 2; y <= 6; y++) tiles[y][6] = 'floor';

  // East hall
  for (let x = 6; x <= 10; x++) tiles[5][x] = 'floor';
  for (let y = 3; y <= 6; y++) tiles[y][10] = 'floor';
  tiles[3][10] = 'chest';

  // West hall
  for (let x = 2; x <= 6; x++) tiles[3][x] = 'floor';
  for (let y = 2; y <= 5; y++) tiles[y][2] = 'floor';
  tiles[2][2] = 'fountain';

  // North room
  for (let x = 4; x <= 8; x++) {
    for (let y = 1; y <= 2; y++) {
      tiles[y][x] = 'floor';
    }
  }
  tiles[1][8] = 'stairs_down';

  const explored = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false)
  );

  const monsters: Monster[] = [
    {
      id: 'orc_brute',
      name: 'Orc Brute',
      symbol: 'M',
      x: 6,
      y: 4,
      hp: 22,
      maxHp: 22,
      attack: 6,
      defense: 3,
      xpReward: 40,
      description: 'A scarred orc veteran in scrap armor.',
    },
    {
      id: 'necro_apprentice',
      name: 'Necromancer',
      symbol: 'N',
      x: 9,
      y: 4,
      hp: 16,
      maxHp: 16,
      attack: 7,
      defense: 1,
      xpReward: 45,
      description: 'A hooded sorcerer chanting dark hexes.',
    },
    {
      id: 'catacomb_skeleton',
      name: 'Skeleton Knight',
      symbol: 'S',
      x: 3,
      y: 4,
      hp: 18,
      maxHp: 18,
      attack: 5,
      defense: 3,
      xpReward: 35,
      description: 'An undead knight bearing an iron shield.',
    },
  ];

  const chests = [
    {
      x: 10,
      y: 3,
      opened: false,
      item: {
        id: 'chainmail_armor',
        name: 'Steel Chainmail',
        type: 'armor' as const,
        value: 50,
        bonusDef: 3,
        description: 'Interlinked steel rings providing formidable physical defense.',
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

// Floor 3: The Abyssal Vault (Boss Floor)
export function createFloor3(): DungeonMap {
  const width = 13;
  const height = 13;
  const tiles: TileType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall' as TileType)
  );

  // Entrance
  for (let y = 9; y <= 11; y++) {
    for (let x = 5; x <= 7; x++) tiles[y][x] = 'floor';
  }
  tiles[8][6] = 'door_closed';

  // Great Hall
  for (let y = 2; y <= 7; y++) {
    for (let x = 3; x <= 9; x++) {
      // Pillars in center of hall
      if ((x === 4 || x === 8) && (y === 4 || y === 6)) {
        tiles[y][x] = 'wall';
      } else {
        tiles[y][x] = 'floor';
      }
    }
  }

  tiles[2][6] = 'stairs_down'; // Relic portal / Exit victory

  const explored = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false)
  );

  const monsters: Monster[] = [
    {
      id: 'minotaur_boss',
      name: 'Minotaur Dreadlord',
      symbol: 'B',
      x: 6,
      y: 3,
      hp: 45,
      maxHp: 45,
      attack: 9,
      defense: 4,
      xpReward: 120,
      description: 'A terrifying beast wielding a double-bladed battleaxe.',
    },
    {
      id: 'vault_guard_1',
      name: 'Demon Thrall',
      symbol: 'M',
      x: 4,
      y: 5,
      hp: 18,
      maxHp: 18,
      attack: 6,
      defense: 2,
      xpReward: 30,
      description: 'A corrupted humanoid burning with demonic embers.',
    },
    {
      id: 'vault_guard_2',
      name: 'Demon Thrall',
      symbol: 'M',
      x: 8,
      y: 5,
      hp: 18,
      maxHp: 18,
      attack: 6,
      defense: 2,
      xpReward: 30,
      description: 'A corrupted humanoid burning with demonic embers.',
    },
  ];

  const chests = [
    {
      x: 3,
      y: 2,
      opened: false,
      item: {
        id: 'flamebrand_blade',
        name: 'Flamebrand Blade',
        type: 'weapon' as const,
        value: 120,
        bonusAtk: 9,
        description: 'A legendary sword glowing with searing elemental fire.',
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
