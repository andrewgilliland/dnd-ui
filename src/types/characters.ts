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

export interface Character {
  id: number;
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  alignment: Alignment;
  description: string;
  stats: CharacterStats;
}

export type Characters = Character[];
