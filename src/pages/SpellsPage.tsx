import { useMemo } from "react";
import { BookOpen, Clock, Crosshair, FlaskConical, Wand2 } from "lucide-react";
import { Link } from "react-router";
import { CardDensityToggle } from "../components/CardDensityToggle";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { ListCardSkeleton } from "../components/ListCardSkeleton";
import { ListFilters } from "../components/ListFilters";
import { ListViewToggle } from "../components/ListViewToggle";
import { PageHeader } from "../components/PageHeader";
import { SpellCard } from "../components/SpellCard";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { useCardDensity } from "../hooks/useCardDensity";
import { useListView } from "../hooks/useListView";
import { useSpells, useSpellsMetadata } from "../hooks/useSpells";
import { useQueryParamUpdater } from "../hooks/useQueryParamUpdater";
import type { Spell } from "../types";
import { toFilterOptions, uniqueSortedStrings } from "../utils/filterOptions";

const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function formatLevel(level: number) {
  return level === 0 ? "Cantrip" : `Level ${level}`;
}

export function SpellsPage() {
  const { searchParams, updateParam } = useQueryParamUpdater();
  const { cardDensity, setCardDensity } = useCardDensity();
  const { listViewMode, setListViewMode } = useListView();
  const query = searchParams.get("q") ?? "";
  const selectedSchool = searchParams.get("school") ?? "";
  const selectedLevel = searchParams.get("level") ?? "";

  const levelValue =
    selectedLevel.length > 0 ? Number(selectedLevel) : undefined;

  const {
    data: spellsData,
    isLoading,
    error,
  } = useSpells({
    skip: 0,
    limit: 100,
    school: selectedSchool || undefined,
    name: query.trim() || undefined,
    min_level: levelValue,
    max_level: levelValue,
  });

  const { data: metadataData } = useSpellsMetadata();

  const spells = useMemo(() => spellsData?.spells ?? [], [spellsData]);
  const total = spellsData?.total ?? 0;
  const errorMessage = error instanceof Error ? error.message : null;

  const schoolValues = useMemo(
    () =>
      uniqueSortedStrings(
        (metadataData?.spells ?? spells).map((s) => s.school),
      ),
    [metadataData, spells],
  );
  const schoolOptions = useMemo(
    () => toFilterOptions(schoolValues),
    [schoolValues],
  );
  const levelOptions = useMemo(
    () =>
      SPELL_LEVELS.map((l) => ({ label: formatLevel(l), value: String(l) })),
    [],
  );

  const tableCellClass =
    cardDensity === "compact" ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm";

  const spellTableColumns = useMemo<DataTableColumn<Spell>[]>(
    () => [
      {
        key: "name",
        header: (
          <span className="inline-flex items-center gap-1">
            <Wand2 aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Name</span>
          </span>
        ),
        sortable: true,
        sortValue: (spell) => spell.name,
        cellClassName: `${tableCellClass} font-medium text-slate-900 dark:text-zinc-100`,
        render: (spell) => spell.name,
      },
      {
        key: "school",
        header: (
          <span className="inline-flex items-center gap-1">
            <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
            <span>School</span>
          </span>
        ),
        sortable: true,
        sortValue: (spell) => spell.school,
        cellClassName: tableCellClass,
        render: (spell) => spell.school,
      },
      {
        key: "level",
        header: (
          <span className="inline-flex items-center gap-1">
            <FlaskConical aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Level</span>
          </span>
        ),
        sortable: true,
        sortValue: (spell) => spell.level,
        cellClassName: tableCellClass,
        render: (spell) => formatLevel(spell.level),
      },
      {
        key: "casting_time",
        header: (
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Casting Time</span>
          </span>
        ),
        sortable: true,
        sortValue: (spell) => spell.casting_time,
        cellClassName: tableCellClass,
        render: (spell) => spell.casting_time,
      },
      {
        key: "range",
        header: (
          <span className="inline-flex items-center gap-1">
            <Crosshair aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Range</span>
          </span>
        ),
        sortable: true,
        sortValue: (spell) => spell.range,
        cellClassName: tableCellClass,
        render: (spell) => spell.range,
      },
      {
        key: "concentration",
        header: "Conc.",
        cellClassName: tableCellClass,
        render: (spell) =>
          spell.concentration ? (
            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              Yes
            </span>
          ) : (
            <span className="text-slate-400 dark:text-zinc-500">—</span>
          ),
      },
      {
        key: "ritual",
        header: "Ritual",
        cellClassName: tableCellClass,
        render: (spell) =>
          spell.ritual ? (
            <span className="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
              Yes
            </span>
          ) : (
            <span className="text-slate-400 dark:text-zinc-500">—</span>
          ),
      },
      {
        key: "actions",
        header: "",
        cellClassName: tableCellClass,
        render: (spell) => (
          <Link
            to={ROUTES.spellDetail(spell.id)}
            className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-slate-200"
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
      <PageHeader
        title="Spells"
        subtitle={
          isLoading
            ? "Loading spells..."
            : `${spells.length} of ${total} spells in the grimoire.`
        }
      />

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
        searchPlaceholder="Name, school, class..."
        onSearchChange={(value) => updateParam("q", value)}
        selectFilters={[
          {
            key: "school",
            label: "School",
            value: selectedSchool,
            allLabel: "All schools",
            options: schoolOptions,
          },
          {
            key: "level",
            label: "Level",
            value: selectedLevel,
            allLabel: "All levels",
            options: levelOptions,
          },
        ]}
        onSelectChange={updateParam}
      />

      {errorMessage ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-slate-700 dark:text-zinc-300">{errorMessage}</p>
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
            <p className="text-slate-700 dark:text-zinc-300">Loading...</p>
          </Surface>
        )
      ) : null}

      {!isLoading && listViewMode === "cards" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {spells.map((spell) => (
            <SpellCard key={spell.id} spell={spell} cardDensity={cardDensity} />
          ))}
        </div>
      ) : null}

      {!isLoading && listViewMode === "table" ? (
        <DataTable
          className="mt-6"
          rows={spells}
          columns={spellTableColumns}
          getRowKey={(spell) => spell.id}
          stickyHeader
        />
      ) : null}

      {!isLoading && !errorMessage && spells.length === 0 ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-slate-700 dark:text-zinc-300">
            No spells match your current filters.
          </p>
        </Surface>
      ) : null}
    </section>
  );
}
