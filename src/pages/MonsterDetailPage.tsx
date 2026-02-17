import { useParams } from "react-router";
import { BackLink } from "../components/BackLink";
import { NotFoundState } from "../components/NotFoundState";
import { StatBlock } from "../components/StatBlock";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { monsters } from "../data/monsters";
import type { Monsters } from "../types";

const monsterList: Monsters = monsters;

type MonsterEntry = Monsters[number];

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
  const monster = monsterList.find((entry) => entry.id === monsterId);

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
      <div>
        <BackLink to={ROUTES.monsters}>← Back to monsters</BackLink>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {monster.name}
        </h2>
        <p className="mt-1 text-slate-600">
          {monster.size} {monster.type} · {monster.alignment}
        </p>
      </div>

      <Surface className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">Core Stats</h3>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="font-medium text-slate-500">Armor Class</dt>
            <dd>{monster.armor_class}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Hit Points</dt>
            <dd>
              {monster.hit_points} ({monster.hit_dice})
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Speed</dt>
            <dd>{formatSpeed(monster.speed)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Saving Throws</dt>
            <dd>{formatMap(monster.saving_throws)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Skills</dt>
            <dd>{formatMap(monster.skills)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Senses</dt>
            <dd>
              {Object.entries(monster.senses)
                .map(([key, value]) => `${key} ${value}`)
                .join(", ")}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Languages</dt>
            <dd>
              {monster.languages.length > 0
                ? monster.languages.join(", ")
                : "None"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Challenge Rating</dt>
            <dd>{monster.challenge_rating}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">XP</dt>
            <dd>{monster.experience_points}</dd>
          </div>
        </dl>
      </Surface>

      <Surface className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">Ability Scores</h3>
        <div className="mt-4">
          <StatBlock stats={monster.stats} />
        </div>
      </Surface>

      <Surface className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Special Abilities
        </h3>
        <ul className="mt-3 space-y-3 text-slate-700">
          {monster.special_abilities.map((ability) => (
            <li key={ability.name}>
              <p className="font-medium text-slate-900">{ability.name}</p>
              <p className="text-sm">{ability.description}</p>
            </li>
          ))}
        </ul>
      </Surface>

      <Surface className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">Actions</h3>
        <ul className="mt-3 space-y-3 text-slate-700">
          {monster.actions.map((action) => (
            <li key={action.name}>
              <p className="font-medium text-slate-900">{action.name}</p>
              <p className="text-sm">{action.description}</p>
              {(action.damage_dice ||
                action.damage_type ||
                typeof action.attack_bonus === "number") && (
                <p className="mt-1 text-sm text-slate-600">
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
      </Surface>
    </section>
  );
}
