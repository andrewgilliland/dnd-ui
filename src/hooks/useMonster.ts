import { useQuery } from "@tanstack/react-query";
import { getMonsterById } from "../api/client";

export function useMonster(id: number) {
  return useQuery({
    queryKey: ["monsters", id],
    queryFn: () => getMonsterById(id),
    enabled: Number.isFinite(id),
  });
}
