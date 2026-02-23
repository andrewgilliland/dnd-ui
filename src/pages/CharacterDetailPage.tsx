import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ApiError, getCharacterById } from "../api/client";
import { DetailPageHeader } from "../components/DetailPageHeader";
import { DetailSection } from "../components/DetailSection";
import { NotFoundState } from "../components/NotFoundState";
import { StatBlock } from "../components/StatBlock";
import { StatsRadarChart } from "../components/StatsRadarChart";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import type { Character } from "../types";

export function CharacterDetailPage() {
  const { id } = useParams();
  const characterId = Number(id);

  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    if (!Number.isFinite(characterId)) {
      setCharacter(null);
      setError(null);
      setIsLoading(false);

      return () => {
        abortController.abort();
      };
    }

    const loadCharacter = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getCharacterById(characterId, {
          signal: abortController.signal,
        });
        setCharacter(response);
      } catch (caughtError) {
        if (abortController.signal.aborted) {
          return;
        }

        setCharacter(null);

        if (caughtError instanceof Error) {
          setError(caughtError);
        } else {
          setError(new Error("Failed to load character."));
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadCharacter();

    return () => {
      abortController.abort();
    };
  }, [characterId]);

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
        <p className="text-slate-700 dark:text-slate-300">
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
        <p className="text-slate-700 dark:text-slate-300">{error.message}</p>
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

  return (
    <section className="space-y-6">
      <DetailPageHeader
        backTo={ROUTES.characters}
        backLabel="Back to characters"
        title={character.name}
        subtitle={`${character.race} · ${character.class} · ${character.alignment}`}
      />

      <DetailSection title="Description">
        <p className="text-slate-700 dark:text-slate-300">
          {character.description}
        </p>
      </DetailSection>

      <DetailSection title="Ability Scores">
        <div className="space-y-6">
          <StatBlock stats={character.stats} />
          <StatsRadarChart stats={character.stats} />
        </div>
      </DetailSection>
    </section>
  );
}
