import { useParams } from "react-router";
import { DetailPageHeader } from "../components/DetailPageHeader";
import { DetailSection } from "../components/DetailSection";
import { NotFoundState } from "../components/NotFoundState";
import { StatBlock } from "../components/StatBlock";
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
      <DetailPageHeader
        backTo={ROUTES.characters}
        backLabel="← Back to characters"
        title={character.name}
        subtitle={`${character.race} · ${character.class} · ${character.alignment}`}
      />

      <DetailSection title="Description">
        <p className="text-slate-700">{character.description}</p>
      </DetailSection>

      <DetailSection title="Ability Scores">
        <StatBlock stats={character.stats} />
      </DetailSection>
    </section>
  );
}
