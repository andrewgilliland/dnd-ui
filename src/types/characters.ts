import type { Alignment, Stats } from "./common";

export type CharacterStats = Stats;

export type CharacterClass =
  | "Barbarian"
  | "Bard"
  | "Cleric"
  | "Druid"
  | "Fighter"
  | "Monk"
  | "Paladin"
  | "Ranger"
  | "Rogue"
  | "Sorcerer"
  | "Warlock"
  | "Wizard";

export type CharacterRace =
  | "Dragonborn"
  | "Dwarf"
  | "Elf"
  | "Gnome"
  | "Half-Elf"
  | "Half-Orc"
  | "Halfling"
  | "Human"
  | "Tiefling";

export interface CharacterSpeed {
  walk?: number;
  climb?: number;
  fly?: number;
  swim?: number;
  burrow?: number;
}

export interface CharacterHitPoints {
  current: number;
  max: number;
  temp: number | null;
}

export interface CharacterSkill {
  skill: string;
  bonus: number;
  proficient: boolean;
}

export interface CharacterPassiveScores {
  passive_perception: number;
  passive_investigation: number;
  passive_insight: number;
}

export interface CharacterProficiencies {
  armor: string[];
  weapons: string[];
  tools: string[];
  languages: string[];
}

export interface CharacterAction {
  name: string;
  description: string;
  attack_bonus?: number;
  damage?: string;
  range?: string;
}

export interface Character {
  id: number;
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  alignment: Alignment;
  description: string;
  level: number;
  stats: CharacterStats;
  proficiency_bonus: number;
  initiative: number;
  armor_class: number;
  speed: CharacterSpeed;
  hit_points: CharacterHitPoints;
  saving_throws: Record<string, number>;
  saving_throw_proficiencies: string[];
  skills: CharacterSkill[];
  passive_scores: CharacterPassiveScores;
  senses: Record<string, number>;
  defenses: string[];
  condition_immunities: string[];
  proficiencies: CharacterProficiencies;
  actions: CharacterAction[];
}

export type Characters = Character[];
