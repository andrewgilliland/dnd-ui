import type { Alignment, Size, Stats } from "./common";

export type MonsterStats = Stats;

export type MonsterType =
  | "Aberration"
  | "Beast"
  | "Celestial"
  | "Construct"
  | "Dragon"
  | "Elemental"
  | "Fey"
  | "Fiend"
  | "Giant"
  | "Humanoid"
  | "Monstrosity"
  | "Ooze"
  | "Plant"
  | "Undead";

export type DamageType =
  | "Acid"
  | "Bludgeoning"
  | "Cold"
  | "Fire"
  | "Force"
  | "Lightning"
  | "Necrotic"
  | "Piercing"
  | "Poison"
  | "Psychic"
  | "Radiant"
  | "Slashing"
  | "Thunder";

export interface MonsterSpeed {
  walk: number;
  climb?: number;
  fly?: number;
  swim?: number;
  burrow?: number;
}

export interface MonsterSenses {
  blindsight?: number;
  darkvision?: number;
  tremorsense?: number;
  truesight?: number;
  passive_perception: number;
}

export interface MonsterAbility {
  name: string;
  description: string;
}

export interface MonsterAction {
  name: string;
  description: string;
  attack_bonus?: number;
  damage_dice?: string;
  damage_type?: DamageType;
}

export interface Monster {
  id: number;
  name: string;
  size: Size;
  type: MonsterType;
  alignment: Alignment;
  armor_class: number;
  hit_points: number;
  hit_dice: string;
  speed: MonsterSpeed;
  stats: MonsterStats;
  saving_throws?: Record<string, number>;
  skills?: Record<string, number>;
  damage_immunities?: DamageType[];
  condition_immunities?: string[];
  senses: MonsterSenses;
  languages: string[];
  challenge_rating: number;
  experience_points: number;
  special_abilities: MonsterAbility[];
  actions: MonsterAction[];
}

export type Monsters = Monster[];
