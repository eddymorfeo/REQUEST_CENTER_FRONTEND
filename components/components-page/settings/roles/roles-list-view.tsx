"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { rolesApi } from "@/api/role/roles.api";
import RolesDataTable from "./data-table/data-table";
import type { RoleTableRow } from "./data-table/columns";
import { Button } from "@/components/ui/button";
import { RoleFormDialog } from "./dialogs/role-form-dialog";
import { RoleDeleteDialog } from "./dialogs/role-delete-dialog";
import { Plus } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Mantenedor de Roles</h1>
          <p className="text-sm text-muted-foreground">
            Administra los roles del sistema: crea, edita y elimina registros.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-xl shadow-sm bg-green-700 text-background hover:bg-green-500 transition gap-2"
        >
          <Plus className="size-4" />
          CREAR ROLES
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      ) : null}

      <div className="pt-10">
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
    </motion.div>
  );
}