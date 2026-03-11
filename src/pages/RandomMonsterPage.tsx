import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Shuffle } from "lucide-react";
import type { RandomMonsterParams } from "../api/client";
import { BackLink } from "../components/BackLink";
import { PageHeader } from "../components/PageHeader";
import { StatsRadarChart } from "../components/StatsRadarChart";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { useRandomMonster } from "../hooks/useMonsters";
import { useMonstersMetadata } from "../hooks/useMonsters";
import type { Monster, MonsterLegendaryAction } from "../types";
import { toFilterOptions, uniqueSortedStrings } from "../utils/filterOptions";

// ── Helpers (mirrored from MonsterDetailPage) ────────────────────────────────

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatSpeed(speed: Monster["speed"]) {
  const parts = Object.entries(speed ?? {})
    .filter(([, v]) => v != null)
    .map(([kind, value]) => `${capitalize(kind)} ${value} ft.`);
  return parts.length > 0 ? parts.join(", ") : "—";
}

function formatCR(cr: number) {
  if (cr === 0.125) return "1/8";
  if (cr === 0.25) return "1/4";
  if (cr === 0.5) return "1/2";
  return String(cr);
}

function modifier(score: number) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : String(mod);
}

const ABILITY_ABBR: { key: keyof Monster["stats"]; label: string }[] = [
  { key: "strength", label: "STR" },
  { key: "dexterity", label: "DEX" },
  { key: "constitution", label: "CON" },
  { key: "intelligence", label: "INT" },
  { key: "wisdom", label: "WIS" },
  { key: "charisma", label: "CHA" },
];

function Divider() {
  return <hr className="border-t border-red-700 dark:border-red-800" />;
}

function PropLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p className="text-sm text-slate-800 dark:text-zinc-200">
      <span className="font-bold text-red-800 dark:text-red-400">{label} </span>
      {children}
    </p>
  );
}

function ActionEntry({
  action,
  legendary,
}: {
  action: MonsterLegendaryAction;
  legendary?: boolean;
}) {
  const costLabel =
    legendary && action.action_cost != null && action.action_cost > 1
      ? ` (Costs ${action.action_cost} Actions)`
      : "";
  return (
    <li className="text-sm text-slate-800 dark:text-zinc-200">
      <span className="font-bold italic text-slate-900 dark:text-zinc-100">
        {action.name}
        {costLabel}.
      </span>{" "}
      {action.description}
    </li>
  );
}

