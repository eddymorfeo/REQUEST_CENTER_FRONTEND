"use client";

import * as React from "react";
import type { RequestItem } from "@/types/requests/request.types";
import { Badge } from "@/components/ui/badge";

export function RequestRow({ item }: { item: RequestItem }) {
  return (
    <div className="grid grid-cols-[1fr_180px_140px] gap-3 items-center px-3 py-2 rounded-lg hover:bg-muted/40 transition">
      <div className="min-w-0">
        <p className="font-medium truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
      </div>

      <div className="text-xs text-muted-foreground truncate">
        {item.type_name ?? "—"}
      </div>

      <div className="flex justify-end">
        {item.priority_name ? (
          <Badge variant="secondary">{item.priority_name}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}
