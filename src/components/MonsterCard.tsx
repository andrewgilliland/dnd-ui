import { Link } from "react-router";
import { ROUTES } from "../constants/routes";
import type { CardDensity } from "../hooks/useCardDensity";
import type { Monster } from "../types";
import { Surface } from "./Surface";

interface MonsterCardProps {
  monster: Monster;
  cardDensity?: CardDensity;
}

export function MonsterCard({
  monster,
  cardDensity = "comfortable",
}: MonsterCardProps) {
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
            {monster.name}
          </h3>
          <p
            className={[
              "text-slate-600 dark:text-slate-400",
              isCompact ? "mt-0.5 text-xs" : "mt-1 text-sm",
            ].join(" ")}
          >
            {monster.size} {monster.type} · {monster.alignment}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          CR {monster.challenge_rating}
        </span>
      </div>

      <dl
        className={[
          "grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300",
          isCompact ? "mt-2 text-xs" : "mt-3 text-sm",
        ].join(" ")}
      >
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
