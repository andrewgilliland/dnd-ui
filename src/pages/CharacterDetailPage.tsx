import { Link, useParams } from "react-router";
import { StatBlock } from "../components/StatBlock";
import charactersData from "../data/characters.json";
import type { Characters } from "../types";

const characters: Characters = charactersData as Characters;

export function CharacterDetailPage() {
  const { id } = useParams();
  const characterId = Number(id);
  const character = characters.find((entry) => entry.id === characterId);

  if (!character) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">
          Character not found
        </h2>
        <p className="mt-2 text-slate-600">No character exists for id: {id}</p>
        <Link
          to="/characters"
          className="mt-4 inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4"
        >
          Back to characters
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <Link
          to="/characters"
          className="text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4"
        >
          ← Back to characters
        </Link>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {character.name}
        </h2>
        <p className="mt-1 text-slate-600">
          {character.race} · {character.class} · {character.alignment}
        </p>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Description</h3>
        <p className="mt-2 text-slate-700">{character.description}</p>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Ability Scores</h3>
        <div className="mt-4">
          <StatBlock stats={character.stats} />
        </div>
      </article>
    </section>
  );
}
