import { http } from "@/api/http/http.client";

/** Respuestas */
type SuccessData<T> = { success: true; data: T };
type SuccessItems<T> = { success: true; items: T[] };

export type MetricsQuery = {
    dateFrom?: string;
    dateTo?: string;
    statusId?: string;
    requestTypeId?: string;
    priorityId?: string;
    assigneeId?: string;
    groupBy?: "day" | "week" | "month";
    inProgressStatusCode?: string;
};

function toQueryString(query: MetricsQuery) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (!v) return;
        params.set(k, String(v));
    });
    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

/** Catálogos reales según tu backend (items + campos de auditoría) */
export type CatalogItem = {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    user_id?: string | null;
    is_active: boolean;
    sort_order?: number; // status/priorities lo tienen
    created_at?: string;
    updated_at?: string;
};

export type UserItem = {
    id: string;
    username: string;
    full_name: string;
    email?: string | null;
    is_active: boolean;
};

/** Metrics */
export type OverviewData = {
    range: { dateFrom: string; dateTo: string };
    kpis: {
        backlogTotal: number;
        createdInRange: number;
        closedInRange: number;
        avgTimeToFirstAssignHours: number;
    };
    backlogByStatus: Array<{ statusId: string; code: string; name: string; count: number }>;
};

export type ThroughputData = {
    range: { dateFrom: string; dateTo: string };
    groupBy: "day" | "week" | "month";
    series: Array<{ bucket: string; created: number; closed: number }>;
};

export type StatusTimeData = {
    range: { dateFrom: string; dateTo: string };
    byStatus: Array<{
        statusId: string;
        code: string;
        name: string;
        countTransitions: number;
        minHours: number;
        maxHours: number;
        avgHours: number;
        timeHours: { p50: number; p90: number };
    }>;
};

export type WorkloadData = {
    range: { dateFrom: string; dateTo: string };
    backlogByAssignee: Array<{
        assigneeId: string;
        username: string;
        fullName: string;
        openAssigned: number;
    }>;
    activityByUser: Array<{
        userId: string;
        username: string;
        fullName: string;
        createdInRange: number;
        closedInRange: number;
        assignmentsInRange: number;
    }>;
};

export type DistributionData = {
    range: { dateFrom: string; dateTo: string };
    openBy: {
        status: Array<{ id: string; code: string; name: string; count: number }>;
        priority: Array<{ id: string; code: string; name: string; count: number }>;
        type: Array<{ id: string; code: string; name: string; count: number }>;
        assignee: Array<{ id: string | null; username: string; full_name: string; count: number }>;
    };
    periodBy: {
        created: DistributionData["openBy"];
        closed: DistributionData["openBy"];
    };
};

export type ProcessTimeData = {
    range: { dateFrom: string; dateTo: string };
    totals: { closedInRange: number };
    leadHours: { min: number; max: number; avg: number; p50: number; p90: number };
    cycleHours: { min: number; max: number; avg: number; p50: number; p90: number };
    inProgressHours: { min: number; max: number; avg: number; p50: number; p90: number };
};

export type RequestTimesRow = {
    id: string;
    title: string;
    statusId: string;
    statusCode: string;
    statusName: string;
    typeName: string;
    priorityName: string;
    assigneeName: string;
    assigneeUsername: string;
    createdAt: string;
    closedAt: string;
    unassignedHours: number;
    assignedHours: number;
    inProgressHours: number;
    totalHours: number;
};

export type RequestTimesData = {
    range: { dateFrom: string; dateTo: string };
    items: RequestTimesRow[];
};

export type RequestTimesLiveRow = {
  id: string;
  title: string;
  statusId: string;
  statusCode: string;
  statusName: string;
  typeName: string;
  priorityName: string;
  assigneeName: string;
  assigneeUsername: string;
  createdAt: string;
  closedAt: string | null;
  endAt: string;

  unassignedHours: number;
  assignedHours: number;
  inProgressHours: number;
  totalHours: number;

  currentStatusHours: number;
};

export type RequestTimesLiveData = {
  range: { dateFrom: string; dateTo: string };
  items: RequestTimesLiveRow[];
};

export const metricsApi = {
    overview(q: MetricsQuery) {
        return http<SuccessData<OverviewData>>({
            method: "GET",
            path: `/metrics/overview${toQueryString(q)}`,
        });
    },
    throughput(q: MetricsQuery) {
        return http<SuccessData<ThroughputData>>({
            method: "GET",
            path: `/metrics/throughput${toQueryString(q)}`,
        });
    },
    statusTime(q: MetricsQuery) {
        return http<SuccessData<StatusTimeData>>({
            method: "GET",
            path: `/metrics/status-time${toQueryString(q)}`,
        });
    },
    workload(q: MetricsQuery) {
        return http<SuccessData<WorkloadData>>({
            method: "GET",
            path: `/metrics/workload${toQueryString(q)}`,
        });
    },
    distribution(q: MetricsQuery) {
        return http<SuccessData<DistributionData>>({
            method: "GET",
            path: `/metrics/distribution${toQueryString(q)}`,
        });
    },
    processTime(q: MetricsQuery) {
        return http<SuccessData<ProcessTimeData>>({
            method: "GET",
            path: `/metrics/process-time${toQueryString(q)}`,
        });
    },

    // ✅ catálogos: tu backend responde { success, items: [...] }
    requestStatus() {
        return http<SuccessItems<CatalogItem>>({ method: "GET", path: "/request-status" });
    },
    requestTypes() {
        return http<SuccessItems<CatalogItem>>({ method: "GET", path: "/request-types" });
    },
    requestPriorities() {
        return http<SuccessItems<CatalogItem>>({ method: "GET", path: "/request-priorities" });
    },
    users() {
        return http<SuccessItems<UserItem>>({ method: "GET", path: "/users" });
    },

    requestTimes(q: MetricsQuery) {
        return http<{ success: true; data: RequestTimesData }>({
            method: "GET",
            path: `/metrics/request-times${toQueryString(q)}`,
        });
    },

    requestTimesLive(q: MetricsQuery & { includeClosed?: boolean }) {
  return http<{ success: true; data: RequestTimesLiveData }>({
    method: "GET",
    path: `/metrics/request-times-live${toQueryString(q)}`,
  });
},
};