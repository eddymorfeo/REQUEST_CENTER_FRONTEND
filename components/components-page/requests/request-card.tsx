"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { RequestItem } from "@/types/requests/request.types";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "./badge/request-priority-badge";

export function RequestCard({ item }: { item: RequestItem }) {
  const router = useRouter();

  return (
    <Card
      className="p-3 rounded-xl border transition cursor-pointer bg-muted/30 bg-linear-to-r/srgb from-green-10 to-blue-50 transition-colors hover:bg-red-100"
      onClick={() => router.push(`/requests/${item.id}`)}
      role="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium leading-snug line-clamp-2">{item.title}</p>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        </div>

        {item.priority_name ? (
          <PriorityBadge value={item.priority_name} className="shrink-0" />
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{item.type_name ?? "—"}</span>
        <span className="shrink-0">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      </div>
    </Card>
  );
}