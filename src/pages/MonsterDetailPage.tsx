import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ApiError, getMonsterById } from "../api/client";
import { DetailPageHeader } from "../components/DetailPageHeader";
import { DetailSection } from "../components/DetailSection";
import { NotFoundState } from "../components/NotFoundState";
import { StatBlock } from "../components/StatBlock";
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

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-900 dark:text-slate-100">
        {value}
      </dd>
    </div>
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
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded px-2 py-0.5 text-xs font-medium ${colors[color]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function ActionCostPips({ cost }: { cost: number }) {
  return (
    <span className="ml-2 inline-flex gap-0.5">
      {Array.from({ length: cost }).map((_, i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500"
        />
      ))}
    </span>
  );
}

function ActionList({
  actions,
  legendary,
}: {
  actions: (ReturnType<typeof Array.prototype.filter> extends Array<infer T>
    ? T
    : never)[];
  legendary?: boolean;
}) {
  return (
    <ul className="space-y-4">
      {(actions as MonsterLegendaryAction[]).map((action) => (
        <li key={action.name} className="text-sm">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            <em>{action.name}</em>
            {legendary && typeof action.action_cost === "number" && (
              <ActionCostPips cost={action.action_cost} />
            )}
          </p>
          <p className="mt-0.5 text-slate-700 dark:text-slate-300">
            {action.description}
          </p>
          {(action.attack_bonus != null ||
            action.damage_dice ||
            action.damage_type) && (
            <div className="mt-1.5 flex flex-wrap gap-2">
              {action.attack_bonus != null && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  +{action.attack_bonus} to hit
                </span>
              )}
              {action.damage_dice && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {action.damage_dice}
                </span>
              )}
              {action.damage_type && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {action.damage_type}
                </span>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
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

  const hasSavingThrows =
    monster.saving_throws && Object.keys(monster.saving_throws).length > 0;
  const hasSkills = monster.skills && Object.keys(monster.skills).length > 0;

  return (
    <section className="space-y-6">
      <DetailPageHeader
        backTo={ROUTES.monsters}
        backLabel="Back to monsters"
        title={monster.name}
        subtitle={`${monster.size} ${monster.type} · ${monster.alignment}`}
      />

      {/* Defence & Speed */}
      <DetailSection title="Stats">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Stat
            label="Armor Class"
            value={
              monster.armor_description
                ? `${monster.armor_class} (${monster.armor_description})`
                : monster.armor_class
            }
          />
          <Stat
            label="Hit Points"
            value={`${monster.hit_points} (${monster.hit_dice})`}
          />
          <Stat label="Speed" value={formatSpeed(monster.speed)} />
          <Stat
            label="Challenge Rating"
            value={formatCR(monster.challenge_rating)}
          />
          {monster.experience_points != null && (
            <Stat
              label="Experience Points"
              value={monster.experience_points.toLocaleString()}
            />
          )}
          {monster.proficiency_bonus != null && (
            <Stat
              label="Proficiency Bonus"
              value={`+${monster.proficiency_bonus}`}
            />
          )}
        </dl>
      </DetailSection>

      {/* Ability Scores */}
      <DetailSection title="Ability Scores">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <StatBlock stats={monster.stats} />
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <StatsRadarChart stats={monster.stats} size={250} />
          </div>
        </div>
      </DetailSection>

      {/* Proficiencies */}
      {(hasSavingThrows || hasSkills) && (
        <DetailSection title="Proficiencies">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {hasSavingThrows && (
              <Stat
                label="Saving Throws"
                value={Object.entries(monster.saving_throws!)
                  .map(([k, v]) => `${capitalize(k)} +${v}`)
                  .join(", ")}
              />
            )}
            {hasSkills && (
              <Stat
                label="Skills"
                value={Object.entries(monster.skills!)
                  .map(([k, v]) => `${capitalize(k)} +${v}`)
                  .join(", ")}
              />
            )}
          </dl>
        </DetailSection>
      )}

      {/* Damage traits */}
      {monster.damage_immunities?.length ||
      monster.damage_resistances?.length ||
      monster.damage_vulnerabilities?.length ||
      monster.condition_immunities?.length ? (
        <DetailSection title="Damage & Condition Traits">
          <div className="space-y-3">
            {monster.damage_immunities?.length ? (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Immunities
                </p>
                <BadgeList items={monster.damage_immunities} color="red" />
              </div>
            ) : null}
            {monster.damage_resistances?.length ? (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Resistances
                </p>
                <BadgeList items={monster.damage_resistances} color="orange" />
              </div>
            ) : null}
            {monster.damage_vulnerabilities?.length ? (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Vulnerabilities
                </p>
                <BadgeList
                  items={monster.damage_vulnerabilities}
                  color="yellow"
                />
              </div>
            ) : null}
            {monster.condition_immunities?.length ? (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Condition Immunities
                </p>
                <BadgeList items={monster.condition_immunities} />
              </div>
            ) : null}
          </div>
        </DetailSection>
      ) : null}

      {/* Senses & Languages */}
      <DetailSection title="Senses & Languages">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Stat
            label="Senses"
            value={
              Object.entries(monster.senses)
                .filter(([, v]) => v != null)
                .map(([k, v]) =>
                  k === "passive_perception"
                    ? `Passive Perception ${v}`
                    : `${capitalize(k)} ${v} ft.`,
                )
                .join(", ") || "—"
            }
          />
          <Stat
            label="Languages"
            value={
              monster.languages.length > 0 ? monster.languages.join(", ") : "—"
            }
          />
        </dl>
      </DetailSection>

      {/* Special Abilities */}
      {monster.special_abilities && monster.special_abilities.length > 0 && (
        <DetailSection title="Special Abilities">
          <ul className="space-y-4">
            {monster.special_abilities.map((ability) => (
              <li key={ability.name} className="text-sm">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  <em>{ability.name}</em>
                </p>
                <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                  {ability.description}
                </p>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* Actions */}
      {monster.actions && monster.actions.length > 0 && (
        <DetailSection title="Actions">
          <ActionList actions={monster.actions} />
        </DetailSection>
      )}

      {/* Legendary Actions */}
      {monster.legendary_actions && monster.legendary_actions.length > 0 && (
        <DetailSection title="Legendary Actions">
          <ActionList actions={monster.legendary_actions} legendary />
        </DetailSection>
      )}
    </section>
  );
}
