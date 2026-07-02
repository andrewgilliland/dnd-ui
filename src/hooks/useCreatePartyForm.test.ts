import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createParty } from "../api/client";
import type { Character, Party } from "../types";
import { useCreatePartyForm } from "./useCreatePartyForm";
import { createLocalPartyDraft, savePartyDraft } from "../utils/partyDrafts";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual("../api/client");
  return {
    ...actual,
    createParty: vi.fn(),
  };
});

vi.mock("../utils/partyDrafts", () => ({
  createLocalPartyDraft: vi.fn(),
  savePartyDraft: vi.fn(),
}));

function makeCharacter(id: number, name: string): Character {
  return {
    id,
    name,
  } as Character;
}

function createSubmitEvent() {
  return {
    preventDefault: vi.fn(),
  } as unknown as React.FormEvent;
}

describe("useCreatePartyForm", () => {
  const mockCreateParty = vi.mocked(createParty);
  const mockCreateLocalPartyDraft = vi.mocked(createLocalPartyDraft);
  const mockSavePartyDraft = vi.mocked(savePartyDraft);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits and calls onCreated on success", async () => {
    mockCreateParty.mockResolvedValueOnce({} as Party);
    const onCreated = vi.fn();
    const selectedCharacters = [makeCharacter(1, "Aria")];

    const { result } = renderHook(() =>
      useCreatePartyForm({
        selectedCharacters,
        initialLeaderCharacterId: 1,
        onCreated,
      }),
    );

    act(() => {
      result.current.setName("Stormbreakers");
      result.current.setNotes("Campaign party");
      result.current.setTagsInput("weekly,dragonlance");
      result.current.handleRoleChange(1, "tank");
    });

    await act(async () => {
      await result.current.handleSubmit(createSubmitEvent());
    });

    expect(mockCreateParty).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Stormbreakers",
        notes: "Campaign party",
        tags: ["weekly", "dragonlance"],
        members: [
          expect.objectContaining({
            characterId: 1,
            marchingOrder: 1,
            isLeader: true,
            role: "tank",
          }),
        ],
      }),
    );
    expect(onCreated).toHaveBeenCalledWith({
      createdPartyName: "Stormbreakers",
    });
  });

  it("does not submit when name is empty", async () => {
    const onCreated = vi.fn();
    const selectedCharacters = [makeCharacter(1, "Aria")];

    const { result } = renderHook(() =>
      useCreatePartyForm({
        selectedCharacters,
        initialLeaderCharacterId: 1,
        onCreated,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit(createSubmitEvent());
    });

    expect(result.current.error).toBe("Party name is required.");
    expect(mockCreateParty).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("saves a local draft and reports local source when API returns 404", async () => {
    mockCreateParty.mockRejectedValueOnce(new ApiError(404, "Not Found"));
    const draft = { id: "local-1" } as Party;
    mockCreateLocalPartyDraft.mockReturnValueOnce(draft);

    const onCreated = vi.fn();
    const selectedCharacters = [makeCharacter(1, "Aria")];

    const { result } = renderHook(() =>
      useCreatePartyForm({
        selectedCharacters,
        initialLeaderCharacterId: 1,
        onCreated,
      }),
    );

    act(() => {
      result.current.setName("Fallback Party");
    });

    await act(async () => {
      await result.current.handleSubmit(createSubmitEvent());
    });

    expect(mockCreateLocalPartyDraft).toHaveBeenCalled();
    expect(mockSavePartyDraft).toHaveBeenCalledWith(draft);
    expect(onCreated).toHaveBeenCalledWith({
      createdPartyName: "Fallback Party",
      createdPartySource: "local-draft",
    });
  });

  it("surfaces non-404 API errors", async () => {
    mockCreateParty.mockRejectedValueOnce(new Error("Service unavailable"));
    const onCreated = vi.fn();
    const selectedCharacters = [makeCharacter(1, "Aria")];

    const { result } = renderHook(() =>
      useCreatePartyForm({
        selectedCharacters,
        initialLeaderCharacterId: 1,
        onCreated,
      }),
    );

    act(() => {
      result.current.setName("Error Party");
    });

    await act(async () => {
      await result.current.handleSubmit(createSubmitEvent());
    });

    expect(result.current.error).toBe("Service unavailable");
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("computes canSubmit based on required state", () => {
    const { result } = renderHook(() =>
      useCreatePartyForm({
        selectedCharacters: [makeCharacter(1, "Aria")],
        initialLeaderCharacterId: 1,
        onCreated: vi.fn(),
      }),
    );

    expect(result.current.canSubmit).toBe(false);

    act(() => {
      result.current.setName("Ready Party");
    });

    expect(result.current.canSubmit).toBe(true);
  });
});
