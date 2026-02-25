import { useEffect, useMemo, useState } from "react";
import { Group } from "@visx/group";
import type { Monster, MonsterType } from "../types";
import { Surface } from "./Surface";

interface MonsterTypeDonutChartProps {
  monsters: Monster[];
  size?: number;
}

interface TypeSlice {
  type: MonsterType;
  count: number;
  percentage: number;
  startAngle: number;
  endAngle: number;
  color: string;
}

const TYPE_COLORS: Record<MonsterType, string> = {
  Aberration: "#7c3aed",
  Beast: "#65a30d",
  Celestial: "#f59e0b",
  Construct: "#78716c",
  Dragon: "#dc2626",
  Elemental: "#0ea5e9",
  Fey: "#a855f7",
  Fiend: "#b91c1c",
  Giant: "#92400e",
  Humanoid: "#2563eb",
  Monstrosity: "#ea580c",
  Ooze: "#16a34a",
  Plant: "#15803d",
  Undead: "#6b7280",
};

const ANIMATION_DURATION_MS = 520;

function arcPath(
  cx: number,
  cy: number,
  radius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const clampedEnd = Math.min(endAngle, startAngle + Math.PI * 2 - 0.001);
  const largeArc = clampedEnd - startAngle > Math.PI ? 1 : 0;

  const outerStartX = cx + Math.cos(startAngle) * radius;
  const outerStartY = cy + Math.sin(startAngle) * radius;
  const outerEndX = cx + Math.cos(clampedEnd) * radius;
  const outerEndY = cy + Math.sin(clampedEnd) * radius;

  const innerStartX = cx + Math.cos(clampedEnd) * innerRadius;
  const innerStartY = cy + Math.sin(clampedEnd) * innerRadius;
  const innerEndX = cx + Math.cos(startAngle) * innerRadius;
  const innerEndY = cy + Math.sin(startAngle) * innerRadius;

  return [
    `M ${outerStartX} ${outerStartY}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}`,
    `L ${innerStartX} ${innerStartY}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEndX} ${innerEndY}`,
    "Z",
  ].join(" ");
}

export function MonsterTypeDonutChart({
  monsters,
  size = 240,
}: MonsterTypeDonutChartProps) {
  const center = size / 2;
  const outerRadius = size * 0.42;
  const innerRadius = outerRadius * 0.58;

  const slices = useMemo<TypeSlice[]>(() => {
    const counts = new Map<MonsterType, number>();

    for (const monster of monsters) {
      counts.set(monster.type, (counts.get(monster.type) ?? 0) + 1);
    }

    const total = monsters.length;
    if (total === 0) return [];

    const sorted = [...counts.entries()].sort(
      ([, countA], [, countB]) => countB - countA,
    );

    let currentAngle = -Math.PI / 2;

    return sorted.map(([type, count]) => {
      const percentage = count / total;
      const startAngle = currentAngle;
      const endAngle = currentAngle + percentage * Math.PI * 2;
      currentAngle = endAngle;

      return {
        type,
        count,
        percentage,
        startAngle,
        endAngle,
        color: TYPE_COLORS[type],
      };
    });
  }, [monsters]);

  const animationKey = slices.map((s) => `${s.type}:${s.count}`).join("|");

  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const step = (timestamp: number) => {
      const elapsed = timestamp - start;
      const linear = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      const eased = 1 - (1 - linear) ** 3;

      setAnimationProgress(eased);

      if (linear < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [animationKey]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (slices.length === 0) return null;

  return (
    <Surface as="section" className="mt-6 p-4">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        Monster Types
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Distribution of {monsters.length} monsters across creature types.
      </p>

      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
        {/* Donut Chart */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="shrink-0"
          role="img"
          aria-label="Monster type distribution donut chart"
        >
          <Group top={0} left={0}>
            {slices.map((slice, index) => {
              const animatedEnd =
                slice.startAngle +
                (slice.endAngle - slice.startAngle) * animationProgress;
              const isHovered = hoveredIndex === index;
              const scale = isHovered ? 1.04 : 1;

              return (
                <path
                  key={slice.type}
                  d={arcPath(
                    center,
                    center,
                    outerRadius * scale,
                    innerRadius * scale,
                    slice.startAngle,
                    animatedEnd,
                  )}
                  fill={slice.color}
                  opacity={hoveredIndex === null || isHovered ? 1 : 0.4}
                  stroke="var(--color-white)"
                  strokeWidth={2}
                  className="cursor-pointer transition-opacity duration-150 dark:stroke-slate-900"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}

            {/* Center label */}
            <text
              x={center}
              y={center - 6}
              textAnchor="middle"
              className="fill-slate-900 text-2xl font-bold dark:fill-slate-100"
              style={{ fontSize: 24, fontWeight: 700 }}
            >
              {monsters.length}
            </text>
            <text
              x={center}
              y={center + 14}
              textAnchor="middle"
              className="fill-slate-500 dark:fill-slate-400"
              style={{ fontSize: 11 }}
            >
              total
            </text>
          </Group>
        </svg>

        {/* Legend */}
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-1">
          {slices.map((slice, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <li
                key={slice.type}
                className={[
                  "flex items-center gap-2 transition-opacity duration-150",
                  hoveredIndex !== null && !isHovered ? "opacity-40" : "",
                ].join(" ")}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-slate-700 dark:text-slate-300">
                  {slice.type}
                </span>
                <span className="ml-auto tabular-nums text-slate-500 dark:text-slate-400">
                  {slice.count}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Surface>
  );
}
