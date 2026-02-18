import { useEffect, useMemo, useState } from "react";
import { getMonsters } from "../api/client";
import { CardDensityToggle } from "../components/CardDensityToggle";
import { ListFilters } from "../components/ListFilters";
import { ListCardSkeleton } from "../components/ListCardSkeleton";
import { MonsterCard } from "../components/MonsterCard";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { useCardDensity } from "../hooks/useCardDensity";
import { useQueryParamUpdater } from "../hooks/useQueryParamUpdater";
import type { Monster } from "../types";
import {
  toFilterOptions,
  uniqueSortedNumbers,
  uniqueSortedStrings,
} from "../utils/filterOptions";

export function MonstersPage() {
  const { searchParams, updateParam } = useQueryParamUpdater();
  const { cardDensity, setCardDensity } = useCardDensity();
  const query = searchParams.get("q") ?? "";
  const selectedType = searchParams.get("type") ?? "";
  const selectedCr = searchParams.get("cr") ?? "";

  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [total, setTotal] = useState(0);
  const [typeValues, setTypeValues] = useState<string[]>([]);
  const [crValues, setCrValues] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const loadMonsterMetadata = async () => {
      try {
        const response = await getMonsters(
          { skip: 0, limit: 100 },
          { signal: abortController.signal },
        );

        setTypeValues(
          uniqueSortedStrings(response.monsters.map((entry) => entry.type)),
        );
        setCrValues(
          uniqueSortedNumbers(
            response.monsters.map((entry) => entry.challenge_rating),
          ),
        );
      } catch {
        // Leave metadata empty and derive from list data as fallback.
      }
    };

    void loadMonsterMetadata();

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const loadMonsters = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const crValue = selectedCr.length > 0 ? Number(selectedCr) : undefined;

      try {
        const response = await getMonsters(
          {
            skip: 0,
            limit: 100,
            type: selectedType || undefined,
            name: query.trim() || undefined,
            min_cr: crValue,
            max_cr: crValue,
          },
          { signal: abortController.signal },
        );

        setMonsters(response.monsters);
        setTotal(response.total);

        if (typeValues.length === 0) {
          setTypeValues(
            uniqueSortedStrings(response.monsters.map((entry) => entry.type)),
          );
        }

        if (crValues.length === 0) {
          setCrValues(
            uniqueSortedNumbers(
              response.monsters.map((entry) => entry.challenge_rating),
            ),
          );
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load monsters.";
        setErrorMessage(message);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadMonsters();

    return () => {
      abortController.abort();
    };
  }, [query, selectedType, selectedCr, typeValues.length, crValues.length]);

  const typeOptions = useMemo(() => toFilterOptions(typeValues), [typeValues]);
  const crOptions = useMemo(() => toFilterOptions(crValues), [crValues]);

  return (
    <section>
      <PageHeader
        title="Monsters"
        subtitle={
          isLoading
            ? "Loading monsters..."
            : `${monsters.length} of ${total} creatures in the bestiary.`
        }
      />

      <div className="mt-4 flex justify-end">
        <CardDensityToggle
          cardDensity={cardDensity}
          onCardDensityChange={setCardDensity}
        />
      </div>

      <ListFilters
        searchValue={query}
        searchPlaceholder="Name, type, alignment..."
        onSearchChange={(value) => updateParam("q", value)}
        selectFilters={[
          {
            key: "type",
            label: "Type",
            value: selectedType,
            allLabel: "All types",
            options: typeOptions,
          },
          {
            key: "cr",
            label: "Challenge Rating",
            value: selectedCr,
            allLabel: "All CRs",
            options: crOptions,
          },
        ]}
        onSelectChange={updateParam}
      />

      {errorMessage ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-slate-700 dark:text-slate-300">{errorMessage}</p>
        </Surface>
      ) : null}

      {isLoading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <ListCardSkeleton key={index} cardDensity={cardDensity} />
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {monsters.map((monster) => (
          <MonsterCard
            key={monster.id}
            monster={monster}
            cardDensity={cardDensity}
          />
        ))}
      </div>

      {!isLoading && !errorMessage && monsters.length === 0 ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-slate-700 dark:text-slate-300">
            No monsters match your current filters.
          </p>
        </Surface>
      ) : null}
    </section>
  );
}
