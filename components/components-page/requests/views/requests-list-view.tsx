"use client";

import * as React from "react";
import type { RequestItem } from "@/types/requests/request.types";
import type { RequestStatus } from "@/types/requests/request-status.types";
import { Separator } from "@/components/ui/separator";
import { RequestRow } from "../request-row";

type Props = {
  statuses: RequestStatus[];
  requests: RequestItem[];
};

export function RequestsListView({ statuses, requests }: Props) {
  const grouped = React.useMemo(() => {
    const map = new Map<string, RequestItem[]>();
    for (const s of statuses) map.set(s.id, []);
    for (const r of requests) {
      const bucket = map.get(r.status_id);
      if (bucket) bucket.push(r);
    }
    return map;
  }, [statuses, requests]);

  return (
    <div className="space-y-6">
      {statuses.map((status) => {
        const items = grouped.get(status.id) ?? [];
        return (
          <section key={status.id} className="rounded-2xl border bg-background">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {status.name}
                </span>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <span className="text-xs text-muted-foreground">Prioridad</span>
            </div>

            <Separator />

            <div className="px-1 py-1">
              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground px-3 py-6 text-center">
                  Sin solicitudes
                </div>
              ) : (
                items.map((r) => <RequestRow key={r.id} item={r} />)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
