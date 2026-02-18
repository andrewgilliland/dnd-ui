import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ApiError, getItemById } from "../api/client";
import { DetailPageHeader } from "../components/DetailPageHeader";
import { DetailSection } from "../components/DetailSection";
import { NotFoundState } from "../components/NotFoundState";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import type { Item } from "../types";

export function ItemDetailPage() {
  const { id } = useParams();
  const itemId = Number(id);

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    if (!Number.isFinite(itemId)) {
      setItem(null);
      setError(null);
      setIsLoading(false);

      return () => {
        abortController.abort();
      };
    }

    const loadItem = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getItemById(itemId, {
          signal: abortController.signal,
        });
        setItem(response);
      } catch (caughtError) {
        if (abortController.signal.aborted) {
          return;
        }

        setItem(null);

        if (caughtError instanceof Error) {
          setError(caughtError);
        } else {
          setError(new Error("Failed to load item."));
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadItem();

    return () => {
      abortController.abort();
    };
  }, [itemId]);

  if (!Number.isFinite(itemId)) {
    return (
      <NotFoundState
        title="Item not found"
        description={`No item exists for id: ${id}`}
        backTo={ROUTES.items}
        backLabel="Back to items"
      />
    );
  }

  if (isLoading) {
    return (
      <Surface as="section" className="p-8 text-center">
        <p className="text-slate-700 dark:text-slate-300">Loading item...</p>
      </Surface>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Item not found"
        description={`No item exists for id: ${id}`}
        backTo={ROUTES.items}
        backLabel="Back to items"
      />
    );
  }

  if (error) {
    return (
      <Surface as="section" className="p-8 text-center">
        <p className="text-slate-700 dark:text-slate-300">{error.message}</p>
      </Surface>
    );
  }

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
        backLabel="Back to items"
        title={item.name}
        subtitle={`${item.type} · ${item.category} · ${item.rarity}`}
      />

      <DetailSection title="Description">
        <p className="text-slate-700 dark:text-slate-300">{item.description}</p>
      </DetailSection>

      <DetailSection title="Details">
        <dl className="grid grid-cols-1 gap-3 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              Cost
            </dt>
            <dd>{item.cost} gp</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              Weight
            </dt>
            <dd>{item.weight} lb</dd>
          </div>
          {item.damage ? (
            <div>
              <dt className="font-medium text-slate-500 dark:text-slate-400">
                Damage
              </dt>
              <dd>
                {item.damage}
                {item.damage_type ? ` ${item.damage_type}` : ""}
              </dd>
            </div>
          ) : null}
          {typeof item.armor_class === "number" ? (
            <div>
              <dt className="font-medium text-slate-500 dark:text-slate-400">
                Armor Class
              </dt>
              <dd>{item.armor_class}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              Magic
            </dt>
            <dd>{item.magic ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              Attunement
            </dt>
            <dd>{item.attunement_required ? "Required" : "Not required"}</dd>
          </div>
        </dl>
      </DetailSection>

      <DetailSection title="Properties">
        <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-300">
          {item.properties.map((property) => (
            <li key={property}>{property}</li>
          ))}
        </ul>
      </DetailSection>
    </section>
  );
}
