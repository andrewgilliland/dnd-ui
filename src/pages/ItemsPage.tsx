import { Link } from "react-router";
import itemsData from "../data/items.json";
import type { Item, Items } from "../types";

const items: Items = itemsData as Items;

function ItemCard({ item }: { item: Item }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
        to={`/items/${item.id}`}
        className="mt-4 inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
      >
        View details
      </Link>
    </article>
  );
}

export function ItemsPage() {
  return (
    <section>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        Items
      </h2>
      <p className="mt-2 text-slate-600">
        {items.length} items in the catalog.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
