import { useParams } from "react-router";
import { DetailPageHeader } from "../components/DetailPageHeader";
import { DetailSection } from "../components/DetailSection";
import { NotFoundState } from "../components/NotFoundState";
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
      <DetailPageHeader
        backTo={ROUTES.items}
        backLabel="← Back to items"
        title={item.name}
        subtitle={`${item.type} · ${item.category} · ${item.rarity}`}
      />

      <DetailSection title="Description">
        <p className="text-slate-700">{item.description}</p>
      </DetailSection>

      <DetailSection title="Details">
        <dl className="grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
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
      </DetailSection>

      <DetailSection title="Properties">
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          {item.properties.map((property) => (
            <li key={property}>{property}</li>
          ))}
        </ul>
      </DetailSection>
    </section>
  );
}
