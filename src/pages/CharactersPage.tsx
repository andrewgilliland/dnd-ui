import { useEffect, useMemo, useState } from "react";
import { BookOpen, Fingerprint, Globe2, Scale, User } from "lucide-react";
import { Link } from "react-router";
import { getCharacters, getClasses, getRaces } from "../api/client";
import { CardDensityToggle } from "../components/CardDensityToggle";
import { CharacterCard } from "../components/CharacterCard";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { ListCardSkeleton } from "../components/ListCardSkeleton";
import { ListFilters } from "../components/ListFilters";
import { ListViewToggle } from "../components/ListViewToggle";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { useCardDensity } from "../hooks/useCardDensity";
import { useListView } from "../hooks/useListView";
import { useQueryParamUpdater } from "../hooks/useQueryParamUpdater";
import type { Character } from "../types";
import { toFilterOptions, uniqueSortedStrings } from "../utils/filterOptions";

export function CharactersPage() {
  const { searchParams, updateParam } = useQueryParamUpdater();
  const { cardDensity, setCardDensity } = useCardDensity();
  const { listViewMode, setListViewMode } = useListView();
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
  const tableCellClass =
    cardDensity === "compact" ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm";
  const characterTableColumns = useMemo<DataTableColumn<Character>[]>(
    () => [
      {
        key: "name",
        header: (
          <span className="inline-flex items-center gap-1">
            <User aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Name</span>
          </span>
        ),
        sortable: true,
        sortValue: (character) => character.name,
        cellClassName: `${tableCellClass} font-medium text-slate-900 dark:text-slate-100`,
        render: (character) => character.name,
      },
      {
        key: "race",
        header: (
          <span className="inline-flex items-center gap-1">
            <Globe2 aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Race</span>
          </span>
        ),
        sortable: true,
        sortValue: (character) => character.race,
        cellClassName: tableCellClass,
        render: (character) => character.race,
      },
      {
        key: "class",
        header: (
          <span className="inline-flex items-center gap-1">
            <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Class</span>
          </span>
        ),
        sortable: true,
        sortValue: (character) => character.class,
        cellClassName: tableCellClass,
        render: (character) => character.class,
      },
      {
        key: "alignment",
        header: (
          <span className="inline-flex items-center gap-1">
            <Scale aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Alignment</span>
          </span>
        ),
        sortable: true,
        sortValue: (character) => character.alignment,
        cellClassName: tableCellClass,
        render: (character) => character.alignment,
      },
      {
        key: "id",
        header: (
          <span className="inline-flex items-center gap-1">
            <Fingerprint aria-hidden="true" className="h-3.5 w-3.5" />
            <span>ID</span>
          </span>
        ),
        sortable: true,
        sortValue: (character) => character.id,
        cellClassName: tableCellClass,
        render: (character) => `#${character.id}`,
      },
      {
        key: "actions",
        header: "",
        cellClassName: tableCellClass,
        render: (character) => (
          <Link
            to={ROUTES.characterDetail(character.id)}
            className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:text-slate-100 dark:decoration-slate-600 dark:hover:decoration-slate-200"
          >
            View
          </Link>
        ),
      },
    ],
    [tableCellClass],
  );

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Characters"
          subtitle={
            isLoading
              ? "Loading characters..."
              : `${characters.length} of ${total} heroes and villains.`
          }
        />
        <Link
          to={ROUTES.createCharacter}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          + Create Character
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ListViewToggle
          listViewMode={listViewMode}
          onListViewModeChange={setListViewMode}
        />
        <CardDensityToggle
          cardDensity={cardDensity}
          onCardDensityChange={setCardDensity}
        />
      </div>

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
        listViewMode === "cards" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <ListCardSkeleton key={index} cardDensity={cardDensity} />
            ))}
          </div>
        ) : (
          <Surface as="section" className="mt-6 p-6 text-center">
            <p className="text-slate-700 dark:text-slate-300">Loading...</p>
          </Surface>
        )
      ) : null}

      {!isLoading && listViewMode === "cards" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              cardDensity={cardDensity}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && listViewMode === "table" ? (
        <DataTable
          className="mt-6"
          rows={characters}
          columns={characterTableColumns}
          getRowKey={(character) => character.id}
          stickyHeader
        />
      ) : null}

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
