import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  useDataTableSort,
  type DataTableSortState,
} from "../hooks/useDataTableSort";
import { Surface } from "./Surface";

interface DataTableBaseColumn<Row> {
  key: string;
  header: ReactNode;
  render: (row: Row) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableSortableColumn<Row> extends DataTableBaseColumn<Row> {
  sortable: true;
  sortValue: (row: Row) => string | number;
}

interface DataTableStaticColumn<Row> extends DataTableBaseColumn<Row> {
  sortable?: false;
  sortValue?: never;
}

export type DataTableColumn<Row> =
  | DataTableSortableColumn<Row>
  | DataTableStaticColumn<Row>;

interface DataTableProps<Row> {
  rows: Row[];
  columns: DataTableColumn<Row>[];
  getRowKey: (row: Row) => string | number;
  sort?: DataTableSortState | null;
  defaultSort?: DataTableSortState | null;
  onSortChange?: (nextSort: DataTableSortState | null) => void;
  stickyHeader?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

const headerCellBaseClassName =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400";

const cx = (...classNames: Array<string | undefined | null | false>) =>
  classNames.filter(Boolean).join(" ");

export function DataTable<Row>({
  rows,
  columns,
  getRowKey,
  sort,
  defaultSort,
  onSortChange,
  stickyHeader = false,
  emptyState,
  className,
}: DataTableProps<Row>) {
  const { sortState, sortedRows, toggleSort } = useDataTableSort({
    rows,
    columns,
    sort,
    defaultSort,
    onSortChange,
  });

  return (
    <Surface as="section" className={cx("overflow-x-auto", className)}>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {columns.map((column) => (
              <th
                key={column.key}
                aria-sort={
                  column.sortable && sortState?.key === column.key
                    ? sortState.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                className={[
                  headerCellBaseClassName,
                  stickyHeader
                    ? "sticky top-0 z-10 bg-white dark:bg-slate-900"
                    : "",
                  column.headerClassName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column)}
                    className="inline-flex items-center gap-1 text-left hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    <span>{column.header}</span>
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center"
                    >
                      {sortState?.key === column.key ? (
                        sortState.direction === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </span>
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                {emptyState ?? "No results found."}
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-b border-slate-100 text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-300"
              >
                {columns.map((column) => (
                  <td key={column.key} className={cx(column.cellClassName)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Surface>
  );
}
