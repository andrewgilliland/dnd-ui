import { useMemo } from "react";
import { ListFilters } from "../components/ListFilters";
import { MonsterCard } from "../components/MonsterCard";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { monsters } from "../data/monsters";
import { useQueryParamUpdater } from "../hooks/useQueryParamUpdater";
import type { Monsters } from "../types";
import {
  toFilterOptions,
  uniqueSortedNumbers,
  uniqueSortedStrings,
} from "../utils/filterOptions";
import {
  matchesQuery,
  matchesSelectedValue,
  normalizeQuery,
} from "../utils/filterPredicates";

const monsterList: Monsters = monsters;
export function MonstersPage() {
  const { searchParams, updateParam } = useQueryParamUpdater();
  const query = searchParams.get("q") ?? "";
  const selectedType = searchParams.get("type") ?? "";
  const selectedCr = searchParams.get("cr") ?? "";

  const typeOptions = useMemo(
    () =>
      toFilterOptions(
        uniqueSortedStrings(monsterList.map((entry) => entry.type)),
      ),
    [],
  );
  const crOptions = useMemo(
    () =>
      toFilterOptions(
        uniqueSortedNumbers(monsterList.map((entry) => entry.challenge_rating)),
      ),
    [],
  );

  const normalizedQuery = useMemo(() => normalizeQuery(query), [query]);
  const filteredMonsters = useMemo(
    () =>
      monsterList.filter((monster) => {
        const isQueryMatch = matchesQuery(normalizedQuery, [
          monster.name,
          monster.type,
          monster.alignment,
        ]);
        const isTypeMatch = matchesSelectedValue(selectedType, monster.type);
        const isCrMatch =
          selectedCr.length === 0 ||
          String(monster.challenge_rating) === selectedCr;

        return isQueryMatch && isTypeMatch && isCrMatch;
      }),
    [normalizedQuery, selectedType, selectedCr],
  );

  return (
    <section>
      <PageHeader
        title="Monsters"
        subtitle={`${filteredMonsters.length} of ${monsterList.length} creatures in the bestiary.`}
      />

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

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filteredMonsters.map((monster) => (
          <MonsterCard key={monster.id} monster={monster} />
        ))}
      </div>

      {filteredMonsters.length === 0 ? (
        <Surface as="section" className="mt-6 p-6 text-center">
          <p className="text-slate-700 dark:text-slate-300">
            No monsters match your current filters.
          </p>
        </Surface>
      ) : null}
    </section>
  );
}
