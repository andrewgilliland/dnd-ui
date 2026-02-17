import { useParams } from "react-router";
import { BackLink } from "../components/BackLink";
import { NotFoundState } from "../components/NotFoundState";
import { StatBlock } from "../components/StatBlock";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { characters } from "../data/characters";
import type { Characters } from "../types";

const characterList: Characters = characters;

export function CharacterDetailPage() {
  const { id } = useParams();
  const characterId = Number(id);
  const character = characterList.find((entry) => entry.id === characterId);

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

  return (
    <section className="space-y-6">
      <div>
        <BackLink to={ROUTES.characters}>← Back to characters</BackLink>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {character.name}
        </h2>
        <p className="mt-1 text-slate-600">
          {character.race} · {character.class} · {character.alignment}
        </p>
      </div>

      <Surface className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">Description</h3>
        <p className="mt-2 text-slate-700">{character.description}</p>
      </Surface>

      <Surface className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">Ability Scores</h3>
        <div className="mt-4">
          <StatBlock stats={character.stats} />
        </div>
      </Surface>
    </section>
  );
}
