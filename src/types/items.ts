export interface Item {
  id: number
  name: string
  type: string
  category: string
  rarity: string
  description: string
  cost: number
  weight: number
  properties: string[]
  magic: boolean
  attunement_required: boolean
  damage?: string
  damage_type?: string
  armor_class?: number
}

export type Items = Item[]
