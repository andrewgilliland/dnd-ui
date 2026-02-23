import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import type { Stats } from "../types";

interface StatsRadarChartProps {
  stats: Stats;
  size?: number;
}

interface Point {
  x: number;
  y: number;
}

const AXES: Array<{ key: keyof Stats; label: string }> = [
  { key: "strength", label: "STR" },
  { key: "dexterity", label: "DEX" },
  { key: "constitution", label: "CON" },
  { key: "intelligence", label: "INT" },
  { key: "wisdom", label: "WIS" },
  { key: "charisma", label: "CHA" },
];

const MAX_SCORE = 30;
const RING_COUNT = 5;

function toPolygonPoints(points: Point[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

export function StatsRadarChart({ stats, size = 280 }: StatsRadarChartProps) {
  const center = size / 2;
  const chartRadius = size * 0.34;

  const radiusScale = scaleLinear<number>({
    domain: [0, MAX_SCORE],
    range: [0, chartRadius],
    clamp: true,
  });

  const getPoint = (axisIndex: number, value: number, maxValue: number) => {
    const angle = (Math.PI * 2 * axisIndex) / AXES.length - Math.PI / 2;
    const radius = radiusScale(Math.min(value, maxValue));

    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  };

  const ringPolygons = Array.from({ length: RING_COUNT }, (_, index) => {
    const ringValue = ((index + 1) / RING_COUNT) * MAX_SCORE;

    return AXES.map((_, axisIndex) =>
      getPoint(axisIndex, ringValue, MAX_SCORE),
    );
  });

  const axisEnds = AXES.map((_, axisIndex) =>
    getPoint(axisIndex, MAX_SCORE, MAX_SCORE),
  );
  const statPoints = AXES.map((axis, axisIndex) =>
    getPoint(axisIndex, stats[axis.key], MAX_SCORE),
  );

  return (
    <div className="flex justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label="Ability score radar chart"
        role="img"
      >
        <Group>
          {ringPolygons.map((ringPoints, index) => (
            <polygon
              key={`ring-${index + 1}`}
              points={toPolygonPoints(ringPoints)}
              fill="none"
              className="stroke-slate-300 dark:stroke-slate-700"
              strokeWidth={1}
            />
          ))}

          {axisEnds.map((axisEnd, index) => (
            <line
              key={AXES[index].key}
              x1={center}
              y1={center}
              x2={axisEnd.x}
              y2={axisEnd.y}
              className="stroke-slate-300 dark:stroke-slate-700"
              strokeWidth={1}
            />
          ))}

          <polygon
            points={toPolygonPoints(statPoints)}
            className="fill-slate-400/35 stroke-slate-600 dark:fill-slate-500/25 dark:stroke-slate-300"
            strokeWidth={2}
          />

          {statPoints.map((point, index) => (
            <circle
              key={`point-${AXES[index].key}`}
              cx={point.x}
              cy={point.y}
              r={3}
              className="fill-slate-700 dark:fill-slate-200"
            />
          ))}

          {AXES.map((axis, index) => {
            const labelPoint = getPoint(index, MAX_SCORE + 4, MAX_SCORE + 4);

            return (
              <text
                key={`label-${axis.key}`}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-600 text-xs font-semibold dark:fill-slate-300"
              >
                {axis.label}
              </text>
            );
          })}
        </Group>
      </svg>
    </div>
  );
}
