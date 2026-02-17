import { Link } from "react-router";
import { ROUTES } from "../constants/routes";
import type { Item } from "../types";
import { Surface } from "./Surface";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Surface className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {item.name}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {item.type} · {item.rarity}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          #{item.id}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
        {item.description}
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
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
        className="mt-4 inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:text-slate-100 dark:decoration-slate-600 dark:hover:decoration-slate-200"
      >
        View details
      </Link>
    </Surface>
  );
}
