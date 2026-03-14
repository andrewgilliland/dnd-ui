import type { Stats } from "../types";

interface StatBlockProps {
  stats: Stats;
}

const STAT_LABELS: Array<keyof Stats> = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];

export function StatBlock({ stats }: StatBlockProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {STAT_LABELS.map((key) => (
        <div
          key={key}
          className="rounded-md border border-zinc-200 bg-white p-4 text-center dark:border-zinc-700 dark:bg-zinc-800"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {key.slice(0, 3)}
          </p>
          <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {stats[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
