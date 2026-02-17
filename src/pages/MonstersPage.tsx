import { Link } from "react-router";
import monstersData from "../data/monsters.json";
import type { Monster, Monsters } from "../types";

const monsters: Monsters = monstersData as unknown as Monsters;

function MonsterCard({ monster }: { monster: Monster }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {monster.name}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {monster.size} {monster.type} · {monster.alignment}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          CR {monster.challenge_rating}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700">
        <div>
          <dt className="font-medium text-slate-500">AC</dt>
          <dd>{monster.armor_class}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">HP</dt>
          <dd>{monster.hit_points}</dd>
        </div>
      </dl>

      <Link
        to={`/monsters/${monster.id}`}
        className="mt-4 inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
      >
        View details
      </Link>
    </article>
  );
}

export function MonstersPage() {
  return (
    <section>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        Monsters
      </h2>
      <p className="mt-2 text-slate-600">
        {monsters.length} creatures in the bestiary.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {monsters.map((monster) => (
          <MonsterCard key={monster.id} monster={monster} />
        ))}
      </div>
    </section>
  );
}
