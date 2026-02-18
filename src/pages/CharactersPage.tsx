import { useEffect, useMemo, useState } from "react";
import { getCharacters, getClasses, getRaces } from "../api/client";
import { CharacterCard } from "../components/CharacterCard";
import { ListFilters } from "../components/ListFilters";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { useQueryParamUpdater } from "../hooks/useQueryParamUpdater";
import type { Character } from "../types";
import { toFilterOptions, uniqueSortedStrings } from "../utils/filterOptions";

export function CharactersPage() {
  const { searchParams, updateParam } = useQueryParamUpdater();
  const query = searchParams.get("q") ?? "";
  const selectedClass = searchParams.get("class") ?? "";
  const selectedRace = searchParams.get("race") ?? "";

  const [characters, setCharacters] = useState<Character[]>([]);
  const [total, setTotal] = useState(0);
  const [classValues, setClassValues] = useState<string[]>([]);
  const [raceValues, setRaceValues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const loadCharacterMetadata = async () => {
      try {
        const [classesResponse, racesResponse] = await Promise.all([
          getClasses({ signal: abortController.signal }),
          getRaces({ signal: abortController.signal }),
        ]);

        setClassValues(uniqueSortedStrings(classesResponse.classes));
        setRaceValues(uniqueSortedStrings(racesResponse.races));
      } catch {
        // Leave metadata empty and derive from list data as fallback.
      }
    };

    void loadCharacterMetadata();

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const loadCharacters = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getCharacters(
          {
            skip: 0,
            limit: 100,
            class: selectedClass || undefined,
            race: selectedRace || undefined,
            name: query.trim() || undefined,
          },
          { signal: abortController.signal },
        );

        setCharacters(response.characters);
        setTotal(response.total);

        if (classValues.length === 0) {
          setClassValues(
            uniqueSortedStrings(
              response.characters.map((entry) => entry.class),
            ),
          );
        }

        if (raceValues.length === 0) {
          setRaceValues(
            uniqueSortedStrings(response.characters.map((entry) => entry.race)),
          );
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load characters.";
        setErrorMessage(message);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadCharacters();

    return () => {
      abortController.abort();
    };
  }, [
    query,
    selectedClass,
    selectedRace,
    classValues.length,
    raceValues.length,
  ]);

  const classOptions = useMemo(
    () => toFilterOptions(classValues),
    [classValues],
  );
  const raceOptions = useMemo(() => toFilterOptions(raceValues), [raceValues]);

  return (
    <section>
      <PageHeader
        title="Characters"
        subtitle={
          isLoading
            ? "Loading characters..."
            : `${characters.length} of ${total} heroes and villains.`
        }
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

      {errorMessage ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-slate-700 dark:text-slate-300">{errorMessage}</p>
        </Surface>
      ) : null}

      {isLoading ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-slate-700 dark:text-slate-300">Loading...</p>
        </Surface>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>

      {!isLoading && !errorMessage && characters.length === 0 ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-slate-700 dark:text-slate-300">
            No characters match your current filters.
          </p>
        </Surface>
      ) : null}
    </section>
  );
}
