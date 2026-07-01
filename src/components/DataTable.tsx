import { useEffect, useMemo, useRef, type ReactNode } from "react";
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

export interface DataTableRowSelection<Row, Key extends string | number> {
  selectedRowKeys: Key[];
  onSelectedRowKeysChange: (nextSelectedRowKeys: Key[]) => void;
  getRowSelectionLabel?: (row: Row) => string;
  selectAllLabel?: string;
}

interface DataTableProps<Row, Key extends string | number = string | number> {
  rows: Row[];
  columns: DataTableColumn<Row>[];
  getRowKey: (row: Row) => Key;
  sort?: DataTableSortState | null;
  defaultSort?: DataTableSortState | null;
  onSortChange?: (nextSort: DataTableSortState | null) => void;
  stickyHeader?: boolean;
  emptyState?: ReactNode;
  className?: string;
  rowSelection?: DataTableRowSelection<Row, Key>;
}

const headerCellBaseClassName =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400";

const selectionColumnKey = "__row-selection__";

const cx = (...classNames: Array<string | undefined | null | false>) =>
  classNames.filter(Boolean).join(" ");

export function DataTable<Row, Key extends string | number = string | number>({
  rows,
  columns,
  getRowKey,
  sort,
  defaultSort,
  onSortChange,
  stickyHeader = false,
  emptyState,
  className,
  rowSelection,
}: DataTableProps<Row, Key>) {
  const { sortState, sortedRows, toggleSort } = useDataTableSort({
    rows,
    columns,
    sort,
    defaultSort,
    onSortChange,
  });

  const selectAllCheckboxRef = useRef<HTMLInputElement | null>(null);
  const selectedRowKeySet = useMemo(
    () => new Set(rowSelection?.selectedRowKeys ?? []),
    [rowSelection?.selectedRowKeys],
  );
  const visibleRowKeys = useMemo(
    () => sortedRows.map((row) => getRowKey(row)),
    [getRowKey, sortedRows],
  );
  const allVisibleRowsSelected =
    visibleRowKeys.length > 0 &&
    visibleRowKeys.every((rowKey) => selectedRowKeySet.has(rowKey));
  const someVisibleRowsSelected =
    visibleRowKeys.length > 0 &&
    visibleRowKeys.some((rowKey) => selectedRowKeySet.has(rowKey));

  useEffect(() => {
    if (!rowSelection || !selectAllCheckboxRef.current) {
      return;
    }

    selectAllCheckboxRef.current.indeterminate =
      someVisibleRowsSelected && !allVisibleRowsSelected;
  }, [allVisibleRowsSelected, rowSelection, someVisibleRowsSelected]);

  const selectionColumn: DataTableStaticColumn<Row> | null = rowSelection
    ? {
        key: selectionColumnKey,
        sortable: false,
        header: (
          <div className="flex justify-center">
            <input
              ref={selectAllCheckboxRef}
              aria-label={
                rowSelection.selectAllLabel ?? "Select all visible rows"
              }
              type="checkbox"
              checked={allVisibleRowsSelected}
              onChange={() => {
                const nextSelectedRowKeys = allVisibleRowsSelected
                  ? rowSelection.selectedRowKeys.filter(
                      (selectedRowKey) =>
                        !visibleRowKeys.includes(selectedRowKey),
                    )
                  : Array.from(
                      new Set([
                        ...rowSelection.selectedRowKeys,
                        ...visibleRowKeys,
                      ]),
                    );

                rowSelection.onSelectedRowKeysChange(nextSelectedRowKeys);
              }}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        ),
        headerClassName: "w-12 px-0 text-center",
        cellClassName: "w-12 px-0 text-center",
        render: (row: Row) => {
          const rowKey = getRowKey(row);
          const isSelected = selectedRowKeySet.has(rowKey);
          const rowSelectionLabel = rowSelection.getRowSelectionLabel?.(row);

          return (
            <div className="flex justify-center">
              <input
                aria-label={
                  rowSelectionLabel
                    ? `Select ${rowSelectionLabel}`
                    : `Select row ${String(rowKey)}`
                }
                type="checkbox"
                checked={isSelected}
                onChange={() => {
                  const nextSelectedRowKeys = isSelected
                    ? rowSelection.selectedRowKeys.filter(
                        (selectedRowKey) => selectedRowKey !== rowKey,
                      )
                    : [...rowSelection.selectedRowKeys, rowKey];

                  rowSelection.onSelectedRowKeysChange(nextSelectedRowKeys);
                }}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          );
        },
      }
    : null;

  const renderedColumns: DataTableColumn<Row>[] = selectionColumn
    ? [selectionColumn, ...columns]
    : columns;

  return (
    <Surface as="section" className={cx("overflow-x-auto", className)}>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            {renderedColumns.map((column) => (
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
                    ? "sticky top-0 z-10 bg-white dark:bg-zinc-900"
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
                    className="inline-flex items-center gap-1 text-left hover:text-zinc-900 dark:hover:text-zinc-200"
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
                colSpan={renderedColumns.length}
                className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400"
              >
                {emptyState ?? "No results found."}
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-b border-zinc-100 text-zinc-700 last:border-b-0 dark:border-zinc-800 dark:text-zinc-300"
              >
                {renderedColumns.map((column) => (
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
