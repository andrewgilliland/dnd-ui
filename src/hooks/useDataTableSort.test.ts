import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDataTableSort } from "./useDataTableSort";
import type { DataTableSortState } from "./useDataTableSort";

type Row = { name: string; cr: number };

const columns = [
  {
    key: "name",
    sortable: true,
    sortValue: (row: Row) => row.name,
  },
  {
    key: "cr",
    sortable: true,
    sortValue: (row: Row) => row.cr,
  },
  {
    key: "type",
    sortable: false,
  },
];

const rows: Row[] = [
  { name: "Zombie", cr: 0.25 },
  { name: "Aboleth", cr: 10 },
  { name: "Dragon", cr: 5 },
];

// ── Uncontrolled mode ─────────────────────────────────────────────────────────

describe("uncontrolled mode", () => {
  it("starts with no sort applied — rows returned in original order", () => {
    const { result } = renderHook(() => useDataTableSort({ rows, columns }));

    expect(result.current.sortState).toBeNull();
    expect(result.current.sortedRows).toEqual(rows);
  });

  it("sorts ascending on first toggleSort call", () => {
    const { result } = renderHook(() => useDataTableSort({ rows, columns }));

    act(() => result.current.toggleSort(columns[1])); // cr asc

    expect(result.current.sortState).toEqual({ key: "cr", direction: "asc" });
    expect(result.current.sortedRows.map((r) => r.cr)).toEqual([0.25, 5, 10]);
  });

  it("toggles from asc to desc on second toggleSort call for same column", () => {
    const { result } = renderHook(() => useDataTableSort({ rows, columns }));

    act(() => result.current.toggleSort(columns[1])); // cr asc
    act(() => result.current.toggleSort(columns[1])); // cr desc

    expect(result.current.sortState).toEqual({ key: "cr", direction: "desc" });
    expect(result.current.sortedRows.map((r) => r.cr)).toEqual([10, 5, 0.25]);
  });

  it("resets to asc when switching to a different column", () => {
    const { result } = renderHook(() => useDataTableSort({ rows, columns }));

    act(() => result.current.toggleSort(columns[1])); // cr asc
    act(() => result.current.toggleSort(columns[0])); // name asc

    expect(result.current.sortState).toEqual({ key: "name", direction: "asc" });
  });

  it("respects defaultSort initial state", () => {
    const defaultSort: DataTableSortState = { key: "cr", direction: "desc" };
    const { result } = renderHook(() =>
      useDataTableSort({ rows, columns, defaultSort }),
    );

    expect(result.current.sortState).toEqual(defaultSort);
    expect(result.current.sortedRows.map((r) => r.cr)).toEqual([10, 5, 0.25]);
  });
});

// ── Sorting correctness ───────────────────────────────────────────────────────

describe("numeric sort", () => {
  it("sorts numbers ascending", () => {
    const { result } = renderHook(() => useDataTableSort({ rows, columns }));

    act(() => result.current.toggleSort(columns[1]));

    expect(result.current.sortedRows.map((r) => r.cr)).toEqual([0.25, 5, 10]);
  });

  it("sorts numbers descending", () => {
    const { result } = renderHook(() =>
      useDataTableSort({
        rows,
        columns,
        defaultSort: { key: "cr", direction: "desc" },
      }),
    );

    expect(result.current.sortedRows.map((r) => r.cr)).toEqual([10, 5, 0.25]);
  });
});

describe("string sort", () => {
  it("sorts strings alphabetically ascending", () => {
    const { result } = renderHook(() => useDataTableSort({ rows, columns }));

    act(() => result.current.toggleSort(columns[0]));

    expect(result.current.sortedRows.map((r) => r.name)).toEqual([
      "Aboleth",
      "Dragon",
      "Zombie",
    ]);
  });

  it("sorts strings alphabetically descending", () => {
    const { result } = renderHook(() =>
      useDataTableSort({
        rows,
        columns,
        defaultSort: { key: "name", direction: "desc" },
      }),
    );

    expect(result.current.sortedRows.map((r) => r.name)).toEqual([
      "Zombie",
      "Dragon",
      "Aboleth",
    ]);
  });
});

// ── Non-sortable columns ──────────────────────────────────────────────────────

describe("non-sortable columns", () => {
  it("does nothing when toggling a non-sortable column", () => {
    const { result } = renderHook(() => useDataTableSort({ rows, columns }));

    act(() => result.current.toggleSort(columns[2])); // type, sortable: false

    expect(result.current.sortState).toBeNull();
    expect(result.current.sortedRows).toEqual(rows);
  });

  it("returns rows unsorted when active sort key has no sortValue", () => {
    const colsNoSortValue = [{ key: "name", sortable: true }];
    const { result } = renderHook(() =>
      useDataTableSort({
        rows,
        columns: colsNoSortValue,
        defaultSort: { key: "name", direction: "asc" },
      }),
    );

    expect(result.current.sortedRows).toEqual(rows);
  });
});

// ── Controlled mode ───────────────────────────────────────────────────────────

describe("controlled mode", () => {
  it("uses the external sort prop instead of internal state", () => {
    const externalSort: DataTableSortState = { key: "cr", direction: "asc" };
    const { result } = renderHook(() =>
      useDataTableSort({ rows, columns, sort: externalSort }),
    );

    expect(result.current.sortState).toEqual(externalSort);
    expect(result.current.sortedRows.map((r) => r.cr)).toEqual([0.25, 5, 10]);
  });

  it("calls onSortChange with next sort when toggleSort is called", () => {
    const onSortChange = vi.fn();
    const externalSort: DataTableSortState = { key: "cr", direction: "asc" };
    const { result } = renderHook(() =>
      useDataTableSort({ rows, columns, sort: externalSort, onSortChange }),
    );

    act(() => result.current.toggleSort(columns[1])); // same col → should go desc

    expect(onSortChange).toHaveBeenCalledOnce();
    expect(onSortChange).toHaveBeenCalledWith({ key: "cr", direction: "desc" });
  });

  it("does not update internal state in controlled mode", () => {
    const onSortChange = vi.fn();
    const externalSort: DataTableSortState = { key: "cr", direction: "asc" };
    const { result } = renderHook(() =>
      useDataTableSort({ rows, columns, sort: externalSort, onSortChange }),
    );

    act(() => result.current.toggleSort(columns[0])); // switch to name

    // sortState still reflects the controlled prop, not internal state
    expect(result.current.sortState).toEqual(externalSort);
  });
});

// ── Does not mutate original rows ─────────────────────────────────────────────

describe("immutability", () => {
  it("does not mutate the original rows array", () => {
    const originalRows = [...rows];
    const { result } = renderHook(() => useDataTableSort({ rows, columns }));

    act(() => result.current.toggleSort(columns[1]));

    expect(rows).toEqual(originalRows);
  });
});
