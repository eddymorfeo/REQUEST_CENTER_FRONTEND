"use client";

import * as React from "react";
import { requestPrioritiesApi } from "@/api/requests/request-priorities.api";

import PrioritiesDataTable from "./data-table/data-table";
import type { PriorityTableRow } from "./data-table/columns";

import { Button } from "@/components/ui/button";
import { PriorityFormDialog } from "./dialogs/priority-form-dialog";
import { PriorityDeleteDialog } from "./dialogs/priority-delete-dialog";

function pickItems<T>(res: any): T[] {
  return (res?.items ?? res?.data?.items ?? res?.data ?? []) as T[];
}

export default function PrioritiesListView() {
  const [rows, setRows] = React.useState<PriorityTableRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [openForm, setOpenForm] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<PriorityTableRow | null>(null);

  const [openDelete, setOpenDelete] = React.useState(false);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await requestPrioritiesApi.getAll();
      const items = pickItems<PriorityTableRow>(res);
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando prioridades.");
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

  function handleOpenEdit(row: PriorityTableRow) {
    setFormMode("edit");
    setSelected(row);
    setOpenForm(true);
  }

  function handleOpenDelete(row: PriorityTableRow) {
    setSelected(row);
    setOpenDelete(true);
  }

  async function handleSubmitForm(payload: { code: string; name: string; sortOrder?: number; isActive: boolean }) {
    if (formMode === "create") {
      await requestPrioritiesApi.create({
        code: payload.code,
        name: payload.name,
        sortOrder: payload.sortOrder,
        isActive: payload.isActive,
      });
    } else {
      if (!selected?.id) throw new Error("No hay prioridad seleccionada para editar.");

      await requestPrioritiesApi.update(selected.id, {
        code: payload.code,
        name: payload.name,
        sortOrder: payload.sortOrder ?? 0,
        isActive: payload.isActive,
      });
    }

    await load();
  }

  async function handleConfirmDelete(id: string) {
    await requestPrioritiesApi.remove(id);
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Prioridades</h1>
        <Button onClick={handleOpenCreate}>+ Crear Prioridad</Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      ) : null}

      <PrioritiesDataTable data={rows} isLoading={isLoading} onEdit={handleOpenEdit} onDelete={handleOpenDelete} />

      <PriorityFormDialog
        open={openForm}
        mode={formMode}
        initial={selected}
        onOpenChange={setOpenForm}
        onSubmit={handleSubmitForm}
      />

      <PriorityDeleteDialog
        open={openDelete}
        priority={selected}
        onOpenChange={setOpenDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}