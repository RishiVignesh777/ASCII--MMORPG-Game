export type Direction = 0 | 1 | 2 | 3; // 0: North, 1: East, 2: South, 3: West

export const DIRECTION_NAMES: Record<Direction, string> = {
  0: 'NORTH',
  1: 'EAST',
  2: 'SOUTH',
  3: 'WEST',
};

export const DIRECTION_ARROWS: Record<Direction, string> = {
  0: '^',
  1: '>',
  2: 'v',
  3: '<',
};

export const DIRECTION_OFFSETS: Record<Direction, { dx: number; dy: number }> = {
  0: { dx: 0, dy: -1 }, // North: y decreases
  1: { dx: 1, dy: 0 },  // East: x increases
  2: { dx: 0, dy: 1 },  // South: y increases
  3: { dx: -1, dy: 0 }, // West: x decreases
};

export type TileType =
  | 'wall'
  | 'floor'
  | 'door_closed'
  | 'door_open'
  | 'stairs_down'
  | 'chest'
  | 'fountain'
  | 'trap';

export interface Monster {
  id: string;
  name: string;
  symbol: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  xpReward: number;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'key' | 'scroll';
  value: number;
  description: string;
  bonusAtk?: number;
  bonusDef?: number;
  healHp?: number;
  healMp?: number;
}

export interface Player {
  x: number;
  y: number;
  facing: Direction;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  xp: number;
  nextXp: number;
  baseAttack: number;
  baseDefense: number;
  weapon: Item;
  shieldArmor: Item;
  inventory: Item[];
  gold: number;
  keys: number;
}

export interface DungeonMap {
  width: number;
  height: number;
  tiles: TileType[][];
  monsters: Monster[];
  chests: { x: number; y: number; item: Item; opened: boolean }[];
  explored: boolean[][];
}

export interface TurnLog {
  turn: number;
  actionTaken: string;
  viewportAscii: string[];
  miniMapAscii: string[];
  heading: string;
  hudInfo: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    weapon: string;
    shieldArmor: string;
    x: number;
    y: number;
    floor: number;
  };
  viewportDescription: string;
  actions: string[];
  combatLog?: string[];
  lootNotification?: string;
}

export type CRTColorTheme = 'amber' | 'emerald' | 'cyan' | 'monochrome';
