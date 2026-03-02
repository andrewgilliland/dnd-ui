import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ApiError, getMonsterById } from "../api/client";
import { BackLink } from "../components/BackLink";
import { NotFoundState } from "../components/NotFoundState";
import { StatsRadarChart } from "../components/StatsRadarChart";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import type { Monster, MonsterLegendaryAction } from "../types";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatSpeed(speed: Monster["speed"]) {
  const parts = Object.entries(speed)
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
    <p className="text-sm text-slate-800 dark:text-slate-200">
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
    <li className="text-sm text-slate-800 dark:text-slate-200">
      <span className="font-bold italic text-slate-900 dark:text-slate-100">
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
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
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

export function MonsterDetailPage() {
  const { id } = useParams();
  const monsterId = Number(id);

  const [monster, setMonster] = useState<Monster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    if (!Number.isFinite(monsterId)) {
      setMonster(null);
      setError(null);
      setIsLoading(false);
      return () => {
        abortController.abort();
      };
    }

    const loadMonster = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMonsterById(monsterId, {
          signal: abortController.signal,
        });
        setMonster(response);
      } catch (caughtError) {
        if (abortController.signal.aborted) return;
        setMonster(null);
        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error("Failed to load monster."),
        );
      } finally {
        if (!abortController.signal.aborted) setIsLoading(false);
      }
    };

    void loadMonster();
    return () => {
      abortController.abort();
    };
  }, [monsterId]);

  if (!Number.isFinite(monsterId)) {
    return (
      <NotFoundState
        title="Monster not found"
        description={`No monster exists for id: ${id}`}
        backTo={ROUTES.monsters}
        backLabel="Back to monsters"
      />
    );
  }

  if (isLoading) {
    return (
      <Surface as="section" className="p-8 text-center">
        <p className="text-slate-700 dark:text-slate-300">Loading monster...</p>
      </Surface>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Monster not found"
        description={`No monster exists for id: ${id}`}
        backTo={ROUTES.monsters}
        backLabel="Back to monsters"
      />
    );
  }

  if (error) {
    return (
      <Surface as="section" className="p-8 text-center">
        <p className="text-slate-700 dark:text-slate-300">{error.message}</p>
      </Surface>
    );
  }

  if (!monster) {
    return (
      <NotFoundState
        title="Monster not found"
        description={`No monster exists for id: ${id}`}
        backTo={ROUTES.monsters}
        backLabel="Back to monsters"
      />
    );
  }

  const sensesText =
    Object.entries(monster.senses)
      .filter(([, v]) => v != null)
      .map(([k, v]) =>
        k === "passive_perception"
          ? `Passive Perception ${v}`
          : `${capitalize(k)} ${v} ft.`,
      )
      .join(", ") || "—";

  return (
    <section className="space-y-6">
      {/* Back navigation */}
      <BackLink to={ROUTES.monsters}>Back to Monsters</BackLink>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        {/* ── Stat Block ── */}
        <Surface className="divide-y divide-red-700/30 overflow-hidden dark:divide-red-800/40">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {monster.name}
            </h1>
            <p className="mt-0.5 italic text-slate-600 dark:text-slate-400">
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
                const score = monster.stats[key];
                const mod = modifier(score);
                return (
                  <div key={key} className="flex flex-col items-center">
                    <span className="text-xs font-bold text-red-800 dark:text-red-400">
                      {label}
                    </span>
                    <span className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {score}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      ({mod})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Divider />

          {/* Properties block */}
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
                  .map(([k, v]) => `${capitalize(k)} ${v >= 0 ? "+" : ""}${v}`)
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
                <BadgeList items={monster.damage_resistances} color="orange" />
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
              {monster.languages.length > 0
                ? monster.languages.join(", ")
                : "—"}
            </PropLine>
            {/* Challenge + Proficiency Bonus on same line */}
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

          {/* Special Abilities / Traits */}
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
                        className="text-sm text-slate-800 dark:text-slate-200"
                      >
                        <span className="font-bold italic text-slate-900 dark:text-slate-100">
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
                  <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
                    {monster.name} can take 3 legendary actions, choosing from
                    the options below. Only one legendary action option can be
                    used at a time and only at the end of another
                    creature&apos;s turn. {monster.name} regains spent legendary
                    actions at the start of its turn.
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

        {/* ── Radar Chart sidebar ── */}
        <Surface className="flex items-center justify-center p-6">
          <StatsRadarChart stats={monster.stats} size={260} />
        </Surface>
      </div>
    </section>
  );
}
