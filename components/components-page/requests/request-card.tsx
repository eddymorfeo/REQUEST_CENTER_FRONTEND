"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { RequestItem } from "@/types/requests/request.types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function RequestCard({ item }: { item: RequestItem }) {
  const router = useRouter();

  return (
    <Card
      className="p-3 rounded-xl border bg-background hover:bg-muted/40 transition cursor-pointer"
      onClick={() => router.push(`/requests/${item.id}`)}
      role="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium leading-snug overflow-hidden break-words line-clamp-2">
            {item.title}
          </p>

          <p className="mt-1 text-xs text-muted-foreground overflow-hidden break-words line-clamp-2">
            {item.description}
          </p>
        </div>

        {item.priority_name ? (
          <Badge variant="secondary" className="shrink-0">
            {item.priority_name}
          </Badge>
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