"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { statusBadgeClass } from "@/utils/badges/badge-colors";

export function StatusBadge({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={[
        "border px-2 py-0.5 text-[11px] font-medium rounded-full",
        statusBadgeClass(value),
        className,
      ].join(" ")}
    >
      {value}
    </Badge>
  );
}