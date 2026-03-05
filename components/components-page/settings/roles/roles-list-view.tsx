"use client";

import * as React from "react";
import { rolesApi } from "@/api/role/roles.api";

import RolesDataTable from "./data-table/data-table";
import type { RoleTableRow } from "./data-table/columns";

import { Button } from "@/components/ui/button";
import { RoleFormDialog } from "./dialogs/role-form-dialog";
import { RoleDeleteDialog } from "./dialogs/role-delete-dialog";

function pickItems<T>(res: any): T[] {
  return (res?.items ?? res?.data?.items ?? res?.data ?? []) as T[];
}

export default function RolesListView() {
  const [rows, setRows] = React.useState<RoleTableRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [openForm, setOpenForm] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<RoleTableRow | null>(null);

  const [openDelete, setOpenDelete] = React.useState(false);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await rolesApi.listRoles();
      const items = pickItems<RoleTableRow>(res);
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando roles.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  function handleOpenCreate() {
    setFormMode("create");
    setSelected(null);
    setOpenForm(true);
  }

  function handleOpenEdit(row: RoleTableRow) {
    setFormMode("edit");
    setSelected(row);
    setOpenForm(true);
  }

  function handleOpenDelete(row: RoleTableRow) {
    setSelected(row);
    setOpenDelete(true);
  }

  async function handleSubmitForm(payload: { code: string; name: string; isActive: boolean }) {
    if (formMode === "create") {
      await rolesApi.createRole({
        code: payload.code,
        name: payload.name,
        isActive: payload.isActive,
      });
    } else {
      if (!selected?.id) throw new Error("No hay rol seleccionado para editar.");

      await rolesApi.updateRole(selected.id, {
        code: payload.code,
        name: payload.name,
        isActive: payload.isActive,
      });
    }

    await load();
  }

  async function handleConfirmDelete(id: string) {
    await rolesApi.deleteRole(id);
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Roles</h1>
        <Button onClick={handleOpenCreate}>+ Crear Rol</Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      ) : null}

      <RolesDataTable
        data={rows}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <RoleFormDialog
        open={openForm}
        mode={formMode}
        initial={selected}
        onOpenChange={setOpenForm}
        onSubmit={handleSubmitForm}
      />

      <RoleDeleteDialog
        open={openDelete}
        role={selected}
        onOpenChange={setOpenDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}