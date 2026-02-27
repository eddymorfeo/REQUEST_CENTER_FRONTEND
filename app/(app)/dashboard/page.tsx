"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { buildLoginRedirectUrl, isLoggedIn } from "@/utils/guards/auth.guard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { metricsApi, type MetricsQuery } from "@/api/metrics/metrics.api";
import type { CatalogItem, UserItem } from "@/api/metrics/metrics.api";

import type { DashboardFiltersState } from "@/components/components-page/dahsboard/dashboardTypes";
import { DashboardFilters } from "@/components/components-page/dahsboard/dashboardFilters";
import { DashboardKpis } from "@/components/components-page/dahsboard/dashboardKpis";

import {
  RequestsByStatusBarChart,
  OpenByAssigneeChart,
  OpenDistributionCharts,
} from "@/components/components-page/dahsboard/dashboardCharts";

import { RequestTimesTable } from "@/components/components-page/dahsboard/requestTimesTable";
import { RequestTimesLiveTable } from "@/components/components-page/dahsboard/requestTimesLiveTable";

function toDateOnly(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function sortByOrderThenName(items: CatalogItem[]) {
  return [...items].sort((a, b) => {
    const ao = a.sort_order ?? 9999;
    const bo = b.sort_order ?? 9999;
    if (ao !== bo) return ao - bo;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}

export default function DashboardPage() {
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoggedIn()) {
      const nextPath = window.location.pathname + window.location.search;
      router.replace(buildLoginRedirectUrl(nextPath));
    }
  }, [router]);

  if (!isLoggedIn()) return null;

  const [catalogs, setCatalogs] = React.useState<{
    status: CatalogItem[];
    priorities: CatalogItem[];
    types: CatalogItem[];
    users: UserItem[];
  }>({
    status: [],
    priorities: [],
    types: [],
    users: [],
  });

  const [draft, setDraft] = React.useState<DashboardFiltersState>(() => ({
    dateFrom: toDateOnly(daysAgo(30)),
    dateTo: toDateOnly(new Date()),
  }));
  const [applied, setApplied] = React.useState<DashboardFiltersState>(draft);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [overview, setOverview] = React.useState<any>(null);
  const [throughput, setThroughput] = React.useState<any>(null);
  const [distribution, setDistribution] = React.useState<any>(null);
  const [statusTime, setStatusTime] = React.useState<any>(null);
  const [workloadRaw, setWorkloadRaw] = React.useState<any>(null);
  const [processTime, setProcessTime] = React.useState<any>(null);

  // ✅ Terminadas (solo closed_at != null)
  const [requestTimes, setRequestTimes] = React.useState<any>(null);

  // ✅ NUEVO: En vivo (abiertas, no esperan a terminar)
  const [requestTimesLive, setRequestTimesLive] = React.useState<any>(null);

  // ✅ catálogos
  React.useEffect(() => {
    let mounted = true;

    Promise.all([
      metricsApi.requestStatus(),
      metricsApi.requestPriorities(),
      metricsApi.requestTypes(),
      metricsApi.users(),
    ])
      .then(([st, pr, tp, us]) => {
        if (!mounted) return;

        const activeStatuses = sortByOrderThenName(
          (st.items ?? []).filter((s) => s.is_active)
        );
        const activePriorities = sortByOrderThenName(
          (pr.items ?? []).filter((p) => p.is_active)
        );
        const activeTypes = [...(tp.items ?? [])]
          .filter((t) => t.is_active)
          .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
        const activeUsers = (us.items ?? []).filter((u) => u.is_active);

        setCatalogs({
          status: activeStatuses,
          priorities: activePriorities,
          types: activeTypes,
          users: activeUsers,
        });
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message ?? "Error cargando catálogos");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const apply = () => setApplied(draft);
  const reset = () => {
    const defaults: DashboardFiltersState = {
      dateFrom: toDateOnly(daysAgo(30)),
      dateTo: toDateOnly(new Date()),
      statusId: undefined,
      assigneeId: undefined,
      priorityId: undefined,
      requestTypeId: undefined,
    };
    setDraft(defaults);
    setApplied(defaults);
  };

  // ✅ construir query global (aplica a TODOS los endpoints)
  const buildQuery = React.useCallback(
    (f: DashboardFiltersState): MetricsQuery => ({
      dateFrom: f.dateFrom,
      dateTo: f.dateTo,
      statusId: f.statusId,
      assigneeId: f.assigneeId,
      priorityId: f.priorityId,
      requestTypeId: f.requestTypeId,
      groupBy: "day",
      inProgressStatusCode: "IN_PROGRESS",
    }),
    []
  );

  // ✅ cargar métricas con filtros globales
  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const q = buildQuery(applied);

    Promise.all([
      metricsApi.overview(q),
      metricsApi.throughput(q),
      metricsApi.distribution(q),
      metricsApi.statusTime(q),
      metricsApi.workload(q),
      metricsApi.processTime(q),

      // ✅ terminadas
      metricsApi.requestTimes(q),

      // ✅ en vivo (abiertas por defecto)
      metricsApi.requestTimesLive(q),
    ])
      .then(([o, th, dist, stt, wl, pt, rt, rtl]) => {
        if (!mounted) return;

        setOverview(o.data);
        setThroughput(th.data);
        setDistribution(dist.data);
        setStatusTime(stt.data);
        setWorkloadRaw(wl.data);
        setProcessTime(pt.data);

        setRequestTimes(rt.data);
        setRequestTimesLive(rtl.data);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message ?? "Error cargando métricas");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [applied, buildQuery]);

  /**
   * ✅ Workaround front:
   * El backend de /metrics/workload NO filtra por assigneeId.
   * Si el usuario selecciona Analista, filtramos el workload en front.
   */
  const workload = React.useMemo(() => {
    if (!workloadRaw) return null;

    const selectedAssigneeId = applied.assigneeId;
    if (!selectedAssigneeId) return workloadRaw;

    return {
      ...workloadRaw,
      backlogByAssignee: (workloadRaw.backlogByAssignee ?? []).filter(
        (x: any) => x.assigneeId === selectedAssigneeId
      ),
      activityByUser: (workloadRaw.activityByUser ?? []).filter(
        (x: any) => x.userId === selectedAssigneeId
      ),
    };
  }, [workloadRaw, applied.assigneeId]);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <div className="text-xl font-semibold">Dashboard</div>
        <div className="text-sm text-muted-foreground">
          Métricas operacionales del flujo de solicitudes (abiertas, terminadas,
          distribución, tiempos y carga).
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardFilters
            value={draft}
            onChange={setDraft}
            onApply={apply}
            onReset={reset}
            catalogs={{
              status: catalogs.status,
              priorities: catalogs.priorities,
              types: catalogs.types,
              users: catalogs.users,
            }}
          />
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="text-sm text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-sm text-muted-foreground">Cargando métricas…</div>
      )}

      {!loading && !error && (
        <>
          <DashboardKpis
            overview={overview}
            process={processTime}
            openStats={requestTimesLive?.stats ?? null}
          />

          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-6">
              <RequestsByStatusBarChart data={overview} />
            </div>
            <div className="md:col-span-6">
              <OpenByAssigneeChart data={distribution} />
            </div>
          </div>

          <OpenDistributionCharts data={distribution} />

          <RequestTimesLiveTable rows={requestTimesLive?.items ?? []} />

          <RequestTimesTable rows={requestTimes?.items ?? []} />
        </>
      )}
    </div>
  );
}