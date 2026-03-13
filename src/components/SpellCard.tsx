import { Link } from "react-router";
import { ROUTES } from "../constants/routes";
import type { CardDensity } from "../hooks/useCardDensity";
import type { Spell } from "../types";
import { Surface } from "./Surface";

interface SpellCardProps {
  spell: Spell;
  cardDensity?: CardDensity;
}

function formatLevel(level: number) {
  return level === 0 ? "Cantrip" : `Level ${level}`;
}

export function SpellCard({
  spell,
  cardDensity = "comfortable",
}: SpellCardProps) {
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
              "font-semibold text-slate-900 dark:text-zinc-100",
              isCompact ? "text-base" : "text-lg",
            ].join(" ")}
          >
            {spell.name}
          </h3>
          <p
            className={[
              "text-slate-600 dark:text-zinc-400",
              isCompact ? "mt-0.5 text-xs" : "mt-1 text-sm",
            ].join(" ")}
          >
            {formatLevel(spell.level)} · {spell.school}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {spell.concentration && (
            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              Concentration
            </span>
          )}
          {spell.ritual && (
            <span className="rounded-md bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
              Ritual
            </span>
          )}
        </div>
      </div>

      <dl
        className={[
          "grid grid-cols-2 gap-2 text-slate-700 dark:text-zinc-300",
          isCompact ? "mt-2 text-xs" : "mt-3 text-sm",
        ].join(" ")}
      >
        <div>
          <dt className="font-medium text-slate-500 dark:text-zinc-400">
            Casting Time
          </dt>
          <dd>{spell.casting_time}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500 dark:text-zinc-400">
            Range
          </dt>
          <dd>{spell.range}</dd>
        </div>
      </dl>

      <Link
        to={ROUTES.spellDetail(spell.id)}
        className={[
          "inline-flex font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-slate-200",
          isCompact ? "mt-3 text-xs" : "mt-4 text-sm",
        ].join(" ")}
      >
        View details
      </Link>
    </Surface>
  );
}
