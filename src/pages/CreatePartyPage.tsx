import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { ApiError, createParty } from "../api/client";
import { BackLink } from "../components/BackLink";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { useCharacters } from "../hooks/useCharacters";
import type {
  Character,
  CreatePartyRequest,
  Party,
  PartyRole,
} from "../types";

const PARTY_ROLES: PartyRole[] = [
  "tank",
  "support",
  "healer",
  "scout",
  "face",
  "caster",
  "striker",
  "controller",
  "custom",
];

interface CreatePartyLocationState {
  selectedCharacterIds?: number[];
}

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500";

const labelClass =
  "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

function toTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function bySelectedIds(selectedIds: number[], characters: Character[]) {
  const characterMap = new Map(
    characters.map((character) => [character.id, character]),
  );
  return selectedIds
    .map((selectedId) => characterMap.get(selectedId))
    .filter((character): character is Character => Boolean(character));
}

function createLocalPartyDraft(payload: CreatePartyRequest): Party {
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

function saveLocalPartyDraft(party: Party) {
  const storageKey = "dnd-ui-party-drafts";
  const existing = localStorage.getItem(storageKey);
  const drafts = existing ? (JSON.parse(existing) as Party[]) : [];
  localStorage.setItem(storageKey, JSON.stringify([party, ...drafts]));
}

export function CreatePartyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as CreatePartyLocationState | null;
  const selectedCharacterIds = useMemo(
    () => Array.from(new Set(locationState?.selectedCharacterIds ?? [])),
    [locationState?.selectedCharacterIds],
  );

  const {
    data: charactersData,
    isLoading: isLoadingCharacters,
    error: charactersError,
  } = useCharacters({
    skip: 0,
    limit: 100,
  });

  const allCharacters = useMemo(
    () => charactersData?.characters ?? [],
    [charactersData],
  );

  const selectedCharacters = useMemo(
    () => bySelectedIds(selectedCharacterIds, allCharacters),
    [allCharacters, selectedCharacterIds],
  );

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [leaderCharacterId, setLeaderCharacterId] = useState<number | null>(
    selectedCharacterIds[0] ?? null,
  );
  const [rolesByCharacterId, setRolesByCharacterId] = useState<
    Record<number, PartyRole | "">
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    name.trim().length > 0 && selectedCharacters.length > 0 && !isSubmitting;

  const handleRoleChange = (characterId: number, role: string) => {
    setRolesByCharacterId((prev) => ({
      ...prev,
      [characterId]: (role as PartyRole | "") ?? "",
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      navigate(ROUTES.characters, {
        replace: true,
        state: { createdPartyName: payload.name },
      });
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 404) {
        const localDraft = createLocalPartyDraft(payload);
        saveLocalPartyDraft(localDraft);
        navigate(ROUTES.characters, {
          replace: true,
          state: {
            createdPartyName: payload.name,
            createdPartySource: "local-draft",
          },
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

  if (selectedCharacterIds.length === 0) {
    return (
      <section className="space-y-5">
        <BackLink to={ROUTES.characters}>Back to Characters</BackLink>
        <Surface as="section" className="p-6">
          <PageHeader
            title="Create Party"
            subtitle="Start by selecting characters from the Characters table."
          />
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            No selected characters were provided for party creation.
          </p>
        </Surface>
      </section>
    );
  }

  const charactersErrorMessage =
    charactersError instanceof Error ? charactersError.message : null;

  return (
    <section className="space-y-6">
      <BackLink to={ROUTES.characters}>Back to Characters</BackLink>
      <PageHeader
        title="Create Party"
        subtitle="Build a party from your selected characters and set initial roles."
      />

      {charactersErrorMessage ? (
        <Surface as="section" className="p-6">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {charactersErrorMessage}
          </p>
        </Surface>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Surface as="section" className="p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Party details
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="party-name" className={labelClass}>
                Party name
              </label>
              <input
                id="party-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Heroes of the Lance"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="party-tags" className={labelClass}>
                Tags (comma-separated)
              </label>
              <input
                id="party-tags"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="weekly, dragonlance, story-heavy"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="party-notes" className={labelClass}>
              Notes
            </label>
            <textarea
              id="party-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={`${inputClass} min-h-24`}
              placeholder="Party goals, tone, or prep notes..."
            />
          </div>
        </Surface>

        <Surface as="section" className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Members
            </h3>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {isLoadingCharacters
                ? "Loading selected characters..."
                : `${selectedCharacters.length} selected`}
            </span>
          </div>

          {selectedCharacters.length === 0 && !isLoadingCharacters ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              The selected characters could not be loaded. Return to
              Characters and try again.
            </p>
          ) : (
            <ul className="space-y-3">
              {selectedCharacters.map((character, index) => (
                <li
                  key={character.id}
                  className="rounded-md border border-zinc-200 p-4 dark:border-zinc-700"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {character.name}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {character.race} {character.class} (Lvl {character.level}
                        )
                      </p>
                    </div>
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      Order {index + 1}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`role-${character.id}`} className={labelClass}>
                        Role
                      </label>
                      <select
                        id={`role-${character.id}`}
                        value={rolesByCharacterId[character.id] ?? ""}
                        onChange={(event) =>
                          handleRoleChange(character.id, event.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="">Unassigned</option>
                        {PARTY_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <label
                        htmlFor={`leader-${character.id}`}
                        className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        <input
                          id={`leader-${character.id}`}
                          type="radio"
                          name="party-leader"
                          checked={leaderCharacterId === character.id}
                          onChange={() => setLeaderCharacterId(character.id)}
                          className="h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                        Set as party leader
                      </label>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Surface>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {isSubmitting ? "Creating party..." : "Create Party"}
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.characters)}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
