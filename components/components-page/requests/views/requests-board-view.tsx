"use client";

import * as React from "react";
import type { RequestItem } from "@/types/requests/request.types";
import type { RequestStatus } from "@/types/requests/request-status.types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { RequestCard } from "../request-card";

type Props = {
  statuses: RequestStatus[];
  requests: RequestItem[];
};

export function RequestsBoardView({ statuses, requests }: Props) {
  const byStatus = React.useMemo(() => {
    const map = new Map<string, RequestItem[]>();
    for (const s of statuses) map.set(s.id, []);
    for (const r of requests) {
      const bucket = map.get(r.status_id);
      if (bucket) bucket.push(r);
    }
    return map;
  }, [statuses, requests]);

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {statuses.map((status) => {
          const items = byStatus.get(status.id) ?? [];

          return (
            <section
              key={status.id}
              className="w-[320px] shrink-0 rounded-2xl bg-muted/30 border p-3"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {status.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3 min-h-[120px]">
                {items.length === 0 ? (
                  <div className="text-sm text-muted-foreground px-1 py-6 text-center">
                    Sin solicitudes
                  </div>
                ) : (
                  items.map((r) => <RequestCard key={r.id} item={r} />)
                )}
              </div>
            </section>
          );
        })}
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}