"use client";

import * as React from "react";
import { requestsApi } from "@/api/requests/requests.api";
import { requestStatusApi } from "@/api/requests/request-status.api";
import { requestTypesApi, type RequestTypeItem } from "@/api/requests/request-types.api";
import { requestPrioritiesApi, type RequestPriorityItem } from "@/api/requests/request-priorities.api";
import type { RequestItem } from "@/types/requests/request.types";
import type { RequestStatus } from "@/types/requests/request-status.types";
import { alerts } from "@/utils/alerts/alerts";

type State = {
  isLoading: boolean;
  statuses: RequestStatus[];
  types: RequestTypeItem[];
  priorities: RequestPriorityItem[];
  requests: RequestItem[];
};

export function useRequestsData() {
  const [state, setState] = React.useState<State>({
    isLoading: true,
    statuses: [],
    types: [],
    priorities: [],
    requests: [],
  });

  const refresh = React.useCallback(async () => {
    setState((p) => ({ ...p, isLoading: true }));

    try {
      const [statusesRes, typesRes, prioritiesRes, requestsRes] = await Promise.all([
        requestStatusApi.getAll(),
        requestTypesApi.getAll(),
        requestPrioritiesApi.getAll(),
        requestsApi.getAll(),
      ]);

      const statuses = (statusesRes.items ?? [])
        .filter((s) => s.is_active)
        .sort((a, b) => a.sort_order - b.sort_order);
      const types = (typesRes.items ?? []).filter((t) => t.is_active);
      const priorities = (prioritiesRes.items ?? [])
        .filter((p) => p.is_active)
        .sort((a, b) => a.sort_order - b.sort_order);

      const requests = (requestsRes.items ?? []).filter((r) => r.is_active);

      setState({ isLoading: false, statuses, types, priorities, requests });
    } catch (e: unknown) {
      setState((p) => ({ ...p, isLoading: false }));
      await alerts.error(
        "No se pudieron cargar las solicitudes",
        e instanceof Error ? e.message : "Intenta nuevamente."
      );
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    ...state,
    refresh,
  };
}
