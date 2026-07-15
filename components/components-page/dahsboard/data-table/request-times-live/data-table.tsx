"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import type { RequestTimesLiveRow } from "@/api/metrics/metrics.api";
import { requestTimesLiveColumns } from "./columns";

type Props = {
  rows: RequestTimesLiveRow[];
};

export function RequestTimesLiveDataTable({ rows }: Props) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const rowsByCreatedAt = React.useMemo(
    () => [...(rows ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || b.id.localeCompare(a.id)),
    [rows]
  );

  const table = useReactTable({
    data: rowsByCreatedAt,
    columns: requestTimesLiveColumns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle className="text-sm uppercase">Análisis en tiempo real por solicitud y estado</CardTitle>
                <p className="text-xs pt-1 text-gray-500">Sin Asignar - Asignadas - En Progreso</p>            
            </div>
            
            <Input
                className="sm:max-w-[280px]"
                placeholder="Buscar por nombre…"
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
            />
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="text-left">
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-3 py-2 font-semibold">
                      {header.isPlaceholder ? null : (
                        <div>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}

              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={requestTimesLiveColumns.length}>
                    No hay datos para mostrar.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
                Mostrando{" "}
                <b>
                    {table.getRowModel().rows.length} de {rows?.length ?? 0}
                </b>
            </div>

            <div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
          
        </div>
      </CardContent>
    </Card>
  );
}
