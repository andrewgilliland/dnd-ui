import { useQuery } from "@tanstack/react-query";
import { getItems, type ItemListParams } from "../api/client";

export function useItems(params: ItemListParams = {}) {
  return useQuery({
    queryKey: ["items", params],
    queryFn: () => getItems(params),
  });
}

export function useItemsMetadata() {
  return useQuery({
    queryKey: ["items-metadata"],
    queryFn: () => getItems({ skip: 0, limit: 500 }),
    staleTime: Infinity,
  });
}
