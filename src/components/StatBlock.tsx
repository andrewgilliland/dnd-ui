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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {STAT_LABELS.map((key) => (
        <div
          key={key}
          className="rounded-md border border-slate-200 bg-white p-3 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {key.slice(0, 3)}
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">{stats[key]}</p>
        </div>
      ))}
    </div>
  );
}
