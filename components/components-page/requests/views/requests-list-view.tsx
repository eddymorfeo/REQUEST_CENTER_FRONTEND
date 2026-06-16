"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { requestAssignmentsApi } from "@/api/requests/request-assignments.api";
import { requestsApi } from "@/api/requests/requests.api";
import type { RequestPriorityItem } from "@/api/requests/request-priorities.api";
import type { RequestTypeItem } from "@/api/requests/request-types.api";
import { usersApi, type UserItem } from "@/api/users/users.api";
import { PriorityBadge } from "@/components/components-page/requests/badge/request-priority-badge";
import { StatusBadge } from "@/components/components-page/requests/badge/request-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { RequestItem } from "@/types/requests/request.types";
import type { RequestStatus } from "@/types/requests/request-status.types";
import { alerts } from "@/utils/alerts/alerts";
import { formatDdMmYyyy } from "@/utils/formatDate";

type Props = {
  statuses: RequestStatus[];
  types: RequestTypeItem[];
  priorities: RequestPriorityItem[];
  requests: RequestItem[];
  onRequestDeleted: () => void;
};

type AssignmentItem = {
  id: string;
  request_id: string;
  assigned_to: string | null;
  assigned_by: string;
  assigned_at: string;
  unassigned_at: string | null;
  note: string | null;
  is_active: boolean;
};

type AssigneeInfo = {
  id: string | null;
  label: string;
  initials: string;
};

type RequestRow = RequestItem & {
  status_name?: string;
  assigneeInfo: AssigneeInfo;
};

type FiltersState = {
  search: string;
  statusId: string;
  typeId: string;
  assigneeId: string;
  priorityId: string;
  dateFrom: string;
  dateTo: string;
};

const ALL_VALUE = "__all";
const PAGE_SIZE = 8;

const initialFilters: FiltersState = {
  search: "",
  statusId: ALL_VALUE,
  typeId: ALL_VALUE,
  assigneeId: ALL_VALUE,
  priorityId: ALL_VALUE,
  dateFrom: "",
  dateTo: "",
};

function pickCurrentAssigneeId(assignments: AssignmentItem[]): string | null {
  const active = assignments
    .filter((a) => a.is_active === true && (a.unassigned_at === null || a.unassigned_at === undefined))
    .sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime());

  return active[0]?.assigned_to ?? null;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function runner() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, runner);
  await Promise.all(workers);
  return results;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "SA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function sameOrAfter(date: string, from: string) {
  if (!from) return true;
  return new Date(date).getTime() >= new Date(`${from}T00:00:00`).getTime();
}

function sameOrBefore(date: string, to: string) {
  if (!to) return true;
  return new Date(date).getTime() <= new Date(`${to}T23:59:59`).getTime();
}

