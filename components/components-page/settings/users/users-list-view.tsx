"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";

import { rolesApi, type RoleItem } from "@/api/role/roles.api";
import { usersApi, type UserItem } from "@/api/users/users.api";
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
import { UserDeleteDialog } from "./dialogs/user-delete-dialog";
import { UserFormDialog } from "./dialogs/user-form-dialog";
import type { UserTableRow } from "./data-table/columns";

type RoleOption = Pick<RoleItem, "id" | "code" | "name" | "is_active">;
type StatusFilter = "all" | "active" | "inactive";
type SortKey = "username" | "full_name" | "email" | "roleName" | "is_active" | "created_at";
type SortState = {
  key: SortKey;
  direction: "asc" | "desc";
};

const PAGE_SIZE = 8;
const ALL_ROLES = "__all_roles__";

const actionButtonClass = "h-10 gap-2 rounded-lg px-4 shadow-sm";
const primaryActionClass = `${actionButtonClass} bg-blue-600 text-white hover:bg-blue-700`;
const softActionClass = `${actionButtonClass} bg-blue-50 text-blue-700 hover:bg-blue-100`;

function buildRoleMap(roles: RoleOption[]) {
  return roles.reduce<Record<string, string>>((acc, role) => {
    acc[role.id] = role.name;
    return acc;
  }, {});
}

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

function toUserRows(users: UserItem[], roleMap: Record<string, string>): UserTableRow[] {
  return users.map((user) => ({
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    role_id: user.role_id,
    roleName: roleMap[user.role_id] ?? "-",
    is_active: Boolean(user.is_active),
    created_at: user.created_at ?? null,
    updated_at: user.updated_at ?? null,
  }));
}

