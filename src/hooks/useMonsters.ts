import { useQuery } from "@tanstack/react-query";
import {
  getMonsters,
  getRandomMonster,
  type MonsterListParams,
  type RandomMonsterParams,
} from "../api/client";

export function useMonsters(params: MonsterListParams = {}) {
  return useQuery({
    queryKey: ["monsters", params],
    queryFn: () => getMonsters(params),
  });
}

export function useMonstersMetadata() {
  return useQuery({
    queryKey: ["monsters-metadata"],
    queryFn: () => getMonsters({ skip: 0, limit: 100 }),
    staleTime: Infinity,
  });
}

export function useRandomMonster(
  params: RandomMonsterParams,
  enabled: boolean,
  seed: number,
) {
  return useQuery({
    queryKey: ["random-monster", params, seed],
    queryFn: () => getRandomMonster(params),
    enabled,
  });
}
