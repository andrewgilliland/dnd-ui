import { Surface } from "./Surface";

interface FilterOption {
  label: string;
  value: string;
}

interface SelectFilter {
  key: string;
  label: string;
  value: string;
  allLabel: string;
  options: FilterOption[];
}

interface ListFiltersProps {
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  selectFilters: SelectFilter[];
  onSelectChange: (key: string, value: string) => void;
}

export function ListFilters({
  searchValue,
  searchPlaceholder,
  onSearchChange,
  selectFilters,
  onSelectChange,
}: ListFiltersProps) {
  return (
    <Surface as="section" className="mt-6 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium text-slate-600 dark:text-slate-400">
            Search
          </span>
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        {selectFilters.map((filter) => (
          <label
            key={filter.key}
            className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300"
          >
            <span className="font-medium text-slate-600 dark:text-slate-400">
              {filter.label}
            </span>
            <select
              value={filter.value}
              onChange={(event) =>
                onSelectChange(filter.key, event.target.value)
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">{filter.allLabel}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </Surface>
  );
}
