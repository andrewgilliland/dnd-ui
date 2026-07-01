import { useMemo, useState } from "react";
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
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<number[]>(
    [],
  );
  const [isPartyDraftVisible, setIsPartyDraftVisible] = useState(false);
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
  const selectedCharacters = useMemo(
    () =>
      characters.filter((character) =>
        selectedCharacterIds.includes(character.id),
      ),
    [characters, selectedCharacterIds],
  );
  const selectedRowKeys = useMemo(
    () => selectedCharacters.map((character) => character.id),
    [selectedCharacters],
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
        cellClassName: `${tableCellClass} font-medium text-zinc-900 dark:text-zinc-100`,
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
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-200"
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
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
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
          <p className="text-zinc-700 dark:text-zinc-300">{errorMessage}</p>
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
            <p className="text-zinc-700 dark:text-zinc-300">Loading...</p>
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
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {selectedCharacters.length > 0
              ? `${selectedCharacters.length} selected for a party draft.`
              : "Select characters to build a party draft."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={selectedCharacters.length === 0}
              onClick={() => {
                setSelectedCharacterIds([]);
                setIsPartyDraftVisible(false);
              }}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Clear selection
            </button>
            <button
              type="button"
              disabled={selectedCharacters.length === 0}
              onClick={() => setIsPartyDraftVisible(true)}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Create Party
            </button>
          </div>
        </div>
      ) : null}

      {!isLoading &&
      listViewMode === "table" &&
      isPartyDraftVisible &&
      selectedCharacters.length > 0 ? (
        <Surface as="section" className="mt-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Party draft
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                This preview is driven by the selected table rows and can be
                wired to a party save flow next.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPartyDraftVisible(false)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Hide draft
            </button>
          </div>

          <ul className="mt-4 flex flex-wrap gap-2">
            {selectedCharacters.map((character) => (
              <li
                key={character.id}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {character.name}
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}

      {!isLoading && listViewMode === "table" ? (
        <DataTable
          className="mt-6"
          rows={characters}
          columns={characterTableColumns}
          getRowKey={(character) => character.id}
          stickyHeader
          rowSelection={{
            selectedRowKeys,
            onSelectedRowKeysChange: (nextSelectedRowKeys) =>
              setSelectedCharacterIds(nextSelectedRowKeys as number[]),
            getRowSelectionLabel: (character) => character.name,
          }}
        />
      ) : null}

      {!isLoading && !errorMessage && characters.length === 0 ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-zinc-700 dark:text-zinc-300">
            No characters match your current filters.
          </p>
        </Surface>
      ) : null}
    </section>
  );
}
