import { useCallback } from "react";
import { useSearchParams } from "react-router";

export function useQueryParamUpdater() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const nextParams = new URLSearchParams(searchParams);

      if (value.length === 0) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }

      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams],
  );

  return { searchParams, updateParam };
}