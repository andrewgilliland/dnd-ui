import { useMemo } from "react";
import { Link } from "react-router";
import { ListFilters } from "../components/ListFilters";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { items } from "../data/items";
import { useQueryParamUpdater } from "../hooks/useQueryParamUpdater";
import type { Item, Items } from "../types";
import { toFilterOptions, uniqueSortedStrings } from "../utils/filterOptions";
import {
  matchesQuery,
  matchesSelectedValue,
  normalizeQuery,
} from "../utils/filterPredicates";

const itemList: Items = items;

function ItemCard({ item }: { item: Item }) {
  return (
    <Surface className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {item.type} · {item.rarity}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          #{item.id}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-700">{item.description}</p>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700">
        <div>
          <dt className="font-medium text-slate-500">Cost</dt>
          <dd>{item.cost} gp</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Weight</dt>
          <dd>{item.weight} lb</dd>
        </div>
      </dl>

      <Link
        to={ROUTES.itemDetail(item.id)}
        className="mt-4 inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
      >
        View details
      </Link>
    </Surface>
  );
}

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
          <p className="text-slate-700">No items match your current filters.</p>
        </Surface>
      ) : null}
    </section>
  );
}
