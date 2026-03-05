"use client";

import * as React from "react";
import { DataTable } from "@/components/components-page/data-table/data-table";
import { buildGroupColumns, type GroupTableRow } from "./columns";

type Props = {
  data: GroupTableRow[];
  isLoading?: boolean;
  onEdit: (row: GroupTableRow) => void;
  onDelete: (row: GroupTableRow) => void;
};

export default function GroupsDataTable({ data, isLoading = false, onEdit, onDelete }: Props) {
  const columns = React.useMemo(() => buildGroupColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">
        Cargando grupos...
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