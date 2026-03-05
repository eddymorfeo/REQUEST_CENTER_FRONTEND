"use client";

import * as React from "react";
import { DataTable } from "@/components/components-page/data-table/data-table";

import { buildStatusColumns, type StatusTableRow } from "./columns";

type Props = {
  data: StatusTableRow[];
  isLoading?: boolean;
  onEdit: (row: StatusTableRow) => void;
  onDelete: (row: StatusTableRow) => void;
};

export default function StatusDataTable({ data, isLoading = false, onEdit, onDelete }: Props) {
  const columns = React.useMemo(() => buildStatusColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">
        Cargando estados...
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      filterKey="name"
      filterPlaceholder="Buscar por nombre..."
    />
  );
}