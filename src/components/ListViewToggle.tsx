import { LayoutGrid, Table2 } from "lucide-react";
import type { ListViewMode } from "../hooks/useListView";

const LIST_VIEW_OPTIONS = [
  { value: "cards", label: "Cards", Icon: LayoutGrid },
  { value: "table", label: "Table", Icon: Table2 },
] as const;

interface ListViewToggleProps {
  listViewMode: ListViewMode;
  onListViewModeChange: (value: ListViewMode) => void;
}

export function ListViewToggle({
  listViewMode,
  onListViewModeChange,
}: ListViewToggleProps) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
      <span>View</span>
      <div
        role="radiogroup"
        aria-label="List view mode"
        className="inline-flex rounded-md border border-zinc-300 bg-white p-1 dark:border-zinc-600 dark:bg-zinc-800"
      >
        {LIST_VIEW_OPTIONS.map((option) => {
          const isActive = listViewMode === option.value;
          const Icon = option.Icon;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onListViewModeChange(option.value)}
              className={[
                "inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700",
              ].join(" ")}
            >
              <Icon aria-hidden="true" className="h-3.5 w-3.5" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
