import { useEffect, useMemo, useState } from "react";
import { Shield, Sword, Heart } from "lucide-react";
import { Link } from "react-router";
import { getMonsters } from "../api/client";
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

  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [total, setTotal] = useState(0);
  const [typeValues, setTypeValues] = useState<string[]>([]);
  const [crValues, setCrValues] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [comparisonMetric, setComparisonMetric] =
    useState<MonsterComparisonMetric>("hit_points");

  useEffect(() => {
    const abortController = new AbortController();

    const loadMonsterMetadata = async () => {
      try {
        const response = await getMonsters(
          { skip: 0, limit: 100 },
          { signal: abortController.signal },
        );

        setTypeValues(
          uniqueSortedStrings(response.monsters.map((entry) => entry.type)),
        );
        setCrValues(
          uniqueSortedNumbers(
            response.monsters.map((entry) => entry.challenge_rating),
          ),
        );
      } catch {
        // Leave metadata empty and derive from list data as fallback.
      }
    };

    void loadMonsterMetadata();

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const loadMonsters = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const crValue = selectedCr.length > 0 ? Number(selectedCr) : undefined;

      try {
        const response = await getMonsters(
          {
            skip: 0,
            limit: 100,
            type: selectedType || undefined,
            name: query.trim() || undefined,
            min_cr: crValue,
            max_cr: crValue,
          },
          { signal: abortController.signal },
        );

        setMonsters(response.monsters);
        setTotal(response.total);

        if (typeValues.length === 0) {
          setTypeValues(
            uniqueSortedStrings(response.monsters.map((entry) => entry.type)),
          );
        }

        if (crValues.length === 0) {
          setCrValues(
            uniqueSortedNumbers(
              response.monsters.map((entry) => entry.challenge_rating),
            ),
          );
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load monsters.";
        setErrorMessage(message);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadMonsters();

    return () => {
      abortController.abort();
    };
  }, [query, selectedType, selectedCr, typeValues.length, crValues.length]);

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
        cellClassName: `${tableCellClass} font-medium text-slate-900 dark:text-slate-100`,
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
      <PageHeader
        title="Monsters"
        subtitle={
          isLoading
            ? "Loading monsters..."
            : `${monsters.length} of ${total} creatures in the bestiary.`
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
        <>
          <MonsterTypeDonutChart monsters={monsters} />
          <MonsterComparisonBarChart
            monsters={monsters}
            metric={comparisonMetric}
            onMetricChange={setComparisonMetric}
          />
        </>
      ) : null}

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
          <p className="text-slate-700 dark:text-slate-300">
            No monsters match your current filters.
          </p>
        </Surface>
      ) : null}
    </section>
  );
}