function BadgeList({
  items,
  color = "slate",
}: {
  items: string[];
  color?: "slate" | "red" | "orange" | "yellow";
}) {
  const colors: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    orange:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    yellow:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  };
  return (
    <span className="inline-flex flex-wrap gap-1">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded px-1.5 py-0.5 text-xs font-medium ${colors[color]}`}
        >
          {item}
        </span>
      ))}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function RandomMonsterPage() {
  const [seed, setSeed] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const { data: metadataData } = useMonstersMetadata();

  const typeValues = useMemo(
    () =>
      uniqueSortedStrings((metadataData?.monsters ?? []).map((m) => m.type)),
    [metadataData],
  );
  const typeOptions = useMemo(() => toFilterOptions(typeValues), [typeValues]);

  const params: RandomMonsterParams = { type: selectedType || undefined };
  const {
    data: monster,
    isFetching,
    error,
  } = useRandomMonster(params, enabled, seed);

  function handleRoll() {
    setEnabled(true);
    setSeed((s) => s + 1);
  }

  const sensesText = monster
    ? Object.entries(monster.senses ?? {})
        .filter(([, v]) => v != null)
        .map(([k, v]) =>
          k === "passive_perception"
            ? `Passive Perception ${v}`
            : `${capitalize(k)} ${v} ft.`,
        )
        .join(", ") || "—"
    : "";

  return (
    <section className="space-y-6">
      <BackLink to={ROUTES.monsters}>Back to Monsters</BackLink>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Random Monster"
          subtitle="Roll to discover a random creature from the bestiary."
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <option value="">All Types</option>
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleRoll}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          <Shuffle aria-hidden="true" className="h-4 w-4" />
          {isFetching ? "Rolling..." : enabled ? "Reroll" : "Roll"}
        </button>

        {monster && !isFetching && (
          <Link
            to={ROUTES.monsterDetail(monster.id)}
            className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            View full detail →
          </Link>
        )}
      </div>

      {/* States */}
      {!enabled ? (
        <Surface className="flex flex-col items-center justify-center py-20 text-center">
          <Shuffle
            aria-hidden="true"
            className="mb-4 h-10 w-10 text-zinc-300 dark:text-zinc-600"
          />
          <p className="text-zinc-500 dark:text-zinc-400">
            Press Roll to generate a random monster.
          </p>
        </Surface>
      ) : isFetching ? (
        <Surface className="p-8 text-center">
          <p className="text-slate-700 dark:text-zinc-300">Rolling...</p>
        </Surface>
      ) : error ? (
        <Surface className="p-8 text-center">
          <p className="text-red-600 dark:text-red-400">
            {error instanceof Error
              ? error.message
              : "Failed to generate a random monster."}
          </p>
        </Surface>
      ) : monster ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          {/* Stat Block */}
          <Surface className="divide-y divide-red-700/30 overflow-hidden dark:divide-red-800/40">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
                {monster.name}
              </h1>
              <p className="mt-0.5 italic text-slate-600 dark:text-zinc-400">
                {capitalize(monster.size)} {capitalize(monster.type)},{" "}
                {capitalize(monster.alignment)}
              </p>
            </div>

            <Divider />

            {/* Defense */}
            <div className="space-y-1 px-6 py-4">
              <PropLine label="Armor Class">
                {monster.armor_class}
                {monster.armor_description && ` (${monster.armor_description})`}
              </PropLine>
              <PropLine label="Hit Points">
                {monster.hit_points} ({monster.hit_dice})
              </PropLine>
              <PropLine label="Speed">{formatSpeed(monster.speed)}</PropLine>
            </div>

            <Divider />

            {/* Ability Scores */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-6 gap-1 text-center">
                {ABILITY_ABBR.map(({ key, label }) => {
                  const score = monster.stats?.[key] ?? 0;
                  const mod = modifier(score);
                  return (
                    <div key={key} className="flex flex-col items-center">
                      <span className="text-xs font-bold text-red-800 dark:text-red-400">
                        {label}
                      </span>
                      <span className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        {score}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-zinc-400">
                        ({mod})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Divider />

            {/* Properties */}
            <div className="space-y-1 px-6 py-4">
              {monster.saving_throws &&
                Object.keys(monster.saving_throws).length > 0 && (
                  <PropLine label="Saving Throws">
                    {Object.entries(monster.saving_throws)
                      .map(
                        ([k, v]) =>
                          `${k.slice(0, 3).toUpperCase()} ${v >= 0 ? "+" : ""}${v}`,
                      )
                      .join(", ")}
                  </PropLine>
                )}
              {monster.skills && Object.keys(monster.skills).length > 0 && (
                <PropLine label="Skills">
                  {Object.entries(monster.skills)
                    .map(
                      ([k, v]) => `${capitalize(k)} ${v >= 0 ? "+" : ""}${v}`,
                    )
                    .join(", ")}
                </PropLine>
              )}
              {monster.damage_immunities?.length ? (
                <PropLine label="Damage Immunities">
                  <BadgeList items={monster.damage_immunities} color="red" />
                </PropLine>
              ) : null}
              {monster.damage_resistances?.length ? (
                <PropLine label="Damage Resistances">
                  <BadgeList
                    items={monster.damage_resistances}
                    color="orange"
                  />
                </PropLine>
              ) : null}
              {monster.damage_vulnerabilities?.length ? (
                <PropLine label="Damage Vulnerabilities">
                  <BadgeList
                    items={monster.damage_vulnerabilities}
                    color="yellow"
                  />
                </PropLine>
              ) : null}
              {monster.condition_immunities?.length ? (
                <PropLine label="Condition Immunities">
                  <BadgeList items={monster.condition_immunities} />
                </PropLine>
              ) : null}
              <PropLine label="Senses">{sensesText}</PropLine>
              <PropLine label="Languages">
                {(monster.languages ?? []).length > 0
                  ? monster.languages.join(", ")
                  : "—"}
              </PropLine>
              <div className="flex flex-wrap items-baseline gap-x-8 pt-0.5">
                <PropLine label="Challenge">
                  {formatCR(monster.challenge_rating)}
                  {monster.experience_points != null &&
                    ` (${monster.experience_points.toLocaleString()} XP)`}
                </PropLine>
                {monster.proficiency_bonus != null && (
                  <PropLine label="Proficiency Bonus">
                    +{monster.proficiency_bonus}
                  </PropLine>
                )}
              </div>
            </div>

            {/* Special Abilities */}
            {monster.special_abilities &&
              monster.special_abilities.length > 0 && (
                <>
                  <Divider />
                  <div className="px-6 py-4">
                    <h2 className="mb-3 text-xl font-semibold text-red-800 dark:text-red-400">
                      Traits
                    </h2>
                    <ul className="space-y-2">
                      {monster.special_abilities.map((ability) => (
                        <li
                          key={ability.name}
                          className="text-sm text-slate-800 dark:text-zinc-200"
                        >
                          <span className="font-bold italic text-slate-900 dark:text-zinc-100">
                            {ability.name}.
                          </span>{" "}
                          {ability.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

            {/* Actions */}
            {monster.actions && monster.actions.length > 0 && (
              <>
                <Divider />
                <div className="px-6 py-4">
                  <h2 className="mb-3 text-xl font-semibold text-red-800 dark:text-red-400">
                    Actions
                  </h2>
                  <ul className="space-y-2">
                    {monster.actions.map((action) => (
                      <ActionEntry key={action.name} action={action} />
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Legendary Actions */}
            {monster.legendary_actions &&
              monster.legendary_actions.length > 0 && (
                <>
                  <Divider />
                  <div className="px-6 py-4 pb-6">
                    <h2 className="mb-2 text-xl font-semibold text-red-800 dark:text-red-400">
                      Legendary Actions
                    </h2>
                    <p className="mb-3 text-sm text-slate-700 dark:text-zinc-300">
                      {monster.name} can take 3 legendary actions, choosing from
                      the options below. Only one legendary action option can be
                      used at a time and only at the end of another
                      creature&apos;s turn. {monster.name} regains spent
                      legendary actions at the start of its turn.
                    </p>
                    <ul className="space-y-2">
                      {monster.legendary_actions.map((action) => (
                        <ActionEntry
                          key={action.name}
                          action={action}
                          legendary
                        />
                      ))}
                    </ul>
                  </div>
                </>
              )}
          </Surface>

          {/* Radar Chart */}
          <Surface className="flex items-center justify-center p-6">
            <StatsRadarChart stats={monster.stats ?? {}} size={260} />
          </Surface>
        </div>
      ) : null}
    </section>
  );
}
