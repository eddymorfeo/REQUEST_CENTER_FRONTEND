"use client";

import * as React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ChartRegister } from "@/components/components-page/dahsboard/chartRegister";
import { clampTopN } from "@/components/components-page/dahsboard/dashboardFormat";
import {
  colorByStatusCode,
  colorByPriorityCode,
} from "@/components/components-page/dahsboard/dashboardColors";

import type { OverviewData, DistributionData } from "@/api/metrics/metrics.api";

ChartRegister();

/* -------------------------------- Helpers -------------------------------- */

function ChartCard({
  title,
  heightClass,
  children,
}: {
  title: string;
  heightClass: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className={heightClass}>{children}</CardContent>
    </Card>
  );
}

function barOptionsY(params?: { showLegend?: boolean; integerTicks?: boolean }): ChartOptions<"bar"> {
  const showLegend = params?.showLegend ?? false;
  const integerTicks = params?.integerTicks ?? true;

  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",

    // ✅ hace que el chart "respire" igual que los doughnuts
    layout: {
      padding: {
        left: 12,
        right: 24,
        top: 8,
        bottom: 8,
      },
    },

    plugins: {
      legend: { display: showLegend },
      tooltip: { intersect: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: integerTicks
          ? {
              precision: 0,
              stepSize: 1,
              callback: (value) => String(Math.round(Number(value))),
            }
          : undefined,
        border: { display: false },
        grid: { drawTicks: false },
      },
      y: {
        ticks: { autoSkip: false },

        // ✅ reduce el "empuje" visual del eje
        border: { display: false },
        grid: { drawTicks: false },
      },
    },
  };
}

/** Color estable por label (no depende del orden) */
function colorFromLabel(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 70% 55%)`;
}

/* -------------------------------- Charts -------------------------------- */

/** 1) Barras: activas por estado */
export function RequestsByStatusBarChart({ data }: { data: OverviewData | null }) {
  if (!data) return null;

  const items = data.backlogByStatus ?? [];
  const labels = items.map((x) => x.name);
  const values = items.map((x) => x.count);
  const colors = items.map((x) => colorByStatusCode(x.code));

  return (
    <ChartCard title="Activas por estado" heightClass="h-[320px]">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Activas",
              data: values,
              backgroundColor: colors.map((c) => `${c}33`),
              borderColor: colors,
              borderWidth: 1,
            },
          ],
        }}
        options={barOptionsY({ integerTicks: true })}
      />
    </ChartCard>
  );
}

/** 2) Barras: activas por analista (Top 8) */
export function OpenByAssigneeChart({ data }: { data: DistributionData | null }) {
  if (!data) return null;

  const assignee = clampTopN(
    [...(data.openBy.assignee ?? [])].sort((a, b) => b.count - a.count),
    8
  );

  return (
    <ChartCard title="Activas por analista" heightClass="h-[320px]">
      <Bar
        data={{
          labels: assignee.map((x) => x.full_name),
          datasets: [
            {
              label: "Activas",
              data: assignee.map((x) => x.count),
              backgroundColor: "rgba(59,130,246,0.25)",
              borderColor: "#3B82F6",
              borderWidth: 1,
            },
          ],
        }}
        options={barOptionsY({ integerTicks: true })}
      />
    </ChartCard>
  );
}

/** 3) Distribuciones: prioridad + tipo (tortas) */
export function OpenDistributionCharts({ data }: { data: DistributionData | null }) {
  if (!data) return null;

  const priority = data.openBy.priority ?? [];
  const type = clampTopN([...(data.openBy.type ?? [])].sort((a, b) => b.count - a.count), 8);

  const priLabels = priority.map((x) => x.name);
  const priValues = priority.map((x) => x.count);
  const priColors = priority.map((x) => colorByPriorityCode(x.code));

  const typeLabels = type.map((x) => x.name);
  const typeValues = type.map((x) => x.count);
  const typeColors = typeLabels.map(colorFromLabel);

  return (
    <div className="grid gap-4 md:grid-cols-8">
      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm">Activas por prioridad</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <Doughnut
            data={{
              labels: priLabels,
              datasets: [{ data: priValues, backgroundColor: priColors, borderWidth: 1 }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "left" } },
            }}
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm">Activas por tipo</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <Doughnut
            data={{
              labels: typeLabels,
              datasets: [{ data: typeValues, backgroundColor: typeColors, borderWidth: 1 }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "right" } },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}