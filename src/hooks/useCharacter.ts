import { useQuery } from "@tanstack/react-query";
import { getCharacterById } from "../api/client";

export function useCharacter(id: number) {
  return useQuery({
    queryKey: ["characters", id],
    queryFn: () => getCharacterById(id),
    enabled: Number.isFinite(id),
  });
}
