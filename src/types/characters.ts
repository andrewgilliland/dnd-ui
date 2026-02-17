export interface CharacterStats {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface Character {
  id: number
  name: string
  race: string
  class: string
  alignment: string
  description: string
  stats: CharacterStats
}

export type Characters = Character[]
