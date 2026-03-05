"use client";

import * as React from "react";
import { DataTable } from "@/components/components-page/data-table/data-table";

import { buildRoleColumns, type RoleTableRow } from "./columns";

type Props = {
  data: RoleTableRow[];
  isLoading?: boolean;
  onEdit: (row: RoleTableRow) => void;
  onDelete: (row: RoleTableRow) => void;
};

export default function RolesDataTable({ data, isLoading = false, onEdit, onDelete }: Props) {
  const columns = React.useMemo(() => buildRoleColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">
        Cargando roles...
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