function getInitials(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "US";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getAvatarClassName(index: number) {
  const tones = [
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-orange-100 text-orange-700",
    "bg-cyan-100 text-cyan-700",
  ];

  return tones[index % tones.length];
}

function getRoleBadgeClass(roleName: string) {
  const normalized = roleName.toUpperCase();
  if (normalized.includes("ADMIN")) {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-blue-100 text-blue-700";
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

function compareValues(a: UserTableRow, b: UserTableRow, sort: SortState) {
  const direction = sort.direction === "asc" ? 1 : -1;

  if (sort.key === "created_at") {
    const left = a.created_at ? new Date(a.created_at).getTime() : 0;
    const right = b.created_at ? new Date(b.created_at).getTime() : 0;
    return (left - right) * direction;
  }

  if (sort.key === "is_active") {
    return (Number(a.is_active) - Number(b.is_active)) * direction;
  }

  return String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), "es", {
    sensitivity: "base",
  }) * direction;
}

export default function UsersListView() {
  const [rows, setRows] = React.useState<UserTableRow[]>([]);
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState(ALL_ROLES);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [sort, setSort] = React.useState<SortState>({ key: "created_at", direction: "desc" });

  const [openForm, setOpenForm] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = React.useState<UserTableRow | null>(null);
  const [openDelete, setOpenDelete] = React.useState(false);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [usersRes, rolesRes] = await Promise.all([
        usersApi.listUsersPaged({ page: 1, pageSize: 100 }),
        rolesApi.listRoles(),
      ]);

      const users = pickItems<UserItem>(usersRes);
      const rolesItems = pickItems<RoleOption>(rolesRes);

      setRoles(rolesItems);
      setRows(toUserRows(users, buildRoleMap(rolesItems)));
    } catch (error: unknown) {
      setError(getErrorMessage(error) || "Error cargando usuarios.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    setPageIndex(0);
  }, [search, roleFilter, statusFilter]);

  const filteredRows = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows
      .filter((row) => {
        const matchesSearch =
          !term ||
          row.username.toLowerCase().includes(term) ||
          row.full_name.toLowerCase().includes(term) ||
          row.email.toLowerCase().includes(term);

        const matchesRole = roleFilter === ALL_ROLES || row.role_id === roleFilter;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && row.is_active) ||
          (statusFilter === "inactive" && !row.is_active);

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => compareValues(a, b, sort));
  }, [roleFilter, rows, search, sort, statusFilter]);

  const activeUsers = rows.filter((row) => row.is_active).length;
  const hasFilters = search.trim() !== "" || roleFilter !== ALL_ROLES || statusFilter !== "all";
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = filteredRows.slice(safePageIndex * PAGE_SIZE, safePageIndex * PAGE_SIZE + PAGE_SIZE);
  const showingFrom = filteredRows.length ? safePageIndex * PAGE_SIZE + 1 : 0;
  const showingTo = Math.min((safePageIndex + 1) * PAGE_SIZE, filteredRows.length);

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (current.key !== key) return { key, direction: "asc" };
      return { key, direction: current.direction === "asc" ? "desc" : "asc" };
    });
  }

  function handleOpenCreate() {
    setFormMode("create");
    setSelectedUser(null);
    setOpenForm(true);
  }

  function handleOpenEdit(row: UserTableRow) {
    setFormMode("edit");
    setSelectedUser(row);
    setOpenForm(true);
  }

  function handleOpenDelete(row: UserTableRow) {
    setSelectedUser(row);
    setOpenDelete(true);
  }

  function clearFilters() {
    setSearch("");
    setRoleFilter(ALL_ROLES);
    setStatusFilter("all");
  }

  async function handleSubmitForm(payload: {
    username: string;
    fullName: string;
    email: string;
    roleId: string;
    password?: string;
    isActive: boolean;
  }) {
    if (formMode === "create") {
      await usersApi.createUser({
        username: payload.username,
        fullName: payload.fullName,
        email: payload.email,
        roleId: payload.roleId,
        password: payload.password ?? "",
        isActive: payload.isActive,
      });
    } else {
      if (!selectedUser?.id) throw new Error("No hay usuario seleccionado para editar.");

      await usersApi.updateUser(selectedUser.id, {
        username: payload.username,
        fullName: payload.fullName,
        email: payload.email,
        roleId: payload.roleId,
        password: payload.password,
        isActive: payload.isActive,
      });
    }

    await load();
  }

  async function handleConfirmDelete(id: string) {
    await usersApi.deleteUser(id);
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
          <h1 className="text-2xl font-semibold tracking-tight">Gestion de Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Administra los usuarios del sistema: crea, edita y elimina registros.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className={actionButtonClass} onClick={load} disabled={isLoading}>
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button type="button" className={primaryActionClass} onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Crear usuario
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
              <div className="text-sm text-muted-foreground">Usuarios totales</div>
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
              <div className="text-sm text-muted-foreground">Usuarios activos</div>
              <div className="mt-1 text-3xl font-semibold leading-none text-emerald-700">{activeUsers}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <div className="text-sm font-semibold">Filtros</div>
        <div className="mt-3 grid gap-4 lg:grid-cols-[280px_280px_1fr_auto] lg:items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold">Rol</label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-9 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="w-[var(--radix-select-trigger-width)]">
                <SelectItem value={ALL_ROLES}>Todos los roles</SelectItem>
                {roles
                  .filter((role) => role.is_active !== false)
                  .map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Estado</label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="h-9 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="w-[var(--radix-select-trigger-width)]">
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="hidden h-12 border-l lg:block" />

          <Button
            type="button"
            variant="ghost"
            className={softActionClass}
            disabled={!hasFilters}
            onClick={clearFilters}
          >
            <X className="size-4" />
            Limpiar filtros
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, usuario o email..."
          className="h-10 rounded-lg pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              <SortableHead label="Usuario" sortKey="username" sort={sort} onSort={toggleSort} />
              <SortableHead label="Nombre" sortKey="full_name" sort={sort} onSort={toggleSort} />
              <SortableHead label="Email" sortKey="email" sort={sort} onSort={toggleSort} />
              <SortableHead label="Rol" sortKey="roleName" sort={sort} onSort={toggleSort} />
              <SortableHead label="Estado" sortKey="is_active" sort={sort} onSort={toggleSort} />
              <SortableHead label="Fecha de creacion" sortKey="created_at" sort={sort} onSort={toggleSort} />
              <TableHead className="w-24 text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : pageRows.length ? (
              pageRows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${getAvatarClassName(index)}`}
                      >
                        {getInitials(row.full_name || row.username)}
                      </div>
                      <span className="font-semibold">{row.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>{row.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.email}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClass(row.roleName)}`}>
                      {row.roleName}
                    </span>
                  </TableCell>
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
                <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {showingFrom} a {showingTo} de {filteredRows.length} usuarios
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

      <UserFormDialog
        open={openForm}
        mode={formMode}
        roles={roles}
        initial={selectedUser}
        onOpenChange={setOpenForm}
        onSubmit={handleSubmitForm}
      />

      <UserDeleteDialog
        open={openDelete}
        user={selectedUser}
        onOpenChange={setOpenDelete}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
}

function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
}) {
  const isActive = sort.key === sortKey;

  return (
    <TableHead>
      <Button
        type="button"
        variant="ghost"
        className="-ml-2 h-8 px-2 font-semibold"
        onClick={() => onSort(sortKey)}
      >
        {label}
        <ArrowUpDown className={`ml-1 size-4 ${isActive ? "opacity-100" : "opacity-50"}`} />
      </Button>
    </TableHead>
  );
}
