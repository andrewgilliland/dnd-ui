import type { CardDensity } from "../hooks/useCardDensity";
import { Surface } from "./Surface";

interface ListCardSkeletonProps {
  cardDensity?: CardDensity;
}

export function ListCardSkeleton({
  cardDensity = "comfortable",
}: ListCardSkeletonProps) {
  const isCompact = cardDensity === "compact";

  return (
    <Surface className={["animate-pulse", isCompact ? "p-4" : "p-5"].join(" ")}>
      <div
        className={[
          "flex items-start justify-between",
          isCompact ? "gap-3" : "gap-4",
        ].join(" ")}
      >
        <div className="flex-1 space-y-2">
          <div
            className={[
              "w-2/3 rounded bg-slate-200 dark:bg-slate-700",
              isCompact ? "h-4" : "h-5",
            ].join(" ")}
          />
          <div
            className={[
              "w-1/2 rounded bg-slate-200 dark:bg-slate-700",
              isCompact ? "h-3" : "h-4",
            ].join(" ")}
          />
        </div>
        <div
          className={[
            "w-12 rounded bg-slate-200 dark:bg-slate-700",
            isCompact ? "h-5" : "h-6",
          ].join(" ")}
        />
      </div>

      <div className={["space-y-2", isCompact ? "mt-2" : "mt-3"].join(" ")}>
        <div
          className={[
            "w-full rounded bg-slate-200 dark:bg-slate-700",
            isCompact ? "h-3" : "h-4",
          ].join(" ")}
        />
        <div
          className={[
            "w-5/6 rounded bg-slate-200 dark:bg-slate-700",
            isCompact ? "h-3" : "h-4",
          ].join(" ")}
        />
      </div>

      <div
        className={[
          "w-24 rounded bg-slate-200 dark:bg-slate-700",
          isCompact ? "mt-3 h-3" : "mt-4 h-4",
        ].join(" ")}
      />
    </Surface>
  );
}
