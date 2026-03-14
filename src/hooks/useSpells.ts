import { useQuery } from "@tanstack/react-query";
import { getSpells, type SpellListParams } from "../api/client";

export function useSpells(params: SpellListParams = {}) {
  return useQuery({
    queryKey: ["spells", params],
    queryFn: () => getSpells(params),
  });
}

export function useSpellsMetadata() {
  return useQuery({
    queryKey: ["spells-metadata"],
    queryFn: () => getSpells({ skip: 0, limit: 100 }),
    staleTime: Infinity,
  });
}
