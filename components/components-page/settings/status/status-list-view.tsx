"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { requestStatusApi } from "@/api/requests/request-status.api";
import StatusDataTable from "./data-table/data-table";
import type { StatusTableRow } from "./data-table/columns";
import { Button } from "@/components/ui/button";
import { StatusFormDialog } from "./dialogs/status-form-dialog";
import { StatusDeleteDialog } from "./dialogs/status-delete-dialog";
import { Plus } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Mantenedor de Estados</h1>
          <p className="text-sm text-muted-foreground">
            Administra los estados de las solicitudes del sistema: crea, edita y elimina registros.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-xl shadow-sm bg-green-700 text-background hover:bg-green-500 transition gap-2"
        >
          <Plus className="size-4" />
          CREAR ESTADOS
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      ) : null}

      <div className="pt-10">
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
    </motion.div>
  );
}