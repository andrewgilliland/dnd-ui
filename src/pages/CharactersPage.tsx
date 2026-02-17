import { Link } from "react-router";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { characters } from "../data/characters";
import type { Character, Characters } from "../types";

const characterList: Characters = characters;

function CharacterCard({ character }: { character: Character }) {
  return (
    <Surface className="p-5">
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
        to={ROUTES.characterDetail(character.id)}
        className="mt-4 inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
      >
        View details
      </Link>
    </Surface>
  );
}

export function CharactersPage() {
  return (
    <section>
      <PageHeader
        title="Characters"
        subtitle={`${characterList.length} heroes and villains.`}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {characterList.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </section>
  );
}
