import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Surface } from "./Surface";

type SortDirection = "asc" | "desc";

export interface DataTableColumn<Row> {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: Row) => string | number;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<Row> {
  rows: Row[];
  columns: DataTableColumn<Row>[];
  getRowKey: (row: Row) => string | number;
  stickyHeader?: boolean;
  className?: string;
}

const headerCellBaseClassName =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400";

export function DataTable<Row>({
  rows,
  columns,
  getRowKey,
  stickyHeader = false,
  className,
}: DataTableProps<Row>) {
  const [sortState, setSortState] = useState<{
    key: string | null;
    direction: SortDirection;
  }>({
    key: null,
    direction: "asc",
  });

  const sortedRows = useMemo(() => {
    if (!sortState.key) {
      return rows;
    }

    const sortColumn = columns.find((column) => column.key === sortState.key);

    if (!sortColumn || !sortColumn.sortable) {
      return rows;
    }

    const getSortValue =
      sortColumn.sortValue ??
      ((row: Row) => {
        const renderedValue = sortColumn.render(row);
        return typeof renderedValue === "string" ||
          typeof renderedValue === "number"
          ? renderedValue
          : String(renderedValue);
      });

    return [...rows].sort((leftRow, rightRow) => {
      const leftValue = getSortValue(leftRow);
      const rightValue = getSortValue(rightRow);

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return sortState.direction === "asc"
          ? leftValue - rightValue
          : rightValue - leftValue;
      }

      return sortState.direction === "asc"
        ? String(leftValue).localeCompare(String(rightValue), undefined, {
            numeric: true,
            sensitivity: "base",
          })
        : String(rightValue).localeCompare(String(leftValue), undefined, {
            numeric: true,
            sensitivity: "base",
          });
    });
  }, [columns, rows, sortState.direction, sortState.key]);

  const toggleSort = (column: DataTableColumn<Row>) => {
    if (!column.sortable) {
      return;
    }

    setSortState((currentSortState) => {
      if (currentSortState.key === column.key) {
        return {
          key: currentSortState.key,
          direction: currentSortState.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key: column.key,
        direction: "asc",
      };
    });
  };

  return (
    <Surface as="section" className={["overflow-x-auto", className].join(" ")}>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {columns.map((column) => (
              <th
                key={column.key}
                aria-sort={
                  column.sortable && sortState.key === column.key
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
                      {sortState.key === column.key ? (
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
          {sortedRows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-slate-100 text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-300"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={[column.cellClassName].filter(Boolean).join(" ")}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Surface>
  );
}
