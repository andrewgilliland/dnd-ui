import { useQuery } from "@tanstack/react-query";
import { getCharacters, type CharacterListParams } from "../api/client";

export function useCharacters(params: CharacterListParams = {}) {
  return useQuery({
    queryKey: ["characters", params],
    queryFn: () => getCharacters(params),
  });
}
