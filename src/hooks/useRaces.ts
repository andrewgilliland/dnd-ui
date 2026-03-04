import { useQuery } from "@tanstack/react-query";
import { getRaces } from "../api/client";

export function useRaces() {
  return useQuery({
    queryKey: ["races"],
    queryFn: () => getRaces(),
    staleTime: Infinity,
  });
}
