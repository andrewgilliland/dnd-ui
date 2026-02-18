import type { ReactNode } from "react";
import { Surface } from "./Surface";

export interface DataTableColumn<Row> {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<Row> {
  rows: Row[];
  columns: DataTableColumn<Row>[];
  getRowKey: (row: Row) => string | number;
  className?: string;
}

const headerCellBaseClassName =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400";

export function DataTable<Row>({
  rows,
  columns,
  getRowKey,
  className,
}: DataTableProps<Row>) {
  return (
    <Surface as="section" className={["overflow-x-auto", className].join(" ")}>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {columns.map((column) => (
              <th
                key={column.key}
                className={[
                  headerCellBaseClassName,
                  column.headerClassName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
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
