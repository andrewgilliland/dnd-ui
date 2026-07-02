import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { BackLink } from "../components/BackLink";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { useCreatePartyForm } from "../hooks/useCreatePartyForm";
import { useCharacters } from "../hooks/useCharacters";
import { PARTY_ROLES, type Character } from "../types";

interface CreatePartyLocationState {
  selectedCharacterIds?: number[];
}

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500";

const labelClass =
  "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

function bySelectedIds(selectedIds: number[], characters: Character[]) {
  const characterMap = new Map(
    characters.map((character) => [character.id, character]),
  );
  return selectedIds
    .map((selectedId) => characterMap.get(selectedId))
    .filter((character): character is Character => Boolean(character));
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

  const {
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
  } = useCreatePartyForm({
    selectedCharacters,
    initialLeaderCharacterId: selectedCharacterIds[0] ?? null,
    onCreated: (result) => {
      navigate(ROUTES.characters, {
        replace: true,
        state: result,
      });
    },
  });

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
              The selected characters could not be loaded. Return to Characters
              and try again.
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
                        {character.race} {character.class} (Lvl{" "}
                        {character.level})
                      </p>
                    </div>
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      Order {index + 1}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`role-${character.id}`}
                        className={labelClass}
                      >
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
