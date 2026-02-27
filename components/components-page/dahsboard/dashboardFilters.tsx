"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { DashboardFiltersState } from "./dashboardTypes";
import type { CatalogItem, UserItem } from "@/api/metrics/metrics.api";

type Props = {
  value: DashboardFiltersState;
  onChange: (next: DashboardFiltersState) => void;
  onApply: () => void;
  onReset: () => void;
  catalogs: {
    status?: CatalogItem[];
    types?: CatalogItem[];
    priorities?: CatalogItem[];
    users?: UserItem[];
  };
};

const SELECT_TRIGGER_CLASS =
  "w-[220px] justify-between";
const SELECT_VALUE_CLASS = "truncate";

export function DashboardFilters({
  value,
  onChange,
  onApply,
  onReset,
  catalogs,
}: Props) {
  const status = catalogs.status ?? [];
  const types = catalogs.types ?? [];
  const priorities = catalogs.priorities ?? [];
  const users = catalogs.users ?? [];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="grid gap-3 md:grid-cols-6">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Desde</div>
          <Input
            type="date"
            value={value.dateFrom}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Hasta</div>
          <Input
            type="date"
            value={value.dateTo}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Estado</div>
          <Select
            value={value.statusId ?? "ALL"}
            onValueChange={(v) =>
              onChange({ ...value, statusId: v === "ALL" ? undefined : v })
            }
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue className={SELECT_VALUE_CLASS} placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {status.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Analista</div>
          <Select
            value={value.assigneeId ?? "ALL"}
            onValueChange={(v) =>
              onChange({ ...value, assigneeId: v === "ALL" ? undefined : v })
            }
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue className={SELECT_VALUE_CLASS} placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Prioridad</div>
          <Select
            value={value.priorityId ?? "ALL"}
            onValueChange={(v) =>
              onChange({ ...value, priorityId: v === "ALL" ? undefined : v })
            }
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue className={SELECT_VALUE_CLASS} placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {priorities.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Tipo</div>
          <Select
            value={value.requestTypeId ?? "ALL"}
            onValueChange={(v) =>
              onChange({ ...value, requestTypeId: v === "ALL" ? undefined : v })
            }
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue className={SELECT_VALUE_CLASS} placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {types.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="w-30 bg-blue-100 hover:bg-blue-300" variant="secondary" onClick={onReset}>
          Reset
        </Button>
        <Button className="w-30 bg-blue-600 hover:bg-blue-800" onClick={onApply}>Aplicar</Button>
      </div>
    </div>
  );
}