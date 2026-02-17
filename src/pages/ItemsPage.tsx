import { Link } from "react-router";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { items } from "../data/items";
import type { Item, Items } from "../types";

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
  return (
    <section>
      <PageHeader
        title="Items"
        subtitle={`${itemList.length} items in the catalog.`}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {itemList.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
