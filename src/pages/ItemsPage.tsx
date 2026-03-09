import { useMemo } from "react";
import {
  BadgeDollarSign,
  Fingerprint,
  Gem,
  Package,
  Scale,
  ScrollText,
} from "lucide-react";
import { Link } from "react-router";
import { useItems, useItemsMetadata } from "../hooks/useItems";
import { CardDensityToggle } from "../components/CardDensityToggle";
import { DataTable, type DataTableColumn } from "../components/DataTable";
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

  const {
    data: itemsData,
    isLoading,
    error,
  } = useItems({
    skip: 0,
    limit: 100,
    type: selectedType || undefined,
    rarity: selectedRarity || undefined,
    name: query.trim() || undefined,
  });
  const { data: metadataData } = useItemsMetadata();

  const items = useMemo(() => itemsData?.items ?? [], [itemsData]);
  const total = itemsData?.total ?? 0;
  const errorMessage = error instanceof Error ? error.message : null;

  const typeValues = useMemo(
    () =>
      uniqueSortedStrings(
        (metadataData?.items ?? items).map((entry) => entry.type),
      ),
    [metadataData, items],
  );
  const rarityValues = useMemo(
    () =>
      uniqueSortedStrings(
        (metadataData?.items ?? items).map((entry) => entry.rarity),
      ),
    [metadataData, items],
  );

  const typeOptions = useMemo(() => toFilterOptions(typeValues), [typeValues]);
  const rarityOptions = useMemo(
    () => toFilterOptions(rarityValues),
    [rarityValues],
  );
  const tableCellClass =
    cardDensity === "compact" ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm";
  const itemTableColumns = useMemo<DataTableColumn<Item>[]>(
    () => [
      {
        key: "name",
        header: (
          <span className="inline-flex items-center gap-1">
            <ScrollText aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Name</span>
          </span>
        ),
        sortable: true,
        sortValue: (item) => item.name,
        cellClassName: `${tableCellClass} font-medium text-slate-900 dark:text-zinc-100`,
        render: (item) => item.name,
      },
      {
        key: "type",
        header: (
          <span className="inline-flex items-center gap-1">
            <Package aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Type</span>
          </span>
        ),
        sortable: true,
        sortValue: (item) => item.type,
        cellClassName: tableCellClass,
        render: (item) => item.type,
      },
      {
        key: "rarity",
        header: (
          <span className="inline-flex items-center gap-1">
            <Gem aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Rarity</span>
          </span>
        ),
        sortable: true,
        sortValue: (item) => item.rarity,
        cellClassName: tableCellClass,
        render: (item) => item.rarity,
      },
      {
        key: "cost",
        header: (
          <span className="inline-flex items-center gap-1">
            <BadgeDollarSign aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Cost</span>
          </span>
        ),
        sortable: true,
        sortValue: (item) => item.cost,
        cellClassName: tableCellClass,
        render: (item) => `${item.cost} gp`,
      },
      {
        key: "weight",
        header: (
          <span className="inline-flex items-center gap-1">
            <Scale aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Weight</span>
          </span>
        ),
        sortable: true,
        sortValue: (item) => item.weight,
        cellClassName: tableCellClass,
        render: (item) => `${item.weight} lb`,
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
        sortValue: (item) => item.id,
        cellClassName: tableCellClass,
        render: (item) => `#${item.id}`,
      },
      {
        key: "actions",
        header: "",
        cellClassName: tableCellClass,
        render: (item) => (
          <Link
            to={ROUTES.itemDetail(item.id)}
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
          {items.map((item) => (
            <ItemCard key={item.id} item={item} cardDensity={cardDensity} />
          ))}
        </div>
      ) : null}

      {!isLoading && listViewMode === "table" ? (
        <DataTable
          className="mt-6"
          rows={items}
          columns={itemTableColumns}
          getRowKey={(item) => item.id}
          stickyHeader
        />
      ) : null}

      {!isLoading && !errorMessage && items.length === 0 ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-slate-700 dark:text-zinc-300">
            No items match your current filters.
          </p>
        </Surface>
      ) : null}
    </section>
  );
}
