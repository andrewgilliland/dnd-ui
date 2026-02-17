import { useParams } from "react-router";
import { BackLink } from "../components/BackLink";
import { NotFoundState } from "../components/NotFoundState";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { items } from "../data/items";
import type { Items } from "../types";

const itemList: Items = items;

export function ItemDetailPage() {
  const { id } = useParams();
  const itemId = Number(id);
  const item = itemList.find((entry) => entry.id === itemId);

  if (!item) {
    return (
      <NotFoundState
        title="Item not found"
        description={`No item exists for id: ${id}`}
        backTo={ROUTES.items}
        backLabel="Back to items"
      />
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <BackLink to={ROUTES.items}>← Back to items</BackLink>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {item.name}
        </h2>
        <p className="mt-1 text-slate-600">
          {item.type} · {item.category} · {item.rarity}
        </p>
      </div>

      <Surface className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">Description</h3>
        <p className="mt-2 text-slate-700">{item.description}</p>
      </Surface>

      <Surface className="p-6">
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
      </Surface>

      <Surface className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">Properties</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          {item.properties.map((property) => (
            <li key={property}>{property}</li>
          ))}
        </ul>
      </Surface>
    </section>
  );
}
