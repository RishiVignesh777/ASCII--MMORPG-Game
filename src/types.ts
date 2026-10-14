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
  | 'merchant'
  | 'trap';

export type StatusEffectType = 'poisoned' | 'weakened' | 'hasted' | 'burned' | 'shielded';

export interface StatusEffect {
  type: StatusEffectType;
  name: string;
  duration: number; // turns remaining
  potency: number; // damage per turn or stat modifier
  description: string;
}

export type PlayerClass = 'Fighter' | 'Mage' | 'Rogue';

export interface ClassSkill {
  id: string;
  name: string;
  mpCost: number;
  description: string;
  type: 'attack' | 'spell' | 'buff' | 'debuff' | 'heal';
  damageMultiplier?: number;
  bonusEffect?: StatusEffect;
}

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
  isBoss?: boolean;
  statusEffects?: StatusEffect[];
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'key' | 'scroll' | 'torch' | 'repair_kit';
  value: number;
  description: string;
  bonusAtk?: number;
  bonusDef?: number;
  healHp?: number;
  healMp?: number;
  durability?: number;
  maxDurability?: number;
  curesStatus?: StatusEffectType[];
  appliesStatus?: StatusEffect;
}

export interface Player {
  characterClass: PlayerClass;
  classChosen: boolean;
  x: number;
  y: number;
  facing: Direction;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stamina: number;
  maxStamina: number;
  torchFuel: number; // 0 to 5
  maxTorchFuel: number; // 5
  torchTurnCounter: number; // decreases fuel every 5 movement turns
  torchesCount: number;
  weaponDurability: number;
  maxWeaponDurability: number;
  skills: ClassSkill[];
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
  statusEffects: StatusEffect[];
}

export interface DungeonMap {
  width: number;
  height: number;
  tiles: TileType[][];
  monsters: Monster[];
  chests: { x: number; y: number; item: Item; opened: boolean }[];
  explored: boolean[][];
}

export type VisualFxType = 'melee_hit' | 'fireball' | 'frost' | 'damage_taken' | 'none';

export interface ExtendedHudData {
  characterClass: PlayerClass;
  level: number;
  xp: number;
  nextXp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  torchFuel: number;
  maxTorchFuel: number;
  mainHand: string;
  weaponDura: number;
  maxWeaponDura: number;
  armor: string;
  activeSpells: string;
  potionsCount: number;
  torchesCount: number;
  keysCount: number;
  gold: number;
  x: number;
  y: number;
  floor: number;
  statusEffects: StatusEffect[];
}

export interface TurnLog {
  turn: number;
  actionTaken: string;
  viewportAscii: string[];
  miniMapAscii: string[];
  depthGrid?: number[][]; // 12 rows of depth levels
  heading: string;
  activeVisualFx?: VisualFxType;
  extendedHud: ExtendedHudData;
  viewportDescription: string;
  actions: string[];
  combatLog?: string[];
  lootNotification?: string;
  targetMonsterEffects?: {
    name: string;
    statusEffects: StatusEffect[];
  };
}

export type CRTColorTheme = 'amber' | 'emerald' | 'cyan' | 'monochrome';
