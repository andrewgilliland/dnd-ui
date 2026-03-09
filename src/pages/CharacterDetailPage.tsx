import { useParams } from "react-router";
import { ApiError } from "../api/client";
import { BackLink } from "../components/BackLink";
import { NotFoundState } from "../components/NotFoundState";
import { StatsRadarChart } from "../components/StatsRadarChart";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { useCharacter } from "../hooks/useCharacter";
import type { Character, CharacterAction } from "../types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(str: string) {
  return str
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatSpeed(speed: Character["speed"]) {
  const parts = Object.entries(speed)
    .filter(([, v]) => v != null)
    .map(([kind, value]) => `${capitalize(kind)} ${value} ft.`);
  return parts.length > 0 ? parts.join(", ") : "—";
}

function modifier(score: number) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : String(mod);
}

const ABILITY_ABBR: { key: keyof Character["stats"]; label: string }[] = [
  { key: "strength", label: "STR" },
  { key: "dexterity", label: "DEX" },
  { key: "constitution", label: "CON" },
  { key: "intelligence", label: "INT" },
  { key: "wisdom", label: "WIS" },
  { key: "charisma", label: "CHA" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

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

function BadgeList({
  items,
  color = "slate",
}: {
  items: string[];
  color?: "slate" | "red" | "green" | "blue";
}) {
  const colors: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    green:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
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

function ActionEntry({ action }: { action: CharacterAction }) {
  return (
    <li className="text-sm text-slate-800 dark:text-zinc-200">
      <span className="font-bold italic text-slate-900 dark:text-zinc-100">
        {action.name}.
      </span>{" "}
      {action.description}
      {(action.attack_bonus != null || action.damage || action.range) && (
        <span className="ml-2 inline-flex flex-wrap gap-1">
          {action.attack_bonus != null && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
              +{action.attack_bonus} to hit
            </span>
          )}
          {action.damage && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
              {action.damage}
            </span>
          )}
          {action.range && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
              {action.range}
            </span>
          )}
        </span>
      )}
    </li>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function CharacterDetailPage() {
  const { id } = useParams();
  const characterId = Number(id);
  const { data: character, isLoading, error } = useCharacter(characterId);

  if (!Number.isFinite(characterId)) {
    return (
      <NotFoundState
        title="Character not found"
        description={`No character exists for id: ${id}`}
        backTo={ROUTES.characters}
        backLabel="Back to characters"
      />
    );
  }

  if (isLoading) {
    return (
      <Surface as="section" className="p-8 text-center">
        <p className="text-slate-700 dark:text-zinc-300">
          Loading character...
        </p>
      </Surface>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Character not found"
        description={`No character exists for id: ${id}`}
        backTo={ROUTES.characters}
        backLabel="Back to characters"
      />
    );
  }

  if (error) {
    return (
      <Surface as="section" className="p-8 text-center">
        <p className="text-slate-700 dark:text-zinc-300">{error.message}</p>
      </Surface>
    );
  }

  if (!character) {
    return (
      <NotFoundState
        title="Character not found"
        description={`No character exists for id: ${id}`}
        backTo={ROUTES.characters}
        backLabel="Back to characters"
      />
    );
  }

  const proficientSavingThrows = new Set(
    character.saving_throw_proficiencies ?? [],
  );

  const sensesText =
    Object.entries(character.senses ?? {})
      .filter(([, v]) => v != null)
      .map(([k, v]) => `${capitalize(k)} ${v} ft.`)
      .join(", ") || "—";

  return (
    <section className="space-y-6">
      <BackLink to={ROUTES.characters}>Back to Characters</BackLink>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        {/* ── Stat Block ── */}
        <Surface className="divide-y divide-red-700/30 overflow-hidden dark:divide-red-800/40">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              {character.name}
            </h1>
            <p className="mt-0.5 italic text-slate-600 dark:text-zinc-400">
              {character.race} {character.class}, {character.alignment}
            </p>
            {character.description && (
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
                {character.description}
              </p>
            )}
          </div>

          <Divider />

          {/* Defense block */}
          <div className="space-y-1 px-6 py-4">
            <PropLine label="Armor Class">{character.armor_class}</PropLine>
            <PropLine label="Hit Points">
              {character.hit_points.current} / {character.hit_points.max}
              {character.hit_points.temp != null &&
                ` (+${character.hit_points.temp} temp)`}
            </PropLine>
            <PropLine label="Speed">{formatSpeed(character.speed)}</PropLine>
            <PropLine label="Initiative">
              {character.initiative >= 0
                ? `+${character.initiative}`
                : character.initiative}
            </PropLine>
          </div>

          <Divider />

          {/* Ability Scores */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-6 gap-1 text-center">
              {ABILITY_ABBR.map(({ key, label }) => {
                const score = character.stats[key];
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

          {/* Properties block */}
          <div className="space-y-1 px-6 py-4">
            {/* Saving Throws */}
            <PropLine label="Saving Throws">
              {Object.entries(character.saving_throws)
                .map(([k, v]) => {
                  const abbr = k.slice(0, 3).toUpperCase();
                  const sign = v >= 0 ? "+" : "";
                  const prof = proficientSavingThrows.has(k) ? " ●" : "";
                  return `${abbr} ${sign}${v}${prof}`;
                })
                .join(", ")}
            </PropLine>

            {/* Skills */}
            {character.skills.length > 0 && (
              <PropLine label="Skills">
                {character.skills
                  .filter((s) => s.proficient)
                  .map((s) => `${capitalize(s.skill)} +${s.bonus}`)
                  .join(", ") || "—"}
              </PropLine>
            )}

            {/* Passive Scores */}
            <PropLine label="Passive Perception">
              {character.passive_scores.passive_perception}
            </PropLine>
            <PropLine label="Passive Investigation">
              {character.passive_scores.passive_investigation}
            </PropLine>
            <PropLine label="Passive Insight">
              {character.passive_scores.passive_insight}
            </PropLine>

            {/* Senses */}
            <PropLine label="Senses">{sensesText}</PropLine>

            {/* Defenses */}
            {character.defenses?.length > 0 && (
              <PropLine label="Defenses">
                <BadgeList items={character.defenses} color="blue" />
              </PropLine>
            )}

            {/* Condition Immunities */}
            {character.condition_immunities?.length > 0 && (
              <PropLine label="Condition Immunities">
                <BadgeList items={character.condition_immunities} color="red" />
              </PropLine>
            )}

            {/* Challenge / Proficiency Bonus */}
            <div className="flex flex-wrap items-baseline gap-x-8 pt-0.5">
              <PropLine label="Level">{character.level}</PropLine>
              <PropLine label="Proficiency Bonus">
                +{character.proficiency_bonus}
              </PropLine>
            </div>
          </div>

          {/* Proficiencies */}
          {character.proficiencies && (
            <>
              <Divider />
              <div className="px-6 py-4">
                <h2 className="mb-3 text-xl font-semibold text-red-800 dark:text-red-400">
                  Proficiencies
                </h2>
                <div className="space-y-1">
                  {character.proficiencies.armor.length > 0 && (
                    <PropLine label="Armor">
                      <BadgeList
                        items={character.proficiencies.armor}
                        color="slate"
                      />
                    </PropLine>
                  )}
                  {character.proficiencies.weapons.length > 0 && (
                    <PropLine label="Weapons">
                      <BadgeList
                        items={character.proficiencies.weapons}
                        color="slate"
                      />
                    </PropLine>
                  )}
                  {character.proficiencies.tools.length > 0 && (
                    <PropLine label="Tools">
                      <BadgeList
                        items={character.proficiencies.tools}
                        color="slate"
                      />
                    </PropLine>
                  )}
                  {character.proficiencies.languages.length > 0 && (
                    <PropLine label="Languages">
                      <BadgeList
                        items={character.proficiencies.languages}
                        color="green"
                      />
                    </PropLine>
                  )}
                </div>
              </div>
            </>
          )}

          {/* All Skills */}
          {character.skills.length > 0 && (
            <>
              <Divider />
              <div className="px-6 py-4">
                <h2 className="mb-3 text-xl font-semibold text-red-800 dark:text-red-400">
                  Skills
                </h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 sm:grid-cols-3">
                  {character.skills.map((s) => (
                    <p
                      key={s.skill}
                      className="text-sm text-slate-800 dark:text-zinc-200"
                    >
                      {s.proficient && (
                        <span
                          className="mr-1 text-red-700 dark:text-red-400"
                          title="Proficient"
                        >
                          ●
                        </span>
                      )}
                      <span
                        className={
                          s.proficient
                            ? "font-semibold text-slate-900 dark:text-zinc-100"
                            : ""
                        }
                      >
                        {capitalize(s.skill)}
                      </span>{" "}
                      <span className="text-slate-500 dark:text-zinc-400">
                        {s.bonus >= 0 ? "+" : ""}
                        {s.bonus}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          {character.actions?.length > 0 && (
            <>
              <Divider />
              <div className="px-6 py-4 pb-6">
                <h2 className="mb-3 text-xl font-semibold text-red-800 dark:text-red-400">
                  Actions
                </h2>
                <ul className="space-y-2">
                  {character.actions.map((action) => (
                    <ActionEntry key={action.name} action={action} />
                  ))}
                </ul>
              </div>
            </>
          )}
        </Surface>

        {/* ── Radar Chart sidebar ── */}
        <Surface className="flex items-center justify-center p-6">
          <StatsRadarChart stats={character.stats} size={260} />
        </Surface>
      </div>
    </section>
  );
}
