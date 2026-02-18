import { useEffect, useMemo, useState } from "react";
import { getItems } from "../api/client";
import { ItemCard } from "../components/ItemCard";
import { ListCardSkeleton } from "../components/ListCardSkeleton";
import { ListFilters } from "../components/ListFilters";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { useQueryParamUpdater } from "../hooks/useQueryParamUpdater";
import type { Item } from "../types";
import { toFilterOptions, uniqueSortedStrings } from "../utils/filterOptions";

export function ItemsPage() {
  const { searchParams, updateParam } = useQueryParamUpdater();
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
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <ListCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

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
