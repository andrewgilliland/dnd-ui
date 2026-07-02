import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

type TestRow = {
  id: number;
  name: string;
  role: string;
};

const rows: TestRow[] = [
  { id: 1, name: "Aria", role: "Wizard" },
  { id: 2, name: "Bren", role: "Fighter" },
];

const columns: DataTableColumn<TestRow>[] = [
  {
    key: "name",
    header: "Name",
    render: (row) => row.name,
  },
  {
    key: "role",
    header: "Role",
    render: (row) => row.role,
  },
];

function SelectionHarness() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowKey={(row) => row.id}
      rowSelection={{
        selectedRowKeys,
        onSelectedRowKeysChange: setSelectedRowKeys,
        getRowSelectionLabel: (row) => row.name,
      }}
    />
  );
}

describe("DataTable", () => {
  it("renders selection checkboxes when rowSelection is enabled", () => {
    render(<SelectionHarness />);

    expect(
      screen.getByRole("checkbox", { name: /select all visible rows/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("checkbox", { name: /select aria/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("checkbox", { name: /select bren/i }),
    ).toBeDefined();
  });

  it("selects and clears all visible rows from the header checkbox", () => {
    render(<SelectionHarness />);

    fireEvent.click(
      screen.getByRole("checkbox", { name: /select all visible rows/i }),
    );

    expect(
      (
        screen.getByRole("checkbox", {
          name: /select aria/i,
        }) as HTMLInputElement
      ).checked,
    ).toBe(true);
    expect(
      (
        screen.getByRole("checkbox", {
          name: /select bren/i,
        }) as HTMLInputElement
      ).checked,
    ).toBe(true);

    fireEvent.click(
      screen.getByRole("checkbox", { name: /select all visible rows/i }),
    );

    expect(
      (
        screen.getByRole("checkbox", {
          name: /select aria/i,
        }) as HTMLInputElement
      ).checked,
    ).toBe(false);
    expect(
      (
        screen.getByRole("checkbox", {
          name: /select bren/i,
        }) as HTMLInputElement
      ).checked,
    ).toBe(false);
  });

  it("toggles a single row checkbox", () => {
    render(<SelectionHarness />);

    fireEvent.click(screen.getByRole("checkbox", { name: /select aria/i }));

    expect(
      (
        screen.getByRole("checkbox", {
          name: /select aria/i,
        }) as HTMLInputElement
      ).checked,
    ).toBe(true);
    expect(
      (
        screen.getByRole("checkbox", {
          name: /select bren/i,
        }) as HTMLInputElement
      ).checked,
    ).toBe(false);
  });
});
