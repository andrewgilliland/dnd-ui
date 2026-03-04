import { useQuery } from "@tanstack/react-query";
import { getItemById } from "../api/client";

export function useItem(id: number) {
  return useQuery({
    queryKey: ["items", id],
    queryFn: () => getItemById(id),
    enabled: Number.isFinite(id),
  });
}
