import { useMemo } from "react";
import { CharacterCard } from "../components/CharacterCard";
import { ListFilters } from "../components/ListFilters";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { characters } from "../data/characters";
import { useQueryParamUpdater } from "../hooks/useQueryParamUpdater";
import type { Characters } from "../types";
import { toFilterOptions, uniqueSortedStrings } from "../utils/filterOptions";
import {
  matchesQuery,
  matchesSelectedValue,
  normalizeQuery,
} from "../utils/filterPredicates";

const characterList: Characters = characters;
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
