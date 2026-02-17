import { Link } from "react-router";
import { ROUTES } from "../constants/routes";
import type { Monster } from "../types";
import { Surface } from "./Surface";

interface MonsterCardProps {
  monster: Monster;
}

export function MonsterCard({ monster }: MonsterCardProps) {
  return (
    <Surface className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {monster.name}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {monster.size} {monster.type} · {monster.alignment}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          CR {monster.challenge_rating}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
        <div>
          <dt className="font-medium text-slate-500 dark:text-slate-400">AC</dt>
          <dd>{monster.armor_class}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500 dark:text-slate-400">HP</dt>
          <dd>{monster.hit_points}</dd>
        </div>
      </dl>

      <Link
        to={ROUTES.monsterDetail(monster.id)}
        className="mt-4 inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:text-slate-100 dark:decoration-slate-600 dark:hover:decoration-slate-200"
      >
        View details
      </Link>
    </Surface>
  );
}
