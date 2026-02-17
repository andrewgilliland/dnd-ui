import { useMemo } from "react";
import { Link } from "react-router";
import { ListFilters } from "../components/ListFilters";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { characters } from "../data/characters";
import { useQueryParamUpdater } from "../hooks/useQueryParamUpdater";
import type { Character, Characters } from "../types";
import { toFilterOptions, uniqueSortedStrings } from "../utils/filterOptions";
import {
  matchesQuery,
  matchesSelectedValue,
  normalizeQuery,
} from "../utils/filterPredicates";

const characterList: Characters = characters;

function CharacterCard({ character }: { character: Character }) {
  return (
    <Surface className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {character.name}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {character.race} · {character.class} · {character.alignment}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          #{character.id}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-700">{character.description}</p>
      <Link
        to={ROUTES.characterDetail(character.id)}
        className="mt-4 inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
      >
        View details
      </Link>
    </Surface>
  );
}

export function CharactersPage() {
  const { searchParams, updateParam } = useQueryParamUpdater();
  const query = searchParams.get("q") ?? "";
  const selectedClass = searchParams.get("class") ?? "";
  const selectedRace = searchParams.get("race") ?? "";

  const classOptions = useMemo(
    () =>
      toFilterOptions(
        uniqueSortedStrings(characterList.map((entry) => entry.class)),
      ),
    [],
  );
  const raceOptions = useMemo(
    () =>
      toFilterOptions(
        uniqueSortedStrings(characterList.map((entry) => entry.race)),
      ),
    [],
  );

  const normalizedQuery = useMemo(() => normalizeQuery(query), [query]);
  const filteredCharacters = useMemo(
    () =>
      characterList.filter((character) => {
        const isQueryMatch = matchesQuery(normalizedQuery, [
          character.name,
          character.description,
          character.race,
          character.class,
          character.alignment,
        ]);
        const isClassMatch = matchesSelectedValue(
          selectedClass,
          character.class,
        );
        const isRaceMatch = matchesSelectedValue(selectedRace, character.race);

        return isQueryMatch && isClassMatch && isRaceMatch;
      }),
    [normalizedQuery, selectedClass, selectedRace],
  );

  return (
    <section>
      <PageHeader
        title="Characters"
        subtitle={`${filteredCharacters.length} of ${characterList.length} heroes and villains.`}
      />

      <ListFilters
        searchValue={query}
        searchPlaceholder="Name, race, class, alignment..."
        onSearchChange={(value) => updateParam("q", value)}
        selectFilters={[
          {
            key: "class",
            label: "Class",
            value: selectedClass,
            allLabel: "All classes",
            options: classOptions,
          },
          {
            key: "race",
            label: "Race",
            value: selectedRace,
            allLabel: "All races",
            options: raceOptions,
          },
        ]}
        onSelectChange={updateParam}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filteredCharacters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>

      {filteredCharacters.length === 0 ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-slate-700">
            No characters match your current filters.
          </p>
        </Surface>
      ) : null}
    </section>
  );
}
