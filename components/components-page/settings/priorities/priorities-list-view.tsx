"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { requestPrioritiesApi } from "@/api/requests/request-priorities.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/lib/errors/get-error-message";
import { formatDdMmYyyy } from "@/utils/formatDate";

import { AdminRowActions } from "../admin-row-actions";
import { PriorityDeleteDialog } from "./dialogs/priority-delete-dialog";
import { PriorityFormDialog } from "./dialogs/priority-form-dialog";
import type { PriorityTableRow } from "./data-table/columns";

type StatusFilter = "all" | "active" | "inactive";

const PAGE_SIZE = 8;
const actionButtonClass = "h-10 gap-2 rounded-lg px-4 shadow-sm";
const primaryActionClass = `${actionButtonClass} bg-blue-600 text-white hover:bg-blue-700`;
const softActionClass = `${actionButtonClass} bg-blue-50 text-blue-700 hover:bg-blue-100`;

function pickItems<T>(res: unknown): T[] {
  if (!res || typeof res !== "object") return [];
  const root = res as { items?: unknown; data?: unknown };
  if (Array.isArray(root.items)) return root.items as T[];
  if (Array.isArray(root.data)) return root.data as T[];
  if (root.data && typeof root.data === "object") {
    const nested = root.data as { items?: unknown };
    if (Array.isArray(nested.items)) return nested.items as T[];
  }
  return [];
}

function formatTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function PrioritiesListView() {
  const [rows, setRows] = React.useState<PriorityTableRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [pageIndex, setPageIndex] = React.useState(0);

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
      setRows(items.sort((a, b) => a.sort_order - b.sort_order));
    } catch (error: unknown) {
      setError(getErrorMessage(error) || "Error cargando prioridades.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    setPageIndex(0);
  }, [search, statusFilter]);

  const filteredRows = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !term ||
        row.code.toLowerCase().includes(term) ||
        row.name.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && row.is_active) ||
        (statusFilter === "inactive" && !row.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const activePriorities = rows.filter((row) => row.is_active).length;
  const hasFilters = search.trim() !== "" || statusFilter !== "all";
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = filteredRows.slice(safePageIndex * PAGE_SIZE, safePageIndex * PAGE_SIZE + PAGE_SIZE);
  const showingFrom = filteredRows.length ? safePageIndex * PAGE_SIZE + 1 : 0;
  const showingTo = Math.min((safePageIndex + 1) * PAGE_SIZE, filteredRows.length);

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

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Gestion de Prioridades</h1>
          <p className="text-sm text-muted-foreground">
            Administra las prioridades del sistema: crea, edita y elimina registros.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className={actionButtonClass} onClick={load} disabled={isLoading}>
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button type="button" className={primaryActionClass} onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Crear prioridad
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,360px)]">
        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ShieldCheck className="size-7" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Prioridades totales</div>
              <div className="mt-1 text-3xl font-semibold leading-none text-blue-700">{rows.length}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <UsersRound className="size-7" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Prioridades activas</div>
              <div className="mt-1 text-3xl font-semibold leading-none text-emerald-700">{activePriorities}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-background p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="size-4" />
          Filtros
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[360px_1fr_auto] lg:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="w-[var(--radix-select-trigger-width)]">
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div />

          <Button
            type="button"
            variant="ghost"
            className={softActionClass}
            disabled={!hasFilters}
            onClick={clearFilters}
          >
            <Eraser className="size-4" />
            Limpiar filtros
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por codigo o nombre..."
          className="h-10 rounded-lg pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              <TableHead>Codigo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de creacion</TableHead>
              <TableHead className="w-24 text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                  Cargando prioridades...
                </TableCell>
              </TableRow>
            ) : pageRows.length ? (
              pageRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-semibold text-blue-700">{row.code}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.sort_order}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <span className={`size-2 rounded-full ${row.is_active ? "bg-emerald-600" : "bg-muted-foreground"}`} />
                      {row.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="size-4" />
                      <div className="leading-tight">
                        <div>{row.created_at ? formatDdMmYyyy(row.created_at) : "-"}</div>
                        <div className="text-xs">{formatTime(row.created_at)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <AdminRowActions row={row} onEdit={handleOpenEdit} onDelete={handleOpenDelete} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {showingFrom} a {showingTo} de {filteredRows.length} prioridades
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePageIndex === 0}
              onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
            >
              <ChevronLeft className="mr-1 size-4" />
              Anterior
            </Button>
            <Button type="button" size="sm" className="min-w-9 bg-blue-600 text-white hover:bg-blue-700">
              {safePageIndex + 1}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePageIndex >= pageCount - 1}
              onClick={() => setPageIndex((current) => Math.min(pageCount - 1, current + 1))}
            >
              Siguiente
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </div>

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
    </motion.div>
  );
}
