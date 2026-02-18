import { Link } from "react-router";
import { ROUTES } from "../constants/routes";
import type { CardDensity } from "../hooks/useCardDensity";
import type { Item } from "../types";
import { Surface } from "./Surface";

interface ItemCardProps {
  item: Item;
  cardDensity?: CardDensity;
}

export function ItemCard({ item, cardDensity = "comfortable" }: ItemCardProps) {
  const isCompact = cardDensity === "compact";

  return (
    <Surface className={isCompact ? "p-4" : "p-5"}>
      <div
        className={[
          "flex items-start justify-between",
          isCompact ? "gap-3" : "gap-4",
        ].join(" ")}
      >
        <div>
          <h3
            className={[
              "font-semibold text-slate-900 dark:text-slate-100",
              isCompact ? "text-base" : "text-lg",
            ].join(" ")}
          >
            {item.name}
          </h3>
          <p
            className={[
              "text-slate-600 dark:text-slate-400",
              isCompact ? "mt-0.5 text-xs" : "mt-1 text-sm",
            ].join(" ")}
          >
            {item.type} · {item.rarity}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          #{item.id}
        </span>
      </div>

      <p
        className={[
          "text-slate-700 dark:text-slate-300",
          isCompact ? "mt-2 text-xs" : "mt-3 text-sm",
        ].join(" ")}
      >
        {item.description}
      </p>

      <dl
        className={[
          "grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300",
          isCompact ? "mt-2 text-xs" : "mt-3 text-sm",
        ].join(" ")}
      >
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
      </dl>

      <Link
        to={ROUTES.itemDetail(item.id)}
        className={[
          "inline-flex font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:text-slate-100 dark:decoration-slate-600 dark:hover:decoration-slate-200",
          isCompact ? "mt-3 text-xs" : "mt-4 text-sm",
        ].join(" ")}
      >
        View details
      </Link>
    </Surface>
  );
}