function hasActiveFilters(filters: FiltersState) {
  return (
    filters.search.trim() ||
    filters.statusId !== ALL_VALUE ||
    filters.typeId !== ALL_VALUE ||
    filters.assigneeId !== ALL_VALUE ||
    filters.priorityId !== ALL_VALUE ||
    filters.dateFrom ||
    filters.dateTo
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return { date: "-", time: "" };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: formatDdMmYyyy(value), time: "" };
  return {
    date: formatDdMmYyyy(value),
    time: parsed.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
  };
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full rounded-lg bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

export function RequestsListView({ statuses, types, priorities, requests, onRequestDeleted }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const canDeleteRequests = user?.roleCode === "ADMIN" || user?.roleCode === "ADMINISTRADOR";
  const [assigneeMap, setAssigneeMap] = React.useState<Record<string, AssigneeInfo>>({});
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [filters, setFilters] = React.useState<FiltersState>(initialFilters);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [isResolving, setIsResolving] = React.useState(false);
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);

  const statusNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const s of statuses) map.set(s.id, s.name);
    return map;
  }, [statuses]);

  const resolveAssignees = React.useCallback(async () => {
    if (!requests.length) {
      setAssigneeMap({});
      setUsers([]);
      return;
    }

    setIsResolving(true);
    try {
      const usersRes = await usersApi.listUsers();
      const activeUsers = (usersRes.items ?? []).filter((u) => u.is_active);
      setUsers(activeUsers);

      const userLabelById = new Map<string, string>();
      for (const u of activeUsers) {
        const label = u.full_name?.trim() || u.username?.trim() || u.email?.trim() || "Sin nombre";
        userLabelById.set(u.id, label);
      }

      const pairs = await mapWithConcurrency(requests.map((r) => r.id), 8, async (requestId) => {
        const res = await requestAssignmentsApi.listByRequestId(requestId);
        const list = (res.data ?? []) as AssignmentItem[];
        const assigneeId = pickCurrentAssigneeId(list);
        const label = assigneeId ? userLabelById.get(assigneeId) ?? "Sin asignar" : "Sin asignar";
        return {
          requestId,
          assigneeInfo: {
            id: assigneeId,
            label,
            initials: getInitials(label),
          },
        };
      });

      const next: Record<string, AssigneeInfo> = {};
      for (const pair of pairs) next[pair.requestId] = pair.assigneeInfo;
      setAssigneeMap(next);
    } catch {
      setAssigneeMap({});
      setUsers([]);
    } finally {
      setIsResolving(false);
    }
  }, [requests]);

  React.useEffect(() => {
    void resolveAssignees();
  }, [resolveAssignees]);

  React.useEffect(() => {
    setPageIndex(0);
  }, [filters]);

  const tableData = React.useMemo<RequestRow[]>(() => {
    return requests.map((request) => ({
      ...request,
      status_name: request.status_name ?? statusNameById.get(request.status_id),
      assigneeInfo: assigneeMap[request.id] ?? {
        id: null,
        label: isResolving ? "Resolviendo..." : "Sin asignar",
        initials: "SA",
      },
    }));
  }, [assigneeMap, isResolving, requests, statusNameById]);

  const filteredData = React.useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return tableData.filter((request) => {
      const matchesSearch =
        !search ||
        request.title.toLowerCase().includes(search) ||
        request.id.toLowerCase().includes(search) ||
        request.tracking_code?.toLowerCase().includes(search) ||
        request.description?.toLowerCase().includes(search);

      const matchesStatus = filters.statusId === ALL_VALUE || request.status_id === filters.statusId;
      const matchesType = filters.typeId === ALL_VALUE || request.request_type_id === filters.typeId;
      const matchesAssignee =
        filters.assigneeId === ALL_VALUE ||
        (filters.assigneeId === "__unassigned" && !request.assigneeInfo.id) ||
        request.assigneeInfo.id === filters.assigneeId;
      const matchesPriority = filters.priorityId === ALL_VALUE || request.priority_id === filters.priorityId;
      const matchesDate = sameOrAfter(request.created_at, filters.dateFrom) && sameOrBefore(request.created_at, filters.dateTo);

      return matchesSearch && matchesStatus && matchesType && matchesAssignee && matchesPriority && matchesDate;
    });
  }, [filters, tableData]);

  const pageCount = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = filteredData.slice(safePageIndex * PAGE_SIZE, safePageIndex * PAGE_SIZE + PAGE_SIZE);
  const showingFrom = filteredData.length ? safePageIndex * PAGE_SIZE + 1 : 0;
  const showingTo = Math.min((safePageIndex + 1) * PAGE_SIZE, filteredData.length);

  async function handleDelete(request: RequestRow) {
    const ok = await alerts.confirm(
      "Eliminar solicitud",
      `¿Confirmas eliminar la solicitud "${request.title}"?`
    );
    if (!ok) return;

    setIsDeletingId(request.id);
    try {
      await requestsApi.deleteRequest(request.id);
      await alerts.toastSuccess("Solicitud eliminada");
      onRequestDeleted();
    } catch (error: unknown) {
      await alerts.error("No se pudo eliminar la solicitud", getErrorMessage(error));
    } finally {
      setIsDeletingId(null);
    }
  }

  function updateFilter(patch: Partial<FiltersState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-background p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(220px,1.4fr)_repeat(6,minmax(140px,1fr))]">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Buscar</div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.search}
                onChange={(event) => updateFilter({ search: event.target.value })}
                placeholder="Buscar por nombre, ID o codigo..."
                className="h-9 rounded-lg pl-9"
              />
            </div>
          </div>

          <FilterSelect label="Estado" value={filters.statusId} onChange={(value) => updateFilter({ statusId: value })}>
            <SelectItem value={ALL_VALUE}>Todos</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
            ))}
          </FilterSelect>

          <FilterSelect label="Grupo" value={filters.typeId} onChange={(value) => updateFilter({ typeId: value })}>
            <SelectItem value={ALL_VALUE}>Todos</SelectItem>
            {types.map((type) => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))}
          </FilterSelect>

          <FilterSelect label="Asignado a" value={filters.assigneeId} onChange={(value) => updateFilter({ assigneeId: value })}>
            <SelectItem value={ALL_VALUE}>Todos</SelectItem>
            <SelectItem value="__unassigned">Sin asignar</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.full_name || user.username || user.email}
              </SelectItem>
            ))}
          </FilterSelect>

          <FilterSelect label="Prioridad" value={filters.priorityId} onChange={(value) => updateFilter({ priorityId: value })}>
            <SelectItem value={ALL_VALUE}>Todas</SelectItem>
            {priorities.map((priority) => (
              <SelectItem key={priority.id} value={priority.id}>{priority.name}</SelectItem>
            ))}
          </FilterSelect>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Fecha de creacion</div>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter({ dateFrom: event.target.value })}
              className="h-9 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Hasta</div>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(event) => updateFilter({ dateTo: event.target.value })}
              className="h-9 rounded-lg"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-9 gap-2 rounded-lg"
            disabled={!hasActiveFilters(filters)}
            onClick={() => setFilters(initialFilters)}
          >
            <X className="size-4" />
            Limpiar filtros
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="text-sm font-semibold">
            {filteredData.length} {filteredData.length === 1 ? "solicitud" : "solicitudes"}
          </div>
          {isResolving ? <div className="text-xs text-muted-foreground">Resolviendo asignaciones...</div> : null}
        </div>

        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              <TableHead>Estado</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Asignado a</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Fecha de creacion</TableHead>
              <TableHead className="w-24 text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length ? (
              pageRows.map((request) => {
                const created = formatDateTime(request.created_at);
                return (
                  <TableRow key={request.id} className="hover:bg-muted/20">
                    <TableCell>
                      <StatusBadge value={String(request.status_name ?? request.status_id).toUpperCase()} />
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <div className="font-semibold leading-tight">{request.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">ID: {request.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                        {request.tracking_code ?? "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {request.type_name ?? "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                          {request.assigneeInfo.initials}
                        </span>
                        <span className="text-sm">{request.assigneeInfo.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge value={String(request.priority_name ?? request.priority_id).toUpperCase()} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Calendar className="mt-0.5 size-4" />
                        <div>
                          <div>{created.date}</div>
                          {created.time ? <div className="text-xs">{created.time}</div> : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-24">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              disabled={isDeletingId === request.id}
                              aria-label="Abrir acciones"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={() => router.push(`/requests/${request.id}`)}>
                              <Eye className="mr-2 size-4" />
                              Ver
                            </DropdownMenuItem>
                            {canDeleteRequests ? (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => void handleDelete(request)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Eliminar
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">
                  No se encontraron solicitudes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {showingFrom} a {showingTo} de {filteredData.length} solicitudes
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
    </div>
  );
}
