"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { hoursToDhM } from "@/components/components-page/dahsboard/dashboardFormat";
import { StatusBadge } from "@/components/components-page/requests/badge/request-status-badge";
import { PriorityBadge } from "@/components/components-page/requests/badge/request-priority-badge";
import type { RequestTimesLiveRow } from "@/api/metrics/metrics.api";

function timeCell(hours: number) {
  return React.createElement("span", { className: "font-medium" }, hoursToDhM(hours));
}

export const requestTimesLiveColumns: ColumnDef<RequestTimesLiveRow>[] = [
  {
    id: "status",
    header: "Estado",
    accessorFn: (row) => row.statusCode ?? row.statusName ?? "—",
    cell: ({ row }) => {
      const value = row.original.statusCode ?? row.original.statusName ?? "—";
      return React.createElement(StatusBadge, { value });
    },
    enableSorting: true,
  },
  {
    id: "title",
    header: "Nombre",
    accessorKey: "title",
    cell: ({ row }) => {
      const r = row.original;
      return React.createElement(
        "div",
        { className: "min-w-[260px]" },
        [
          React.createElement("div", { key: "t", className: "font-medium leading-5" }, r.title),
          React.createElement("div", { key: "id", className: "text-xs text-muted-foreground" }, r.id),
        ]
      );
    },
    enableSorting: true,
  },
  {
    id: "type",
    header: "Tipo",
    accessorFn: (row) => row.typeName ?? "—",
    cell: ({ row }) =>
      React.createElement(
        "span",
        { className: "text-sm text-muted-foreground min-w-[160px] inline-block" },
        row.original.typeName ?? "—"
      ),
    enableSorting: true,
  },
  {
    id: "assignee",
    header: "Asignado a",
    accessorFn: (row) => row.assigneeName ?? "Sin asignar",
    cell: ({ row }) =>
      React.createElement(
        "span",
        { className: "text-sm min-w-[160px] inline-block" },
        row.original.assigneeName || "Sin asignar"
      ),
    enableSorting: true,
  },
  {
    id: "priority",
    header: "Prioridad",
    accessorFn: (row) => row.priorityName ?? "—",
    cell: ({ row }) => {
      const value = row.original.priorityName ?? "—";
      return React.createElement(
        "div",
        { className: "flex justify-start" },
        React.createElement(PriorityBadge, { value })
      );
    },
    enableSorting: true,
  },
  {
    id: "unassigned",
    header: "Sin asignar",
    accessorKey: "unassignedHours",
    cell: ({ row }) => timeCell(row.original.unassignedHours),
    enableSorting: true,
  },
  {
    id: "assigned",
    header: "Asignado",
    accessorKey: "assignedHours",
    cell: ({ row }) => timeCell(row.original.assignedHours),
    enableSorting: true,
  },
  {
    id: "inProgress",
    header: "En progreso",
    accessorKey: "inProgressHours",
    cell: ({ row }) => timeCell(row.original.inProgressHours),
    enableSorting: true,
  },
  {
    id: "total",
    header: "Total",
    accessorKey: "totalHours",
    cell: ({ row }) => timeCell(row.original.totalHours),
    enableSorting: true,
  },
];