import { useEffect, useState } from "react";

export type ListViewMode = "cards" | "table";

const LIST_VIEW_STORAGE_KEY = "dnd-ui-list-view";

function isListViewMode(value: string | null): value is ListViewMode {
  return value === "cards" || value === "table";
}

function getInitialListViewMode(): ListViewMode {
  const storedListViewMode = localStorage.getItem(LIST_VIEW_STORAGE_KEY);

  if (isListViewMode(storedListViewMode)) {
    return storedListViewMode;
  }

  return "cards";
}

export function useListView() {
  const [listViewMode, setListViewMode] = useState<ListViewMode>(
    getInitialListViewMode,
  );

  useEffect(() => {
    localStorage.setItem(LIST_VIEW_STORAGE_KEY, listViewMode);
  }, [listViewMode]);

  return { listViewMode, setListViewMode };
}
