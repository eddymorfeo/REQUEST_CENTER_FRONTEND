"use client";

import * as React from "react";
import { DataTable } from "@/components/components-page/data-table/data-table";
import { buildPriorityColumns, type PriorityTableRow } from "./columns";

type Props = {
  data: PriorityTableRow[];
  isLoading?: boolean;
  onEdit: (row: PriorityTableRow) => void;
  onDelete: (row: PriorityTableRow) => void;
};

export default function PrioritiesDataTable({ data, isLoading = false, onEdit, onDelete }: Props) {
  const columns = React.useMemo(() => buildPriorityColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">
        Cargando prioridades...
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