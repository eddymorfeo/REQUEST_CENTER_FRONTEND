"use client";

import * as React from "react";
import { requestStatusApi } from "@/api/requests/request-status.api";
import StatusDataTable from "./data-table/data-table";
import type { StatusTableRow } from "./data-table/columns";
import { Button } from "@/components/ui/button";
import { StatusFormDialog } from "./dialogs/status-form-dialog";
import { StatusDeleteDialog } from "./dialogs/status-delete-dialog";

function pickItems<T>(res: any): T[] {
  return (res?.items ?? res?.data?.items ?? res?.data ?? []) as T[];
}

export default function StatusListView() {
  const [rows, setRows] = React.useState<StatusTableRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [openForm, setOpenForm] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<StatusTableRow | null>(null);

  const [openDelete, setOpenDelete] = React.useState(false);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await requestStatusApi.getAll();
      const items = pickItems<StatusTableRow>(res);
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando estados.");
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

  function handleOpenEdit(row: StatusTableRow) {
    setFormMode("edit");
    setSelected(row);
    setOpenForm(true);
  }

  function handleOpenDelete(row: StatusTableRow) {
    setSelected(row);
    setOpenDelete(true);
  }

  async function handleSubmitForm(payload: {
    code: string;
    name: string;
    sortOrder?: number;
    isTerminal: boolean;
    isActive: boolean;
  }) {
    if (formMode === "create") {
      await requestStatusApi.create({
        code: payload.code,
        name: payload.name,
        sortOrder: payload.sortOrder,
        isTerminal: payload.isTerminal,
        isActive: payload.isActive,
      });
    } else {
      if (!selected?.id) throw new Error("No hay estado seleccionado para editar.");

      await requestStatusApi.update(selected.id, {
        code: payload.code,
        name: payload.name,
        sortOrder: payload.sortOrder ?? 0,
        isTerminal: payload.isTerminal,
        isActive: payload.isActive,
      });
    }

    await load();
  }

  async function handleConfirmDelete(id: string) {
    await requestStatusApi.remove(id);
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Estados</h1>
        <Button onClick={handleOpenCreate}>+ Crear Estado</Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      ) : null}

      <StatusDataTable
        data={rows}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <StatusFormDialog
        open={openForm}
        mode={formMode}
        initial={selected}
        onOpenChange={setOpenForm}
        onSubmit={handleSubmitForm}
      />

      <StatusDeleteDialog
        open={openDelete}
        status={selected}
        onOpenChange={setOpenDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}