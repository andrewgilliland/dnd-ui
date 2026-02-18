import { Link } from "react-router";
import { ROUTES } from "../constants/routes";
import type { CardDensity } from "../hooks/useCardDensity";
import type { Character } from "../types";
import { Surface } from "./Surface";

interface CharacterCardProps {
  character: Character;
  cardDensity?: CardDensity;
}

export function CharacterCard({
  character,
  cardDensity = "comfortable",
}: CharacterCardProps) {
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
            {character.name}
          </h3>
          <p
            className={[
              "text-slate-600 dark:text-slate-400",
              isCompact ? "mt-0.5 text-xs" : "mt-1 text-sm",
            ].join(" ")}
          >
            {character.race} · {character.class} · {character.alignment}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          #{character.id}
        </span>
      </div>
      <p
        className={[
          "text-slate-700 dark:text-slate-300",
          isCompact ? "mt-2 text-xs" : "mt-3 text-sm",
        ].join(" ")}
      >
        {character.description}
      </p>
      <Link
        to={ROUTES.characterDetail(character.id)}
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
