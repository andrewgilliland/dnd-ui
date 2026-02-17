import { Link, useParams } from "react-router";
import itemsData from "../data/items.json";
import type { Items } from "../types";

const items: Items = itemsData as Items;

export function ItemDetailPage() {
  const { id } = useParams();
  const itemId = Number(id);
  const item = items.find((entry) => entry.id === itemId);

  if (!item) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Item not found</h2>
        <p className="mt-2 text-slate-600">No item exists for id: {id}</p>
        <Link
          to="/items"
          className="mt-4 inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4"
        >
          Back to items
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <Link
          to="/items"
          className="text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4"
        >
          ← Back to items
        </Link>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {item.name}
        </h2>
        <p className="mt-1 text-slate-600">
          {item.type} · {item.category} · {item.rarity}
        </p>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Description</h3>
        <p className="mt-2 text-slate-700">{item.description}</p>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Details</h3>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">Cost</dt>
            <dd>{item.cost} gp</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Weight</dt>
            <dd>{item.weight} lb</dd>
          </div>
          {item.damage ? (
            <div>
              <dt className="font-medium text-slate-500">Damage</dt>
              <dd>
                {item.damage}
                {item.damage_type ? ` ${item.damage_type}` : ""}
              </dd>
            </div>
          ) : null}
          {typeof item.armor_class === "number" ? (
            <div>
              <dt className="font-medium text-slate-500">Armor Class</dt>
              <dd>{item.armor_class}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium text-slate-500">Magic</dt>
            <dd>{item.magic ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Attunement</dt>
            <dd>{item.attunement_required ? "Required" : "Not required"}</dd>
          </div>
        </dl>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Properties</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          {item.properties.map((property) => (
            <li key={property}>{property}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
