"use client";

import * as React from "react";
import { DataTable } from "@/components/components-page/data-table/data-table";
import { buildUserColumns, type UserTableRow } from "./columns";

type Props = {
  data: UserTableRow[];
  isLoading?: boolean;
  onEdit: (row: UserTableRow) => void;
  onDelete: (row: UserTableRow) => void;
  onRowClick?: (row: UserTableRow) => void;
};

export default function UsersDataTable({
  data,
  isLoading = false,
  onEdit,
  onDelete,
  onRowClick,
}: Props) {
  const columns = React.useMemo(() => buildUserColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">
        Cargando usuarios...
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      filterKey="fullName"
      filterPlaceholder="Buscar por nombre..."
      onRowClick={onRowClick}
    />
  );
}