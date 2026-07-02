import type { Character, Item, Monster, Party, Spell } from "./index";

export interface CharactersResponse {
  characters: Character[];
  total: number;
  skip: number;
  limit: number;
}

export interface MonstersResponse {
  monsters: Monster[];
  total: number;
  skip: number;
  limit: number;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  skip: number;
  limit: number;
}

export interface SpellsResponse {
  spells: Spell[];
  total: number;
  skip: number;
  limit: number;
}

export interface ClassesResponse {
  classes: string[];
}

export interface RacesResponse {
  races: string[];
}

export interface PartiesResponse {
  parties: Party[];
  total: number;
  skip: number;
  limit: number;
}
