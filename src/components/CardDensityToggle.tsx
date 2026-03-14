import { Maximize2, Minimize2 } from "lucide-react";
import type { CardDensity } from "../hooks/useCardDensity";

const CARD_DENSITY_OPTIONS = [
  { value: "comfortable", label: "Comfortable", Icon: Maximize2 },
  { value: "compact", label: "Compact", Icon: Minimize2 },
] as const;

interface CardDensityToggleProps {
  cardDensity: CardDensity;
  onCardDensityChange: (value: CardDensity) => void;
}

export function CardDensityToggle({
  cardDensity,
  onCardDensityChange,
}: CardDensityToggleProps) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
      <span>Density</span>
      <div
        role="radiogroup"
        aria-label="Card density"
        className="inline-flex rounded-md border border-zinc-300 bg-white p-1 dark:border-zinc-600 dark:bg-zinc-800"
      >
        {CARD_DENSITY_OPTIONS.map((option) => {
          const isActive = cardDensity === option.value;
          const Icon = option.Icon;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onCardDensityChange(option.value)}
              className={[
                "inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700",
              ].join(" ")}
            >
              <Icon aria-hidden="true" className="h-3.5 w-3.5" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
