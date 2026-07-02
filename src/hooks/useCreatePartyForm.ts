import { useMemo, useState, type FormEvent } from "react";
import { ApiError, createParty } from "../api/client";
import type { Character, CreatePartyRequest, PartyRole } from "../types";
import { createLocalPartyDraft, savePartyDraft } from "../utils/partyDrafts";

interface UseCreatePartyFormOptions {
  selectedCharacters: Character[];
  initialLeaderCharacterId: number | null;
  onCreated: (result: {
    createdPartyName: string;
    createdPartySource?: "local-draft";
  }) => void;
}

function toTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function useCreatePartyForm({
  selectedCharacters,
  initialLeaderCharacterId,
  onCreated,
}: UseCreatePartyFormOptions) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [leaderCharacterId, setLeaderCharacterId] = useState<number | null>(
    initialLeaderCharacterId,
  );
  const [rolesByCharacterId, setRolesByCharacterId] = useState<
    Record<number, PartyRole | "">
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => name.trim().length > 0 && selectedCharacters.length > 0 && !isSubmitting,
    [isSubmitting, name, selectedCharacters.length],
  );

  const handleRoleChange = (characterId: number, role: string) => {
    setRolesByCharacterId((prev) => ({
      ...prev,
      [characterId]: (role as PartyRole | "") ?? "",
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Party name is required.");
      return;
    }

    if (selectedCharacters.length === 0) {
      setError("Select at least one character before creating a party.");
      return;
    }

    const payload: CreatePartyRequest = {
      name: name.trim(),
      members: selectedCharacters.map((character, index) => {
        const role = rolesByCharacterId[character.id];
        return {
          characterId: character.id,
          marchingOrder: index + 1,
          isLeader: leaderCharacterId === character.id,
          ...(role ? { role } : {}),
        };
      }),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(tagsInput.trim() ? { tags: toTags(tagsInput) } : {}),
    };

    setIsSubmitting(true);

    try {
      await createParty(payload);
      onCreated({ createdPartyName: payload.name });
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 404) {
        const localDraft = createLocalPartyDraft(payload);
        savePartyDraft(localDraft);
        onCreated({
          createdPartyName: payload.name,
          createdPartySource: "local-draft",
        });
        return;
      }

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create party.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    canSubmit,
    error,
    handleRoleChange,
    handleSubmit,
    isSubmitting,
    leaderCharacterId,
    name,
    notes,
    rolesByCharacterId,
    setLeaderCharacterId,
    setName,
    setNotes,
    setTagsInput,
    tagsInput,
  };
}