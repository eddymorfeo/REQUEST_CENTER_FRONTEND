"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Columns2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey?: string;
  filterPlaceholder?: string;
  onRowClick?: (row: TData) => void;
};

function getRangeLabel(pageIndex: number, pageSize: number, total: number) {
  if (total === 0) return "0 de 0";
  const start = pageIndex * pageSize + 1;
  const end = Math.min(start + pageSize - 1, total);
  return `${end - start + 1} de ${total}`;
}

function hasColumnId<TData, TValue>(columns: ColumnDef<TData, TValue>[], id: string): boolean {
  return columns.some((col: any) => col?.id === id || col?.accessorKey === id);
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey = "assignee",
  filterPlaceholder = "Buscar...",
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(() => {
    return hasColumnId(columns, "createdAt") ? [{ id: "createdAt", desc: true }] : [];
  });

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  React.useEffect(() => {
    if (!sorting.length) return;

    const validIds = new Set(columns.map((c: any) => c?.id ?? c?.accessorKey).filter(Boolean));
    const nextSorting = sorting.filter((s) => validIds.has(s.id));

    if (nextSorting.length !== sorting.length) setSorting(nextSorting);
  }, [columns, sorting]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const filterColumn = table.getColumn(filterKey);

  const filteredTotal = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const rangeLabel = getRangeLabel(pageIndex, pageSize, filteredTotal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="space-y-3"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={filterPlaceholder}
            value={(filterColumn?.getFilterValue() as string) ?? ""}
            onChange={(event) => filterColumn?.setFilterValue(event.target.value)}
            className="pl-9 rounded-xl bg-muted/30 focus:bg-background transition"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuContent align="end" className="rounded-xl">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const label =
                  typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/30">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold uppercase tracking-wide text-xs text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="uppercase">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={[
                    "transition-colors",
                    "hover:bg-muted/40",
                    "data-[state=selected]:bg-muted/50",
                    onRowClick ? "cursor-pointer" : "",
                  ].join(" ")}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground">
                  SIN RESULTADOS.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Footer pagination */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t bg-background">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Mostrando <span className="font-semibold text-foreground">{rangeLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-muted-foreground/20 hover:bg-muted/40 transition"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="mr-1 size-4" />
              PREVIOUS
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-muted-foreground/20 hover:bg-muted/40 transition p-2"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              NEXT
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}