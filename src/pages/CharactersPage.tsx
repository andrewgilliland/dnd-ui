import { useMemo } from "react";
import { BookOpen, Fingerprint, Globe2, Scale, User } from "lucide-react";
import { Link } from "react-router";
import { useCharacters } from "../hooks/useCharacters";
import { useClasses } from "../hooks/useClasses";
import { useRaces } from "../hooks/useRaces";
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

  const {
    data: charactersData,
    isLoading,
    error,
  } = useCharacters({
    skip: 0,
    limit: 100,
    class: selectedClass || undefined,
    race: selectedRace || undefined,
    name: query.trim() || undefined,
  });
  const { data: classesData } = useClasses();
  const { data: racesData } = useRaces();

  const characters = useMemo(
    () => charactersData?.characters ?? [],
    [charactersData],
  );
  const total = charactersData?.total ?? 0;
  const errorMessage = error instanceof Error ? error.message : null;

  const classValues = useMemo(
    () =>
      uniqueSortedStrings(
        classesData?.classes ?? characters.map((c) => c.class),
      ),
    [classesData, characters],
  );
  const raceValues = useMemo(
    () =>
      uniqueSortedStrings(racesData?.races ?? characters.map((c) => c.race)),
    [racesData, characters],
  );

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
