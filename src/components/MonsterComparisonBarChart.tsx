import { useMemo } from "react";
import { Link } from "react-router";
import { ROUTES } from "../constants/routes";
import type { Monster } from "../types";
import { Surface } from "./Surface";

export type MonsterComparisonMetric =
  | "hit_points"
  | "armor_class"
  | "challenge_rating";

interface MonsterComparisonBarChartProps {
  monsters: Monster[];
  metric: MonsterComparisonMetric;
  onMetricChange: (metric: MonsterComparisonMetric) => void;
}

const metricOptions: Array<{
  key: MonsterComparisonMetric;
  label: string;
  shortLabel: string;
}> = [
  { key: "hit_points", label: "Hit Points", shortLabel: "HP" },
  { key: "armor_class", label: "Armor Class", shortLabel: "AC" },
  { key: "challenge_rating", label: "Challenge Rating", shortLabel: "CR" },
];

export function MonsterComparisonBarChart({
  monsters,
  metric,
  onMetricChange,
}: MonsterComparisonBarChartProps) {
  const chartRows = useMemo(() => {
    return [...monsters]
      .sort((first, second) => second[metric] - first[metric])
      .slice(0, 10);
  }, [monsters, metric]);

  const maxValue = useMemo(
    () => Math.max(...chartRows.map((monster) => monster[metric]), 1),
    [chartRows, metric],
  );

  return (
    <Surface as="section" className="mt-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Monster Comparison
        </h3>
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          {metricOptions.map((option) => {
            const isActive = option.key === metric;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onMetricChange(option.key)}
                className={[
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  "first:rounded-l-md last:rounded-r-md",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                {option.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Top {chartRows.length} filtered monsters by{" "}
        {metricOptions.find((option) => option.key === metric)?.label}.
      </p>

      <ul className="mt-4 space-y-2">
        {chartRows.map((monster) => {
          const value = monster[metric];
          const widthPercent = (value / maxValue) * 100;

          return (
            <li key={monster.id}>
              <Link
                to={ROUTES.monsterDetail(monster.id)}
                aria-label={`View ${monster.name} details`}
                className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_3rem] items-center gap-3 rounded px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              >
                <span className="truncate text-xs font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900 dark:text-slate-200 dark:decoration-slate-600 dark:hover:decoration-slate-200">
                  {monster.name}
                </span>
                <div className="h-3 rounded bg-slate-200 transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700">
                  <div
                    className="h-full rounded bg-slate-500 dark:bg-slate-400"
                    style={{ width: `${widthPercent}%` }}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-right text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {value}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}
