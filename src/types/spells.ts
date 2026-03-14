export type SpellComponent = "V" | "S" | "M";

export type SpellSchool =
  | "Abjuration"
  | "Conjuration"
  | "Divination"
  | "Enchantment"
  | "Evocation"
  | "Illusion"
  | "Necromancy"
  | "Transmutation";

export interface Spell {
  id: number;
  name: string;
  level: number;
  school: SpellSchool;
  casting_time: string;
  range: string;
  components: SpellComponent[];
  material?: string | null;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higher_levels?: string | null;
  classes: string[];
}

export type Spells = Spell[];
