"use client";

import * as React from "react";
import { requestTypesApi } from "@/api/requests/request-types.api";
import GroupsDataTable from "./data-table/data-table";
import type { GroupTableRow } from "./data-table/columns";
import { Button } from "@/components/ui/button";
import { GroupFormDialog } from "./dialogs/group-form-dialog";
import { GroupDeleteDialog } from "./dialogs/group-delete-dialog";

function pickItems<T>(res: any): T[] {
  return (res?.items ?? res?.data?.items ?? res?.data ?? []) as T[];
}

export default function GroupsListView() {
  const [rows, setRows] = React.useState<GroupTableRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [openForm, setOpenForm] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<GroupTableRow | null>(null);

  const [openDelete, setOpenDelete] = React.useState(false);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await requestTypesApi.getAll();
      const items = pickItems<GroupTableRow>(res);
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando grupos.");
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

  function handleOpenEdit(row: GroupTableRow) {
    setFormMode("edit");
    setSelected(row);
    setOpenForm(true);
  }

  function handleOpenDelete(row: GroupTableRow) {
    setSelected(row);
    setOpenDelete(true);
  }

  async function handleSubmitForm(payload: { code: string; name: string; description?: string | null; isActive: boolean }) {
    if (formMode === "create") {
      await requestTypesApi.create({
        code: payload.code,
        name: payload.name,
        description: payload.description ?? null,
        isActive: payload.isActive,
      });
    } else {
      if (!selected?.id) throw new Error("No hay grupo seleccionado para editar.");

      await requestTypesApi.update(selected.id, {
        code: payload.code,
        name: payload.name,
        description: payload.description ?? null,
        isActive: payload.isActive,
      });
    }

    await load();
  }

  async function handleConfirmDelete(id: string) {
    await requestTypesApi.remove(id);
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Grupos</h1>
        <Button onClick={handleOpenCreate}>+ Crear Grupo</Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      ) : null}

      <GroupsDataTable data={rows} isLoading={isLoading} onEdit={handleOpenEdit} onDelete={handleOpenDelete} />

      <GroupFormDialog
        open={openForm}
        mode={formMode}
        initial={selected}
        onOpenChange={setOpenForm}
        onSubmit={handleSubmitForm}
      />

      <GroupDeleteDialog
        open={openDelete}
        group={selected}
        onOpenChange={setOpenDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}