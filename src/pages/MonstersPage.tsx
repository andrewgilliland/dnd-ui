import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { getMonsters } from "../api/client";
import { CardDensityToggle } from "../components/CardDensityToggle";
import { ListFilters } from "../components/ListFilters";
import { ListCardSkeleton } from "../components/ListCardSkeleton";
import { ListViewToggle } from "../components/ListViewToggle";
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
        <Surface as="section" className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  CR
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  AC
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  HP
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"></th>
              </tr>
            </thead>
            <tbody>
              {monsters.map((monster) => (
                <tr
                  key={monster.id}
                  className="border-b border-slate-100 text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-300"
                >
                  <td
                    className={`${tableCellClass} font-medium text-slate-900 dark:text-slate-100`}
                  >
                    {monster.name}
                  </td>
                  <td className={tableCellClass}>{monster.type}</td>
                  <td className={tableCellClass}>{monster.size}</td>
                  <td className={tableCellClass}>{monster.challenge_rating}</td>
                  <td className={tableCellClass}>{monster.armor_class}</td>
                  <td className={tableCellClass}>{monster.hit_points}</td>
                  <td className={tableCellClass}>
                    <Link
                      to={ROUTES.monsterDetail(monster.id)}
                      className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:text-slate-100 dark:decoration-slate-600 dark:hover:decoration-slate-200"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
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
