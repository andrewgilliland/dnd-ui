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
import type { Monster } from "../types";

type MonsterEntry = Monster;

function formatSpeed(speed: MonsterEntry["speed"]) {
  return Object.entries(speed)
    .map(([kind, value]) => `${kind} ${value} ft`)
    .join(", ");
}

function formatMap(
  values?: MonsterEntry["saving_throws"] | MonsterEntry["skills"],
) {
  if (!values || Object.keys(values).length === 0) {
    return "None";
  }

  return Object.entries(values)
    .map(([key, value]) => `${key} +${value}`)
    .join(", ");
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
        if (abortController.signal.aborted) {
          return;
        }

        setMonster(null);

        if (caughtError instanceof Error) {
          setError(caughtError);
        } else {
          setError(new Error("Failed to load monster."));
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
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

  return (
    <section className="space-y-6">
      <DetailPageHeader
        backTo={ROUTES.monsters}
        backLabel="Back to monsters"
        title={monster.name}
        subtitle={`${monster.size} ${monster.type} · ${monster.alignment}`}
      />

      <DetailSection title="Core Stats">
        <dl className="grid grid-cols-1 gap-3 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              Armor Class
            </dt>
            <dd>{monster.armor_class}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              Hit Points
            </dt>
            <dd>
              {monster.hit_points} ({monster.hit_dice})
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              Speed
            </dt>
            <dd>{formatSpeed(monster.speed)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              Saving Throws
            </dt>
            <dd>{formatMap(monster.saving_throws)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              Skills
            </dt>
            <dd>{formatMap(monster.skills)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              Senses
            </dt>
            <dd>
              {Object.entries(monster.senses)
                .map(([key, value]) => `${key} ${value}`)
                .join(", ")}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              Languages
            </dt>
            <dd>
              {monster.languages.length > 0
                ? monster.languages.join(", ")
                : "None"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              Challenge Rating
            </dt>
            <dd>{monster.challenge_rating}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">
              XP
            </dt>
            <dd>{monster.experience_points}</dd>
          </div>
        </dl>
      </DetailSection>

      <DetailSection title="Ability Scores">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <StatBlock stats={monster.stats} />

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <StatsRadarChart stats={monster.stats} size={250} />
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Special Abilities">
        <ul className="space-y-3 text-slate-700 dark:text-slate-300">
          {monster.special_abilities.map((ability) => (
            <li key={ability.name}>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {ability.name}
              </p>
              <p className="text-sm">{ability.description}</p>
            </li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection title="Actions">
        <ul className="space-y-3 text-slate-700 dark:text-slate-300">
          {monster.actions.map((action) => (
            <li key={action.name}>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {action.name}
              </p>
              <p className="text-sm">{action.description}</p>
              {(action.damage_dice ||
                action.damage_type ||
                typeof action.attack_bonus === "number") && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {typeof action.attack_bonus === "number"
                    ? `Attack Bonus: +${action.attack_bonus} · `
                    : ""}
                  {action.damage_dice
                    ? `Damage Dice: ${action.damage_dice}`
                    : ""}
                  {action.damage_type ? ` ${action.damage_type}` : ""}
                </p>
              )}
            </li>
          ))}
        </ul>
      </DetailSection>
    </section>
  );
}
