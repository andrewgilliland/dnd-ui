import monstersJson from "./monsters.json";
import type { Monsters } from "../types";

export const monsters: Monsters = monstersJson as unknown as Monsters;
