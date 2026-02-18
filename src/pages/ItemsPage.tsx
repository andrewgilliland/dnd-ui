import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { getItems } from "../api/client";
import { CardDensityToggle } from "../components/CardDensityToggle";
import { ItemCard } from "../components/ItemCard";
import { ListCardSkeleton } from "../components/ListCardSkeleton";
import { ListFilters } from "../components/ListFilters";
import { ListViewToggle } from "../components/ListViewToggle";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { useCardDensity } from "../hooks/useCardDensity";
import { useListView } from "../hooks/useListView";
import { useQueryParamUpdater } from "../hooks/useQueryParamUpdater";
import type { Item } from "../types";
import { toFilterOptions, uniqueSortedStrings } from "../utils/filterOptions";

export function ItemsPage() {
  const { searchParams, updateParam } = useQueryParamUpdater();
  const { cardDensity, setCardDensity } = useCardDensity();
  const { listViewMode, setListViewMode } = useListView();
  const query = searchParams.get("q") ?? "";
  const selectedType = searchParams.get("type") ?? "";
  const selectedRarity = searchParams.get("rarity") ?? "";

  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [typeValues, setTypeValues] = useState<string[]>([]);
  const [rarityValues, setRarityValues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const loadItemMetadata = async () => {
      try {
        const response = await getItems(
          { skip: 0, limit: 100 },
          { signal: abortController.signal },
        );

        setTypeValues(
          uniqueSortedStrings(response.items.map((entry) => entry.type)),
        );
        setRarityValues(
          uniqueSortedStrings(response.items.map((entry) => entry.rarity)),
        );
      } catch {
        // Leave metadata empty and derive from list data as fallback.
      }
    };

    void loadItemMetadata();

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const loadItems = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getItems(
          {
            skip: 0,
            limit: 100,
            type: selectedType || undefined,
            rarity: selectedRarity || undefined,
            name: query.trim() || undefined,
          },
          { signal: abortController.signal },
        );

        setItems(response.items);
        setTotal(response.total);

        if (typeValues.length === 0) {
          setTypeValues(
            uniqueSortedStrings(response.items.map((entry) => entry.type)),
          );
        }

        if (rarityValues.length === 0) {
          setRarityValues(
            uniqueSortedStrings(response.items.map((entry) => entry.rarity)),
          );
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load items.";
        setErrorMessage(message);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadItems();

    return () => {
      abortController.abort();
    };
  }, [
    query,
    selectedType,
    selectedRarity,
    typeValues.length,
    rarityValues.length,
  ]);

  const typeOptions = useMemo(() => toFilterOptions(typeValues), [typeValues]);
  const rarityOptions = useMemo(
    () => toFilterOptions(rarityValues),
    [rarityValues],
  );
  const tableCellClass =
    cardDensity === "compact" ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm";

  return (
    <section>
      <PageHeader
        title="Items"
        subtitle={
          isLoading
            ? "Loading items..."
            : `${items.length} of ${total} items in the catalog.`
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
        searchPlaceholder="Name, type, rarity..."
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
            key: "rarity",
            label: "Rarity",
            value: selectedRarity,
            allLabel: "All rarities",
            options: rarityOptions,
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
          {items.map((item) => (
            <ItemCard key={item.id} item={item} cardDensity={cardDensity} />
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
                  Rarity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Weight
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-300"
                >
                  <td
                    className={`${tableCellClass} font-medium text-slate-900 dark:text-slate-100`}
                  >
                    {item.name}
                  </td>
                  <td className={tableCellClass}>{item.type}</td>
                  <td className={tableCellClass}>{item.rarity}</td>
                  <td className={tableCellClass}>{item.cost} gp</td>
                  <td className={tableCellClass}>{item.weight} lb</td>
                  <td className={tableCellClass}>#{item.id}</td>
                  <td className={tableCellClass}>
                    <Link
                      to={ROUTES.itemDetail(item.id)}
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

      {!isLoading && !errorMessage && items.length === 0 ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-slate-700 dark:text-slate-300">
            No items match your current filters.
          </p>
        </Surface>
      ) : null}
    </section>
  );
}
