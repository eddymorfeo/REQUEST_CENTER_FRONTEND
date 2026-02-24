"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { RequestItem } from "@/types/requests/request.types";
import type { RequestStatus } from "@/types/requests/request-status.types";

import { requestAssignmentsApi } from "@/api/requests/request-assignments.api";
import { usersApi, type UserItem } from "@/api/users/users.api";

import { DataTable } from "@/components/components-page/data-table/data-table";
import { requestColumns, type RequestTableRow } from "@/components/components-page/data-table/columns";

type Props = {
  statuses: RequestStatus[];
  requests: RequestItem[];
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

export function RequestsListView({ statuses, requests }: Props) {
  const router = useRouter();

  const [assigneeMap, setAssigneeMap] = React.useState<Record<string, string>>({});
  const [isResolving, setIsResolving] = React.useState(false);

  // ✅ Diccionario rápido para mostrar status_name consistente
  const statusNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const s of statuses) map.set(s.id, s.name);
    return map;
  }, [statuses]);

  const resolveAssignees = React.useCallback(async () => {
    if (!requests.length) {
      setAssigneeMap({});
      return;
    }

    setIsResolving(true);
    try {
      const usersRes = await usersApi.listUsers();
      const users = (usersRes.items ?? []).filter((u: UserItem) => u.is_active);

      const userLabelById = new Map<string, string>();
      for (const u of users) {
        const label = u.full_name?.trim() || u.username?.trim() || u.email?.trim() || "—";
        userLabelById.set(u.id, label);
      }

      const requestIds = requests.map((r) => r.id);

      const pairs = await mapWithConcurrency(requestIds, 8, async (requestId) => {
        const res = await requestAssignmentsApi.listByRequestId(requestId);
        const list = (res.data ?? []) as AssignmentItem[];
        const assigneeId = pickCurrentAssigneeId(list);
        const label = assigneeId ? userLabelById.get(assigneeId) ?? "—" : "Sin asignar";
        return { requestId, label };
      });

      const next: Record<string, string> = {};
      for (const p of pairs) next[p.requestId] = p.label;

      setAssigneeMap(next);
    } catch {
      setAssigneeMap({});
    } finally {
      setIsResolving(false);
    }
  }, [requests]);

  React.useEffect(() => {
    void resolveAssignees();
  }, [resolveAssignees]);

  const tableData: RequestTableRow[] = React.useMemo(() => {
    return requests.map((r) => ({
      ...r,
      // asegura status_name aunque backend no lo incluya siempre
      status_name: r.status_name ?? statusNameById.get(r.status_id),
      assignee: assigneeMap[r.id] ?? "Sin asignar",
    }));
  }, [requests, assigneeMap, statusNameById]);

  return (
    <div className="space-y-2">
      {isResolving ? (
        <div className="text-xs text-muted-foreground">Resolviendo asignaciones…</div>
      ) : null}

      <DataTable
        columns={requestColumns}
        data={tableData}
        filterKey="assignee"
        filterPlaceholder="Filter username..."
        onRowClick={(row) => router.push(`/requests/${(row as RequestTableRow).id}`)}
      />
    </div>
  );
}