import { useQuery } from "@tanstack/react-query";
import { getClasses } from "../api/client";

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: () => getClasses(),
    staleTime: Infinity,
  });
}
