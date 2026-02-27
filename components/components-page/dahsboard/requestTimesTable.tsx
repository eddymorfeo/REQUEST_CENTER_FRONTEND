"use client";
import type { RequestTimesRow } from "@/api/metrics/metrics.api";
import { RequestTimesDataTable } from "@/components/components-page/dahsboard/data-table/request-times/data-table";

export function RequestTimesTable({ rows }: { rows: RequestTimesRow[] }) {
  return <RequestTimesDataTable rows={rows} />;
}