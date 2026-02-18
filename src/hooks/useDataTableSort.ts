import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export interface DataTableSortState {
  key: string;
  direction: SortDirection;
}

interface SortableColumnLike<Row> {
  key: string;
  sortable?: boolean;
  sortValue?: (row: Row) => string | number;
}

interface UseDataTableSortOptions<Row, Column extends SortableColumnLike<Row>> {
  rows: Row[];
  columns: Column[];
  sort?: DataTableSortState | null;
  defaultSort?: DataTableSortState | null;
  onSortChange?: (nextSort: DataTableSortState | null) => void;
}

export function useDataTableSort<
  Row,
  Column extends SortableColumnLike<Row>,
>({
  rows,
  columns,
  sort,
  defaultSort,
  onSortChange,
}: UseDataTableSortOptions<Row, Column>) {
  const isControlled = sort !== undefined;
  const [uncontrolledSort, setUncontrolledSort] =
    useState<DataTableSortState | null>(defaultSort ?? null);

  const activeSort = isControlled ? (sort ?? null) : uncontrolledSort;

  const sortedRows = useMemo(() => {
    if (!activeSort) {
      return rows;
    }

    const sortColumn = columns.find((column) => column.key === activeSort.key);

    if (!sortColumn || !sortColumn.sortable || !sortColumn.sortValue) {
      return rows;
    }

    return [...rows].sort((leftRow, rightRow) => {
      const leftValue = sortColumn.sortValue!(leftRow);
      const rightValue = sortColumn.sortValue!(rightRow);

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return activeSort.direction === "asc"
          ? leftValue - rightValue
          : rightValue - leftValue;
      }

      return activeSort.direction === "asc"
        ? String(leftValue).localeCompare(String(rightValue), undefined, {
            numeric: true,
            sensitivity: "base",
          })
        : String(rightValue).localeCompare(String(leftValue), undefined, {
            numeric: true,
            sensitivity: "base",
          });
    });
  }, [activeSort, columns, rows]);

  const setSort = (nextSort: DataTableSortState | null) => {
    if (!isControlled) {
      setUncontrolledSort(nextSort);
    }

    onSortChange?.(nextSort);
  };

  const toggleSort = (column: Column) => {
    if (!column.sortable) {
      return;
    }

    if (activeSort?.key === column.key) {
      setSort({
        key: activeSort.key,
        direction: activeSort.direction === "asc" ? "desc" : "asc",
      });
      return;
    }

    setSort({
      key: column.key,
      direction: "asc",
    });
  };

  return {
    sortState: activeSort,
    sortedRows,
    toggleSort,
  };
}