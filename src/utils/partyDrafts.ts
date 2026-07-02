import type { CreatePartyRequest, Party } from "../types";

export const PARTY_DRAFTS_STORAGE_KEY = "dnd-ui-party-drafts";

function parsePartyDrafts(rawValue: string | null): Party[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? (parsedValue as Party[]) : [];
  } catch {
    return [];
  }
}

export function createLocalPartyDraft(payload: CreatePartyRequest): Party {
  const now = new Date().toISOString();

  return {
    id: `local-${Date.now()}`,
    name: payload.name,
    createdByUserId: "local-user",
    status: "active",
    members: payload.members.map((member) => ({
      ...member,
      joinedAt: now,
    })),
    notes: payload.notes,
    tags: payload.tags,
    createdAt: now,
    updatedAt: now,
  };
}

export function savePartyDraft(party: Party): void {
  try {
    const existingDrafts = parsePartyDrafts(
      localStorage.getItem(PARTY_DRAFTS_STORAGE_KEY),
    );
    localStorage.setItem(
      PARTY_DRAFTS_STORAGE_KEY,
      JSON.stringify([party, ...existingDrafts]),
    );
  } catch {
    // Ignore localStorage failures so party creation UX can continue.
  }
}