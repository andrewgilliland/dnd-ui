import { Link } from "react-router";
import charactersData from "../data/characters.json";
import type { Character, Characters } from "../types";

const characters: Characters = charactersData as Characters;

function CharacterCard({ character }: { character: Character }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {character.name}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {character.race} · {character.class} · {character.alignment}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          #{character.id}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-700">{character.description}</p>
      <Link
        to={`/characters/${character.id}`}
        className="mt-4 inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
      >
        View details
      </Link>
    </article>
  );
}

export function CharactersPage() {
  return (
    <section>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        Characters
      </h2>
      <p className="mt-2 text-slate-600">
        {characters.length} heroes and villains.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </section>
  );
}
