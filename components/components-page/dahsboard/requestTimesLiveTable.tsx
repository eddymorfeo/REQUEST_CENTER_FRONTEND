"use client";
import type { RequestTimesLiveRow } from "@/api/metrics/metrics.api";
import { RequestTimesLiveDataTable } from "@/components/components-page/dahsboard/data-table/request-times-live/data-table";

export function RequestTimesLiveTable({ rows }: { rows: RequestTimesLiveRow[] }) {
  return <RequestTimesLiveDataTable rows={rows} />;
}