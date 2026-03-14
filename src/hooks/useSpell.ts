import { useQuery } from "@tanstack/react-query";
import { getSpellById } from "../api/client";

export function useSpell(id: number) {
  return useQuery({
    queryKey: ["spells", id],
    queryFn: () => getSpellById(id),
    enabled: Number.isFinite(id),
  });
}
