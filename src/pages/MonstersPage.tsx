import { useMemo, useState } from "react";
import { Shield, Sword, Heart, Shuffle } from "lucide-react";
import { Link } from "react-router";
import { CardDensityToggle } from "../components/CardDensityToggle";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { ListFilters } from "../components/ListFilters";
import { ListCardSkeleton } from "../components/ListCardSkeleton";
import { ListViewToggle } from "../components/ListViewToggle";
import {
  MonsterComparisonBarChart,
  type MonsterComparisonMetric,
} from "../components/MonsterComparisonBarChart";
import { MonsterTypeDonutChart } from "../components/MonsterTypeDonutChart";
import { MonsterCard } from "../components/MonsterCard";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { useCardDensity } from "../hooks/useCardDensity";
import { useListView } from "../hooks/useListView";
import { useMonsters, useMonstersMetadata } from "../hooks/useMonsters";
import { useQueryParamUpdater } from "../hooks/useQueryParamUpdater";
import type { Monster } from "../types";
import {
  toFilterOptions,
  uniqueSortedNumbers,
  uniqueSortedStrings,
} from "../utils/filterOptions";

export function MonstersPage() {
  const { searchParams, updateParam } = useQueryParamUpdater();
  const { cardDensity, setCardDensity } = useCardDensity();
  const { listViewMode, setListViewMode } = useListView();
  const query = searchParams.get("q") ?? "";
  const selectedType = searchParams.get("type") ?? "";
  const selectedCr = searchParams.get("cr") ?? "";

  const [comparisonMetric, setComparisonMetric] =
    useState<MonsterComparisonMetric>("hit_points");

  const crValue = selectedCr.length > 0 ? Number(selectedCr) : undefined;

  const {
    data: monstersData,
    isLoading,
    error,
  } = useMonsters({
    skip: 0,
    limit: 100,
    type: selectedType || undefined,
    name: query.trim() || undefined,
    min_cr: crValue,
    max_cr: crValue,
  });

  const { data: metadataData } = useMonstersMetadata();

  const monsters = useMemo(() => monstersData?.monsters ?? [], [monstersData]);
  const total = monstersData?.total ?? 0;
  const errorMessage = error instanceof Error ? error.message : null;

  const typeValues = useMemo(
    () =>
      uniqueSortedStrings(
        (metadataData?.monsters ?? monsters).map((m) => m.type),
      ),
    [metadataData, monsters],
  );
  const crValues = useMemo(
    () =>
      uniqueSortedNumbers(
        (metadataData?.monsters ?? monsters).map((m) => m.challenge_rating),
      ),
    [metadataData, monsters],
  );

  const typeOptions = useMemo(() => toFilterOptions(typeValues), [typeValues]);
  const crOptions = useMemo(() => toFilterOptions(crValues), [crValues]);
  const tableCellClass =
    cardDensity === "compact" ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm";
  const monsterTableColumns = useMemo<DataTableColumn<Monster>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        sortable: true,
        sortValue: (monster) => monster.name,
        cellClassName: `${tableCellClass} font-medium text-zinc-900 dark:text-zinc-100`,
        render: (monster) => monster.name,
      },
      {
        key: "type",
        header: "Type",
        sortable: true,
        sortValue: (monster) => monster.type,
        cellClassName: tableCellClass,
        render: (monster) => monster.type,
      },
      {
        key: "size",
        header: "Size",
        sortable: true,
        sortValue: (monster) => monster.size,
        cellClassName: tableCellClass,
        render: (monster) => monster.size,
      },
      {
        key: "cr",
        header: (
          <span className="inline-flex items-center gap-1">
            <Sword aria-hidden="true" className="h-3.5 w-3.5" />
            <span>CR</span>
          </span>
        ),
        sortable: true,
        sortValue: (monster) => monster.challenge_rating,
        cellClassName: tableCellClass,
        render: (monster) => monster.challenge_rating,
      },
      {
        key: "ac",
        header: (
          <span className="inline-flex items-center gap-1">
            <Shield aria-hidden="true" className="h-3.5 w-3.5" />
            <span>AC</span>
          </span>
        ),
        sortable: true,
        sortValue: (monster) => monster.armor_class,
        cellClassName: tableCellClass,
        render: (monster) => monster.armor_class,
      },
      {
        key: "hp",
        header: (
          <span className="inline-flex items-center gap-1">
            <Heart aria-hidden="true" className="h-3.5 w-3.5" />
            <span>HP</span>
          </span>
        ),
        sortable: true,
        sortValue: (monster) => monster.hit_points,
        cellClassName: tableCellClass,
        render: (monster) => monster.hit_points,
      },
      {
        key: "actions",
        header: "",
        cellClassName: tableCellClass,
        render: (monster) => (
          <Link
            to={ROUTES.monsterDetail(monster.id)}
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
          title="Monsters"
          subtitle={
            isLoading
              ? "Loading monsters..."
              : `${monsters.length} of ${total} creatures in the bestiary.`
          }
        />
        <Link
          to={ROUTES.randomMonster}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          <Shuffle aria-hidden="true" className="h-4 w-4" />
          Random Monster
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
        searchPlaceholder="Name, type, alignment..."
        onSearchChange={(value) => updateParam("q", value)}
        selectFilters={[
          {
            key: "type",
            label: "Type",
            value: selectedType,
            allLabel: "All types",
            options: typeOptions,
          },
          {
            key: "cr",
            label: "Challenge Rating",
            value: selectedCr,
            allLabel: "All CRs",
            options: crOptions,
          },
        ]}
        onSelectChange={updateParam}
      />

      {!isLoading && !errorMessage && monsters.length > 1 ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <MonsterTypeDonutChart monsters={monsters} />
          <MonsterComparisonBarChart
            monsters={monsters}
            metric={comparisonMetric}
            onMetricChange={setComparisonMetric}
          />
        </div>
      ) : null}

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
          {monsters.map((monster) => (
            <MonsterCard
              key={monster.id}
              monster={monster}
              cardDensity={cardDensity}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && listViewMode === "table" ? (
        <DataTable
          className="mt-6"
          rows={monsters}
          columns={monsterTableColumns}
          getRowKey={(monster) => monster.id}
          stickyHeader
        />
      ) : null}

      {!isLoading && !errorMessage && monsters.length === 0 ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-zinc-700 dark:text-zinc-300">
            No monsters match your current filters.
          </p>
        </Surface>
      ) : null}
    </section>
  );
}
