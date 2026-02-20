"use client";

import * as React from "react";
import { requestsApi } from "@/api/requests/requests.api";
import { requestStatusApi } from "@/api/requests/request-status.api";
import type { RequestItem } from "@/types/requests/request.types";
import type { RequestStatus } from "@/types/requests/request-status.types";
import { alerts } from "@/utils/alerts/alerts";

type State = {
  isLoading: boolean;
  statuses: RequestStatus[];
  requests: RequestItem[];
};

export function useRequestsData() {
  const [state, setState] = React.useState<State>({
    isLoading: true,
    statuses: [],
    requests: [],
  });

  const refresh = React.useCallback(async () => {
    setState((p) => ({ ...p, isLoading: true }));

    try {
      const [statusesRes, requestsRes] = await Promise.all([
        requestStatusApi.getAll(),
        requestsApi.getAll(),
      ]);

      const statuses = (statusesRes.items ?? [])
        .filter((s) => s.is_active)
        .sort((a, b) => a.sort_order - b.sort_order);

      const requests = (requestsRes.items ?? []).filter((r) => r.is_active);

      setState({ isLoading: false, statuses, requests });
    } catch (e: any) {
      setState((p) => ({ ...p, isLoading: false }));
      await alerts.error(
        "No se pudieron cargar las solicitudes",
        e?.message ?? "Intenta nuevamente."
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
