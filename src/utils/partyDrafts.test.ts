import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreatePartyRequest, Party } from "../types";
import {
  PARTY_DRAFTS_STORAGE_KEY,
  createLocalPartyDraft,
  savePartyDraft,
} from "./partyDrafts";

function makePayload(name: string): CreatePartyRequest {
  return {
    name,
    members: [
      {
        characterId: 1,
        marchingOrder: 1,
        isLeader: true,
        role: "tank",
      },
    ],
    notes: "notes",
    tags: ["weekly"],
  };
}

describe("partyDrafts", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("creates a local party draft with generated metadata", () => {
    const draft = createLocalPartyDraft(makePayload("New Party"));

    expect(draft.id.startsWith("local-")).toBe(true);
    expect(draft.name).toBe("New Party");
    expect(draft.status).toBe("active");
    expect(draft.createdByUserId).toBe("local-user");
    expect(draft.members[0]?.joinedAt).toBeDefined();
    expect(draft.createdAt).toBeDefined();
    expect(draft.updatedAt).toBeDefined();
  });

  it("prepends a saved draft ahead of existing drafts", () => {
    const existing = [{ id: "local-old" }] as Party[];
    localStorage.setItem(PARTY_DRAFTS_STORAGE_KEY, JSON.stringify(existing));

    const nextDraft = { id: "local-new" } as Party;
    savePartyDraft(nextDraft);

    const stored = JSON.parse(
      localStorage.getItem(PARTY_DRAFTS_STORAGE_KEY) ?? "[]",
    ) as Party[];
    expect(stored.map((party) => party.id)).toEqual(["local-new", "local-old"]);
  });

  it("handles invalid existing storage value", () => {
    localStorage.setItem(PARTY_DRAFTS_STORAGE_KEY, "not-json");

    const nextDraft = { id: "local-new" } as Party;
    savePartyDraft(nextDraft);

    const stored = JSON.parse(
      localStorage.getItem(PARTY_DRAFTS_STORAGE_KEY) ?? "[]",
    ) as Party[];
    expect(stored.map((party) => party.id)).toEqual(["local-new"]);
  });

  it("swallows localStorage failures", () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("storage denied");
      });

    expect(() => savePartyDraft({ id: "local-1" } as Party)).not.toThrow();
    expect(getItemSpy).toHaveBeenCalledWith(PARTY_DRAFTS_STORAGE_KEY);
  });
});
