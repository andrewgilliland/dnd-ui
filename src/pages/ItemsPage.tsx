import { useMemo } from "react";
import { ItemCard } from "../components/ItemCard";
import { ListFilters } from "../components/ListFilters";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { items } from "../data/items";
import { useQueryParamUpdater } from "../hooks/useQueryParamUpdater";
import type { Items } from "../types";
import { toFilterOptions, uniqueSortedStrings } from "../utils/filterOptions";
import {
  matchesQuery,
  matchesSelectedValue,
  normalizeQuery,
} from "../utils/filterPredicates";

const itemList: Items = items;
export function ItemsPage() {
  const { searchParams, updateParam } = useQueryParamUpdater();
  const query = searchParams.get("q") ?? "";
  const selectedType = searchParams.get("type") ?? "";
  const selectedRarity = searchParams.get("rarity") ?? "";

  const typeOptions = useMemo(
    () =>
      toFilterOptions(uniqueSortedStrings(itemList.map((entry) => entry.type))),
    [],
  );
  const rarityOptions = useMemo(
    () =>
      toFilterOptions(
        uniqueSortedStrings(itemList.map((entry) => entry.rarity)),
      ),
    [],
  );

  const normalizedQuery = useMemo(() => normalizeQuery(query), [query]);
  const filteredItems = useMemo(
    () =>
      itemList.filter((item) => {
        const isQueryMatch = matchesQuery(normalizedQuery, [
          item.name,
          item.description,
          item.type,
          item.category,
          item.rarity,
        ]);
        const isTypeMatch = matchesSelectedValue(selectedType, item.type);
        const isRarityMatch = matchesSelectedValue(selectedRarity, item.rarity);

        return isQueryMatch && isTypeMatch && isRarityMatch;
      }),
    [normalizedQuery, selectedType, selectedRarity],
  );

  return (
    <section>
      <PageHeader
        title="Items"
        subtitle={`${filteredItems.length} of ${itemList.length} items in the catalog.`}
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

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-slate-700 dark:text-slate-300">
            No items match your current filters.
          </p>
        </Surface>
      ) : null}
    </section>
  );
}
