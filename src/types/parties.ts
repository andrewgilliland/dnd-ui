export type PartyStatus = "active" | "archived";

export const PARTY_ROLES = [
  "tank",
  "support",
  "healer",
  "scout",
  "face",
  "caster",
  "striker",
  "controller",
  "custom",
] as const;

export type PartyRole = (typeof PARTY_ROLES)[number];

export interface PartyMember {
  characterId: number;
  role?: PartyRole;
  isLeader?: boolean;
  marchingOrder?: number;
  joinedAt: string;
}

export interface PartySharedInventoryItem {
  itemId: string;
  name: string;
  quantity: number;
}

export interface PartySharedResources {
  gold?: number;
  silver?: number;
  copper?: number;
  inspirationPool?: number;
  inventory?: PartySharedInventoryItem[];
}

export interface PartyCombatState {
  inCombat: boolean;
  round: number;
  turnIndex: number;
  turnOrder: number[];
  activeEncounterId?: string;
}

export interface Party {
  id: string;
  name: string;
  campaignId?: string;
  createdByUserId: string;
  status: PartyStatus;
  members: PartyMember[];
  partyLevel?: number;
  notes?: string;
  tags?: string[];
  sharedResources?: PartySharedResources;
  combatState?: PartyCombatState;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartyRequest {
  name: string;
  campaignId?: string;
  members: Array<
    Pick<PartyMember, "characterId" | "role" | "isLeader" | "marchingOrder">
  >;
  notes?: string;
  tags?: string[];
}

export interface UpdatePartyRequest {
  name?: string;
  campaignId?: string;
  status?: PartyStatus;
  members?: PartyMember[];
  notes?: string;
  tags?: string[];
  sharedResources?: PartySharedResources;
  combatState?: PartyCombatState;
}
