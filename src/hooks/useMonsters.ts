import { useQuery } from "@tanstack/react-query";
import { getMonsters, type MonsterListParams } from "../api/client";

export function useMonsters(params: MonsterListParams = {}) {
  return useQuery({
    queryKey: ["monsters", params],
    queryFn: () => getMonsters(params),
  });
}

export function useMonstersMetadata() {
  return useQuery({
    queryKey: ["monsters-metadata"],
    queryFn: () => getMonsters({ skip: 0, limit: 500 }),
    staleTime: Infinity,
  });
}
